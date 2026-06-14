'use client';

import { Button } from "@/components/ui/button";
import { GOVERNMENT_SERVICES } from "@/lib/government";
import {
  Check,
  CircleUser,
  FileText,
  Landmark,
  MessageSquareWarning,
  Shield,
  ChevronRight,
  ArrowRight,
  Building2,
  Zap,
  BadgeCheck,
  Users,
  Brain,
  ShieldCheck,
  Activity,
  Globe
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const quickLinks = [
  { icon: CircleUser, label: "Neural ID Link", desc: "Sync Biometric State Credentials", color: "from-blue-600 to-indigo-700", shadow: "shadow-blue-500/25", href: "/kyc" },
  { icon: FileText, label: "Arise Permits", desc: "Digital Land & Business Licenses", color: "from-emerald-500 to-emerald-700", shadow: "shadow-emerald-500/25", href: "#services" },
  { icon: Landmark, label: "Revenue Portal", desc: "State-Verified Secure Payments", color: "from-amber-500 to-amber-600", shadow: "shadow-amber-500/25", href: "#payments" },
  { icon: Activity, label: "Impact Tracker", desc: "Live Project Telemetry", color: "from-purple-500 to-purple-600", shadow: "shadow-purple-500/25", href: "#track" },
];

export default function GovernmentPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-32 relative overflow-hidden">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[1200px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-8 py-10 md:py-16 space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* ── Dynamic Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div className="space-y-5 max-w-3xl">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                    <Landmark className="size-5 text-emerald-600" />
                 </div>
                 <Badge className="bg-emerald-600/10 text-emerald-600 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                   Institutional Nexus V4
                 </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tightest text-slate-950 dark:text-white leading-none">
                STATE<span className="bg-gradient-to-r from-emerald-500 to-amber-500 bg-clip-text text-transparent italic">NEXUS</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed max-w-xl">
                 Secure digital infrastructure for the ARISE Agenda. Access government protocols, revenue channels, and civic initiatives.
              </p>
           </div>
           
           <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-inner">
              <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                 <Globe className="size-7 text-emerald-600" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Governance Online</p>
                 <p className="text-xl font-black text-slate-900 dark:text-white">100% <span className="text-sm font-bold text-emerald-500">READY</span></p>
              </div>
           </div>
        </div>

        {/* ── Quick Access Nexus ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {quickLinks.map((link) => (
             <Link key={link.label} href={link.href}>
                <Card className="group bg-white dark:bg-slate-900/60 backdrop-blur-3xl border-none shadow-xl rounded-[2.5rem] p-8 hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                   <div className={cn("size-16 rounded-[1.5rem] bg-gradient-to-br flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500", link.color, link.shadow)}>
                      <link.icon className="size-8 text-white" />
                   </div>
                   <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2">{link.label}</h3>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{link.desc}</p>
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open Nexus <ArrowRight className="size-3" />
                   </div>
                   {/* Abstract element */}
                   <div className="absolute -bottom-10 -right-10 size-32 bg-white/5 rounded-full pointer-events-none group-hover:bg-white/10 transition-colors" />
                </Card>
             </Link>
           ))}
        </div>

        {/* ── AI Service Directory ── */}
        <div className="grid lg:grid-cols-3 gap-12 pt-8">
           <div className="lg:col-span-2 space-y-10">
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black uppercase tracking-tightest flex items-center gap-4">
                    <FileText className="size-8 text-emerald-600" /> Service Protocols
                 </h2>
                 <Badge className="bg-slate-100 text-slate-500 border-none font-bold px-4 py-1.5 rounded-xl uppercase text-[9px] tracking-widest">
                    {GOVERNMENT_SERVICES.length} Registered
                 </Badge>
              </div>

              <div className="grid gap-6">
                 {GOVERNMENT_SERVICES.map((s) => (
                   <Card key={s.name} className="group bg-white dark:bg-slate-900/40 border-none shadow-lg rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl transition-all duration-500 border border-slate-100 dark:border-white/5">
                      <div className="flex items-center gap-5 flex-1">
                         <div className="size-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <ShieldCheck className="size-7" />
                         </div>
                         <div className="space-y-1">
                            <h3 className="text-lg font-black tracking-tight text-slate-950 dark:text-white">{s.name}</h3>
                            <p className="text-xs text-slate-500 font-medium">{s.description}</p>
                         </div>
                      </div>
                      <Button className="h-14 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[9px] px-8 hover:bg-emerald-600 shadow-xl active:scale-95 transition-all">
                         Initialize Request <ChevronRight className="size-4 ml-2" />
                      </Button>
                   </Card>
                 ))}
              </div>
           </div>

           {/* Orion Side HUD */}
           <div className="space-y-8">
              <Card className="bg-slate-950 text-white border-none rounded-[3rem] overflow-hidden shadow-2xl relative group">
                 <div className="p-8 relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl group-hover:rotate-12 transition-transform">
                          <Brain className="size-7 text-emerald-400" />
                       </div>
                       <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black uppercase text-[9px] tracking-widest px-4 py-1.5">Orion Presence</Badge>
                    </div>
                    
                    <div className="space-y-4">
                       <p className="text-2xl font-black italic leading-tight text-emerald-50">"Boss, the state ledger is synchronized. Your ID link is at 100% trust level."</p>
                       <div className="space-y-2 pt-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Live State Project: Pisonia Link</p>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-500 w-[78%] animate-pulse" />
                          </div>
                          <p className="text-[9px] font-bold text-emerald-500 text-right">78% Complete</p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 size-48 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
              </Card>

              {/* Verified Badge Case */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-white/5 space-y-6">
                 <div className="flex items-center gap-3">
                    <BadgeCheck className="size-6 text-blue-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Authenticity</p>
                 </div>
                 <p className="text-xs font-medium leading-relaxed italic text-slate-500 italic">
                   "Governance in the ARISE era is transparent, hashed on the ledger, and accessible by every resident of our Great State."
                 </p>
              </div>
           </div>
        </div>

        {/* Digital Payments */}
        <div id="payments" className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-green-900/30 mt-12">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 size-48 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="size-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-4">
                <Landmark className="size-7" />
              </div>
              <h3 className="text-2xl font-black mb-2">Digital Payments & Revenue</h3>
              <p className="text-white/70 max-w-lg leading-relaxed">
                Pay your state taxes, levies, and government fees securely through our digital revenue platform.
              </p>
            </div>
            <Link href="/wallet">
              <Button className="rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black px-8 h-12 shadow-xl shadow-orange-500/30 gap-2 flex-shrink-0">
                Pay Taxes & Fees <ArrowRight className="size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
