'use client';

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
    area: "State Housing Estate",
    day: "Mondays & Thursdays",
    time: "8:00 AM - 12:00 PM",
    status: "Active"
  },
  {
    area: "Marian / Calabar South",
    day: "Tuesdays & Fridays",
    time: "8:00 AM - 12:00 PM",
    status: "Active"
  },
  {
    area: "8 Miles / Highway",
    day: "Wednesdays & Saturdays",
    time: "8:00 AM - 12:00 PM",
    status: "Delayed"
  },
];

export default function WastePage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 md:p-12 space-y-20 relative z-10 animate-in fade-in duration-1000">

        <WasteHero />

        {/* Tactical Overview Grid */}
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="City Cleanliness" value="94%" icon={<ShieldCheck className="size-8 text-emerald-500" />} />
          <StatCard label="Active Crews" value="42 Units" icon={<Activity className="size-8 text-orange-500" />} />
          <StatCard label="Waste Recovered" value="12.4 Tons" icon={<Trash2 className="size-8 text-emerald-600" />} />
          <StatCard label="Next Pickup" value="In 4 Hours" icon={<Clock className="size-8 text-slate-400" />} />
        </section>

        {/* Collectors Section */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
            <div className="space-y-2">
              <Badge className="bg-emerald-600/10 text-emerald-600 border-none px-4 py-1 rounded-full font-black uppercase text-[10px] tracking-widest mb-2">
                Verified Partners
              </Badge>
              <h2 className="text-4xl md:text-5xl font-black tracking-tightest">LICENSED COLLECTORS</h2>
              <p className="text-slate-500 font-medium max-w-xl text-lg">Official ARISE-certified waste management partners for residential and institutional logistics.</p>
            </div>
            <Button variant="ghost" className="hidden md:flex font-black uppercase text-[11px] tracking-[0.2em] group text-slate-400 hover:text-emerald-500 transition-colors">
              Registration Portal <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
          <CollectorGrid collectors={privateWasteCollectors} />
        </section>

        {/* Schedule & Monitoring Area */}
        <div className="grid lg:grid-cols-3 gap-16 pt-10">
          <section className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4 px-4">
              <Calendar className="size-10 text-emerald-600" />
              <h3 className="text-3xl font-black tracking-tighter">Strategic Pickup Schedule</h3>
            </div>

            <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3.5rem] overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                    <TableRow className="border-slate-100 dark:border-slate-800">
                      <TableHead className="font-black uppercase text-[11px] tracking-widest px-12 h-20">Designated Sector</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest px-12 h-20">Operation Cycles</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest px-12 h-20">Timeframe</TableHead>
                      <TableHead className="font-black uppercase text-[11px] tracking-widest px-12 h-20">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {collectionSchedule.map((s, idx) => (
                      <TableRow key={s.area} className="border-slate-50 dark:border-slate-800/50 hover:bg-emerald-500/5 transition-colors group">
                        <TableCell className="px-12 py-10">
                          <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                              <MapPin className="size-5" />
                            </div>
                            <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white">{s.area}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-12 py-10 font-bold text-slate-500 dark:text-slate-400">{s.day}</TableCell>
                        <TableCell className="px-12 py-10">
                          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl w-fit">
                            <Clock className="size-4 text-emerald-500" />
                            <span className="text-xs font-black tracking-widest uppercase">{s.time}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-12 py-10">
                          <Badge className={`${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-orange-500/10 text-orange-600'} border-none px-4 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest`}>
                            {s.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-8">
            <div className="flex items-center gap-4 px-4 text-orange-600">
              <AlertCircle className="size-10" />
              <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">Citizen Intel</h3>
            </div>

            <div className="grid gap-10">
              <InfoCard
                title="Illegal Dumping"
                desc="Report non-sanctioned waste disposal in your sector for immediate cleanup team deployment."
                icon={<Trash2 className="size-10 text-red-500" />}
              />
              <InfoCard
                title="Recycling Incentives"
                desc="Learn about the Ibom Waste-to-Wealth initiative and earn credits for sorted recyclables."
                icon={<Activity className="size-10 text-emerald-500" />}
              />
              <InfoCard
                title="Compost Program"
                desc="Official ARISE organic waste reduction protocols for residential agriculture."
                icon={<ShieldCheck className="size-10 text-indigo-500" />}
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
    <Card className="border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] hover:bg-slate-950 group transition-all duration-700 hover:-translate-y-4 relative overflow-hidden">
      <div className="flex items-center gap-8 relative z-10">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white/10 transition-all shadow-inner group-hover:scale-110 group-hover:-rotate-12 group-hover:text-emerald-400">
          {icon}
        </div>
        <div>
          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400 group-hover:text-slate-500 mb-2 leading-none">{label}</p>
          <p className="text-4xl font-black text-slate-950 dark:text-white group-hover:text-white leading-none tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function InfoCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-sm rounded-[3rem] p-8 space-y-6 bg-white dark:bg-slate-900/60 backdrop-blur-3xl hover:shadow-2xl transition-all group border border-white/5">
      <div className="flex items-center gap-6">
        <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
          {icon}
        </div>
        <div className="space-y-1">
          <h4 className="text-2xl font-black tracking-tightest">{title}</h4>
          <p className="text-[11px] text-slate-400 font-medium leading-relaxed uppercase tracking-widest">{desc.slice(0, 50)}...</p>
        </div>
      </div>
      <p className="text-sm text-slate-500 leading-relaxed font-medium px-2">{desc}</p>
      <Button className="w-full h-16 rounded-2xl bg-slate-950 text-white font-black uppercase text-xs tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
        Initiate Protocol <ArrowRight className="ml-2 size-4" />
      </Button>
    </Card>
  );
}
