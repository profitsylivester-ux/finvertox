"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";

interface ReportRow {
  id: number;
  code: string;
  name: string;
  type: string;
  debit: number;
  credit: number;
}

export default function TrialBalancePage() {
  const [report, setReport] = useState<ReportRow[]>([]);
  const [totalDebits, setTotalDebits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports/trial-balance")
      .then(res => res.json())
      .then(data => {
        setReport(data.report || []);
        setTotalDebits(data.totalDebits || 0);
        setTotalCredits(data.totalCredits || 0);
        setIsLoading(false);
      });
  }, []);

  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-900">Trial Balance</h1>
            <p className="text-sm text-slate-500 mt-1">Report of all account balances as of today.</p>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">Calculating balances...</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600">Code</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Account Name</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Debit (TZS)</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Credit (TZS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {report.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{row.code}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{row.name}</td>
                      <td className="px-6 py-4 text-right font-mono text-slate-800">
                        {row.debit > 0 ? row.debit.toFixed(2) : "-"}
                      </td>
                      <td className="px-6 py-4 text-right font-mono text-slate-800">
                        {row.credit > 0 ? row.credit.toFixed(2) : "-"}
                      </td>
                    </tr>
                  ))}
                  
                  {/* EMPTY STATE */}
                  {report.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        No accounts found to generate a trial balance.
                      </td>
                    </tr>
                  )}
                </tbody>
                
                {/* TOTALS FOOTER */}
                <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-bold text-slate-900">
                  <tr>
                    <td colSpan={2} className="px-6 py-4 text-right">Total Balances:</td>
                    <td className="px-6 py-4 text-right font-mono">{totalDebits.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-mono">{totalCredits.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>

          {/* BALANCE CHECK BANNER */}
          {!isLoading && report.length > 0 && (
            <div className={`p-4 border-t flex items-center justify-center gap-2 text-sm font-semibold ${
              isBalanced 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              {isBalanced ? (
                <>
                  <CheckCircle2 className="w-5 h-5" /> 
                  The Trial Balance is perfectly balanced (Debits = Credits).
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5" /> 
                  Warning: The Trial Balance is out of balance by {(Math.abs(totalDebits - totalCredits)).toFixed(2)}!
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}