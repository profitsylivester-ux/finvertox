import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const list = await db.select().from(customers).where(eq(customers.tenantId, payload.userId)).orderBy(desc(customers.createdAt));
    
    return NextResponse.json({ customers: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const { name, email, phone, address } = await req.json();

    if (!name) return NextResponse.json({ error: "Customer name is required" }, { status: 400 });

    const [newCustomer] = await db.insert(customers).values({
      tenantId: payload.userId,
      name, email, phone, address
    }).returning();

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
