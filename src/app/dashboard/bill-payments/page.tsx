"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, DollarSign, Wallet, Landmark } from "lucide-react";

export default function BillPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [unpaidExpenses, setUnpaidExpenses] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [expenseId, setExpenseId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState("Bank Transfer");
  const [bankAccountId, setBankAccountId] = useState("");

  const fetchData = () => {
    Promise.all([
      fetch("/api/expense-payments").then(res => res.json()),
      fetch("/api/expenses").then(res => res.json()),
      fetch("/api/treasury").then(res => res.json())
    ]).then(([paymentsData, expensesData, treasuryData]) => {
      setPayments(paymentsData.payments || []);
      setUnpaidExpenses((expensesData.expenses || []).filter((exp: any) => exp.status === 'unpaid'));
      setBankAccounts(treasuryData.accounts || []);
      setIsLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleExpenseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setExpenseId(selectedId);
    const exp = unpaidExpenses.find(i => i.id.toString() === selectedId);
    if (exp) setAmount(exp.amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!bankAccountId) {
      setError("Please select a bank account.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/expense-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          expenseId: parseInt(expenseId), 
          amount, 
          date, 
          method, 
          bankAccountId: parseInt(bankAccountId) 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsRecording(false);
      setExpenseId(""); setAmount(""); setBankAccountId("");
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
              <h1 className="text-2xl font-bold text-slate-900">Bill Payments</h1>
              <p className="text-sm text-slate-500 mt-1">Record money leaving your bank accounts to pay suppliers.</p>
            </div>
            {!isRecording && (
              <button 
                onClick={() => {
                  if (unpaidExpenses.length === 0) return alert("No unpaid expenses to pay.");
                  if (bankAccounts.length === 0) return alert("Please add a bank account in Treasury first.");
                  setIsRecording(true);
                }} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <DollarSign className="w-4 h-4" /> Pay Expense
              </button>
            )}
          </div>

          {isRecording && (
            <div className="p-6 border-b border-slate-200 bg-blue-50/20">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Record Payment to Supplier</h2>
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Unpaid Expense</label>
                    <select required value={expenseId} onChange={handleExpenseChange} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500">
                      <option value="">Select Expense...</option>
                      {unpaidExpenses.map(exp => <option key={exp.id} value={exp.id}>{exp.supplierName} - {exp.description} ({exp.amount})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid</label>
                    <input type="number" required step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 font-mono font-bold text-red-600" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pay From (Bank Account)</label>
                    <div className="relative">
                      <Landmark className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <select required value={bankAccountId} onChange={e => setBankAccountId(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500">
                        <option value="">Select Account...</option>
                        {bankAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Bal: {acc.balance})</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                    <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500">
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsRecording(false)} className="px-6 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Save Payment & Post to Ledger</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading && !isRecording ? (
              <div className="p-12 text-center text-slate-500">Loading bill payments...</div>
            ) : payments.length === 0 && !isRecording ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <Wallet className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">No supplier payments yet.</p>
                <p className="text-sm mt-1">Pay an expense to clear your liabilities.</p>
              </div>
            ) : payments.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Supplier</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Description</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Paid From</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{pmt.date}</td>
                      <td className="px-6 py-4 text-slate-700 font-medium">{pmt.supplierName}</td>
                      <td className="px-6 py-4 text-slate-600">{pmt.description}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs font-semibold">{pmt.bankName || "Unknown"}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-red-600">-{parseFloat(pmt.amount).toFixed(2)}</td>
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