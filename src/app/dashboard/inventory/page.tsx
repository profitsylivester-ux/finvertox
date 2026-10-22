"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Package, Plus, Search, AlertTriangle, X } from "lucide-react";

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");

  const fetchProducts = () => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data.products || []);
        setIsLoading(false);
      });
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, name, description, costPrice, sellingPrice, stockQuantity }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }

    setCode(""); setName(""); setDescription(""); setCostPrice(""); setSellingPrice(""); setStockQuantity("0");
    setIsAdding(false);
    fetchProducts();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" /> Inventory & Products
              </h1>
              <p className="text-sm text-slate-500 mt-1">Manage your stock levels, costs, and selling prices.</p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {isAdding && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-blue-50/10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Product</h2>
                <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"><X className="w-5 h-5" /></button>
              </div>
              
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Code (SKU) *</label>
                  <input required type="text" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. LAP-001" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name *</label>
                  <input required type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. HP Laptop" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost Price *</label>
                  <input required type="number" step="0.01" value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price *</label>
                  <input required type="number" step="0.01" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="0.00" className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Stock</label>
                  <input required type="number" step="0.01" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500 font-mono" />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description (Optional)</label>
                  <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500" />
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">Save Product</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-12 text-center text-slate-500">Loading inventory...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <Package className="w-12 h-12 mb-4 text-slate-300 dark:text-slate-600" />
                <p className="font-medium text-slate-500 dark:text-slate-400">No products found.</p>
                <p className="text-sm mt-1">Add your first product to start tracking inventory.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Code</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Name</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Cost</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Price</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProducts.map((p) => {
                    const stock = parseFloat(p.stockQuantity);
                    const isLowStock = stock <= 10;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">{p.code}</td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{p.name}</td>
                        <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-400">{parseFloat(p.costPrice).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-slate-200">{parseFloat(p.sellingPrice).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1 font-mono font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {isLowStock && <AlertTriangle className="w-3 h-3" />}
                            {stock.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}