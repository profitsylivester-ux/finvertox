"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Info, TrendingUp, TrendingDown, DollarSign, Scale } from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pl" | "bs">("pl");

  useEffect(() => {
    fetch("/api/reports/financials")
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Generating financial reports...</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">Failed to load reports.</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          
          <div className="border-b border-slate-200">
            <div className="flex">
              <button 
                onClick={() => setActiveTab("pl")}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pl' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Profit & Loss (Income Statement)
              </button>
              <button 
                onClick={() => setActiveTab("bs")}
                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bs' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Balance Sheet
              </button>
            </div>
          </div>

          <div className="p-8">
            
            {/* PROFIT AND LOSS TAB */}
            {activeTab === "pl" && (
              <div className="space-y-8">
                
                {/* Plain English Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed">
                    <strong>What is this?</strong> This report shows how much money your business made (Revenue) versus how much it spent (Expenses) over a period of time. If Revenue is higher than Expenses, you have a <strong>Net Profit</strong>. If Expenses are higher, you have a Net Loss.
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Revenue Section */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-500" /> Revenue (Money In)
                    </h3>
                    <div className="space-y-2">
                      {data.profitAndLoss.revenue.map((acc: any) => (
                        <div key={acc.id} className="flex justify-between text-sm">
                          <span className="text-slate-600">{acc.name}</span>
                          <span className="font-mono text-slate-900">{parseFloat(acc.balance).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
                        <span>Total Revenue</span>
                        <span className="font-mono">{data.profitAndLoss.totalRevenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Section */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-red-500" /> Expenses (Money Out)
                    </h3>
                    <div className="space-y-2">
                      {data.profitAndLoss.expenses.map((acc: any) => (
                        <div key={acc.id} className="flex justify-between text-sm">
                          <span className="text-slate-600">{acc.name}</span>
                          <span className="font-mono text-slate-900">{parseFloat(acc.balance).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100">
                        <span>Total Expenses</span>
                        <span className="font-mono">{data.profitAndLoss.totalExpenses.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className={`p-6 rounded-lg border-2 flex justify-between items-center ${data.profitAndLoss.netIncome >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <div>
                      <h3 className={`text-lg font-bold ${data.profitAndLoss.netIncome >= 0 ? 'text-emerald-800' : 'text-red-800'}`}>
                        Net {data.profitAndLoss.netIncome >= 0 ? "Profit" : "Loss"}
                      </h3>
                      <p className="text-sm text-slate-600 mt-1">Revenue minus Expenses</p>
                    </div>
                    <div className={`text-3xl font-bold font-mono ${data.profitAndLoss.netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {data.profitAndLoss.netIncome.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BALANCE SHEET TAB */}
            {activeTab === "bs" && (
              <div className="space-y-8">
                
                {/* Plain English Explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800">
                  <Scale className="w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-sm leading-relaxed">
                    <strong>What is this?</strong> This is a snapshot of what your business owns (Assets) and what it owes (Liabilities). Your Equity is what is left over for the owners. In accounting, <strong>Assets must always equal Liabilities + Equity.</strong>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* LEFT: Assets */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">Assets (What you own)</h3>
                    <div className="space-y-2">
                      {data.balanceSheet.assets.map((acc: any) => (
                        <div key={acc.id} className="flex justify-between text-sm">
                          <span className="text-slate-600">{acc.name}</span>
                          <span className="font-mono text-slate-900">{parseFloat(acc.balance).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold text-slate-900 pt-4 mt-2 border-t-2 border-slate-200 text-lg">
                        <span>Total Assets</span>
                        <span className="font-mono">{data.balanceSheet.totalAssets.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Liabilities & Equity */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">Liabilities & Equity</h3>
                    
                    <div className="mb-6">
                      <h4 className="text-sm font-bold text-slate-500 mb-2">Liabilities (What you owe)</h4>
                      <div className="space-y-2">
                        {data.balanceSheet.liabilities.map((acc: any) => (
                          <div key={acc.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{acc.name}</span>
                            <span className="font-mono text-slate-900">{parseFloat(acc.balance).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
                          <span>Total Liabilities</span>
                          <span className="font-mono">{data.balanceSheet.totalLiabilities.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-500 mb-2">Equity (Owner's stake)</h4>
                      <div className="space-y-2">
                        {data.balanceSheet.equity.map((acc: any) => (
                          <div key={acc.id} className="flex justify-between text-sm">
                            <span className="text-slate-600">{acc.name}</span>
                            <span className="font-mono text-slate-900">{parseFloat(acc.balance).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Retained Earnings (Net Income)</span>
                          <span className="font-mono text-slate-900">{data.balanceSheet.netIncome.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">
                          <span>Total Equity</span>
                          <span className="font-mono">{data.balanceSheet.totalEquity.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between font-bold text-slate-900 pt-4 mt-4 border-t-2 border-slate-200 text-lg">
                      <span>Total Liabilities & Equity</span>
                      <span className="font-mono">{(data.balanceSheet.totalLiabilities + data.balanceSheet.totalEquity).toFixed(2)}</span>
                    </div>

                  </div>
                </div>
                
                {/* Balance Check */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex justify-center">
                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-bold border border-emerald-200">
                     <Scale className="w-4 h-4" />
                     Assets ({data.balanceSheet.totalAssets.toFixed(2)}) = Liabilities + Equity ({(data.balanceSheet.totalLiabilities + data.balanceSheet.totalEquity).toFixed(2)})
                   </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}