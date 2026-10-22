import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { companySettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    const [settings] = await db.select().from(companySettings).where(eq(companySettings.tenantId, tenantId));
    
    return NextResponse.json({ settings: settings || null });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    const { tin, vatRate, address, phone, email, logoUrl, invoicePrefix, termsAndConditions } = await req.json();

    const existing = await db.select().from(companySettings).where(eq(companySettings.tenantId, tenantId));

    if (existing.length > 0) {
      await db.update(companySettings)
        .set({ tin, vatRate, address, phone, email, logoUrl, invoicePrefix, termsAndConditions, updatedAt: new Date() })
        .where(eq(companySettings.tenantId, tenantId));
    } else {
      await db.insert(companySettings).values({
        tenantId, tin, vatRate, address, phone, email, logoUrl, invoicePrefix, termsAndConditions
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}