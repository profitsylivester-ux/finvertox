"use client";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, ArrowRight, ShieldCheck, BarChart3, Database, Layers, Building2, Home as HomeIcon, Wallet, PieChart, Settings, PlayCircle, BookOpen, Lock, FileText, Cpu, Users, Box, CreditCard, ChevronDown, Briefcase, Store, Wrench, Globe } from "lucide-react";

// FULL TRANSLATION DICTIONARY
const translations = {
  English: {
    navPlatform: "Platform", navSolutions: "Solutions", navSecurity: "Security", navResources: "Resources",
    signIn: "Sign in", getStarted: "Get Started",
    tagline: "Clear finances. Confident decisions. Lasting impact.",
    title1: "Finance &", title2: "Accounting.",
    p1: "FinVortex is the unified financial platform for modern enterprises. Consolidate your accounting, inventory, and payroll into a single, highly secure system.",
    p2: "Eliminate fragmented data and gain real-time visibility into your cash flow. Engineered with bank-grade security and absolute data isolation, FinVortex scales seamlessly with your business.",
    demoBtn: "Request a Demo", docBtn: "Documentation",
    stats1: "Bank-Grade", stats1b: "Enterprise Security",
    stats2: "Global", stats2b: "Multi-Currency",
    stats3: "Real-Time", stats3b: "Live Reporting",
    phoneFinance: "Finance", phoneWorkspace: "Workspace", phoneCash: "Cash Position", phoneRevenue: "Revenue",
    phoneActivity: "Recent Activity", phoneInvoicePaid: "Invoice Paid", phoneStock: "Stock Received", phoneInvoices: "Invoices",
    phoneHome: "Home", phoneAccounts: "Accounts", phoneReports: "Reports", phoneSettings: "Settings",
    sec1: "Data Isolation", sec1b: "Database-level separation", sec2: "Encryption", sec2b: "End-to-end protection", sec3: "Audit Logs", sec3b: "Immutable tracking", sec4: "Role-Based Access", sec4b: "Granular permissions"
  },
  Swahili: {
    navPlatform: "Jukwaa", navSolutions: "Suluhisho", navSecurity: "Usalama", navResources: "Rasilimali",
    signIn: "Ingia", getStarted: "Anza Sasa",
    tagline: "Fedha zilizo wazi. Maamuzi thabiti. Athari ya kudumu.",
    title1: "Fedha na", title2: "Uhasibu.",
    p1: "FinVortex ni jukwaa la umoja la kifedha kwa biashara za kisasa. Unganisha uhasibu, hesabu za bidhaa, na mishahara yako katika mfumo mmoja salama.",
    p2: "Ondoa data iliyogawanyika na upate uonekano wa moja kwa moja wa mtiririko wa fedha zako. Imeundwa kwa usalama wa kiwango cha benki, FinVortex inakua pamoja na biashara yako.",
    demoBtn: "Omba Demo", docBtn: "Nyaraka",
    stats1: "Kiwango cha Benki", stats1b: "Usalama wa Biashara",
    stats2: "Kimataifa", stats2b: "Sarafu Mbalimbali",
    stats3: "Wakati Halisi", stats3b: "Ripoti za Moja kwa Moja",
    phoneFinance: "Fedha", phoneWorkspace: "Nafasi", phoneCash: "Nafasi ya Fedha", phoneRevenue: "Mapato",
    phoneActivity: "Shughuli za Hivi Karibuni", phoneInvoicePaid: "Ankara Imelipwa", phoneStock: "Bidhaa Imepokelewa", phoneInvoices: "Ankara",
    phoneHome: "Nyumbani", phoneAccounts: "Akaunti", phoneReports: "Ripoti", phoneSettings: "Mipangilio",
    sec1: "Utengano wa Data", sec1b: "Utengano wa hifadhidata", sec2: "Usimbaji fiche", sec2b: "Ulinzi kamili", sec3: "Kumbukumbu za Ukaguzi", sec3b: "Ufuatiliaji usiobadilika", sec4: "Ufikiaji wa Jukumu", sec4b: "Ruhusa za kina"
  },
  French: {
    navPlatform: "Plateforme", navSolutions: "Solutions", navSecurity: "Sécurité", navResources: "Ressources",
    signIn: "Connexion", getStarted: "Commencer",
    tagline: "Finances claires. Décisions confiantes. Impact durable.",
    title1: "Finance &", title2: "Comptabilité.",
    p1: "FinVortex est la plateforme financière unifiée pour les entreprises modernes. Consolidez votre comptabilité, vos stocks et votre paie dans un système unique et hautement sécurisé.",
    p2: "Éliminez les données fragmentées et obtenez une visibilité en temps réel sur vos flux de trésorerie. Conçu avec une sécurité de niveau bancaire, FinVortex évolue avec votre entreprise.",
    demoBtn: "Demander une démo", docBtn: "Documentation",
    stats1: "Niveau Bancaire", stats1b: "Sécurité d'Entreprise",
    stats2: "Mondial", stats2b: "Multi-Devises",
    stats3: "Temps Réel", stats3b: "Rapports en Direct",
    phoneFinance: "Finance", phoneWorkspace: "Espace", phoneCash: "Trésorerie", phoneRevenue: "Revenus",
    phoneActivity: "Activité Récente", phoneInvoicePaid: "Facture Payée", phoneStock: "Stock Reçu", phoneInvoices: "Factures",
    phoneHome: "Accueil", phoneAccounts: "Comptes", phoneReports: "Rapports", phoneSettings: "Paramètres",
    sec1: "Isolation des données", sec1b: "Séparation de la base de données", sec2: "Chiffrement", sec2b: "Protection de bout en bout", sec3: "Journaux d'audit", sec3b: "Suivi immuable", sec4: "Accès basé sur les rôles", sec4b: "Autorisations granulaires"
  },
  Arabic: {
    navPlatform: "المنصة", navSolutions: "الحلول", navSecurity: "الأمان", navResources: "الموارد",
    signIn: "تسجيل الدخول", getStarted: "ابدأ الآن",
    tagline: "تمويل واضح. قرارات واثقة. تأثير دائم.",
    title1: "المالية و", title2: "المحاسبة.",
    p1: "FinVortex هي المنصة المالية الموحدة للمؤسسات الحديثة. قم بتوحيد محاسبتك ومخزونك ورواتبك في نظام واحد آمن للغاية.",
    p2: "تخلص من البيانات المجزأة واحصل على رؤية في الوقت الفعلي لتدفق النقد الخاص بك. تم تصميمه بأمان على مستوى البنوك وعزل مطلق للبيانات، ويتوسع FinVortex بسلاسة مع عملك.",
    demoBtn: "طلب عرض توضيحي", docBtn: "الوثائق",
    stats1: "مستوى بنكي", stats1b: "أمن المؤسسات",
    stats2: "عالمي", stats2b: "متعدد العملات",
    stats3: "في الوقت الفعلي", stats3b: "تقارير مباشرة",
    phoneFinance: "المالية", phoneWorkspace: "مساحة العمل", phoneCash: "المركز النقدي", phoneRevenue: "الإيرادات",
    phoneActivity: "النشاط الأخير", phoneInvoicePaid: "تم دفع الفاتورة", phoneStock: "تم استلام المخزون", phoneInvoices: "الفواتير",
    phoneHome: "الرئيسية", phoneAccounts: "الحسابات", phoneReports: "التقارير", phoneSettings: "الإعدادات",
    sec1: "عزل البيانات", sec1b: "فصل على مستوى قاعدة البيانات", sec2: "التشفير", sec2b: "حماية من طرف إلى طرف", sec3: "سجلات التدقيق", sec3b: "تتبع ثابت", sec4: "الوصول القائم على الأدوار", sec4b: "أذونات دقيقة"
  }
};

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<keyof typeof translations>("English");

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const t = translations[lang];
  const isRTL = lang === "Arabic";

  const getLangAbbr = (language: string) => {
    if (language === "English") return "EN";
    if (language === "Swahili") return "SW";
    if (language === "French") return "FR";
    if (language === "Arabic") return "AR";
    return "EN";
  };

  return (
    <div className={`h-screen min-h-[700px] overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950 font-sans selection:bg-blue-200 dark:selection:bg-blue-900 transition-colors duration-300 relative ${isRTL ? 'dir-rtl' : ''}`}>
      
      {/* PREMIUM ANIMATED BACKGROUND (Glowing Mesh) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[120px] animate-pulse duration-[10000ms]"></div>
        <div className="absolute top-[20%] right-[0%] w-[40%] h-[60%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/10 blur-[120px] animate-pulse duration-[8000ms]"></div>
      </div>

      {/* Subtle Background Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Main Navigation */}
      <nav className="relative z-50 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl h-20 shrink-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          
          {/* LOGO WITH CUSTOM V ICON */}
          <div className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-all duration-300">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 6l8 12 8-12" />
              </svg>
            </div>
            <span className="font-[family-name:var(--font-jakarta)] font-extrabold text-[1.7rem] tracking-tighter text-blue-600 dark:text-blue-500 transition-colors pt-1">
              finvortex
            </span>
          </div>
          
          {/* Desktop Mega-Menu */}
          <div className="hidden lg:flex space-x-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
            
            {/* 1. PLATFORM DROPDOWN */}
            <div className="relative group cursor-pointer py-7">
              <span className="hover:text-blue-700 dark:hover:text-blue-500 transition-colors flex items-center gap-1.5">
                {t.navPlatform} <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
              </span>
              <div className="absolute top-[70px] left-1/2 -translate-x-1/2 w-[560px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-200 grid grid-cols-2 gap-1 p-3 text-left rtl:text-right">
                <a href="#" className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-start gap-3 transition-colors">
                  <Database className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" /> 
                  <div><p className="text-slate-900 dark:text-white font-semibold">Accounting & Ledger</p><p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">Double-entry, immutable records</p></div>
                </a>
                <a href="#" className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-start gap-3 transition-colors">
                  <FileText className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" /> 
                  <div><p className="text-slate-900 dark:text-white font-semibold">Invoicing & Billing</p><p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">Automated receivables</p></div>
                </a>
                <a href="#" className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-start gap-3 transition-colors">
                  <Box className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" /> 
                  <div><p className="text-slate-900 dark:text-white font-semibold">Inventory</p><p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">Real-time stock tracking</p></div>
                </a>
                <a href="#" className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-start gap-3 transition-colors">
                  <Users className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" /> 
                  <div><p className="text-slate-900 dark:text-white font-semibold">Payroll & HR</p><p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">Secure salary disbursement</p></div>
                </a>
                <a href="#" className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-start gap-3 transition-colors">
                  <CreditCard className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" /> 
                  <div><p className="text-slate-900 dark:text-white font-semibold">Payments</p><p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">Multi-provider reconciliation</p></div>
                </a>
                <a href="#" className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-start gap-3 transition-colors">
                  <Cpu className="w-5 h-5 text-blue-700 mt-0.5 shrink-0" /> 
                  <div><p className="text-slate-900 dark:text-white font-semibold">Vortex AI</p><p className="text-xs text-slate-500 font-normal mt-0.5 leading-snug">Context-aware assistant</p></div>
                </a>
              </div>
            </div>

            {/* 2. SOLUTIONS DROPDOWN */}
            <div className="relative group cursor-pointer py-7">
              <span className="hover:text-blue-700 dark:hover:text-blue-500 transition-colors flex items-center gap-1.5">
                {t.navSolutions} <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
              </span>
              <div className="absolute top-[70px] left-0 w-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-200 flex flex-col py-2 text-left rtl:text-right">
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">Enterprise</p><p className="text-xs text-slate-500 font-normal mt-0.5">Multi-entity consolidation</p></div>
                </a>
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <Building2 className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">Small Business</p><p className="text-xs text-slate-500 font-normal mt-0.5">Simple, fast setup</p></div>
                </a>
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <Store className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">Retailers</p><p className="text-xs text-slate-500 font-normal mt-0.5">POS integration</p></div>
                </a>
              </div>
            </div>

            {/* 3. SECURITY DROPDOWN - RESTORED TO 4 ITEMS */}
            <div className="relative group cursor-pointer py-7">
              <span className="hover:text-blue-700 dark:hover:text-blue-500 transition-colors flex items-center gap-1.5">
                {t.navSecurity} <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
              </span>
              <div className="absolute top-[70px] left-0 w-[320px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-200 flex flex-col py-2 text-left rtl:text-right">
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">{t.sec1}</p><p className="text-xs text-slate-500 font-normal mt-0.5">{t.sec1b}</p></div>
                </a>
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <Lock className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">{t.sec2}</p><p className="text-xs text-slate-500 font-normal mt-0.5">{t.sec2b}</p></div>
                </a>
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <FileText className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">{t.sec3}</p><p className="text-xs text-slate-500 font-normal mt-0.5">{t.sec3b}</p></div>
                </a>
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <Users className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">{t.sec4}</p><p className="text-xs text-slate-500 font-normal mt-0.5">{t.sec4b}</p></div>
                </a>
              </div>
            </div>

            {/* 4. RESOURCES DROPDOWN */}
            <div className="relative group cursor-pointer py-7">
              <span className="hover:text-blue-700 dark:hover:text-blue-500 transition-colors flex items-center gap-1.5">
                {t.navResources} <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
              </span>
              <div className="absolute top-[70px] left-0 w-[300px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-200 flex flex-col py-2 text-left rtl:text-right">
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <BookOpen className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">Documentation</p><p className="text-xs text-slate-500 font-normal mt-0.5">User guides</p></div>
                </a>
                <a href="#" className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-start gap-3 transition-colors">
                  <Cpu className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                  <div><p className="text-slate-700 dark:text-slate-300 font-semibold">API Reference</p><p className="text-xs text-slate-500 font-normal mt-0.5">Developer docs</p></div>
                </a>
              </div>
            </div>

          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            
            {/* LANGUAGE DROPDOWN */}
            <div className="relative group cursor-pointer py-2 flex items-center gap-1.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-500 transition-colors mr-2">
              <Globe className="w-4 h-4" />
              <span>{getLangAbbr(lang)}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-50 group-hover:rotate-180 transition-transform duration-200" />
              
              <div className="absolute top-10 right-0 w-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 translate-y-2 transition-all duration-200 flex flex-col py-2 max-h-64 overflow-y-auto text-left rtl:text-right">
                {(Object.keys(translations) as Array<keyof typeof translations>).map((language) => (
                  <button 
                    key={language} 
                    onClick={() => setLang(language)}
                    className={`px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-normal transition-colors ${lang === language ? 'text-blue-600 font-semibold bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="#" className="hidden sm:block text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-500 transition-colors px-2">{t.signIn}</a>
            <a href="#" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95">
              {t.getStarted}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto px-6 w-full flex items-center justify-center">
        <div className={`grid lg:grid-cols-2 gap-16 items-center w-full py-4 ${isRTL ? 'direction-rtl' : ''}`}>
          
          {/* Left Column - Dynamic Translated Text */}
          <div className={`max-w-xl ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="font-serif text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-4 font-medium transition-all duration-300">
              {t.tagline}
            </p>

            <h1 className="text-5xl sm:text-6xl font-bold font-serif tracking-tight mb-6 leading-[1.1] text-slate-900 dark:text-white transition-all duration-300">
              {t.title1} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-blue-600 dark:from-blue-400 dark:to-blue-600">{t.title2}</span>
            </h1>
            
            <div className="space-y-4 mb-8 transition-all duration-300">
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {t.p1}
              </p>
              
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                {t.p2}
              </p>
            </div>
            
            <div className={`flex flex-col sm:flex-row gap-4 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <button className="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white transition-all duration-200 bg-blue-800 rounded-full hover:bg-blue-900 hover:shadow-[0_8px_30px_rgb(30,58,138,0.3)] hover:-translate-y-0.5 active:scale-95">
                <PlayCircle className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t.demoBtn}
              </button>
              
              <button className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95">
                <BookOpen className={`w-5 h-5 text-slate-400 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t.docBtn}
              </button>
            </div>

            {/* Professional & Universal Stats */}
            <div className="mt-10 pt-6 border-t border-slate-300 dark:border-slate-800 grid grid-cols-3 gap-6">
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.stats1}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.stats1b}</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.stats2}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.stats2b}</p>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{t.stats3}</p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.stats3b}</p>
              </div>
            </div>
          </div>

          {/* Right Column: LIVE Phone Mockup */}
          <div className="hidden lg:flex justify-center relative perspective-1000 lg:mr-12">
            
            <div className="phone-container relative w-[300px] h-[600px] bg-slate-950 rounded-[2.5rem] border-[8px] border-slate-900 shadow-2xl overflow-hidden flex flex-col ring-1 ring-white/10">
              
              <div className="absolute top-0 inset-x-0 h-7 bg-slate-950 flex justify-center z-20">
                <div className="w-28 h-6 bg-slate-900 rounded-b-xl border-b border-x border-slate-800"></div>
              </div>
              
              <div className="flex-1 bg-slate-50 dark:bg-slate-950 pt-10 overflow-hidden relative">
                
                <div className="animate-scroll-up space-y-4 px-3 pb-20">
                  
                  {/* === SCREEN 1 === */}
                  <div className={`flex justify-between items-center text-slate-900 dark:text-white mb-4 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-bold text-lg">{t.phoneFinance}</h3>
                      <p className="text-xs text-slate-500">{t.phoneWorkspace}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm">A</div>
                  </div>

                  <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-[10px] text-slate-500 font-medium mb-1">{t.phoneCash}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">$ 4,250,000</p>
                    <div className={`mt-2 flex gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] font-bold rounded">+12% MoM</span>
                    </div>
                  </div>

                  <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-28 flex flex-col justify-end ${isRTL ? 'text-right' : 'text-left'}`}>
                     <p className="text-[10px] text-slate-500 font-medium mb-2">{t.phoneRevenue}</p>
                     <div className={`flex items-end gap-1.5 h-14 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-full bg-blue-100 dark:bg-blue-900/50 rounded-t-sm h-[40%]"></div>
                        <div className="w-full bg-blue-200 dark:bg-blue-800/50 rounded-t-sm h-[60%]"></div>
                        <div className="w-full bg-blue-300 dark:bg-blue-700/50 rounded-t-sm h-[80%]"></div>
                        <div className="w-full bg-blue-600 rounded-t-sm h-[100%]"></div>
                        <div className="w-full bg-blue-500 rounded-t-sm h-[70%]"></div>
                     </div>
                  </div>

                  <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <p className="text-[10px] text-slate-500 font-medium mb-3">{t.phoneActivity}</p>
                    <div className="space-y-3">
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400"/></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white">{t.phoneInvoicePaid}</p>
                          <p className="text-[9px] text-slate-500">$ 450,000</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"><Database className="w-3 h-3 text-emerald-600 dark:text-emerald-400"/></div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white">{t.phoneStock}</p>
                          <p className="text-[9px] text-slate-500">120 Units</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* === SCREEN 2 (Duplicate for seamless scroll) === */}
                  <div className={`flex justify-between items-center text-slate-900 dark:text-white mb-4 mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                      <h3 className="font-bold text-lg">{t.phoneInvoices}</h3>
                      <p className="text-xs text-slate-500">Recent</p>
                    </div>
                  </div>

                  <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div>
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white">INV-2026-001</p>
                      <p className="text-[9px] text-slate-500">Global Retail</p>
                    </div>
                    <span className="text-[10px] font-bold text-green-600">$ 1.2M</span>
                  </div>

                  <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div>
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white">INV-2026-002</p>
                      <p className="text-[9px] text-slate-500">Traders Ltd</p>
                    </div>
                    <span className="text-[10px] font-bold text-orange-500">$ 850K</span>
                  </div>
                  
                  <div className={`bg-white dark:bg-slate-900 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex justify-between items-center ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
                    <div>
                      <p className="text-[10px] font-bold text-slate-900 dark:text-white">INV-2026-003</p>
                      <p className="text-[9px] text-slate-500">Logistics Co</p>
                    </div>
                    <span className="text-[10px] font-bold text-green-600">$ 3.4M</span>
                  </div>

                  <div className="h-10"></div>
                </div>

              </div>
              
              {/* Bottom Navigation Bar */}
              <div className={`absolute bottom-0 inset-x-0 h-14 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around z-20 pb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex flex-col items-center gap-1 text-blue-600 dark:text-blue-400">
                  <HomeIcon className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{t.phoneHome}</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
                  <Wallet className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{t.phoneAccounts}</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
                  <PieChart className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{t.phoneReports}</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-[9px] font-medium">{t.phoneSettings}</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}