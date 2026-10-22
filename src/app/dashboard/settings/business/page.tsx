"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, ShieldCheck, CheckCircle2, Upload, FileText, Settings } from "lucide-react";

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
  const [logoUrl, setLogoUrl] = useState("");
  const [invoicePrefix, setInvoicePrefix] = useState("INV-");
  const [termsAndConditions, setTermsAndConditions] = useState("");

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
          setLogoUrl(data.settings.logoUrl || "");
          setInvoicePrefix(data.settings.invoicePrefix || "INV-");
          setTermsAndConditions(data.settings.termsAndConditions || "");
        }
        setIsLoading(false);
      });
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB to prevent database bloat)
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    await fetch("/api/company/setup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        tin, vatRate, address, phone, email, logoUrl, invoicePrefix, termsAndConditions 
      }),
    });

    setIsSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 font-sans text-slate-800 dark:text-slate-200">
      <div className="max-w-4xl mx-auto">
        
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-blue-600" /> Business Setup
            </h1>
            <p className="text-sm text-slate-500 mt-1">Configure your company's branding, financial settings, and invoice defaults.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-10">
            
            {success && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-5 h-5" /> All settings saved successfully!
              </div>
            )}

            {/* BRANDING & PROFILE */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-6">
                <Building2 className="w-5 h-5 text-blue-600" /> Company Profile & Branding
              </h3>
              
              <div className="flex flex-col md:flex-row gap-8">
                {/* Logo Upload */}
                <div className="w-full md:w-1/3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company Logo</label>
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-50 dark:bg-slate-950 h-40">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="text-slate-400 flex flex-col items-center">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-xs font-medium">Click to upload logo</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">Max 2MB (PNG, JPG, SVG)</p>
                </div>

                {/* Profile Fields */}
                <div className="w-full md:w-2/3 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Physical Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Samora Machel Ave, Dar es Salaam" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+255 700 000 000" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Email</label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="billing@company.com" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FINANCIAL & TAX */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-8">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> Financial & Tax Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TIN (Tax ID)</label>
                  <input type="text" value={tin} onChange={e => setTin(e.target.value)} placeholder="e.g. 123-456-789" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default VAT Rate (%)</label>
                  <input type="number" step="0.01" value={vatRate} onChange={e => setVatRate(e.target.value)} placeholder="18.00" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Invoice Prefix</label>
                  <input type="text" value={invoicePrefix} onChange={e => setInvoicePrefix(e.target.value)} placeholder="INV-" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono" />
                </div>
              </div>
            </div>

            {/* INVOICE DEFAULTS */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 mb-4 mt-8">
                <FileText className="w-5 h-5 text-blue-600" /> Invoice Defaults
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Terms & Conditions (Printed on every invoice)</label>
                <textarea 
                  rows={4} 
                  value={termsAndConditions} 
                  onChange={e => setTermsAndConditions(e.target.value)} 
                  placeholder="e.g. Payment is due within 14 days. Please make transfers to CRDB Bank Account 0150-XXXX-XXXX." 
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 shadow-sm">
                {isSaving ? "Saving..." : "Save All Settings"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}