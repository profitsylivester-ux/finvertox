import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { journalEntries, journalLines, accounts, fiscalPeriods } from '@/db/schema';
import { eq, sql, desc, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.userId;

    const { date, description, reference, lines } = await req.json();

    // --- NEW: CHECK IF PERIOD IS CLOSED ---
    const entryDate = new Date(date);
    const entryMonth = entryDate.getMonth() + 1; // JS months are 0-indexed
    const entryYear = entryDate.getFullYear();

    const existingPeriod = await db.select().from(fiscalPeriods).where(
      and(
        eq(fiscalPeriods.tenantId, tenantId),
        eq(fiscalPeriods.month, entryMonth),
        eq(fiscalPeriods.year, entryYear),
        eq(fiscalPeriods.status, 'closed')
      )
    );

    if (existingPeriod.length > 0) {
      return NextResponse.json({ error: "This financial period is closed. You cannot post new entries." }, { status: 400 });
    }
    // ----------------------------------------

    const totalDebits = lines.filter((l: any) => l.type === 'debit').reduce((sum: number, l: any) => sum + parseFloat(l.amount), 0);
    const totalCredits = lines.filter((l: any) => l.type === 'credit').reduce((sum: number, l: any) => sum + parseFloat(l.amount), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return NextResponse.json({ error: "Debits and Credits do not balance!" }, { status: 400 });
    }

    const [newEntry] = await db.insert(journalEntries).values({
      tenantId, date, description, reference, status: 'posted'
    }).returning();

    for (const line of lines) {
      if (!line.accountId || !line.amount) continue;

      await db.insert(journalLines).values({
        journalId: newEntry.id,
        accountId: line.accountId,
        type: line.type,
        amount: line.amount,
      });

      const amountChange = line.type === 'debit' ? parseFloat(line.amount) : -parseFloat(line.amount);
      const [account] = await db.select().from(accounts).where(eq(accounts.id, line.accountId));
      
      let balanceAdjustment = amountChange;
      if (account.type === 'Liability' || account.type === 'Equity' || account.type === 'Revenue') {
        balanceAdjustment = line.type === 'credit' ? parseFloat(line.amount) : -parseFloat(line.amount);
      }

      await db.update(accounts)
        .set({ balance: sql`${accounts.balance} + ${balanceAdjustment}` })
        .where(eq(accounts.id, line.accountId));
    }

    return NextResponse.json({ success: true, message: "Journal Entry posted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to post journal entry" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);

    const entries = await db.select().from(journalEntries)
      .where(eq(journalEntries.tenantId, payload.userId))
      .orderBy(desc(journalEntries.createdAt));

    const allLines = await db.select({
      id: journalLines.id,
      journalId: journalLines.journalId,
      type: journalLines.type,
      amount: journalLines.amount,
      accountCode: accounts.code,
      accountName: accounts.name,
    })
    .from(journalLines)
    .leftJoin(accounts, eq(journalLines.accountId, accounts.id))
    .where(eq(accounts.tenantId, payload.userId));

    const entriesWithLines = entries.map(entry => ({
      ...entry,
      lines: allLines.filter(line => line.journalId === entry.id)
    }));

    return NextResponse.json({ entries: entriesWithLines });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch journal entries" }, { status: 500 });
  }
}