import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { invoices, expenses, accounts } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.userId;

    // 1. Revenue vs Expenses (Grouped by Month)
    // Since our dates are stored as text 'YYYY-MM-DD', we can group by the first 7 characters (YYYY-MM)
    const monthlyRevenue = await db.select({
      month: sql<string>`SUBSTRING(${invoices.date}, 1, 7)`,
      total: sql<number>`SUM(CAST(${invoices.total} AS DECIMAL))`
    })
    .from(invoices)
    .where(eq(invoices.tenantId, tenantId))
    .groupBy(sql`SUBSTRING(${invoices.date}, 1, 7)`);

    const monthlyExpenses = await db.select({
      month: sql<string>`SUBSTRING(${expenses.date}, 1, 7)`,
      total: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`
    })
    .from(expenses)
    .where(eq(expenses.tenantId, tenantId))
    .groupBy(sql`SUBSTRING(${expenses.date}, 1, 7)`);

    // Combine them into a single array for the chart
    const allMonths = Array.from(new Set([...monthlyRevenue.map(r => r.month), ...monthlyExpenses.map(e => e.month)])).sort();
    
    const revExpData = allMonths.map(month => {
      const rev = monthlyRevenue.find(r => r.month === month);
      const exp = monthlyExpenses.find(e => e.month === month);
      return {
        month: month || "Unknown",
        revenue: rev ? Number(rev.total) : 0,
        expenses: exp ? Number(exp.total) : 0
      };
    });

    // 2. Expenses by Category
    const expensesByCategory = await db.select({
      name: accounts.name,
      total: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`
    })
    .from(expenses)
    .leftJoin(accounts, eq(expenses.expenseAccountId, accounts.id))
    .where(eq(expenses.tenantId, tenantId))
    .groupBy(accounts.name);

    const pieData = expensesByCategory.map(item => ({
      name: item.name || "Uncategorized",
      value: Number(item.total)
    })).filter(item => item.value > 0);

    return NextResponse.json({ revExpData, pieData });

  } catch (error) {
    console.error("Chart API Error:", error);
    return NextResponse.json({ error: "Failed to load chart data" }, { status: 500 });
  }
}
