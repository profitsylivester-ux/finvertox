import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    
    // Mark all unread logs for this tenant as read
    await db.update(activityLogs)
      .set({ isRead: true })
      .where(and(eq(activityLogs.tenantId, payload.userId), eq(activityLogs.isRead, false)));
      
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }
}
