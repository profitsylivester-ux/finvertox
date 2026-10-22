import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { expenses, suppliers, accounts, journalEntries, journalLines, fiscalPeriods } from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const list = await db.select({
      id: expenses.id,
      date: expenses.date,
      description: expenses.description,
      amount: expenses.amount,
      status: expenses.status,
      supplierName: suppliers.name,
      accountName: accounts.name,
    })
    .from(expenses)
    .leftJoin(suppliers, eq(expenses.supplierId, suppliers.id))
    .leftJoin(accounts, eq(expenses.expenseAccountId, accounts.id))
    .where(eq(expenses.tenantId, payload.userId))
    .orderBy(desc(expenses.createdAt));
    
    return NextResponse.json({ expenses: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.userId;
    const { supplierId, expenseAccountId, date, description, amount } = await req.json();

    // Check period
    const entryDate = new Date(date);
    const entryMonth = entryDate.getMonth() + 1;
    const entryYear = entryDate.getFullYear();
    const existingPeriod = await db.select().from(fiscalPeriods).where(
      and(eq(fiscalPeriods.tenantId, tenantId), eq(fiscalPeriods.month, entryMonth), eq(fiscalPeriods.year, entryYear), eq(fiscalPeriods.status, 'closed'))
    );
    if (existingPeriod.length > 0) return NextResponse.json({ error: "Cannot record expense in a closed period." }, { status: 400 });

    // Save Expense
    const [newExpense] = await db.insert(expenses).values({
      tenantId, supplierId, expenseAccountId, date, description, amount: amount.toString(), status: 'unpaid'
    }).returning();

    // AUTOMATIC JOURNAL ENTRY (Debit Expense, Credit Accounts Payable)
    const [apAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '2000')));
    
    if (apAccount) {
      const [journalEntry] = await db.insert(journalEntries).values({
        tenantId, date, description: `Expense: ${description}`, reference: `EXP-${newExpense.id}`, status: 'posted'
      }).returning();

      // Debit Expense Account
      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: expenseAccountId, type: 'debit', amount: amount.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, expenseAccountId));

      // Credit Accounts Payable
      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: apAccount.id, type: 'credit', amount: amount.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, apAccount.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record expense" }, { status: 500 });
  }
}
