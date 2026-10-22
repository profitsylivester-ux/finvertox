"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, FileText, CheckCircle2, Wallet, Receipt } from "lucide-react";

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [supplierId, setSupplierId] = useState("");
  const [expenseAccountId, setExpenseAccountId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  const fetchData = () => {
    Promise.all([
      fetch("/api/expenses").then(res => res.json()),
      fetch("/api/suppliers").then(res => res.json()),
      fetch("/api/accounts").then(res => res.json())
    ]).then(([expensesData, suppliersData, accountsData]) => {
      setExpenses(expensesData.expenses || []);
      setSuppliers(suppliersData.suppliers || []);
      setExpenseAccounts((accountsData.accounts || []).filter((a: any) => a.type === 'Expense'));
      setIsLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          supplierId: parseInt(supplierId), 
          expenseAccountId: parseInt(expenseAccountId), 
          date, description, amount 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsRecording(false);
      setSupplierId(""); setExpenseAccountId(""); setDescription(""); setAmount("");
      fetchData();
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
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Expenses & Bills</h1>
              <p className="text-sm text-slate-500 mt-1">Record money your business owes to suppliers.</p>
            </div>
            {!isRecording && (
              <button 
                onClick={() => {
                  if (suppliers.length === 0) return alert("Please add a supplier first.");
                  setIsRecording(true);
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" /> Record Expense
              </button>
            )}
          </div>

          {isRecording && (
            <div className="p-6 border-b border-slate-200 bg-blue-50/10">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Record New Expense</h2>
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supplier</label>
                    <select required value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500">
                      <option value="">Select Supplier...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Expense Category</label>
                    <select required value={expenseAccountId} onChange={e => setExpenseAccountId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500">
                      <option value="">Select Category...</option>
                      {expenseAccounts.map(a => <option key={a.id} value={a.id}>{a.code} - {a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                    <input type="number" required step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 font-mono" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <input type="text" required value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Internet Bill for October" className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsRecording(false)} className="px-6 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Save & Post to Ledger</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading && !isRecording ? (
              <div className="p-12 text-center text-slate-500">Loading expenses...</div>
            ) : expenses.length === 0 && !isRecording ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <Receipt className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">No expenses recorded yet.</p>
                <p className="text-sm mt-1">Record a bill to track your spending.</p>
              </div>
            ) : expenses.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Supplier</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Category</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Description</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{exp.date}</td>
                      <td className="px-6 py-4 text-slate-700">{exp.supplierName}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{exp.accountName}</td>
                      <td className="px-6 py-4 text-slate-600">{exp.description}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-red-600">-{parseFloat(exp.amount).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}