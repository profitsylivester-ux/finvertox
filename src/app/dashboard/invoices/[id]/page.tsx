"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, CheckCircle2, Clock } from "lucide-react";

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/invoices/${params.id}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setIsLoading(false);
      });
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading invoice...</div>;
  if (!data || data.error) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500">Invoice not found.</div>;

  const { invoice, items, company } = data;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 font-sans text-slate-800 print:bg-white print:p-0">
      
      {/* ACTION BAR (HIDDEN ON PRINT) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <Link href="/dashboard/invoices" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
        <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
          <Printer className="w-4 h-4" /> Print / Save as PDF
        </button>
      </div>

      {/* A4 PAPER */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl border border-slate-200 print:shadow-none print:border-none print:w-full">
        <div className="p-12">
          
          {/* HEADER */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">{company.name}</h1>
              <div className="text-sm text-slate-500 mt-2 space-y-0.5">
                {company.address && <p>{company.address}</p>}
                {company.email && <p>{company.email}</p>}
                {company.phone && <p>{company.phone}</p>}
                {company.tin && <p className="font-semibold mt-1">TIN: {company.tin}</p>}
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-4xl font-light text-slate-300 uppercase tracking-widest">Invoice</h2>
              <p className="font-bold text-lg text-slate-900 mt-1">{invoice.invoiceNumber}</p>
            </div>
          </div>

          {/* BILL TO & METADATA */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</p>
              <p className="font-bold text-lg text-slate-900">{invoice.customerName}</p>
              <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                {invoice.customerAddress && <p>{invoice.customerAddress}</p>}
                {invoice.customerEmail && <p>{invoice.customerEmail}</p>}
                {invoice.customerPhone && <p>{invoice.customerPhone}</p>}
              </div>
            </div>
            <div className="text-right space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Issue Date</p>
                <p className="font-medium text-slate-900">{invoice.date}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</p>
                <p className="font-medium text-slate-900">{invoice.dueDate}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</p>
                <span className={`inline-flex items-center gap-1 mt-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 
                  invoice.status === 'pending_approval' ? 'bg-amber-100 text-amber-700' : 
                  'bg-red-100 text-red-700'
                }`}>
                  {invoice.status === 'paid' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* ITEMS TABLE */}
          <table className="w-full text-left mb-12">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-center w-24">Qty</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right w-32">Unit Price</th>
                <th className="py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right w-32">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4 text-sm font-medium text-slate-900">{item.description}</td>
                  <td className="py-4 text-sm text-slate-600 text-center">{parseFloat(item.quantity)}</td>
                  <td className="py-4 text-sm text-slate-600 text-right font-mono">{parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td className="py-4 text-sm font-bold text-slate-900 text-right font-mono">{parseFloat(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTALS */}
          <div className="flex justify-end mb-16">
            <div className="w-64">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-sm font-medium text-slate-500">Subtotal</span>
                <span className="text-sm font-mono text-slate-900">{parseFloat(invoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-b-2 border-slate-900">
                <span className="text-base font-bold text-slate-900">Total</span>
                <span className="text-base font-bold font-mono text-slate-900">{parseFloat(invoice.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
            <p>Thank you for your business.</p>
            <p className="mt-1">If you have any questions about this invoice, please contact {company.email || company.phone}.</p>
          </div>

        </div>
      </div>
    </div>
  );
}