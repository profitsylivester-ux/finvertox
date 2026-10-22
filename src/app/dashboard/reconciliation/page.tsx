"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, CheckCircle2, ArrowRightLeft, Building2 } from "lucide-react";

export default function ReconciliationPage() {
  const [bankTxs, setBankTxs] = useState<any[]>([]);
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/reconciliation", { cache: "no-store" });
      const data = await res.json();
      setBankTxs(data.bankTxs || []);
      setLedgerEntries(data.unreconciledLedger || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSimulateImport = async () => {
    setIsProcessing(true);
    await fetch("/api/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: 'simulate_import' }),
    });
    fetchData();
    setIsProcessing(false);
  };

  const handleMatch = async (bankTxId: number, journalId: number) => {
    setIsProcessing(true);
    await fetch("/api/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: 'reconcile', bankTxId, journalId }),
    });
    fetchData();
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-7xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-6 h-6 text-blue-600" /> Bank Reconciliation
            </h1>
            <p className="text-sm text-slate-500 mt-1">Match your bank statement to your ledger to ensure accuracy.</p>
          </div>
          <button 
            onClick={handleSimulateImport}
            disabled={isProcessing}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} /> Simulate Bank Import
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT: BANK STATEMENT */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-slate-900 dark:text-white">Bank Statement (Unmatched)</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px]">
              {isLoading ? (
                <div className="text-center text-slate-500 py-8">Loading...</div>
              ) : bankTxs.length === 0 ? (
                <div className="text-center text-slate-400 py-8 border border-dashed rounded-lg">No unmatched bank transactions.<br/>Click "Simulate Bank Import" above.</div>
              ) : (
                bankTxs.map(tx => (
                  <div key={tx.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{tx.description}</p>
                        <p className="text-xs text-slate-500">{tx.date}</p>
                      </div>
                      <p className={`font-mono font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{parseFloat(tx.amount).toFixed(2)}
                      </p>
                    </div>
                    {ledgerEntries.length > 0 && (
                       <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                         <select 
                           onChange={(e) => handleMatch(tx.id, parseInt(e.target.value))}
                           defaultValue=""
                           className="text-xs px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-slate-50 dark:bg-slate-900 outline-none w-full max-w-xs"
                         >
                           <option value="" disabled>Match to Ledger Entry...</option>
                           {ledgerEntries.map(le => (
                             <option key={le.id} value={le.id}>{le.description} ({parseFloat(le.amount).toFixed(2)})</option>
                           ))}
                         </select>
                       </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: LEDGER */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/10 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-slate-900 dark:text-white">Your Ledger (Unmatched)</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px]">
              {isLoading ? (
                <div className="text-center text-slate-500 py-8">Loading...</div>
              ) : ledgerEntries.length === 0 ? (
                <div className="text-center text-slate-400 py-8 border border-dashed rounded-lg">No unmatched ledger entries.</div>
              ) : (
                ledgerEntries.map(le => (
                  <div key={le.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{le.description}</p>
                        <p className="text-xs text-slate-500">Ref: {le.reference || "N/A"} | {le.date}</p>
                      </div>
                      <p className="font-mono font-bold text-slate-700 dark:text-slate-300">{parseFloat(le.amount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}