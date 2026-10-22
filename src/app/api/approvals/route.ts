import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { expenses, suppliers, accounts, journalEntries, journalLines, activityLogs } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    if (payload.role !== 'admin') return NextResponse.json({ error: "Only CEO can view approvals" }, { status: 403 });

    const tenantId = payload.userId;

    const pendingExpenses = await db.select({
      id: expenses.id,
      date: expenses.date,
      description: expenses.description,
      amount: expenses.amount,
      supplierName: suppliers.name,
      accountName: accounts.name,
      accountId: expenses.expenseAccountId
    })
    .from(expenses)
    .leftJoin(suppliers, eq(expenses.supplierId, suppliers.id))
    .leftJoin(accounts, eq(expenses.expenseAccountId, accounts.id))
    .where(and(eq(expenses.tenantId, tenantId), eq(expenses.status, 'pending_approval')));

    return NextResponse.json({ approvals: pendingExpenses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    if (payload.role !== 'admin') return NextResponse.json({ error: "Only CEO can approve" }, { status: 403 });

    const tenantId = payload.userId;
    const { expenseId, action } = await req.json();

    const [expense] = await db.select().from(expenses).where(and(eq(expenses.id, expenseId), eq(expenses.tenantId, tenantId)));
    if (!expense) return NextResponse.json({ error: "Expense not found" }, { status: 404 });

    if (action === 'reject') {
      await db.update(expenses).set({ status: 'rejected' }).where(eq(expenses.id, expenseId));
      await db.insert(activityLogs).values({
        tenantId, userName: `${payload.firstName} ${payload.lastName}`,
        action: 'REJECT_EXPENSE', details: `Rejected expense: ${expense.description}`
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'approve') {
      // 1. Mark as unpaid
      await db.update(expenses).set({ status: 'unpaid' }).where(eq(expenses.id, expenseId));

      // 2. Post to Ledger
      const [apAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '2000')));
      
      if (apAccount) {
        const amount = parseFloat(expense.amount);
        const [journalEntry] = await db.insert(journalEntries).values({
          tenantId, date: expense.date, description: `Expense: ${expense.description}`, reference: `EXP-${expense.id}`, status: 'posted'
        }).returning();

        // Debit Expense
        await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: expense.expenseAccountId, type: 'debit', amount: amount.toString() });
        await db.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, expense.expenseAccountId));

        // Credit A/P
        await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: apAccount.id, type: 'credit', amount: amount.toString() });
        await db.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, apAccount.id));
      }

      await db.insert(activityLogs).values({
        tenantId, userName: `${payload.firstName} ${payload.lastName}`,
        action: 'APPROVE_EXPENSE', details: `Approved expense: ${expense.description}`
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process approval" }, { status: 500 });
  }
}