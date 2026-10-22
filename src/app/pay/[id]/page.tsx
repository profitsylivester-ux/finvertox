"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Smartphone, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [provider, setProvider] = useState("M-Pesa");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    fetch(`/api/pay/${params.id}`)
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setIsLoading(false);
      })
      .catch(() => {
        setError("Failed to load invoice");
        setIsLoading(false);
      });
  }, [params.id]);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPaying(true);

    try {
      const res = await fetch(`/api/pay/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, phoneNumber }),
      });
      
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-sans">Loading secure checkout...</div>;
  }

  if (error && !data) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-500 font-sans">{error}</div>;
  }

  if (data?.invoice?.status === 'paid' || isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
          <p className="text-slate-500 mb-8">Your payment of <strong>TZS {parseFloat(data.invoice.total).toLocaleString()}</strong> has been received.</p>
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 mb-8">
            <p>Reference: {data.invoice.number}</p>
            <p>A receipt has been sent to your phone.</p>
          </div>
          <p className="text-xs text-slate-400">Powered securely by {data.companyName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 text-center text-white relative">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold">{data.companyName}</h1>
          <p className="text-xs text-slate-400 mt-1">Secure Invoice Payment</p>
        </div>

        {/* BODY */}
        <div className="p-6">
          <div className="text-center mb-8">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Amount Due</p>
            <h2 className="text-4xl font-extrabold text-slate-900">TZS {parseFloat(data.invoice.total).toLocaleString()}</h2>
            <p className="text-sm text-slate-500 mt-2">Invoice: {data.invoice.number}</p>
          </div>

          {error && <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">{error}</div>}

          <form onSubmit={handlePay} className="space-y-6">
            
            {/* PROVIDER SELECTION */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">Choose Payment Method</label>
              <div className="grid grid-cols-2 gap-3">
                {['M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Halopesa'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all font-semibold text-sm ${
                      provider === p 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" /> {p}
                  </button>
                ))}
              </div>
            </div>

            {/* PHONE NUMBER */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
              <div className="relative">
                <Smartphone className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
                <input 
                  type="tel" 
                  required
                  value={phoneNumber} 
                  onChange={e => setPhoneNumber(e.target.value)} 
                  placeholder="e.g. 0754 123 456" 
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-lg" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPaying}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold text-lg transition-all duration-200 shadow-lg shadow-blue-600/30 active:scale-[0.98] disabled:opacity-70"
            >
              {isPaying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                </>
              ) : (
                "Pay Now"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 256-bit SSL Secure Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}