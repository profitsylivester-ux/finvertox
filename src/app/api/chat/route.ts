import { NextResponse } from 'next/server';
import { db } from '@/db';
import { financeTerms } from '@/db/schema';

// 1. Fuzzy matching function to detect typos
function getLevenshteinDistance(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1) // insertion/deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const lowerMsg = message.toLowerCase().replace(/[^a-z0-9\s]/g, ''); // remove punctuation
    const userWords = lowerMsg.split(/\s+/).filter(w => w.length > 2); // ignore tiny words like "is", "a"

    const allTerms = await db.select().from(financeTerms);
    let bestMatch = null;
    let highestScore = 0;

    allTerms.forEach(term => {
      let score = 0;
      const termWords = term.term.toLowerCase().split(' ');
      const keywords = term.keywords.split(',').map(k => k.trim().toLowerCase());

      userWords.forEach(userWord => {
        // Check against the actual term name
        termWords.forEach(termWord => {
          if (userWord === termWord) score += 20;
          else if (termWord.startsWith(userWord) && userWord.length > 3) score += 10;
          else if (userWord.length > 3 && getLevenshteinDistance(userWord, termWord) <= 2) score += 15; // Typo caught!
        });

        // Check against keywords
        keywords.forEach(kw => {
           const kwWords = kw.split(' ');
           kwWords.forEach(kwWord => {
             if (userWord === kwWord) score += 10;
             else if (userWord.length > 3 && getLevenshteinDistance(userWord, kwWord) <= 2) score += 8;
           });
        });
      });

      if (score > highestScore) {
        highestScore = score;
        bestMatch = term;
      }
    });

    if (bestMatch && highestScore > 0) {
      return NextResponse.json({ text: bestMatch.definition });
    }

    // Smart fallback for FinVortex specific features
    if (/pay|roll|sal|hr/i.test(lowerMsg)) return NextResponse.json({ text: "The Payroll & HR module secures sensitive employee data with strict access controls. Every payroll disbursement requires CEO-only authorization." });
    if (/sec|safe|data|protect|isolat/i.test(lowerMsg)) return NextResponse.json({ text: "Your data is highly secure. FinVortex uses bank-grade encryption and strict database-level isolation. No other company can ever access your financial records." });
    if (/invoic|bill|receiv/i.test(lowerMsg)) return NextResponse.json({ text: "Our Invoicing module allows you to generate, track, and reconcile invoices automatically. It posts directly to the general ledger." });
    if (/price|cost|plan|subscription/i.test(lowerMsg)) return NextResponse.json({ text: "We offer scalable plans starting with a free tier for small businesses, up to enterprise-level custom pricing." });
    
    // Default
    return NextResponse.json({ text: "I am trained on all FinVortex modules and financial concepts. Ask me about Journal Entries, Trial Balances, Security, Payroll, or our Invoicing system." });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ text: "I am having trouble reaching the knowledge base right now. Please try again." }, { status: 500 });
  }
}
