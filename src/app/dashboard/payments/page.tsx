"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, DollarSign, Wallet } from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState("Bank Transfer");

  const fetchData = () => {
    Promise.all([
      fetch("/api/payments").then(res => res.json()),
      fetch("/api/invoices").then(res => res.json())
    ]).then(([paymentsData, invoicesData]) => {
      setPayments(paymentsData.payments || []);
      setUnpaidInvoices((invoicesData.invoices || []).filter((inv: any) => inv.status === 'unpaid'));
      setIsLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setInvoiceId(selectedId);
    const inv = unpaidInvoices.find(i => i.id.toString() === selectedId);
    if (inv) setAmount(inv.total);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: parseInt(invoiceId), amount, date, method }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsRecording(false);
      setInvoiceId(""); setAmount("");
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
              <h1 className="text-2xl font-bold text-slate-900">Payments Received</h1>
              <p className="text-sm text-slate-500 mt-1">Record cash coming in from customers.</p>
            </div>
            {!isRecording && (
              <button 
                onClick={() => {
                  if (unpaidInvoices.length === 0) return alert("No unpaid invoices to record.");
                  setIsRecording(true);
                }} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
              >
                <DollarSign className="w-4 h-4" /> Record Payment
              </button>
            )}
          </div>

          {isRecording && (
            <div className="p-6 border-b border-slate-200 bg-emerald-50/20">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Record Payment</h2>
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Unpaid Invoice</label>
                    <select required value={invoiceId} onChange={handleInvoiceChange} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500">
                      <option value="">Select Invoice...</option>
                      {unpaidInvoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - {inv.customerName} ({inv.total})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount Received</label>
                    <input type="number" required step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500 font-mono font-bold text-emerald-700" />
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
                  <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold">Save Payment & Post to Ledger</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading && !isRecording ? (
              <div className="p-12 text-center text-slate-500">Loading payments...</div>
            ) : payments.length === 0 && !isRecording ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <Wallet className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">No payments recorded yet.</p>
                <p className="text-sm mt-1">Payments will appear here once you collect money.</p>
              </div>
            ) : payments.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Invoice #</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Method</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{pmt.date}</td>
                      <td className="px-6 py-4 font-mono text-xs text-blue-600 font-bold">{pmt.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{pmt.method}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">+{parseFloat(pmt.amount).toFixed(2)}</td>
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