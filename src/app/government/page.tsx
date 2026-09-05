'use client';

import { Button } from "@/components/ui/button";
import { GOVERNMENT_SERVICES } from "@/lib/government";
import {
   CircleUser,
   FileText,
   Landmark,
   ChevronRight,
   ArrowRight,
   BadgeCheck,
   ShieldCheck,
   Activity,
   Globe,
   Sparkles,
   MessageSquare
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const quickLinks = [
   { icon: CircleUser, label: "Citizen ID Sync", desc: "Verify & Link State Credentials", color: "from-blue-600 to-indigo-700", shadow: "shadow-blue-500/20", href: "/kyc" },
   { icon: FileText, label: "ARISE Permits", desc: "Digital Land & Business Licenses", color: "from-emerald-600 to-teal-700", shadow: "shadow-emerald-500/20", href: "#services" },
   { icon: Landmark, label: "Revenue Portal", desc: "State-Verified Tax & Fee Payments", color: "from-amber-500 to-amber-600", shadow: "shadow-amber-500/20", href: "#payments" },
   { icon: Activity, label: "Project Tracker", desc: "Live State Infrastructure Progress", color: "from-purple-600 to-indigo-600", shadow: "shadow-purple-500/20", href: "#track" },
];

export default function GovernmentPage() {
   return (
      <main className="min-h-screen bg-white dark:bg-slate-950 pb-28 relative overflow-hidden">
         {/* Background subtle glow */}
         <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-emerald-600/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

         <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-14 space-y-10 relative z-10 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
               <div className="space-y-4 max-w-3xl">
                  <div className="flex items-center gap-2.5">
                     <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-xs">
                        <Landmark className="size-4.5 text-emerald-600" />
                     </div>
                     <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-none px-3 py-1 rounded-lg font-bold uppercase text-[10px] tracking-wider">
                        Akwa Ibom State Ministries & Agencies
                     </Badge>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-tight">
                     Government <span className="text-emerald-600">Services</span>
                  </h1>
                  <p className="text-slate-600 dark:text-slate-300 font-normal text-sm md:text-base leading-relaxed max-w-2xl">
                     Official portal for state ministries, Internal Revenue Service (AKIRS), civil secretariats, and digital permit applications.
                  </p>
               </div>

               <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-900/60 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl border border-slate-200/80 dark:border-white/10 shadow-xs shrink-0">
                  <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                     <Globe className="size-5" />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Civic Portal</p>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">Active & Certified</p>
                  </div>
               </div>
            </div>

            {/* Quick Access Services */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
               {quickLinks.map((link) => (
                  <Link key={link.label} href={link.href}>
                     <Card className="group h-full bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-sm hover:shadow-md rounded-2xl p-5 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative">
                        <div className={cn("size-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-sm mb-4 group-hover:scale-105 transition-transform duration-200", link.color, link.shadow)}>
                           <link.icon className="size-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{link.label}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">{link.desc}</p>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                           Open Service <ArrowRight className="size-3" />
                        </div>
                     </Card>
                  </Link>
               ))}
            </div>

            {/* Service Directory + Dara Civic Assistant */}
            <div id="services" className="grid lg:grid-cols-3 gap-8 pt-4">
               <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between">
                     <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                        <FileText className="size-6 text-emerald-600" />
                        <span>State Ministry Directory</span>
                     </h2>
                     <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-none font-semibold px-3 py-1 rounded-lg text-xs">
                        {GOVERNMENT_SERVICES.length} Registered
                     </Badge>
                  </div>

                  <div className="grid gap-3.5 sm:gap-4">
                     {GOVERNMENT_SERVICES.map((s) => (
                        <Card key={s.name} className="group bg-white dark:bg-slate-900/40 border border-slate-200/70 dark:border-white/10 shadow-xs rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-200">
                           <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                              <div className="size-11 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                 <ShieldCheck className="size-5.5" />
                              </div>
                              <div className="space-y-0.5 min-w-0">
                                 <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{s.name}</h3>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{s.description}</p>
                              </div>
                           </div>
                           <Button className="h-10 rounded-xl bg-slate-900 text-white font-semibold text-xs px-5 hover:bg-emerald-600 shadow-sm active:scale-95 transition-all shrink-0">
                              Apply Online <ChevronRight className="size-3.5 ml-1.5" />
                           </Button>
                        </Card>
                     ))}
                  </div>
               </div>

               {/* Dara Civic Advisory HUD */}
               <div className="space-y-6">
                  <Card className="bg-slate-900 text-white border-none rounded-3xl overflow-hidden shadow-xl relative group">
                     <div className="p-6 relative z-10 space-y-5">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2.5">
                              <div className="size-10 rounded-full overflow-hidden border border-violet-400/40 shadow-sm">
                                 <img src="/dara.png" alt="Dara AI" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-white leading-tight">Dara</p>
                                 <p className="text-[10px] text-violet-300 font-medium">State Civic AI</p>
                              </div>
                           </div>
                           <Badge className="bg-violet-500/20 text-violet-300 border-violet-400/30 font-bold uppercase text-[9px] tracking-wider px-2.5 py-0.5">
                              Online
                           </Badge>
                        </div>

                        <div className="space-y-3">
                           <p className="text-sm font-medium text-slate-200 leading-relaxed italic">
                              "Emedi! All state agency portals are synchronized. Need guidance filing business permits or land verification? Ask me in Ibibio, Pidgin, or English."
                           </p>

                           <div className="pt-2">
                              <Link href="/dara" className="block w-full">
                                 <Button className="w-full h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-violet-600/30">
                                    <MessageSquare className="size-3.5" /> Ask Dara a Civic Question
                                 </Button>
                              </Link>
                           </div>

                           <div className="pt-3 border-t border-white/10 space-y-1.5">
                              <div className="flex justify-between text-[11px] text-slate-400">
                                 <span>Priority Project:</span>
                                 <span className="text-white font-semibold">Pisonia Link Corridor</span>
                              </div>
                              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500 w-[78%]" />
                              </div>
                              <p className="text-[10px] font-semibold text-emerald-400 text-right">78% Complete</p>
                           </div>
                        </div>
                     </div>
                     <div className="absolute -bottom-10 -right-10 size-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                  </Card>

                  {/* Verified Transparency Card */}
                  <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/70 dark:border-white/10 space-y-3">
                     <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <BadgeCheck className="size-5" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Verified Civic Standards</p>
                     </div>
                     <p className="text-xs font-normal leading-relaxed text-slate-600 dark:text-slate-400">
                        All applications submitted through the Ibom Power Hub portal are routed directly to the designated ministry secretariat with an official audit trail.
                     </p>
                  </div>
               </div>
            </div>

            {/* Digital Revenue & Payments */}
            <div id="payments" className="bg-gradient-to-br from-emerald-900 via-green-900 to-slate-950 rounded-3xl p-6 sm:p-8 md:p-10 text-white relative overflow-hidden shadow-xl mt-8">
               <div className="absolute right-8 top-1/2 -translate-y-1/2 size-48 rounded-full bg-emerald-500/10 blur-3xl" />
               <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                     <div className="size-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-2">
                        <Landmark className="size-5.5 text-white" />
                     </div>
                     <h3 className="text-xl sm:text-2xl font-bold">Digital Revenue & State Payments</h3>
                     <p className="text-white/80 max-w-xl text-xs sm:text-sm leading-relaxed">
                        Settle your state taxes, municipal levies, and official regulatory fees with real-time receipt generation via your IbomPay wallet.
                     </p>
                  </div>
                  <Link href="/wallet" className="shrink-0">
                     <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 h-11 shadow-lg shadow-emerald-500/25 gap-2">
                        Pay Taxes & Levies <ArrowRight className="size-4" />
                     </Button>
                  </Link>
               </div>
            </div>
         </div>
      </main>
   );
}