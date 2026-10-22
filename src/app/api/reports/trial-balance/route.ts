import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    
    // Fetch all accounts for this tenant
    const tenantAccounts = await db.select().from(accounts).where(eq(accounts.tenantId, payload.userId));

    // Sort accounts by code
    tenantAccounts.sort((a, b) => a.code.localeCompare(b.code));

    let totalDebits = 0;
    let totalCredits = 0;

    const reportData = tenantAccounts.map(acc => {
      const balance = parseFloat(acc.balance);
      
      // For Assets and Expenses: Debit increases the balance
      // For Liabilities, Equity, Revenue: Credit increases the balance
      const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense';
      
      let debitAmount = 0;
      let creditAmount = 0;

      if (balance !== 0) {
        if (isDebitNormal) {
          if (balance > 0) debitAmount = balance;
          else creditAmount = Math.abs(balance);
        } else {
          if (balance > 0) creditAmount = balance;
          else debitAmount = Math.abs(balance);
        }
      }

      totalDebits += debitAmount;
      totalCredits += creditAmount;

      return {
        id: acc.id,
        code: acc.code,
        name: acc.name,
        type: acc.type,
        debit: debitAmount,
        credit: creditAmount
      };
    });

    return NextResponse.json({ 
      report: reportData,
      totalDebits,
      totalCredits
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate trial balance" }, { status: 500 });
  }
}