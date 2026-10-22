import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { invoices, invoiceItems, customers, accounts, journalEntries, journalLines, fiscalPeriods, activityLogs, users } from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const list = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      date: invoices.date,
      dueDate: invoices.dueDate,
      status: invoices.status,
      total: invoices.total,
      customerName: customers.name
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.tenantId, payload.userId))
    .orderBy(desc(invoices.createdAt));
    
    return NextResponse.json({ invoices: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.userId;
    const { customerId, date, dueDate, items } = await req.json();

    const entryDate = new Date(date);
    const entryMonth = entryDate.getMonth() + 1;
    const entryYear = entryDate.getFullYear();

    const existingPeriod = await db.select().from(fiscalPeriods).where(
      and(eq(fiscalPeriods.tenantId, tenantId), eq(fiscalPeriods.month, entryMonth), eq(fiscalPeriods.year, entryYear), eq(fiscalPeriods.status, 'closed'))
    );

    if (existingPeriod.length > 0) {
      return NextResponse.json({ error: "Cannot create invoice in a closed period." }, { status: 400 });
    }

    const subtotal = items.reduce((sum: number, item: any) => sum + (parseFloat(item.quantity) * parseFloat(item.unitPrice)), 0);
    const total = subtotal;

    const invCount = await db.select({ count: sql`count(*)` }).from(invoices).where(eq(invoices.tenantId, tenantId));
    const invoiceNumber = `INV-${String(Number(invCount[0].count) + 1).padStart(4, '0')}`;

    const [newInvoice] = await db.insert(invoices).values({
      tenantId, customerId, invoiceNumber, date, dueDate, status: 'unpaid', subtotal: subtotal.toString(), total: total.toString()
    }).returning();

    for (const item of items) {
      await db.insert(invoiceItems).values({
        invoiceId: newInvoice.id,
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        total: (parseFloat(item.quantity) * parseFloat(item.unitPrice)).toString()
      });
    }

    const [arAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '1100')));
    const [salesAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '4000')));

    if (arAccount && salesAccount) {
      const [journalEntry] = await db.insert(journalEntries).values({
        tenantId, date, description: `Invoice ${invoiceNumber}`, reference: invoiceNumber, status: 'posted'
      }).returning();

      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: arAccount.id, type: 'debit', amount: total.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${total}` }).where(eq(accounts.id, arAccount.id));

      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: salesAccount.id, type: 'credit', amount: total.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${total}` }).where(eq(accounts.id, salesAccount.id));
    }

    // LOG THE ACTIVITY
    const [user] = await db.select().from(users).where(eq(users.id, tenantId));
    await db.insert(activityLogs).values({
      tenantId,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'CREATE_INVOICE',
      details: `Created invoice ${invoiceNumber} for TZS ${total.toFixed(2)}`
    });

    return NextResponse.json({ success: true, invoice: newInvoice });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
