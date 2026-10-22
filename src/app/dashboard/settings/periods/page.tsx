"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, Unlock, Info, ShieldAlert } from "lucide-react";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<any[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);

  const fetchPeriods = () => {
    fetch("/api/periods")
      .then(res => res.json())
      .then(data => {
        setPeriods(data.periods || []);
        setIsLoading(false);
      });
  };

  useEffect(() => { fetchPeriods(); }, []);

  const handleToggle = async (monthIndex: number, currentStatus: string) => {
    const action = currentStatus === 'closed' ? 'open' : 'close';
    if (action === 'close' && !confirm(`Are you sure you want to CLOSE ${MONTHS[monthIndex]} ${year}? No one will be able to post transactions to this month.`)) return;

    await fetch("/api/periods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: monthIndex + 1, year, action }),
    });
    fetchPeriods();
  };

  const getStatus = (monthIndex: number) => {
    const p = periods.find(p => p.month === monthIndex + 1 && p.year === year);
    return p ? p.status : 'open';
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Financial Periods</h1>
              <p className="text-sm text-slate-500 mt-1">Lock months to prevent backdated changes.</p>
            </div>
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold outline-none">
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-blue-800 mb-8">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm leading-relaxed">
                <strong>Why lock periods?</strong> Once you review a month's financials and send them to auditors, you lock it. The system will block anyone from posting a journal entry to a closed month. This ensures your reported numbers are permanent and secure.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {MONTHS.map((month, index) => {
                const status = getStatus(index);
                const isClosed = status === 'closed';

                return (
                  <div key={month} className={`border rounded-lg p-4 flex items-center justify-between transition-colors ${isClosed ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div>
                      <h3 className={`font-bold ${isClosed ? 'text-slate-500' : 'text-slate-900'}`}>{month}</h3>
                      <p className={`text-xs font-semibold mt-1 ${isClosed ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isClosed ? 'Locked' : 'Open'}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleToggle(index, status)}
                      className={`p-2 rounded-full transition-colors ${isClosed ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                      title={isClosed ? "Reopen Period" : "Close Period"}
                    >
                      {isClosed ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}