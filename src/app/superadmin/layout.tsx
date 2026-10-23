"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Building2, Users, Coins, Activity, ShieldCheck, Server 
} from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Global Overview", href: "/superadmin", icon: Activity },
    { name: "Tenants", href: "/superadmin/tenants", icon: Building2 },
    { name: "Token Economy", href: "/superadmin/tokens", icon: Coins },
    { name: "Platform Users", href: "/superadmin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-200 flex font-sans selection:bg-indigo-500/30">
      
      {/* SUPER ADMIN SIDEBAR */}
      <aside className="w-64 bg-[#09090b] border-r border-zinc-800 flex flex-col hidden md:flex fixed h-full z-10">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-zinc-800">
          <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-white tracking-wide text-sm">FINVORTEX</h2>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Super Admin</p>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name}
                href={item.href} 
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? "bg-zinc-800 text-white shadow-sm" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-indigo-400" : ""}`} /> {item.name}
              </Link>
            )
          })}
          
          <div className="pt-6 mt-6 border-t border-zinc-800/50">
            <Link href="/superadmin/system" className="flex items-center gap-3 px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg font-medium transition-all duration-200">
              <Server className="w-4 h-4 text-amber-500" /> System Health
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold">F</div>
            <div>
              <p className="text-sm font-bold text-white">Founder</p>
              <p className="text-xs text-indigo-400">God Mode</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  );
}