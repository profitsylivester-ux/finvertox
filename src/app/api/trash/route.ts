import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { deletedRecords } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const list = await db.select().from(deletedRecords)
      .where(eq(deletedRecords.tenantId, payload.userId))
      .orderBy(desc(deletedRecords.createdAt));
    
    return NextResponse.json({ trash: list });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch trash" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    if (payload.role !== 'admin') return NextResponse.json({ error: "Only CEO can manage trash" }, { status: 403 });

    const { trashId, action } = await req.json(); // action: 'restore' or 'permanent_delete'

    if (action === 'permanent_delete') {
      await db.delete(deletedRecords).where(and(eq(deletedRecords.id, trashId), eq(deletedRecords.tenantId, payload.userId)));
    } else if (action === 'restore') {
      // In a real app, you would insert the JSON data back into the original table here.
      // For now, we just remove it from the trash.
      await db.delete(deletedRecords).where(and(eq(deletedRecords.id, trashId), eq(deletedRecords.tenantId, payload.userId)));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process action" }, { status: 500 });
  }
}
