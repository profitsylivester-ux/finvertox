import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { db } from '@/db';
import { bankTransactions, journalEntries, bankAccounts } from '@/db/schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;

    // Fetch unreconciled bank transactions
    const bankTxs = await db.select({
      id: bankTransactions.id,
      date: bankTransactions.date,
      description: bankTransactions.description,
      amount: bankTransactions.amount,
      type: bankTransactions.type,
      status: bankTransactions.status,
    })
    .from(bankTransactions)
    .where(and(eq(bankTransactions.tenantId, tenantId), eq(bankTransactions.status, 'unreconciled')))
    .orderBy(desc(bankTransactions.date));

    // Fetch posted journal entries that haven't been matched yet
    // A simple way to check if it's matched: LEFT JOIN bankTransactions on matchedJournalId
    const ledgerEntries = await db.select({
      id: journalEntries.id,
      date: journalEntries.date,
      description: journalEntries.description,
      reference: journalEntries.reference,
      amount: sql<string>`(SELECT SUM(amount) FROM journal_lines WHERE journal_id = ${journalEntries.id} AND type = 'debit')`
    })
    .from(journalEntries)
    .where(and(eq(journalEntries.tenantId, tenantId), eq(journalEntries.status, 'posted')))
    .orderBy(desc(journalEntries.date));

    // Filter out already matched journal entries
    const matchedResult = await db.select({ matchedJournalId: bankTransactions.matchedJournalId }).from(bankTransactions).where(eq(bankTransactions.tenantId, tenantId));
    const matchedIds = matchedResult.map(m => m.matchedJournalId).filter(id => id !== null);
    
    const unreconciledLedger = ledgerEntries.filter(entry => !matchedIds.includes(entry.id));

    return NextResponse.json({ bankTxs, unreconciledLedger });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reconciliation data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const payload = await decrypt(session);
    const tenantId = payload.tenantId || payload.userId;
    const { action, bankTxId, journalId, amount, description, type } = await req.json();

    if (action === 'simulate_import') {
      // Find a bank account to attach to
      const [account] = await db.select().from(bankAccounts).where(eq(bankAccounts.tenantId, tenantId));
      if (!account) return NextResponse.json({ error: "Please create a bank account first." }, { status: 400 });

      // Generate fake transactions
      const today = new Date().toISOString().split('T')[0];
      await db.insert(bankTransactions).values([
        { tenantId, bankAccountId: account.id, date: today, description: "Bank Transfer from Customer A", amount: "500000.00", type: "credit" },
        { tenantId, bankAccountId: account.id, date: today, description: "M-Pesa Deposit", amount: "150000.00", type: "credit" },
        { tenantId, bankAccountId: account.id, date: today, description: "Office Rent Payment", amount: "800000.00", type: "debit" },
      ]);

      return NextResponse.json({ success: true });
    }

    if (action === 'reconcile') {
      await db.update(bankTransactions)
        .set({ status: 'reconciled', matchedJournalId: journalId })
        .where(and(eq(bankTransactions.id, bankTxId), eq(bankTransactions.tenantId, tenantId)));
        
      return NextResponse.json({ success: true });
    }

    if (action === 'add_ledger_entry') {
       // Option to manually add a missing ledger entry directly during reconciliation
       await db.insert(journalEntries).values({
         tenantId, date: new Date().toISOString().split('T')[0], description, reference: "Bank Rec Adjustment", status: 'posted'
       }).returning();
       return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process reconciliation" }, { status: 500 });
  }
}