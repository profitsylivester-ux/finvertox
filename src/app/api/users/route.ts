import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { users, activityLogs } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    
    // Fetch all users that belong to this CEO's tenant OR the CEO themselves
    const team = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      role: users.role,
      status: users.status, // THIS WAS MISSING
      createdAt: users.createdAt
    }).from(users).where(
      or(
        eq(users.tenantId, payload.userId),
        eq(users.id, payload.userId)
      )
    );

    return NextResponse.json({ users: team });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    if (payload.role !== 'admin') return NextResponse.json({ error: "Only CEO can invite users" }, { status: 403 });

    const { firstName, lastName, email, password, role } = await req.json();

    const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim()));
    if (existing.length > 0) return NextResponse.json({ error: "Email already in use" }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      tenantId: payload.userId,
      firstName,
      lastName,
      companyName: "Company", 
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role || 'finance'
    }).returning();

    await db.insert(activityLogs).values({
      tenantId: payload.userId,
      userName: `${payload.firstName} ${payload.lastName}`,
      action: 'INVITE_USER',
      details: `Invited ${firstName} ${lastName} as ${role}`
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: "Failed to invite user" }, { status: 500 });
  }
}