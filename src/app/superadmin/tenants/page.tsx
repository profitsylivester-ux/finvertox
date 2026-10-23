"use client";

import { useState, useEffect } from "react";
import { Search, X, AlertTriangle, Loader2 } from "lucide-react";

export default function TenantsPage() {
  const [search, setSearch] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await fetch("/api/superadmin");
      const data = await res.json();
      if (data.success) setTenants(data.tenants);
    } catch (error) {
      console.error("Failed to load data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const openManageDrawer = (tenant: any) => {
    setSelectedTenant(tenant);
    setIsDrawerOpen(true);
  };

  const handleSuspend = async () => {
    if (!selectedTenant) return;
    setIsActionLoading(true);
    const newStatus = selectedTenant.status === "Active" ? "suspended" : "active";
    
    try {
      const res = await fetch(`/api/superadmin/tenant/${selectedTenant.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await fetchTenants(); // Refresh list
        setSelectedTenant({ ...selectedTenant, status: newStatus === "active" ? "Active" : "Suspended" });
        alert(`Account ${newStatus === "active" ? "Activated" : "Suspended"} successfully!`);
      } else {
        alert(`Error: ${data.error || "Failed to update status"}`);
      }
    } catch (err) {
      alert("Network error. Check your terminal for details.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTenant) return;
    if (!confirm("Are you sure you want to delete this tenant? This cannot be undone.")) return;
    
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/superadmin/tenant/${selectedTenant.id}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsDrawerOpen(false);
        fetchTenants();
        alert("Tenant deleted successfully.");
      } else {
        alert(`Error: ${data.error || "Failed to delete tenant."}`);
      }
    } catch (err) {
      alert("Network error. Check your terminal.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#09090b] relative">
      <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 shrink-0 bg-[#09090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="text-zinc-500">Super Admin</span>
          <span>/</span>
          <span className="font-medium text-zinc-200">Tenants</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tight">Tenant Directory</h1>
              <p className="text-sm text-zinc-400 mt-1">Manage all companies subscribed to FinVortex.</p>
            </div>
          </div>

          <div className="bg-[#18181b] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-[#18181b]">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text" 
                  placeholder="Search by company name..." 
                  className="bg-[#09090b] border border-zinc-800 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-indigo-500 w-80 text-white transition-colors"
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <table className="w-full text-left text-sm">
              <thead className="bg-[#09090b]/50 text-zinc-500 text-xs border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Company Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {isLoading ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">Loading data...</td></tr>
                ) : tenants.length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-zinc-500">No tenants found.</td></tr>
                ) : (
                  tenants.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map((tenant) => (
                    <tr key={tenant.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                         <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs text-zinc-300">
                           {tenant.name.charAt(0)}
                         </div>
                         {tenant.name}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-medium ${tenant.status === 'Active' ? 'text-emerald-400' : 'text-red-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === 'Active' ? 'bg-emerald-400' : 'bg-red-400'}`}></span> {tenant.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openManageDrawer(tenant)}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-md transition-colors"
                        >
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

      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsDrawerOpen(false)}></div>

          <div className="fixed inset-y-0 right-0 w-[400px] bg-[#09090b] border-l border-zinc-800 shadow-2xl z-50 flex flex-col">
            
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">Manage Tenant</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="text-zinc-400 hover:text-white p-2 rounded-md hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl font-bold text-indigo-400">
                  {selectedTenant?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedTenant?.name}</h3>
                  <p className="text-xs text-zinc-500">Tenant ID: #{selectedTenant?.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Quick Actions</h4>
                
                <div className="space-y-2">
                  <button onClick={handleSuspend} disabled={isActionLoading} className="w-full flex items-center justify-between p-3 bg-[#18181b] hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors group disabled:opacity-50">
                    <span className="flex items-center gap-3 text-sm text-white"><AlertTriangle className={`w-4 h-4 ${selectedTenant?.status === 'Active' ? 'text-orange-400' : 'text-emerald-400'}`} /> {selectedTenant?.status === 'Active' ? 'Suspend Account' : 'Activate Account'}</span>
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-300">{isActionLoading ? 'Processing...' : 'Change status'}</span>
                  </button>
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-zinc-800 bg-red-500/5">
              <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider mb-3">Danger Zone</h4>
              <button onClick={handleDelete} disabled={isActionLoading} className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-50">
                {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Tenant Permanently"}
              </button>
            </div>

          </div>
        </>
      )}

    </div>
  );
}