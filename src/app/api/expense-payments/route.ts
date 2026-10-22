import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { expensePayments, expenses, accounts, journalEntries, journalLines, fiscalPeriods, suppliers } from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const list = await db.select({
      id: expensePayments.id,
      amount: expensePayments.amount,
      date: expensePayments.date,
      method: expensePayments.method,
      description: expenses.description,
      supplierName: suppliers.name,
    })
    .from(expensePayments)
    .leftJoin(expenses, eq(expensePayments.expenseId, expenses.id))
    .leftJoin(suppliers, eq(expenses.supplierId, suppliers.id))
    .where(eq(expensePayments.tenantId, payload.userId))
    .orderBy(desc(expensePayments.createdAt));
    
    return NextResponse.json({ payments: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expense payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.userId;
    const { expenseId, amount, date, method } = await req.json();

    // Check period
    const entryDate = new Date(date);
    const entryMonth = entryDate.getMonth() + 1;
    const entryYear = entryDate.getFullYear();
    const existingPeriod = await db.select().from(fiscalPeriods).where(
      and(eq(fiscalPeriods.tenantId, tenantId), eq(fiscalPeriods.month, entryMonth), eq(fiscalPeriods.year, entryYear), eq(fiscalPeriods.status, 'closed'))
    );
    if (existingPeriod.length > 0) return NextResponse.json({ error: "Cannot record payment in a closed period." }, { status: 400 });

    // Get Expense
    const [expense] = await db.select().from(expenses).where(and(eq(expenses.id, expenseId), eq(expenses.tenantId, tenantId)));
    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    if (expense.status === 'paid') return NextResponse.json({ error: "Expense is already paid" }, { status: 400 });

    // Save Payment
    await db.insert(expensePayments).values({
      tenantId, expenseId, amount: amount.toString(), date, method
    });

    // Mark Expense as Paid
    await db.update(expenses).set({ status: 'paid' }).where(eq(expenses.id, expenseId));

    // AUTOMATIC JOURNAL ENTRY (Debit Accounts Payable, Credit Cash)
    const [apAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '2000')));
    const [cashAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '1000')));

    if (apAccount && cashAccount) {
      const [journalEntry] = await db.insert(journalEntries).values({
        tenantId, date, description: `Payment for: ${expense.description}`, reference: `EXP-${expense.id}`, status: 'posted'
      }).returning();

      // Debit A/P (Reduces liability)
      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: apAccount.id, type: 'debit', amount: amount.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, apAccount.id));

      // Credit Cash (Reduces cash)
      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: cashAccount.id, type: 'credit', amount: amount.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, cashAccount.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
