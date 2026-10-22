"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Trash2, RotateCcw, ShieldAlert, Info } from "lucide-react";

export default function TrashPage() {
  const [trash, setTrash] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const fetchData = () => {
    Promise.all([
      fetch("/api/trash").then(res => res.json()),
      fetch("/api/auth/me").then(res => res.json())
    ]).then(([trashData, userData]) => {
      setTrash(trashData.trash || []);
      setUser(userData);
      setIsLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (id: number, action: string) => {
    const confirmMsg = action === 'permanent_delete' 
      ? "Are you sure? This will permanently destroy the record and cannot be undone." 
      : "Are you sure you want to restore this record?";
      
    if (!confirm(confirmMsg)) return;

    await fetch("/api/trash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trashId: id, action }),
    });
    fetchData();
  };

  const isCEO = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Trash & Archive</h1>
              <p className="text-sm text-slate-500 mt-1">Recover or permanently delete records.</p>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3 text-blue-800 dark:text-blue-300 mb-8">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <strong>How this works:</strong> When a record (like an invoice or expense) is deleted, it is moved here instead of being destroyed immediately. This is a safety feature. Only the <strong>CEO</strong> can permanently delete items or restore them to the main system.
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading trash...</div>
            ) : trash.length === 0 ? (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <Trash2 className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
                <p className="font-medium text-slate-500 dark:text-slate-400">Trash is empty.</p>
                <p className="text-sm mt-1">Deleted records will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trash.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.recordType} #{item.recordId}</p>
                      <p className="text-xs text-slate-500">Deleted on {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(item.id, 'restore')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors">
                        <RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                      <button onClick={() => handleAction(item.id, 'permanent_delete')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                      </button>
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