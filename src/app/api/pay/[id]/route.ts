import { NextResponse } from 'next/server';
import { db } from '@/db';
import { invoices, customers, users, accounts, journalEntries, journalLines, payments, bankAccounts, activityLogs } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const invoiceId = parseInt(params.id);
    if (isNaN(invoiceId)) return NextResponse.json({ error: "Invalid invoice" }, { status: 400 });

    const [invoice] = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      total: invoices.total,
      status: invoices.status,
      tenantId: invoices.tenantId,
      customerName: customers.name,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.id, invoiceId));

    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    const [company] = await db.select().from(users).where(eq(users.id, invoice.tenantId));

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        number: invoice.invoiceNumber,
        total: invoice.total,
        status: invoice.status,
        customerName: invoice.customerName,
      },
      companyName: company?.companyName || "Company"
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const invoiceId = parseInt(params.id);
    if (isNaN(invoiceId)) return NextResponse.json({ error: "Invalid invoice" }, { status: 400 });

    const { provider, phoneNumber } = await req.json();
    if (!provider || !phoneNumber) return NextResponse.json({ error: "Provider and phone required" }, { status: 400 });

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId));
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    if (invoice.status === 'paid') return NextResponse.json({ error: "Already paid" }, { status: 400 });

    const tenantId = invoice.tenantId;
    const amount = parseFloat(invoice.total);

    // Simulate the M-Pesa USSD prompt delay (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Find or create a Mobile Money account
    let [mobileAccount] = await db.select().from(bankAccounts).where(
      and(eq(bankAccounts.tenantId, tenantId), eq(bankAccounts.type, 'Mobile Money'))
    );

    if (!mobileAccount) {
      [mobileAccount] = await db.insert(bankAccounts).values({
        tenantId,
        name: `${provider} Account`,
        type: 'Mobile Money',
        balance: '0.00'
      }).returning();
    }

    // Record payment with provider info
    await db.insert(payments).values({
      tenantId,
      invoiceId,
      bankAccountId: mobileAccount.id,
      provider,
      phoneNumber,
      amount: invoice.total,
      date: new Date().toISOString().split('T')[0],
      method: provider
    });

    // Mark invoice as paid
    await db.update(invoices).set({ status: 'paid' }).where(eq(invoices.id, invoiceId));

    // Post to Ledger (Debit Cash, Credit A/R)
    const [cashAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '1000')));
    const [arAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '1100')));

    if (cashAccount && arAccount) {
      const [entry] = await db.insert(journalEntries).values({
        tenantId,
        date: new Date().toISOString().split('T')[0],
        description: `${provider} payment for ${invoice.invoiceNumber}`,
        reference: invoice.invoiceNumber,
        status: 'posted'
      }).returning();

      await db.insert(journalLines).values({ journalId: entry.id, accountId: cashAccount.id, type: 'debit', amount: invoice.total });
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${invoice.total}` }).where(eq(accounts.id, cashAccount.id));

      await db.insert(journalLines).values({ journalId: entry.id, accountId: arAccount.id, type: 'credit', amount: invoice.total });
      await db.update(accounts).set({ balance: sql`${accounts.balance} - ${invoice.total}` }).where(eq(accounts.id, arAccount.id));
    }

    // Update Mobile Money account balance
    await db.update(bankAccounts).set({ balance: sql`${bankAccounts.balance} + ${invoice.total}` }).where(eq(bankAccounts.id, mobileAccount.id));

    // Log the action
    await db.insert(activityLogs).values({
      tenantId,
      userName: invoice.customerName || "Customer",
      action: 'PAYMENT_RECEIVED',
      details: `Paid ${invoice.invoiceNumber} via ${provider} (${phoneNumber})`
    });

    return NextResponse.json({ success: true, message: "Payment received" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}