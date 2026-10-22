import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { budgets, accounts, expenses } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.userId;

    const budgetList = await db.select({
      id: budgets.id,
      accountId: budgets.accountId,
      accountName: accounts.name,
      month: budgets.month,
      year: budgets.year,
      allocated: budgets.allocatedAmount,
    })
    .from(budgets)
    .leftJoin(accounts, eq(budgets.accountId, accounts.id))
    .where(eq(budgets.tenantId, tenantId));

    const budgetsWithSpent = await Promise.all(budgetList.map(async (budget) => {
      const spentResult = await db.select({
        total: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`
      })
      .from(expenses)
      .where(
        and(
          eq(expenses.tenantId, tenantId),
          eq(expenses.expenseAccountId, budget.accountId)
        )
      );
      
      const spent = spentResult[0]?.total ? Number(spentResult[0].total) : 0;
      const allocated = Number(budget.allocated);
      
      return {
        ...budget,
        allocated: allocated, // Force it to be a number
        spent,
        remaining: allocated - spent,
        percentageUsed: allocated > 0 ? (spent / allocated) * 100 : 0
      };
    }));

    return NextResponse.json({ budgets: budgetsWithSpent });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch budgets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    if (payload.role !== 'admin') return NextResponse.json({ error: "Only CEO can set budgets" }, { status: 403 });

    const { accountId, month, year, amount } = await req.json();

    const existing = await db.select().from(budgets).where(
      and(
        eq(budgets.tenantId, payload.userId),
        eq(budgets.accountId, accountId),
        eq(budgets.month, month),
        eq(budgets.year, year)
      )
    );

    if (existing.length > 0) {
      await db.update(budgets)
        .set({ allocatedAmount: amount })
        .where(eq(budgets.id, existing[0].id));
    } else {
      await db.insert(budgets).values({
        tenantId: payload.userId,
        accountId,
        month,
        year,
        allocatedAmount: amount
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}