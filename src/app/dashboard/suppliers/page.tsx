"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, UserPlus, X, Building2 } from "lucide-react";

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const fetchSuppliers = () => {
    fetch("/api/suppliers")
      .then(res => res.json())
      .then(data => {
        setSuppliers(data.suppliers || []);
        setIsLoading(false);
      });
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/suppliers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, address }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setName(""); setEmail(""); setPhone(""); setAddress("");
    setIsAdding(false);
    fetchSuppliers();
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Suppliers</h1>
              <p className="text-sm text-slate-500 mt-1">Manage the vendors and companies you buy from.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search suppliers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Add Supplier
              </button>
            </div>
          </div>

          {isAdding && (
            <div className="p-6 border-b border-slate-200 bg-blue-50/30">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">New Supplier</h2>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

              <form onSubmit={handleAddSupplier} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name *</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                </div>
                <div className="md:col-span-2 flex justify-end mt-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                    Save Supplier
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">Loading suppliers...</div>
            ) : filteredSuppliers.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <Building2 className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">No suppliers found.</p>
                <p className="text-sm mt-1">Add your first supplier to start tracking expenses.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600">Name</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Email</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Phone</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{supplier.name}</td>
                      <td className="px-6 py-4 text-slate-600">{supplier.email || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">{supplier.phone || "-"}</td>
                      <td className="px-6 py-4 text-slate-600">{supplier.address || "-"}</td>
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