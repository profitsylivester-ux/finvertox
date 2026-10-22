import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { currency } = await req.json();
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = await decrypt(session);

    // Update the user's currency
    await db.update(users).set({ currency }).where(eq(users.id, payload.userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
  }
}
