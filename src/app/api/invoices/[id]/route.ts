import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { invoices, invoiceItems, customers, companySettings, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    
    const params = await context.params;
    const invoiceId = parseInt(params.id);

    if (isNaN(invoiceId)) return NextResponse.json({ error: "Invalid Invoice ID" }, { status: 400 });

    // 1. Fetch Invoice & Customer
    const [invoiceData] = await db.select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      date: invoices.date,
      dueDate: invoices.dueDate,
      status: invoices.status,
      total: invoices.total,
      customerName: customers.name,
      customerEmail: customers.email,
      customerPhone: customers.phone,
      customerAddress: customers.address,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(and(eq(invoices.id, invoiceId), eq(invoices.tenantId, tenantId)));

    if (!invoiceData) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

    // 2. Fetch Invoice Items
    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));

    // 3. Fetch Company Settings (for the header)
    const [settings] = await db.select().from(companySettings).where(eq(companySettings.tenantId, tenantId));
    const [company] = await db.select().from(users).where(eq(users.id, tenantId));

    return NextResponse.json({
      invoice: invoiceData,
      items,
      company: {
        name: company?.companyName || "Company",
        email: settings?.email || company?.email,
        phone: settings?.phone || "",
        address: settings?.address || "",
        tin: settings?.tin || "",
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}