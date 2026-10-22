"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle, Clock, ShieldAlert } from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchApprovals = async () => {
    try {
      const [approvalsRes, meRes] = await Promise.all([
        fetch("/api/approvals", { cache: "no-store" }),
        fetch("/api/auth/me", { cache: "no-store" })
      ]);
      
      if (!approvalsRes.ok || !meRes.ok) throw new Error("Failed to fetch");
      
      const approvalsData = await approvalsRes.json();
      const meData = await meRes.json();
      
      setApprovals(approvalsData.approvals || []);
      setUser(meData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchApprovals(); }, []);

  const handleAction = async (expenseId: number, action: 'approve' | 'reject') => {
    setProcessingId(expenseId);
    
    try {
      const res = await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId, action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh the list
      fetchApprovals();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const currencySymbol = "TZS"; // You can replace this with user?.currency logic if needed

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-blue-600" /> Pending Approvals
              </h1>
              <p className="text-sm text-slate-500 mt-1">Review transactions submitted by your team before they hit the ledger.</p>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading pending approvals...</div>
            ) : approvals.length === 0 ? (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <CheckCircle2 className="w-12 h-12 mb-4 text-emerald-400" />
                <p className="font-medium text-slate-500 dark:text-slate-400">You're all caught up!</p>
                <p className="text-sm mt-1">There are no transactions waiting for your approval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {approvals.map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400 mt-1">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-lg">{item.description}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Supplier: {item.supplierName}</span>
                          <span>Category: {item.accountName}</span>
                          <span>Date: {item.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 md:border-l md:border-slate-200 md:dark:border-slate-700 md:pl-6">
                      <div className="text-right mr-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">Amount</p>
                        <p className="font-mono font-bold text-xl text-slate-900 dark:text-white">
                          {currencySymbol} {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(item.id, 'reject')}
                          disabled={processingId === item.id}
                          className="flex items-center justify-center gap-1 px-4 py-2 text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                        <button 
                          onClick={() => handleAction(item.id, 'approve')}
                          disabled={processingId === item.id}
                          className="flex items-center justify-center gap-1 px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}