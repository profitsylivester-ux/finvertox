import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, companyName, password } = body;
    const email = body.email.toLowerCase().trim(); // Normalize email

    // 1. Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 2. Hash the password securely
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Save to database
    await db.insert(users).values({
      firstName,
      lastName,
      companyName,
      email,
      passwordHash,
    });

    return NextResponse.json({ success: true, message: "Account created successfully" });
  } catch (error: any) {
    console.error("Detailed Registration Error:", error);
    // THIS WILL RETURN THE EXACT ERROR SO WE CAN SEE IT
    return NextResponse.json({ error: error.message || "Failed to create account" }, { status: 500 });
  }
}
