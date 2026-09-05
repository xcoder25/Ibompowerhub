'use client';
import React from 'react';

import WasteHero from "@/components/waste/waste-hero";
import CollectorGrid from "@/components/waste/collector-grid";
import { privateWasteCollectors } from "@/lib/waste-management";
import { Card, CardContent } from "@/components/ui/card";
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-700">

        <WasteHero />

        {/* Overview Stats */}
        <section className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard label="City Cleanliness" value="94%" icon={<ShieldCheck className="size-5 text-emerald-500" />} />
          <StatCard label="Active Crews" value="42 Units" icon={<Activity className="size-5 text-orange-500" />} />
          <StatCard label="Waste Recovered" value="12.4 Tons" icon={<Trash2 className="size-5 text-emerald-600" />} />
          <StatCard label="Next Pickup" value="In 4 Hours" icon={<Clock className="size-5 text-slate-400" />} />
        </section>

        {/* Collectors Section */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 px-1">
            <div className="space-y-1">
              <Badge className="bg-emerald-600/10 text-emerald-700 dark:text-emerald-300 border-none px-3 py-1 rounded-full font-bold uppercase text-[9px] tracking-wider mb-1">
                Verified AKS Partners
              </Badge>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Licensed Waste Collectors</h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-xl">Official certified waste management partners for residential and commercial collection.</p>
            </div>
            <Button variant="ghost" className="hidden md:flex font-semibold text-xs text-slate-500 hover:text-emerald-600 h-9 px-3">
              Operator Registration <ArrowRight className="ml-1.5 size-3.5" />
            </Button>
          </div>
          <CollectorGrid collectors={privateWasteCollectors} />
        </section>

        {/* Schedule & Monitoring Area */}
        <div className="grid lg:grid-cols-3 gap-8 pt-2">
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 px-1">
              <Calendar className="size-5 text-emerald-600" />
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Municipal Pickup Schedule</h3>
            </div>

            <div className="space-y-4">
              {/* Desktop Table View */}
              <Card className="hidden md:block border border-slate-200/70 dark:border-white/10 shadow-xs rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="font-bold text-xs px-6 h-11 text-slate-600 dark:text-slate-300">Designated Sector</TableHead>
                        <TableHead className="font-bold text-xs px-6 h-11 text-slate-600 dark:text-slate-300">Collection Days</TableHead>
                        <TableHead className="font-bold text-xs px-6 h-11 text-slate-600 dark:text-slate-300">Window</TableHead>
                        <TableHead className="font-bold text-xs px-6 h-11 text-slate-600 dark:text-slate-300">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collectionSchedule.map((s) => (
                        <TableRow key={s.area} className="border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                                <MapPin className="size-3.5" />
                              </div>
                              <span className="font-bold text-sm text-slate-900 dark:text-white">{s.area}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4 font-medium text-slate-500 text-xs">{s.day}</TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                              <Clock className="size-3 text-slate-400" />
                              <span>{s.time}</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge className={`${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' : 'bg-amber-500/10 text-amber-600 border-amber-200'} font-semibold text-[10px]`}>
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
              <div className="grid gap-3 md:hidden">
                {collectionSchedule.map((s) => (
                  <Card key={s.area} className="border border-slate-200/70 dark:border-white/10 shadow-xs rounded-xl bg-white dark:bg-slate-900/60 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                          <MapPin className="size-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">{s.area}</p>
                          <p className="text-xs text-slate-500">{s.day}</p>
                        </div>
                      </div>
                      <Badge className={`${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'} border-none px-2 py-0.5 font-bold text-[9px]`}>
                        {s.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <Clock className="size-3.5 text-emerald-600" />
                      <span>{s.time}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Citizen Reporting & Initiatives */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 px-1 text-slate-900 dark:text-white">
              <AlertCircle className="size-5 text-emerald-600" />
              <h3 className="text-xl font-bold tracking-tight">Citizen Action</h3>
            </div>

            <div className="grid gap-3.5">
              <InfoCard
                title="Report Illegal Dumping"
                desc="Report non-sanctioned waste disposal in your area for immediate evacuation by state sanitation."
                icon={<Trash2 className="size-5 text-rose-500" />}
                btnText="Report Dump"
              />
              <InfoCard
                title="Waste-to-Wealth Recycling"
                desc="Participate in the Akwa Ibom recycling initiative and earn credits for sorted plastics and cans."
                icon={<Activity className="size-5 text-emerald-500" />}
                btnText="Join Program"
              />
              <InfoCard
                title="Organic Compost Scheme"
                desc="Official ARISE agricultural waste recycling for farming and residential fertilizer support."
                icon={<ShieldCheck className="size-5 text-indigo-500" />}
                btnText="Learn More"
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
    <Card className="border border-slate-200/70 dark:border-white/10 shadow-xs bg-white dark:bg-slate-900/60 p-3.5 sm:p-5 rounded-2xl transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5 truncate">{label}</p>
          <p className="text-sm sm:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function InfoCard({ title, desc, icon, btnText }: { title: string; desc: string; icon: React.ReactNode; btnText: string }) {
  return (
    <Card className="border border-slate-200/70 dark:border-white/10 shadow-xs rounded-2xl p-4 space-y-3 bg-white dark:bg-slate-900/60">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="space-y-0.5 min-w-0">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">{desc}</p>
        </div>
      </div>
      <Button className="w-full h-9 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs active:scale-95 transition-all">
        {btnText} <ArrowRight className="ml-1.5 size-3.5" />
      </Button>
    </Card>
  );
}
