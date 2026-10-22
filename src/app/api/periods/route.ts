import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { fiscalPeriods } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await decrypt(session);

    const periods = await db.select().from(fiscalPeriods).where(eq(fiscalPeriods.tenantId, payload.userId));
    return NextResponse.json({ periods });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch periods" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await decrypt(session);

    const { month, year, action } = await req.json(); // action: 'close' or 'open'

    // Check if it exists
    const existing = await db.select().from(fiscalPeriods).where(
      and(
        eq(fiscalPeriods.tenantId, payload.userId),
        eq(fiscalPeriods.month, month),
        eq(fiscalPeriods.year, year)
      )
    );

    if (existing.length > 0) {
      await db.update(fiscalPeriods)
        .set({ status: action === 'close' ? 'closed' : 'open' })
        .where(eq(fiscalPeriods.id, existing[0].id));
    } else {
      await db.insert(fiscalPeriods).values({
        tenantId: payload.userId,
        month,
        year,
        status: action === 'close' ? 'closed' : 'open'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update period" }, { status: 500 });
  }
}
