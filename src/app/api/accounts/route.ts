import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { accounts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    // Use the tenantId (which points to the CEO) instead of the user's own ID
    const tenantId = payload.tenantId || payload.userId; 
    
    const tenantAccounts = await db.select().from(accounts).where(eq(accounts.tenantId, tenantId));
    
    return NextResponse.json({ accounts: tenantAccounts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    const { code, name, type } = await req.json();

    if (!code || !name || !type) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const [newAccount] = await db.insert(accounts).values({
      tenantId: tenantId,
      code,
      name,
      type,
      balance: '0.00'
    }).returning();

    return NextResponse.json({ success: true, account: newAccount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}