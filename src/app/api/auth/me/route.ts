import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    
    if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await decrypt(session);
    if (!payload || !payload.userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    const [user] = await db.select().from(users).where(eq(users.id, payload.userId));
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      email: user.email,
      role: user.role,
      currency: user.currency // NEW
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
