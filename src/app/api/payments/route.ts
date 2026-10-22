import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { payments, invoices, accounts, journalEntries, journalLines, fiscalPeriods } from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const list = await db.select({
      id: payments.id,
      amount: payments.amount,
      date: payments.date,
      method: payments.method,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(payments)
    .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
    .where(eq(payments.tenantId, payload.userId))
    .orderBy(desc(payments.createdAt));
    
    return NextResponse.json({ payments: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.userId;
    const { invoiceId, amount, date, method } = await req.json();

    // 1. Check if period is closed
    const entryDate = new Date(date);
    const entryMonth = entryDate.getMonth() + 1;
    const entryYear = entryDate.getFullYear();
    const existingPeriod = await db.select().from(fiscalPeriods).where(
      and(eq(fiscalPeriods.tenantId, tenantId), eq(fiscalPeriods.month, entryMonth), eq(fiscalPeriods.year, entryYear), eq(fiscalPeriods.status, 'closed'))
    );
    if (existingPeriod.length > 0) return NextResponse.json({ error: "Cannot record payment in a closed period." }, { status: 400 });

    // 2. Get Invoice
    const [invoice] = await db.select().from(invoices).where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)));
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status === 'paid') return NextResponse.json({ error: "Invoice is already paid" }, { status: 400 });

    // 3. Save Payment
    await db.insert(payments).values({
      tenantId, invoiceId, amount: amount.toString(), date, method
    });

    // 4. Mark Invoice as Paid
    await db.update(invoices).set({ status: 'paid' }).where(eq(invoices.id, invoiceId));

    // 5. AUTOMATIC JOURNAL ENTRY (Debit Cash, Credit Accounts Receivable)
    const [cashAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '1000')));
    const [arAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '1100')));

    if (cashAccount && arAccount) {
      const [journalEntry] = await db.insert(journalEntries).values({
        tenantId, date, description: `Payment received for ${invoice.invoiceNumber}`, reference: invoice.invoiceNumber, status: 'posted'
      }).returning();

      // Debit Cash
      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: cashAccount.id, type: 'debit', amount: amount.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${amount}` }).where(eq(accounts.id, cashAccount.id));

      // Credit A/R
      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: arAccount.id, type: 'credit', amount: amount.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${amount}` }).where(eq(accounts.id, arAccount.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
  }
}
