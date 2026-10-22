import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, companyName, password } = body;
    const email = body.email.toLowerCase().trim();

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [newUser] = await db.insert(users).values({
      firstName,
      lastName,
      companyName,
      email,
      passwordHash,
      role: 'admin',
    }).returning();

    // Update the tenantId to be their own ID
    await db.update(users).set({ tenantId: newUser.id }).where(eq(users.id, newUser.id));

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error: any) {
    console.error("Detailed Registration Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 });
  }
}