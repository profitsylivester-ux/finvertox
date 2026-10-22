"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  LayoutDashboard, Briefcase, Book, Landmark, FileText, CheckSquare, Trash, Target,
  Wallet, ShoppingCart, CreditCard, Receipt, Folder, ShieldAlert, Users, History,
  Bell, ChevronDown, Lock, Building2, Sun, Moon, TrendingDown, Activity, X, Package
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';

interface UserData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  role: string;
  currency: string;
}

interface Account {
  id: number;
  code: string;
  name: string;
  type: string;
  balance: string;
}

interface Log {
  id: number;
  userName: string;
  action: string;
  details: string;
  isRead: boolean;
  createdAt: string;
}

const CURRENCIES = [
  { code: "TZS", symbol: "TZS" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "KES", symbol: "KSh" },
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function DashboardPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [chartData, setChartData] = useState<any>({ revExpData: [], pieData: [] });
  const [chartType, setChartType] = useState<"line" | "bar" | "pie" | "donut">("line");
  const [isLoading, setIsLoading] = useState(true);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isChartMenuOpen, setIsChartMenuOpen] = useState(false);

  // State for Adding Account
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Expense");
  const [accountError, setAccountError] = useState("");

  const fetchLogs = () => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => setLogs(data.logs || []));
  };

  const fetchAccounts = () => {
    fetch("/api/accounts")
      .then(res => res.json())
      .then(data => setAccounts(data.accounts || []));
  };

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const [userRes, chartsRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/dashboard/charts")
        ]);

        if (!userRes.ok) {
          router.push("/login");
          return;
        }

        const userData = await userRes.json();
        const chartsData = await chartsRes.json();
        
        setUser(userData);
        setChartData(chartsData);
        
        fetchAccounts();
        fetchLogs();
      } catch (err) {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleCurrencyChange = async (currency: string) => {
    setIsCurrencyOpen(false);
    if (!user) return;
    setUser({ ...user, currency });
    await fetch("/api/company/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currency }),
    });
  };

  const handleMarkAllRead = async () => {
    await fetch("/api/notifications/read", { method: "POST" });
    fetchLogs();
    setIsNotificationsOpen(false);
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");

    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: newCode, name: newName, type: newType }),
    });

    const data = await res.json();
    if (!res.ok) {
      setAccountError(data.error);
      return;
    }

    setNewCode(""); setNewName(""); setNewType("Expense");
    setIsAddingAccount(false);
    fetchAccounts();
  };

  if (isLoading || !mounted) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a1128] text-white">Loading secure workspace...</div>;
  }

  const displayCompany = user?.companyName || "Company";
  const displayName = `${user?.firstName} ${user?.lastName}` || "Admin User";
  const displayEmail = user?.email || "admin@company.com";
  const currentCurrency = user?.currency || "TZS";
  const currencySymbol = CURRENCIES.find(c => c.code === currentCurrency)?.symbol || "TZS";
  const isCEO = user?.role === "admin";
  const roleTitle = isCEO ? "CEO" : user?.role ? user.role.replace('_', ' ').toUpperCase() : "STAFF";

  const totalAssets = accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const totalLiabilities = accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + parseFloat(a.balance), 0);
  const unreadCount = logs.filter(l => !l.isRead).length;
  const totalExpenses = chartData.pieData.reduce((sum: number, item: any) => sum + item.value, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0a1128] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/50 h-screen overflow-hidden">
        <div className="h-20 flex items-center gap-3 px-6 border-b border-slate-800/50 bg-[#0a1128] shrink-0">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg uppercase shadow-lg shadow-blue-600/20">
            {displayCompany.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-white text-sm truncate w-40">{displayCompany}</h2>
            <p className="text-xs text-slate-400">Finance Workspace</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-hide">
          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Overview</p>
            <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors mt-1">
              <LayoutDashboard className="w-4 h-4" /> {isCEO ? "CEO Dashboard" : "Finance Dashboard"}
            </Link>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Accounting</p>
            <Link href="/dashboard/settings/business" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Briefcase className="w-4 h-4" /> Business Setup
            </Link>
            <Link href="/dashboard/journal" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Book className="w-4 h-4" /> Journal Entries
            </Link>
            <Link href="/dashboard/general-ledger" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Landmark className="w-4 h-4" /> General Ledger
            </Link>
            <Link href="/dashboard/trial-balance" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <FileText className="w-4 h-4" /> Trial Balance
            </Link>
            <Link href="/dashboard/reports" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <FileText className="w-4 h-4" /> Financial Reports
            </Link>
            <Link href="/dashboard/budgets" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Target className="w-4 h-4" /> Budgets & Commitments
            </Link>
            <Link href="/dashboard/settings/periods" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Lock className="w-4 h-4" /> Period Close
            </Link>
            <Link href="/dashboard/trash" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Trash className="w-4 h-4" /> Trash
            </Link>
            {/* THE MISSING LINK IS NOW HERE */}
            <Link href="/dashboard/approvals" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <CheckSquare className="w-4 h-4" /> Approvals
            </Link>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Sales & Purchases</p>
            <Link href="/dashboard/inventory" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Package className="w-4 h-4" /> Inventory
            </Link>
            <Link href="/dashboard/customers" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Users className="w-4 h-4" /> Customers
            </Link>
            <Link href="/dashboard/suppliers" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Building2 className="w-4 h-4" /> Suppliers
            </Link>
            <Link href="/dashboard/invoices" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <FileText className="w-4 h-4" /> Invoices
            </Link>
            <Link href="/dashboard/expenses" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Receipt className="w-4 h-4" /> Expenses
            </Link>
            <Link href="/dashboard/payments" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Wallet className="w-4 h-4" /> Payments (In)
            </Link>
            <Link href="/dashboard/bill-payments" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <CreditCard className="w-4 h-4" /> Bill Payments (Out)
            </Link>
          </div>

          <div>
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Treasury</p>
            <Link href="/dashboard/treasury" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Landmark className="w-4 h-4" /> Cash, Bank & Mobile
            </Link>
          </div>

          <div className="pb-4">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-4">Administration</p>
            <Link href="/dashboard/users" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <Users className="w-4 h-4" /> Users & Roles
            </Link>
            <Link href="/dashboard/audit-trail" className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium hover:text-white hover:bg-slate-800/50 rounded-md transition-colors">
              <History className="w-4 h-4" /> Audit Trail
            </Link>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800/50 bg-[#0a1128] shrink-0">
          <div className="mb-3">
            <p className="text-sm font-bold text-white truncate w-60">{displayName}</p>
            <p className="text-xs text-slate-400 truncate w-60">{displayEmail}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`px-2 py-0.5 border rounded-full text-[10px] font-bold ${
                isCEO ? 'border-blue-500 text-blue-400 bg-blue-500/10' : 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              }`}>
                {roleTitle}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mt-4">
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="flex items-center">
            {isCEO && (
              <div className="relative">
                <button 
                  onClick={() => setIsCurrencyOpen(!isCurrencyOpen)} 
                  className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full hover:border-blue-500 hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-sm font-bold text-slate-900 dark:text-white"
                >
                  {currentCurrency}
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>
                
                {isCurrencyOpen && (
                  <div className="absolute top-12 left-0 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                    {CURRENCIES.map((c) => (
                      <button 
                        key={c.code} 
                        onClick={() => handleCurrencyChange(c.code)} 
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${currentCurrency === c.code ? 'text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-12 right-0 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Live Activity</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-blue-600 font-semibold hover:underline">
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {logs.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">No activity yet.</div>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className={`p-4 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!log.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                          <p className="text-sm text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2">
                            {log.userName}
                            {!log.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{log.details}</p>
                          <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                            {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-3 text-center border-t border-slate-100 dark:border-slate-700">
                    <Link href="/dashboard/audit-trail" onClick={() => setIsNotificationsOpen(false)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                      View Full Audit Trail
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{displayName}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{roleTitle}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-600/20">
                {displayName.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1400px] mx-auto space-y-6">
            
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{isCEO ? "CEO Dashboard" : "Finance Dashboard"}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome back, {displayName}. Here is your financial overview.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cash Position</p>
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 rounded-md text-blue-600 dark:text-blue-400"><Wallet className="w-4 h-4" /></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{currencySymbol} {totalAssets.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">Real-time Asset Balance</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Liabilities</p>
                  <div className="p-1.5 bg-red-50 dark:bg-red-900/30 rounded-md text-red-600 dark:text-red-400"><TrendingDown className="w-4 h-4" /></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{currencySymbol} {totalLiabilities.toFixed(2)}</h3>
                <p className="text-xs text-slate-400 mt-1">Money owed to suppliers</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Accounts</p>
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-md text-emerald-600 dark:text-emerald-400"><FileText className="w-4 h-4" /></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{accounts.length}</h3>
                <p className="text-xs text-slate-400 mt-1">Chart of Accounts</p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overdue Invoices</p>
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-900/30 rounded-md text-amber-600 dark:text-amber-400"><Activity className="w-4 h-4" /></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">0</h3>
                <p className="text-xs text-slate-400 mt-1">AR: 0 - AP: 0</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col relative min-h-[380px]">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">Financial Analytics</h3>
                    <p className="text-xs text-slate-500">Live data from your ledger</p>
                  </div>
                  
                  <div className="relative">
                    <button onClick={() => setIsChartMenuOpen(!isChartMenuOpen)} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                      {chartType === 'line' && 'Line Chart'}
                      {chartType === 'bar' && 'Bar Chart'}
                      {chartType === 'pie' && 'Pie Chart'}
                      {chartType === 'donut' && 'Donut Chart'}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {isChartMenuOpen && (
                      <div className="absolute top-10 right-0 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 py-1">
                        <button onClick={() => { setChartType('line'); setIsChartMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Revenue vs Exp (Line)</button>
                        <button onClick={() => { setChartType('bar'); setIsChartMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Revenue vs Exp (Bar)</button>
                        <button onClick={() => { setChartType('pie'); setIsChartMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Expenses (Pie)</button>
                        <button onClick={() => { setChartType('donut'); setIsChartMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700">Expenses (Donut)</button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full h-full">
                  {chartType === 'line' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.revExpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}

                  {chartType === 'bar' && (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.revExpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                        <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                        <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {(chartType === 'pie' || chartType === 'donut') && (
                    <div className="w-full h-full flex flex-row items-center justify-center">
                      <div className="relative w-1/2 h-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                              data={chartData.pieData} 
                              cx="50%" 
                              cy="50%" 
                              innerRadius={chartType === 'donut' ? 65 : 0} 
                              outerRadius={90} 
                              paddingAngle={chartType === 'donut' ? 5 : 0} 
                              dataKey="value"
                              stroke="none"
                            >
                              {chartData.pieData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>

                        {chartType === 'donut' && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Exp</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{currencySymbol} {totalExpenses.toFixed(0)}</p>
                          </div>
                        )}
                      </div>

                      <div className="w-1/2 flex flex-col items-start justify-center pl-4 space-y-3">
                        {chartData.pieData.map((entry: any, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{entry.name}</p>
                              <p className="text-xs text-slate-500 font-mono">{currencySymbol} {entry.value.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Security Monitor</h3>
                  <p className="text-xs text-slate-500">Recent sign-in activity</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-4">
                  <ShieldAlert className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No recent failed sign-ins.</p>
                  <p className="text-xs text-slate-400 mt-1">Your account is secure.</p>
                </div>
              </div>
            </div>

            {/* CHART OF ACCOUNTS */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white">Chart of Accounts</h3>
                  <p className="text-xs text-slate-500 mt-1">Standard general ledger accounts</p>
                </div>
                <button onClick={() => setIsAddingAccount(true)} className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">+ Add Account</button>
              </div>

              {/* ADD ACCOUNT FORM (INLINE) */}
              {isAddingAccount && (
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-blue-50/20 dark:bg-blue-900/10 flex items-center gap-4">
                  {accountError && <div className="text-red-500 text-xs font-bold w-full absolute mt-12">{accountError}</div>}
                  <input type="text" placeholder="Code (e.g. 6100)" value={newCode} onChange={e => setNewCode(e.target.value)} className="w-32 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500 text-sm" />
                  <input type="text" placeholder="Account Name (e.g. Marketing)" value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500 text-sm" />
                  <select value={newType} onChange={e => setNewType(e.target.value)} className="w-40 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-md outline-none focus:border-blue-500 text-sm">
                    <option value="Expense">Expense</option>
                    <option value="Asset">Asset</option>
                    <option value="Liability">Liability</option>
                    <option value="Equity">Equity</option>
                    <option value="Revenue">Revenue</option>
                  </select>
                  <button onClick={handleAddAccount} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold text-sm transition-colors">Save</button>
                  <button onClick={() => setIsAddingAccount(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-2"><X className="w-5 h-5" /></button>
                </div>
              )}

              <div className="max-h-[300px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Code</th>
                      <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400">Account Name</th>
                      <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 text-right">Balance</th>
                      <th className="px-6 py-3 font-semibold text-slate-600 dark:text-slate-400 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {accounts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">No accounts found.</td>
                      </tr>
                    ) : (
                      accounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-6 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{acc.code}</td>
                          <td className="px-6 py-3 font-medium text-slate-900 dark:text-white">{acc.name}</td>
                          <td className="px-6 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-200">{currencySymbol} {parseFloat(acc.balance).toFixed(2)}</td>
                          <td className="px-6 py-3 text-center">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                              acc.type === 'Asset' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                              acc.type === 'Liability' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                              acc.type === 'Equity' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                              acc.type === 'Revenue' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {acc.type}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}