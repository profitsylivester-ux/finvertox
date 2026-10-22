"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, CheckCircle2, AlertCircle, Lock } from "lucide-react";

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
}

interface LineItem {
  accountId: number | "";
  type: "debit" | "credit";
  amount: string;
}

export default function JournalEntryPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [closedPeriods, setClosedPeriods] = useState<any[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [reference, setReference] = useState("");
  const [lines, setLines] = useState<LineItem[]>([
    { accountId: "", type: "debit", amount: "" },
    { accountId: "", type: "credit", amount: "" },
  ]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch accounts and closed periods on load
    Promise.all([
      fetch("/api/accounts").then(res => res.json()),
      fetch("/api/periods").then(res => res.json())
    ]).then(([accountsData, periodsData]) => {
      setAccounts(accountsData.accounts || []);
      setClosedPeriods(periodsData.periods || []);
    });
  }, []);

  const addLine = () => setLines([...lines, { accountId: "", type: "debit", amount: "" }]);
  const removeLine = (index: number) => setLines(lines.filter((_, i) => i !== index));
  
  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    const newLines = [...lines];
    // @ts-ignore
    newLines[index][field] = value;
    setLines(newLines);
  };

  const totalDebits = lines.filter(l => l.type === "debit").reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
  const totalCredits = lines.filter(l => l.type === "credit").reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0);
  const difference = Math.abs(totalDebits - totalCredits);
  const isBalanced = difference < 0.01 && totalDebits > 0;

  // Check if the selected date falls in a closed period
  const entryDate = new Date(date);
  const entryMonth = entryDate.getMonth() + 1;
  const entryYear = entryDate.getFullYear();
  const isPeriodClosed = closedPeriods.some(p => p.month === entryMonth && p.year === entryYear && p.status === 'closed');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced || isPeriodClosed) return;
    
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, description, reference, lines }),
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-900">New Journal Entry</h1>
            <p className="text-sm text-slate-500 mt-1">Record a double-entry transaction in the general ledger.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}
            
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5" /> Entry posted successfully! Updating ledger...
              </div>
            )}

            {/* LIVE LOCK WARNING */}
            {isPeriodClosed && !success && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg flex items-center gap-2 font-medium">
                <Lock className="w-5 h-5" /> 
                The financial period for {date} is locked. You cannot post new entries to this month.
              </div>
            )}

            {/* Header Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reference (Optional)</label>
                <input type="text" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. INV-1001" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Initial Capital Injection" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            {/* Lines */}
            <div className="border border-slate-200 rounded-lg overflow-hidden mt-6">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600 w-1/2">Account</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Type</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Amount</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        <select 
                          required 
                          value={line.accountId} 
                          onChange={(e) => updateLine(index, 'accountId', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500"
                        >
                          <option value="">Select Account...</option>
                          {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <select 
                          value={line.type} 
                          onChange={(e) => updateLine(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500"
                        >
                          <option value="debit">Debit</option>
                          <option value="credit">Credit</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input 
                          type="number" 
                          step="0.01" 
                          required
                          value={line.amount} 
                          onChange={(e) => updateLine(index, 'amount', e.target.value)}
                          placeholder="0.00" 
                          className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 font-mono text-right" 
                        />
                      </td>
                      <td className="p-2 text-center">
                        {lines.length > 2 && (
                          <button type="button" onClick={() => removeLine(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-end mt-2">
              <button type="button" onClick={addLine} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mb-2">
                <Plus className="w-4 h-4" /> Add Line
              </button>

              <div className="text-right">
                <div className="flex gap-8 text-sm font-bold mb-1">
                  <div className={totalDebits > 0 ? "text-slate-900" : "text-slate-400"}>Total Debits: {totalDebits.toFixed(2)}</div>
                  <div className={totalCredits > 0 ? "text-slate-900" : "text-slate-400"}>Total Credits: {totalCredits.toFixed(2)}</div>
                </div>
                {!isBalanced && (totalDebits > 0 || totalCredits > 0) && (
                  <div className="flex items-center justify-end gap-1 text-xs font-semibold text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" /> 
                    Out of balance by {difference.toFixed(2)}
                  </div>
                )}
                {isBalanced && totalDebits > 0 && (
                  <div className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ready to post
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button 
                type="submit" 
                disabled={!isBalanced || isLoading || isPeriodClosed}
                className={`px-8 py-2.5 rounded-lg font-semibold transition-colors text-white ${
                  isPeriodClosed ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {isLoading ? "Posting..." : isPeriodClosed ? "Period Locked" : "Post Journal Entry"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}