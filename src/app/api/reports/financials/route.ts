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
    const tenantAccounts = await db.select().from(accounts).where(eq(accounts.tenantId, payload.userId));

    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    const revenueAccounts: any[] = [];
    const expenseAccounts: any[] = [];
    const assetAccounts: any[] = [];
    const liabilityAccounts: any[] = [];
    const equityAccounts: any[] = [];

    tenantAccounts.forEach(acc => {
      const balance = parseFloat(acc.balance);
      if (acc.type === 'Revenue') {
        totalRevenue += balance;
        revenueAccounts.push(acc);
      } else if (acc.type === 'Expense') {
        totalExpenses += balance;
        expenseAccounts.push(acc);
      } else if (acc.type === 'Asset') {
        totalAssets += balance;
        assetAccounts.push(acc);
      } else if (acc.type === 'Liability') {
        totalLiabilities += balance;
        liabilityAccounts.push(acc);
      } else if (acc.type === 'Equity') {
        totalEquity += balance;
        equityAccounts.push(acc);
      }
    });

    const netIncome = totalRevenue - totalExpenses;
    // In accounting, Net Income is added to Equity to balance the sheet
    const adjustedEquity = totalEquity + netIncome;

    return NextResponse.json({
      profitAndLoss: {
        revenue: revenueAccounts,
        expenses: expenseAccounts,
        totalRevenue,
        totalExpenses,
        netIncome
      },
      balanceSheet: {
        assets: assetAccounts,
        liabilities: liabilityAccounts,
        equity: equityAccounts,
        totalAssets,
        totalLiabilities,
        totalEquity: adjustedEquity,
        netIncome
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  }
}