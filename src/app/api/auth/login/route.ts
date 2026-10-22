import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users, activityLogs } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { encrypt } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body.email.toLowerCase().trim();
    const password = body.password;

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }
    
    if (user.status === 'suspended') {
      return NextResponse.json({ error: "Account suspended. Contact your CEO." }, { status: 403 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Include tenantId in the secure token
    const session = await encrypt({ 
      userId: user.id, 
      tenantId: user.tenantId || user.id, 
      email: user.email, 
      role: user.role 
    });

    const cookieStore = await cookies();
    cookieStore.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    await db.insert(activityLogs).values({
      tenantId: user.tenantId || user.id,
      userName: `${user.firstName} ${user.lastName}`,
      action: 'LOGIN',
      details: `Signed in to the workspace`
    });

    return NextResponse.json({ success: true, message: "Logged in successfully" });
  } catch (error: any) {
    console.error("Detailed Login Error:", error);
    return NextResponse.json({ error: "Database connection error or server issue" }, { status: 500 });
  }
}