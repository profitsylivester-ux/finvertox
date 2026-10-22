"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";

interface JournalLine {
  id: number;
  type: "debit" | "credit";
  amount: string;
  accountCode: string;
  accountName: string;
}

interface JournalEntry {
  id: number;
  date: string;
  description: string;
  reference: string;
  status: string;
  lines: JournalLine[];
}

export default function GeneralLedgerPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/journal")
      .then(res => res.json())
      .then(data => {
        setEntries(data.entries || []);
        setIsLoading(false);
      });
  }, []);

  const toggleRow = (id: number) => {
    setExpandedEntry(expandedEntry === id ? null : id);
  };

  const filteredEntries = entries.filter(e => 
    e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.reference?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">General Ledger</h1>
              <p className="text-sm text-slate-500 mt-1">View and audit every posted double-entry transaction.</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by description or ref..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">Loading ledger history...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <ShieldCheck className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">No journal entries found.</p>
                <p className="text-sm mt-1">Post an entry to see it appear here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-600 w-12"></th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Date</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Reference</th>
                    <th className="px-6 py-3 font-semibold text-slate-600">Description</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-right">Total Amount</th>
                    <th className="px-6 py-3 font-semibold text-slate-600 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEntries.map((entry) => {
                    const totalAmount = entry.lines.filter(l => l.type === 'debit').reduce((sum, l) => sum + parseFloat(l.amount), 0);
                    const isExpanded = expandedEntry === entry.id;

                    return (
                      <>
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => toggleRow(entry.id)}>
                          <td className="px-6 py-4 text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">{entry.date}</td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">{entry.reference || "-"}</td>
                          <td className="px-6 py-4 text-slate-800">{entry.description}</td>
                          <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono">{totalAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                        
                        {/* EXPANDED LINES */}
                        {isExpanded && (
                          <tr key={`${entry.id}-details`}>
                            <td colSpan={6} className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 border-b">
                              <div className="pl-10 pr-4">
                                <table className="w-full text-xs text-left">
                                  <thead>
                                    <tr className="text-slate-500 border-b border-slate-200">
                                      <th className="pb-2 font-semibold">Account</th>
                                      <th className="pb-2 font-semibold text-right">Debit</th>
                                      <th className="pb-2 font-semibold text-right">Credit</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {entry.lines.map(line => (
                                      <tr key={line.id}>
                                        <td className="py-2 text-slate-700 font-medium">
                                          {line.accountCode} - {line.accountName}
                                        </td>
                                        <td className="py-2 text-right font-mono text-slate-800">
                                          {line.type === 'debit' ? parseFloat(line.amount).toFixed(2) : ''}
                                        </td>
                                        <td className="py-2 text-right font-mono text-slate-800">
                                          {line.type === 'credit' ? parseFloat(line.amount).toFixed(2) : ''}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}