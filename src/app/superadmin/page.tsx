"use client";

import { useState, useEffect } from "react";
import { 
  TrendingUp, ArrowUpRight, Search, Filter
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const revenueData = [
  { name: 'Jan', revenue: 4000 }, { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 9800 }, { name: 'Apr', revenue: 12000 },
  { name: 'May', revenue: 15000 }, { name: 'Jun', revenue: 22000 },
  { name: 'Jul', revenue: 28000 }, { name: 'Aug', revenue: 34000 },
  { name: 'Sep', revenue: 40000 }, { name: 'Oct', revenue: 50000 },
];

export default function SuperAdminOverview() {
  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ totalMRR: 0, activeTenants: 0, totalTokens: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/superadmin");
        const data = await res.json();
        if (data.success) {
          setTenants(data.tenants);
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#09090b]">
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 shrink-0 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="font-medium text-zinc-200">Global Overview</span>
          <span>/</span>
          <span>Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> System Operational
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Platform Overview</h1>
              <p className="text-sm text-zinc-400 mt-1">Monitor your SaaS performance and manage tenants.</p>
            </div>
            <button className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Export Data
            </button>
          </div>

          {/* KPI SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#18181b] p-6 rounded-xl border border-zinc-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp className="w-16 h-16 text-indigo-500" />
              </div>
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Total MRR</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">TZS {metrics.totalMRR.toLocaleString()}</h3>
              </div>
              <p className="text-xs text-emerald-400 mt-4 flex items-center gap-1 font-medium"><ArrowUpRight className="w-3 h-3"/> +14.5% vs last month</p>
            </div>

            <div className="bg-[#18181b] p-6 rounded-xl border border-zinc-800 shadow-sm">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Active Tenants</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">{metrics.activeTenants}</h3>
              </div>
              <p className="text-xs text-zinc-500 mt-4 font-medium">Companies actively using FinVortex</p>
            </div>

            <div className="bg-[#18181b] p-6 rounded-xl border border-zinc-800 shadow-sm">
              <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">Tokens Consumed</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-white">{metrics.totalTokens.toLocaleString()}</h3>
              </div>
              <p className="text-xs text-zinc-500 mt-4 font-medium">Platform-wide AI & feature usage</p>
            </div>
          </div>

          {/* CHART SECTION */}
          <div className="bg-[#18181b] p-6 rounded-xl border border-zinc-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-semibold text-white">Revenue Growth</h3>
                <p className="text-xs text-zinc-500 mt-1">Monthly recurring revenue over time.</p>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} tickFormatter={(val) => `TZS ${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '12px' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* TENANT DIRECTORY TABLE */}
          <div className="bg-[#18181b] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-[#18181b]">
              <h3 className="text-sm font-semibold text-white">Recent Tenants</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="bg-[#09090b] border border-zinc-800 rounded-md py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-indigo-500 w-64 text-white transition-colors"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button className="p-1.5 border border-zinc-800 rounded-md hover:bg-zinc-800 text-zinc-400 transition-colors">
                  <Filter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-[#09090b]/50 text-zinc-500 text-xs border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-6 py-3 font-medium">Plan</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">MRR</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {isLoading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Loading data...</td></tr>
                ) : tenants.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No tenants found.</td></tr>
                ) : (
                  tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-3 font-medium text-white flex items-center gap-3">
                         <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                           {tenant.name.charAt(0)}
                         </div>
                         {tenant.name}
                      </td>
                      <td className="px-6 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {tenant.plan}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-zinc-300 font-mono text-xs">{tenant.mrr.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">
                        <button className="px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-md transition-colors">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}