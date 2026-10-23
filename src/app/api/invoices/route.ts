import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { invoices, invoiceItems, customers, accounts, journalEntries, journalLines, fiscalPeriods, activityLogs, users, products } from '@/db/schema';
import { eq, sql, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    
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
    .where(eq(invoices.tenantId, tenantId))
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
    const tenantId = payload.tenantId || payload.userId;
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

    let subtotal = 0;
    let totalCOGS = 0;

    // 1. Process Items and Calculate Totals
    const processedItems = await Promise.all(items.map(async (item: any) => {
      const lineTotal = parseFloat(item.quantity) * parseFloat(item.unitPrice);
      subtotal += lineTotal;

      let itemCOGS = 0;
      if (item.productId) {
        const [prod] = await db.select().from(products).where(and(eq(products.id, parseInt(item.productId)), eq(products.tenantId, tenantId)));
        if (prod) {
          itemCOGS = parseFloat(prod.costPrice) * parseFloat(item.quantity);
          totalCOGS += itemCOGS;
        }
      }

      return {
        ...item,
        total: lineTotal,
        cogs: itemCOGS
      };
    }));

    const total = subtotal;

    const invCount = await db.select({ count: sql`count(*)` }).from(invoices).where(eq(invoices.tenantId, tenantId));
    const invoiceNumber = `INV-${String(Number(invCount[0].count) + 1).padStart(4, '0')}`;

    // 2. Save Invoice
    const [newInvoice] = await db.insert(invoices).values({
      tenantId, customerId, invoiceNumber, date, dueDate, status: 'unpaid', subtotal: subtotal.toString(), total: total.toString()
    }).returning();

    // 3. Save Items & Deduct Stock
    for (const item of processedItems) {
      await db.insert(invoiceItems).values({
        invoiceId: newInvoice.id,
        productId: item.productId ? parseInt(item.productId) : null,
        description: item.description,
        quantity: item.quantity.toString(),
        unitPrice: item.unitPrice.toString(),
        total: item.total.toString()
      });

      if (item.productId) {
        await db.update(products)
          .set({ stockQuantity: sql`${products.stockQuantity} - ${item.quantity}` })
          .where(and(eq(products.id, parseInt(item.productId)), eq(products.tenantId, tenantId)));
      }
    }

    // 4. Post Revenue & COGS to Ledger
    const [arAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '1100')));
    const [salesAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '4000')));
    const [cogsAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '5000')));
    const [inventoryAccount] = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.code, '1200')));

    if (arAccount && salesAccount) {
      const [journalEntry] = await db.insert(journalEntries).values({
        tenantId, date, description: `Invoice ${invoiceNumber}`, reference: invoiceNumber, status: 'posted'
      }).returning();

      // Record Revenue
      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: arAccount.id, type: 'debit', amount: total.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${total}` }).where(eq(accounts.id, arAccount.id));

      await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: salesAccount.id, type: 'credit', amount: total.toString() });
      await db.update(accounts).set({ balance: sql`${accounts.balance} + ${total}` }).where(eq(accounts.id, salesAccount.id));

      // Record COGS (if there are any)
      if (totalCOGS > 0 && cogsAccount && inventoryAccount) {
        await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: cogsAccount.id, type: 'debit', amount: totalCOGS.toString() });
        await db.update(accounts).set({ balance: sql`${accounts.balance} + ${totalCOGS}` }).where(eq(accounts.id, cogsAccount.id));

        await db.insert(journalLines).values({ journalId: journalEntry.id, accountId: inventoryAccount.id, type: 'credit', amount: totalCOGS.toString() });
        await db.update(accounts).set({ balance: sql`${accounts.balance} - ${totalCOGS}` }).where(eq(accounts.id, inventoryAccount.id));
      }
    }

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
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