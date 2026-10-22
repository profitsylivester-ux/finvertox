import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { users, activityLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    if (payload.role !== 'admin') return NextResponse.json({ error: "Only CEO can manage users" }, { status: 403 });

    const params = await context.params;
    const targetUserId = parseInt(params.id);
    
    if (isNaN(targetUserId)) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    if (targetUserId === payload.userId) return NextResponse.json({ error: "Cannot modify self" }, { status: 400 });

    const body = await req.json();
    const updateData: any = {};
    if (body.status) updateData.status = body.status;
    if (body.role) updateData.role = body.role;

    await db.update(users).set(updateData).where(eq(users.id, targetUserId));

    await db.insert(activityLogs).values({
      tenantId: payload.userId,
      userName: `${payload.firstName} ${payload.lastName}`,
      action: 'UPDATE_USER',
      details: `Updated user ID ${targetUserId}`
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}