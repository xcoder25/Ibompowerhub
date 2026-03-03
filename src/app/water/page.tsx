'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { waterSchedule } from '@/lib/data';
import {
  Droplets,
  Clock,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Activity,
  Zap,
  ShieldCheck,
  Waves,
  FlaskConical,
  TestTube2
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function WaterPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-blue-500/10 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[200px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 md:p-12 space-y-16 relative z-10 animate-in fade-in duration-1000">

        {/* Hero Section - Water Purity */}
        <section className="relative h-[550px] w-full rounded-[4rem] overflow-hidden group shadow-[0_80px_160px_-30px_rgba(30,58,138,0.3)]">
          <Image
            src="/water_purity_aks_hero_1772468044434.png"
            alt="AKS Water Purity Control"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-[3000ms] opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-center p-12 md:p-24 space-y-6">
            <Badge className="w-fit bg-blue-600 text-white border-none px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl">
              Sanitized State Supply
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tightest leading-none drop-shadow-2xl">
              AQUA <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent italic">INTEGRITY.</span>
            </h1>
            <p className="text-slate-300 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed drop-shadow-lg">
              Precision hydraulics and molecular-level filtration ensuring the life-blood of Akwa Ibom exceeds international safety standards.
            </p>
            <div className="flex gap-4 pt-4">
              <Button className="h-20 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black text-lg transition-all shadow-2xl active:scale-95">
                Check Supply Quality <Waves className="ml-3 size-6" />
              </Button>
            </div>
          </div>
          <div className="absolute top-12 right-12 flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-blue-600/20 backdrop-blur-3xl px-6 py-3 rounded-full border border-blue-500/30">
              <span className="size-3 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Pressure: Stable (4.2 Bar)</span>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">99.8% System Integrity</p>
          </div>
        </section>

        {/* Tactical Metrics Grid */}
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="PH Level" value="7.2 - Neutral" icon={<FlaskConical className="size-8 text-blue-500" />} />
          <MetricCard label="Turbidity" value="0.4 NTU" icon={<TestTube2 className="size-8 text-emerald-500" />} />
          <MetricCard label="Reservoir" value="84% Loaded" icon={<Droplets className="size-8 text-blue-400" />} />
          <MetricCard label="Compliance" value="WHO Grade A" icon={<BadgeCheck className="size-8 text-indigo-500" />} />
        </section>

        <div className="grid lg:grid-cols-3 gap-16 pt-8">
          {/* Service Status Monitoring */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
                <Activity className="size-10 text-blue-600" /> Supply Logistics
              </h2>
              <Button variant="ghost" className="font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-blue-500 transition-colors">
                Regional Telemetry <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <StatusCard
                area="State Housing Estate"
                status="Flowing"
                nextSupply="Continuous Feed"
                icon={<Waves className="size-8 text-blue-500" />}
              />
              <StatusCard
                area="Uyo Central Metropolis"
                status="Interrupted"
                nextSupply="Resumes: 4h 12m"
                icon={<AlertTriangle className="size-8 text-orange-500" />}
                isWarning
              />
            </div>

            <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3.5rem] overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20">
              <CardHeader className="p-12">
                <CardTitle className="text-3xl font-black tracking-tighter">Supply Deployment Schedule</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Strategic hydraulic distribution across the state network.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                    <TableRow className="border-slate-100 dark:border-slate-800">
                      <TableHead className="font-black uppercase text-[10px] tracking-widest px-12 h-16">Metropolitan Zone</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest px-12 h-16">Operational Days</TableHead>
                      <TableHead className="font-black uppercase text-[10px] tracking-widest px-12 h-16">Window</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waterSchedule.map((item, index) => (
                      <TableRow key={index} className="border-slate-50 dark:border-slate-800/50 hover:bg-blue-500/5 transition-colors">
                        <TableCell className="px-12 py-8 font-black text-lg tracking-tight text-slate-900 dark:text-white">{item.area}</TableCell>
                        <TableCell className="px-12 py-8 font-medium text-slate-500">{item.days}</TableCell>
                        <TableCell className="px-12 py-8">
                          <Badge variant="outline" className="h-10 px-6 rounded-xl border-blue-200 text-blue-600 font-black text-[10px] uppercase tracking-widest">{item.time}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Citizen Actions */}
          <div className="space-y-12">
            <h2 className="text-4xl font-black tracking-tighter px-6">Direct Controls</h2>
            <div className="grid gap-10">
              <ActionCard
                title="Report Link Leak"
                desc="Immediate deployment of stabilization crews."
                icon={<Droplets className="size-10 text-red-500" />}
                btnClass="bg-red-600 hover:bg-red-700"
              />
              <ActionCard
                title="Bill Settlement"
                desc="Real-time account calibration and usage telemetry."
                icon={<Zap className="size-10 text-emerald-500" />}
                btnClass="bg-emerald-600 hover:bg-emerald-700"
              />
              <ActionCard
                title="Quality Check"
                desc="Request molecular laboratory testing for your premise."
                icon={<FlaskConical className="size-10 text-blue-500" />}
                btnClass="bg-blue-600 hover:bg-blue-700"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none shadow-[0_30px_60px_-15px_rgba(30,58,138,0.1)] bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] hover:bg-slate-950 group transition-all duration-700 hover:-translate-y-4 relative overflow-hidden">
      <div className="flex items-center gap-8 relative z-10">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white/10 transition-all shadow-inner group-hover:scale-110 group-hover:-rotate-12 group-hover:text-blue-400">
          {icon}
        </div>
        <div>
          <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-400 group-hover:text-slate-500 mb-2 leading-none">{label}</p>
          <p className="text-3xl font-black text-slate-950 dark:text-white group-hover:text-white leading-none tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function StatusCard({ area, status, nextSupply, icon, isWarning }: { area: string, status: string, nextSupply: string, icon: React.ReactNode, isWarning?: boolean }) {
  return (
    <Card className="border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] bg-white dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-10 space-y-8 group hover:-translate-y-2 transition-all duration-500 border border-white/20">
      <div className="flex items-center justify-between">
        <div className={`p-4 rounded-2xl ${isWarning ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-500'} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <Badge className={`bg-transparent ${isWarning ? 'text-orange-500 border-orange-200' : 'text-emerald-500 border-emerald-200'} font-black px-4 py-2 rounded-xl h-10`}>
          {status}
        </Badge>
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Regional Sector</p>
        <h3 className="text-2xl font-black tracking-tighter leading-none">{area}</h3>
        <p className={`text-sm font-bold pt-2 ${isWarning ? 'text-orange-600' : 'text-blue-600'}`}>{nextSupply}</p>
      </div>
    </Card>
  );
}

function ActionCard({ title, desc, icon, btnClass }: { title: string, desc: string, icon: React.ReactNode, btnClass: string }) {
  return (
    <Card className="border-none shadow-sm rounded-[3rem] p-8 space-y-6 bg-white dark:bg-slate-900/60 backdrop-blur-3xl hover:shadow-2xl transition-all group border border-white/5">
      <div className="flex items-center gap-6">
        <div className="size-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
          {icon}
        </div>
        <div className="space-y-1">
          <h4 className="text-xl font-black tracking-tightest">{title}</h4>
          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{desc}</p>
        </div>
      </div>
      <Button className={`w-full h-16 rounded-2xl text-white font-black uppercase text-xs tracking-widest transition-all shadow-xl active:scale-95 ${btnClass}`}>
        Initialize Task <ArrowRight className="ml-2 size-4" />
      </Button>
    </Card>
  );
}
