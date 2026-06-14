'use client';
import React from 'react';

import WasteHero from "@/components/waste/waste-hero";
import CollectorGrid from "@/components/waste/collector-grid";
import { privateWasteCollectors } from "@/lib/waste-management";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Clock,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
  Activity,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const collectionSchedule = [
  {
    area: "State Housing Estate, Uyo",
    day: "Mondays & Thursdays",
    time: "7:00 AM - 11:00 AM",
    status: "Active"
  },
  {
    area: "Itam / Ikot Ekpene Road",
    day: "Tuesdays & Fridays",
    time: "7:00 AM - 11:00 AM",
    status: "Active"
  },
  {
    area: "Ewet Housing / Oron Road",
    day: "Wednesdays & Saturdays",
    time: "8:00 AM - 12:00 PM",
    status: "Active"
  },
  {
    area: "Eket Urban (Grace Bill)",
    day: "Tuesdays & Fridays",
    time: "7:00 AM - 11:00 AM",
    status: "Active"
  },
  {
    area: "Ikot Ekpene Central",
    day: "Wednesdays & Saturdays",
    time: "7:00 AM - 11:00 AM",
    status: "Active"
  },
  {
    area: "Abak Road / Federal Housing",
    day: "Mondays & Wednesdays",
    time: "8:00 AM - 12:00 PM",
    status: "Delayed"
  },
];

export default function WastePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto px-6 py-6 sm:p-6 md:p-8 space-y-10 md:space-y-16 relative z-10 animate-in fade-in duration-1000">

        <WasteHero />

        {/* Tactical Overview Grid */}
        <section className="grid gap-2 sm:gap-6 md:gap-8 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="City Cleanliness" value="94%" icon={<ShieldCheck className="size-8 text-emerald-500" />} />
          <StatCard label="Active Crews" value="42 Units" icon={<Activity className="size-8 text-orange-500" />} />
          <StatCard label="Waste Recovered" value="12.4 Tons" icon={<Trash2 className="size-8 text-emerald-600" />} />
          <StatCard label="Next Pickup" value="In 4 Hours" icon={<Clock className="size-8 text-slate-400" />} />
        </section>

        {/* Collectors Section */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
            <div className="space-y-1.5">
              <Badge className="bg-emerald-600/10 text-emerald-600 border-none px-3 py-1 rounded-full font-bold uppercase text-[9px] tracking-widest mb-1.5">
                Verified Partners
              </Badge>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">LICENSED COLLECTORS</h2>
              <p className="text-slate-500 font-medium max-w-xl text-base">Official ARISE-certified waste management partners for residential and institutional logistics.</p>
            </div>
            <Button variant="ghost" className="hidden md:flex font-bold uppercase text-[10px] tracking-widest group text-slate-400 hover:text-emerald-500 transition-colors h-10 px-4">
              Registration Portal <ArrowRight className="ml-2 size-3.5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <CollectorGrid collectors={privateWasteCollectors} />
        </section>

        {/* Schedule & Monitoring Area */}
        <div className="grid lg:grid-cols-3 gap-10 pt-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3 px-2">
              <Calendar className="size-6 text-emerald-600" />
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">Strategic Pickup Schedule</h3>
            </div>

            <div className="space-y-4">
              {/* Desktop Table View */}
              <Card className="hidden md:block border border-white/20 shadow-sm rounded-3xl overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6 h-12">Designated Sector</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6 h-12">Operation Cycles</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6 h-12">Timeframe</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest px-6 h-12">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionSchedule.map((s, idx) => (
                        <TableRow key={s.area} className="border-slate-50 dark:border-slate-800/50 hover:bg-emerald-500/5 transition-colors group">
                          <TableCell className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                                <MapPin className="size-4" />
                              </div>
                              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">{s.area}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5 font-bold text-slate-500 dark:text-slate-400 text-sm">{s.day}</TableCell>
                          <TableCell className="px-6 py-5">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg w-fit shadow-inner">
                              <Clock className="size-3 text-emerald-500" />
                              <span className="text-[10px] font-bold tracking-widest uppercase">{s.time}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-5">
                            <Badge className={`${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'} border-none px-3 py-1 rounded-md font-bold uppercase text-[9px] tracking-widest`}>
                              {s.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Mobile Card View */}
              <div className="grid gap-4 md:hidden">
                {collectionSchedule.map((s) => (
                  <Card key={s.area} className="border border-white/20 shadow-sm rounded-2xl bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                          <MapPin className="size-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-black text-slate-950 dark:text-white text-base tracking-tight">{s.area}</p>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{s.day}</p>
                        </div>
                      </div>
                      <Badge className={`${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'} border-none px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-widest`}>
                        {s.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-white/10 shadow-inner">
                      <Clock className="size-4 text-emerald-500" />
                      <span className="text-sm font-black tracking-tight uppercase text-slate-700 dark:text-slate-300">{s.time}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 px-2 text-orange-600">
              <AlertCircle className="size-6" />
              <h3 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">Citizen Intel</h3>
            </div>

            <div className="grid gap-4">
              <InfoCard
                title="Illegal Dumping"
                desc="Report non-sanctioned waste disposal in your sector for immediate cleanup team deployment."
                icon={<Trash2 className="size-6 text-red-500" />}
              />
              <InfoCard
                title="Recycling Incentives"
                desc="Learn about the Ibom Waste-to-Wealth initiative and earn credits for sorted recyclables."
                icon={<Activity className="size-6 text-emerald-500" />}
              />
              <InfoCard
                title="Compost Program"
                desc="Official ARISE organic waste reduction protocols for residential agriculture."
                icon={<ShieldCheck className="size-6 text-indigo-500" />}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border border-white/20 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-1.5 sm:p-6 rounded-lg hover:bg-slate-950 group transition-all duration-300 md:hover:-translate-y-1 relative overflow-hidden">
      <div className="flex items-center gap-1 sm:gap-4 relative z-10">
        <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-800 group-hover:bg-white/10 transition-all shadow-inner group-hover:scale-105 group-hover:-rotate-6 group-hover:text-emerald-400 shrink-0">
          {React.cloneElement(icon as React.ReactElement, { className: 'size-3 sm:size-8' })}
        </div>
        <div className="min-w-0">
          <p className="text-[4.5px] sm:text-[9px] uppercase font-bold tracking-tighter text-slate-400 group-hover:text-slate-500 mb-0 leading-none">{label}</p>
          <p className="text-[8.5px] sm:text-2xl font-black text-slate-950 dark:text-white group-hover:text-white leading-tight tracking-tightest">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function InfoCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Card className="border border-white/10 shadow-sm rounded-2xl p-4 md:p-5 space-y-3 md:space-y-4 bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl hover:shadow-md transition-all group">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="size-10 md:size-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner shrink-0">
          {React.cloneElement(icon as React.ReactElement, { className: 'size-5 md:size-6' })}
        </div>
        <div className="space-y-0.5 md:space-y-1 min-w-0">
          <h4 className="text-base md:text-lg font-black tracking-tight truncate">{title}</h4>
          <p className="text-[7px] md:text-[9px] text-slate-400 font-bold leading-relaxed uppercase tracking-widest hidden sm:block truncate">{desc}</p>
        </div>
      </div>
      <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-medium px-1 line-clamp-2 md:line-clamp-none">{desc}</p>
      <Button className="w-full h-10 md:h-11 rounded-xl bg-slate-950 text-white font-bold uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-emerald-600 transition-all shadow-md active:scale-95">
        Initiate Protocol <ArrowRight className="ml-2 size-3 md:size-3.5" />
      </Button>
    </Card>
  );
}
