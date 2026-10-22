"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, FileText } from "lucide-react";

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [customerId, setCustomerId] = useState("");
  const [date, setDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState([{ productId: "", description: "", quantity: "1", unitPrice: "" }]);

  useEffect(() => {
    const today = new Date();
    const twoWeeks = new Date(today);
    twoWeeks.setDate(today.getDate() + 14);
    
    setDate(today.toISOString().split('T')[0]);
    setDueDate(twoWeeks.toISOString().split('T')[0]);
  }, []);

  const fetchData = () => {
    Promise.all([
      fetch("/api/invoices").then(res => res.json()),
      fetch("/api/customers").then(res => res.json()),
      fetch("/api/products").then(res => res.json())
    ]).then(([invoicesData, customersData, productsData]) => {
      setInvoices(invoicesData.invoices || []);
      setCustomers(customersData.customers || []);
      setProducts(productsData.products || []);
      setIsLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = () => setItems([...items, { productId: "", description: "", quantity: "1", unitPrice: "" }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleProductChange = (index: number, productId: string) => {
    const newItems = [...items];
    if (productId) {
      const prod = products.find(p => p.id.toString() === productId);
      if (prod) {
        newItems[index].productId = productId;
        newItems[index].description = prod.name;
        newItems[index].unitPrice = prod.sellingPrice;
      }
    } else {
      newItems[index].productId = "";
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0);
  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { setError("Please select a customer."); return; }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: parseInt(customerId), date, dueDate, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsCreating(false);
      setCustomerId(""); setItems([{ productId: "", description: "", quantity: "1", unitPrice: "" }]);
      fetchData();
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
              <p className="text-sm text-slate-500 mt-1">Create and track customer invoices.</p>
            </div>
            {!isCreating && (
              <button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                <Plus className="w-4 h-4" /> New Invoice
              </button>
            )}
          </div>

          {isCreating && (
            <div className="p-6 border-b border-slate-200 bg-blue-50/10">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Create Invoice</h2>
              {error && <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
                    <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500">
                      <option value="">Select Customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Invoice Date</label>
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                    <input type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden mt-6 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-slate-600 w-1/4">Product</th>
                        <th className="px-4 py-3 font-semibold text-slate-600">Description</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 w-20">Qty</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 w-28">Price</th>
                        <th className="px-4 py-3 font-semibold text-slate-600 w-28">Total</th>
                        <th className="px-4 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2">
                            <select 
                              value={item.productId} 
                              onChange={e => handleProductChange(index, e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-300 rounded outline-none text-xs font-medium"
                            >
                              <option value="">Custom Item</option>
                              {products.map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input required type="text" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Item description" className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none text-sm" />
                          </td>
                          <td className="p-2">
                            <input required type="number" min="1" step="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none text-right text-sm" />
                          </td>
                          <td className="p-2">
                            <input required type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(index, 'unitPrice', e.target.value)} placeholder="0.00" className="w-full px-3 py-1.5 border border-slate-300 rounded outline-none text-right font-mono text-sm" />
                          </td>
                          <td className="p-2 text-right font-mono font-medium text-sm">
                            {((parseFloat(item.quantity)||0) * (parseFloat(item.unitPrice)||0)).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            {items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-start mt-4">
                  <button type="button" onClick={addItem} className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"><Plus className="w-4 h-4" /> Add Item</button>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Total Amount</p>
                    <p className="text-2xl font-bold font-mono text-slate-900">TZS {total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-2 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">Save & Post Invoice</button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-x-auto">
            {isLoading && !isCreating ? (
              <div className="p-12 text-center text-slate-500">Loading invoices...</div>
            ) : invoices.length === 0 && !isCreating ? (
              <div className="p-16 text-center text-slate-400 flex flex-col items-center">
                <FileText className="w-12 h-12 mb-4 text-slate-300" />
                <p className="font-medium text-slate-500">No invoices yet.</p>
                <p className="text-sm mt-1">Create your first invoice to get paid.</p>
              </div>
            ) : invoices.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600">Invoice #</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Customer</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-600">Due Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Total</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr 
                      key={inv.id} 
                      onClick={() => router.push(`/dashboard/invoices/${inv.id}`)}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{inv.customerName}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.date}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.dueDate}</td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">{parseFloat(inv.total).toFixed(2)}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                          inv.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
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