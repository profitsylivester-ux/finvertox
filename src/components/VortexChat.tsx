"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X, Send, User } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
};

export default function VortexChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      text: "Hello! I am Vortex. I am connected to the FinVortex database. Ask me anything about our accounting, security, payroll, or financial definitions."
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Hide the chatbot completely on the invoice view page
  if (pathname?.includes('/invoices/')) {
    return null;
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
      
      const data = await res.json();
      
      setTimeout(() => {
        const botMsg: Message = { id: Date.now().toString(), role: "bot", text: data.text };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 1000);
      
    } catch (error) {
      setTimeout(() => {
        const botMsg: Message = { id: Date.now().toString(), role: "bot", text: "Sorry, I am having trouble connecting to the server." };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    // Added print:hidden to ensure it never prints
    <div className="fixed bottom-6 right-6 z-[100] font-sans print:hidden">
      
      <div 
        className={`absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 translate-y-4 invisible"
        }`}
      >
        <div className="bg-slate-900 dark:bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">Vortex AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-slate-400 font-medium">Database Connected</p>
              </div>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300" : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
              }`}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user" 
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-tr-sm" 
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-sm shadow-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about Trial Balance..."
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-full px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3.5 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.8)] hover:-translate-y-1 transition-all duration-300 group border border-blue-500/50 dark:border-slate-200"
      >
        <div className="bg-blue-600 rounded-full p-1">
          <Sparkles className="w-4 h-4 text-white group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
        </div>
        <span className="text-sm font-bold tracking-wide">Ask Vortex</span>
      </button>

    </div>
  );
}