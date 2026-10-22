"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function BusinessSetupPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Form State
  const [tin, setTin] = useState("");
  const [vatRate, setVatRate] = useState("18.00");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/company/setup")
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setTin(data.settings.tin || "");
          setVatRate(data.settings.vatRate || "18.00");
          setAddress(data.settings.address || "");
          setPhone(data.settings.phone || "");
          setEmail(data.settings.email || "");
        }
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    await fetch("/api/company/setup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tin, vatRate, address, phone, email }),
    });

    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
      <div className="max-w-3xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-900">Business Setup</h1>
            <p className="text-sm text-slate-500 mt-1">Configure your company's tax and contact information.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5" /> Business settings saved successfully!
              </div>
            )}

            {/* TAX CONFIGURATION */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Tax Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">TIN (Tax Identification Number)</label>
                  <input type="text" value={tin} onChange={e => setTin(e.target.value)} placeholder="e.g. 123-456-789" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">VAT Rate (%)</label>
                  <input type="number" step="0.01" value={vatRate} onChange={e => setVatRate(e.target.value)} placeholder="18.00" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>
            </div>

            {/* CONTACT INFORMATION */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2 mb-4 mt-8">
                <Building2 className="w-5 h-5 text-blue-600" /> Contact Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Physical Address</label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Samora Machel Ave, Dar es Salaam" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255 700 000 000" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="billing@company.com" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50">
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}