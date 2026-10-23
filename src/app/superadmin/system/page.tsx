"use client";
import { Server } from "lucide-react";

export default function SystemPage() {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#09090b]">
      <header className="h-16 border-b border-zinc-800 flex items-center px-8 shrink-0 bg-[#09090b]/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="text-zinc-500">Super Admin</span>
          <span>/</span>
          <span className="font-medium text-zinc-200">System Health</span>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800 text-emerald-400">
            <Server className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-white">System Health</h2>
          <p className="text-sm text-zinc-400">All systems operational. Real-time database latency, API up-time, and server load metrics will be displayed here in the next update.</p>
        </div>
      </div>
    </div>
  );
}