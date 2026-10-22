"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Landmark, Smartphone, Wallet, X, CreditCard } from "lucide-react";

export default function TreasuryPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [type, setType] = useState("Bank");
  const [balance, setBalance] = useState("0.00");

  const fetchAccounts = () => {
    fetch("/api/treasury")
      .then(res => res.json())
      .then(data => {
        setAccounts(data.accounts || []);
        setIsLoading(false);
      });
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/treasury", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, accountNumber, type, balance }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setName(""); setAccountNumber(""); setType("Bank"); setBalance("0.00");
    setIsAdding(false);
    fetchAccounts();
  };

  const getIcon = (type: string) => {
    if (type === 'Bank') return <Landmark className="w-6 h-6 text-blue-600" />;
    if (type === 'Mobile Money') return <Smartphone className="w-6 h-6 text-emerald-600" />;
    return <Wallet className="w-6 h-6 text-amber-600" />;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Treasury</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your bank accounts, mobile money, and physical cash.</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Account
          </button>
        </div>

        {/* ADD ACCOUNT MODAL */}
        {isAdding && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Account</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
            </div>
            
            {error && <div className="mb-4 p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded">{error}</div>}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Name *</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CRDB Main Account" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500">
                  <option value="Bank">Bank Account</option>
                  <option value="Mobile Money">Mobile Money (M-Pesa, Tigo)</option>
                  <option value="Cash">Physical Cash (Petty Cash)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Number (Optional)</label>
                <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="e.g. 0150-XXXX-XXXX" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Opening Balance</label>
                <input type="number" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500 font-mono" />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                  Save Account
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ACCOUNTS GRID */}
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Loading accounts...</div>
        ) : accounts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-16 text-center flex flex-col items-center">
            <Landmark className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
            <p className="font-medium text-slate-500 dark:text-slate-400">No accounts added yet.</p>
            <p className="text-sm text-slate-400 mt-1">Add your bank or mobile money account to start tracking.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    {getIcon(acc.type)}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{acc.type}</span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate">{acc.name}</h3>
                {acc.accountNumber && <p className="text-xs text-slate-500 mb-4">{acc.accountNumber}</p>}
                
                <div className="mt-6">
                  <p className="text-xs font-medium text-slate-500 mb-1">Available Balance</p>
                  <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                    TZS {parseFloat(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}