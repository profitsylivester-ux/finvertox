"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Target, Plus, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  // Form State - Default to 0 to prevent hydration mismatch
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(0);

  // Set the real date safely on the client side
  useEffect(() => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch("/api/budgets").then(res => res.json()),
      fetch("/api/accounts").then(res => res.json())
    ]).then(([budgetsData, accountsData]) => {
      setBudgets(budgetsData.budgets || []);
      setExpenseAccounts((accountsData.accounts || []).filter((a: any) => a.type === 'Expense'));
      setIsLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: parseInt(accountId), month, year, amount }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setAccountId(""); setAmount("");
    setIsAdding(false);
    fetchData();
  };

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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
                <Target className="w-6 h-6 text-blue-600" /> Budget Management
              </h1>
              <p className="text-sm text-slate-500 mt-1">Set limits for expense categories and track spending.</p>
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Set Budget
            </button>
          </div>

          {isAdding && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-blue-50/10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Allocate Budget</h2>
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expense Category</label>
                  <select required value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500">
                    <option value="">Select an expense account...</option>
                    {expenseAccounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Budget Amount</label>
                  <input type="number" required step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500 font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Month</label>
                    <select value={month} onChange={e => setMonth(parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500">
                      {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Year</label>
                    <input type="number" value={year} onChange={e => setYear(parseInt(e.target.value))} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 mr-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Save Budget</button>
                </div>
              </form>
            </div>
          )}

          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-12 text-slate-500">Loading budgets...</div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-16 text-slate-400 flex flex-col items-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <Target className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
                <p className="font-medium text-slate-500 dark:text-slate-400">No budgets set yet.</p>
                <p className="text-sm mt-1">Set a budget to control your spending.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {budgets.map((budget) => {
                  const isOverBudget = budget.spent > budget.allocated;
                  
                  return (
                    <div key={budget.id}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg">{budget.accountName}</h3>
                          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{MONTHS[budget.month - 1]} {budget.year}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                            {budget.spent.toFixed(2)} / {budget.allocated.toFixed(2)}
                          </p>
                          <p className="text-xs font-medium text-slate-500">{budget.percentageUsed.toFixed(1)}% Used</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden relative">
                        <div 
                          className={`h-4 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : 'bg-blue-600'}`}
                          style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                        ></div>
                      </div>
                      
                      {isOverBudget && (
                        <p className="flex items-center gap-1 text-xs font-bold text-red-500 mt-2">
                          <ShieldAlert className="w-3 h-3" /> Over budget by {(budget.spent - budget.allocated).toFixed(2)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}