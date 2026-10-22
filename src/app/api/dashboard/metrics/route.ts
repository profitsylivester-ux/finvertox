import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { invoices } from '@/db/schema';
import { eq, and, sql, lt } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    const today = new Date().toISOString().split('T')[0];

    // 1. Total Sales Revenue (All invoiced amounts)
    const totalSalesResult = await db.select({
      total: sql<number>`SUM(CAST(${invoices.total} AS DECIMAL))`
    }).from(invoices).where(eq(invoices.tenantId, tenantId));

    // 2. Outstanding Receivables (Unpaid invoices)
    const receivablesResult = await db.select({
      total: sql<number>`SUM(CAST(${invoices.total} AS DECIMAL))`
    }).from(invoices).where(and(eq(invoices.tenantId, tenantId), eq(invoices.status, 'unpaid')));

    // 3. Overdue Invoices (Unpaid AND dueDate < today)
    const overdueResult = await db.select({
      count: sql<number>`COUNT(*)`
    }).from(invoices).where(and(
      eq(invoices.tenantId, tenantId), 
      eq(invoices.status, 'unpaid'),
      lt(invoices.dueDate, today)
    ));

    return NextResponse.json({
      totalSales: totalSalesResult[0]?.total ? Number(totalSalesResult[0].total) : 0,
      receivables: receivablesResult[0]?.total ? Number(receivablesResult[0].total) : 0,
      overdueCount: overdueResult[0]?.count ? Number(overdueResult[0].count) : 0,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}