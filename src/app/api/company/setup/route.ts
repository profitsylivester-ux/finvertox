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
    const [settings] = await db.select().from(companySettings).where(eq(companySettings.tenantId, payload.userId));
    
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
    const { tin, vatRate, address, phone, email } = await req.json();

    const existing = await db.select().from(companySettings).where(eq(companySettings.tenantId, payload.userId));

    if (existing.length > 0) {
      await db.update(companySettings)
        .set({ tin, vatRate, address, phone, email, updatedAt: new Date() })
        .where(eq(companySettings.tenantId, payload.userId));
    } else {
      await db.insert(companySettings).values({
        tenantId: payload.userId,
        tin, vatRate, address, phone, email
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
