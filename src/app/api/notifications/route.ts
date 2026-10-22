import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { activityLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const logs = await db.select().from(activityLogs)
      .where(eq(activityLogs.tenantId, payload.userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(10); // Only show the last 10 activities
      
    return NextResponse.json({ logs });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
