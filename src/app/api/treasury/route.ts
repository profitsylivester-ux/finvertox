import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { bankAccounts } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    
    const list = await db.select().from(bankAccounts).where(eq(bankAccounts.tenantId, tenantId)).orderBy(desc(bankAccounts.createdAt));
    
    return NextResponse.json({ accounts: list });
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
    if (payload.role !== 'admin') return NextResponse.json({ error: "Only CEO can add bank accounts" }, { status: 403 });

    const tenantId = payload.tenantId || payload.userId;
    const { name, accountNumber, type, balance } = await req.json();

    if (!name || !type) return NextResponse.json({ error: "Name and type are required" }, { status: 400 });

    const [newAccount] = await db.insert(bankAccounts).values({
      tenantId,
      name, 
      accountNumber, 
      type, 
      balance: balance || '0.00'
    }).returning();

    return NextResponse.json({ success: true, account: newAccount });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}