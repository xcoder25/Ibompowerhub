'use client';
import React from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { waterSchedule } from '@/lib/data';
import {
  Droplets,
  Clock,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Activity,
  Zap,
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-700">

        {/* Hero Section */}
        <section className="relative h-[340px] sm:h-[420px] md:h-[480px] w-full rounded-2xl sm:rounded-3xl overflow-hidden group shadow-lg">
          <Image
            src="/images/akwa_ibom_water_hero.png"
            alt="AKS Water Purity Control"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60 md:opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-transparent flex flex-col justify-center p-6 sm:p-10 md:p-14 space-y-3 sm:space-y-4">
            <Badge className="w-fit bg-blue-600 text-white border-none px-3 py-1 rounded-full font-bold uppercase text-[10px] tracking-wider shadow-sm">
              State Water Corporation (AKSWC)
            </Badge>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Aqua <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Integrity</span>
            </h1>
            <p className="text-slate-200 text-sm sm:text-base md:text-lg font-normal max-w-xl leading-relaxed">
              Monitoring hydraulic distribution, filtration standards, and municipal supply windows across Akwa Ibom State.
            </p>
            <div className="flex gap-3 pt-2">
              <Button className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95">
                Check Supply Quality <Waves className="ml-2 size-4" />
              </Button>
            </div>
          </div>
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-blue-500/30 shadow-sm">
              <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Pressure: Stable (4.2 Bar)</span>
            </div>
            <p className="text-[10px] font-medium text-slate-300 mr-2">99.8% System Integrity</p>
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <MetricCard label="PH Level" value="7.2 Neutral" icon={<FlaskConical className="size-5 text-blue-500" />} />
          <MetricCard label="Turbidity" value="0.4 NTU" icon={<TestTube2 className="size-5 text-emerald-500" />} />
          <MetricCard label="Reservoir" value="84% Capacity" icon={<Droplets className="size-5 text-blue-400" />} />
          <MetricCard label="Standard" value="WHO Grade A" icon={<BadgeCheck className="size-5 text-indigo-500" />} />
        </section>

        {/* Logistics & Action Hub */}
        <div className="grid lg:grid-cols-3 gap-8 pt-2">
          {/* Supply Status Monitoring */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
                <Activity className="size-5 text-blue-600" /> Supply Logistics
              </h2>
              <Button variant="ghost" className="font-semibold text-xs text-slate-500 hover:text-blue-600 h-8">
                Zone Overview <ArrowRight className="ml-1 size-3.5" />
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <StatusCard
                area="Shelter Afrique Estate"
                status="Active Flow"
                nextSupply="Continuous Feed"
                icon={<Waves className="size-5 text-blue-500" />}
              />
              <StatusCard
                area="Uyo Central Metropolis"
                status="Maintenance"
                nextSupply="Resumes in 4h 12m"
                icon={<AlertTriangle className="size-5 text-amber-500" />}
                isWarning
              />
            </div>

            <div className="space-y-4">
              {/* Desktop Table View */}
              <Card className="hidden md:block border border-slate-200/70 dark:border-white/10 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900/60">
                <CardHeader className="p-6 pb-4">
                  <CardTitle className="text-lg font-bold">Metropolitan Supply Windows</CardTitle>
                  <CardDescription className="text-slate-500 text-xs">Strategic municipal distribution schedule across state zones.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-800/40">
                      <TableRow className="border-slate-100 dark:border-slate-800">
                        <TableHead className="font-bold text-xs px-6 h-11 text-slate-600 dark:text-slate-300">Zone</TableHead>
                        <TableHead className="font-bold text-xs px-6 h-11 text-slate-600 dark:text-slate-300">Active Days</TableHead>
                        <TableHead className="font-bold text-xs px-6 h-11 text-slate-600 dark:text-slate-300">Supply Window</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {waterSchedule.map((item, index) => (
                        <TableRow key={index} className="border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <TableCell className="px-6 py-4 font-bold text-sm text-slate-900 dark:text-white">{item.area}</TableCell>
                          <TableCell className="px-6 py-4 font-medium text-slate-500 text-xs">{item.days}</TableCell>
                          <TableCell className="px-6 py-4">
                            <Badge variant="outline" className="h-7 px-3 rounded-lg border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 font-semibold text-xs">{item.time}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Mobile Card View */}
              <div className="grid gap-3 md:hidden">
                <div className="px-1">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Supply Schedule</h3>
                  <p className="text-xs text-slate-500">Weekly hydraulic distribution times.</p>
                </div>
                {waterSchedule.map((item, index) => (
                  <Card key={index} className="border border-slate-200/70 dark:border-white/10 shadow-xs rounded-xl bg-white dark:bg-slate-900/60 p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{item.area}</h4>
                      <Badge variant="outline" className="border-blue-200 text-blue-600 font-semibold text-[10px]">ACTIVE</Badge>
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Clock className="size-3.5" />
                        <span>{item.days}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-lg border border-blue-100 dark:border-blue-900">
                        <Waves className="size-3.5 text-blue-600" />
                        <span className="font-bold text-blue-700 dark:text-blue-300 text-xs">{item.time}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Citizen Actions */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resident Services</h2>
            <div className="grid gap-3.5">
              <ActionCard
                title="Report Pipeline Leak"
                desc="Immediate dispatch of AKSWC emergency repair crews."
                icon={<Droplets className="size-5 text-rose-500" />}
                btnText="Report Outage"
                btnClass="bg-rose-600 hover:bg-rose-700 text-white"
              />
              <ActionCard
                title="Water Bill Settlement"
                desc="Pay municipal water tariffs securely via IbomPay."
                icon={<Zap className="size-5 text-emerald-500" />}
                btnText="Pay Tariff"
                btnClass="bg-emerald-600 hover:bg-emerald-700 text-white"
              />
              <ActionCard
                title="Premise Quality Test"
                desc="Request official laboratory purity and safety test."
                icon={<FlaskConical className="size-5 text-blue-500" />}
                btnText="Request Test"
                btnClass="bg-blue-600 hover:bg-blue-700 text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="border border-slate-200/70 dark:border-white/10 shadow-xs bg-white dark:bg-slate-900/60 p-3.5 sm:p-5 rounded-2xl transition-all duration-200">
      <div className="flex items-center gap-3">
        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5 truncate">{label}</p>
          <p className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function StatusCard({ area, status, nextSupply, icon, isWarning }: { area: string; status: string; nextSupply: string; icon: React.ReactNode; isWarning?: boolean }) {
  return (
    <Card className="border border-slate-200/70 dark:border-white/10 shadow-xs bg-white dark:bg-slate-900/60 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl ${isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
          {icon}
        </div>
        <Badge className={`${isWarning ? 'bg-amber-500/10 text-amber-600 border-amber-200' : 'bg-emerald-500/10 text-emerald-600 border-emerald-200'} font-bold text-[10px]`}>
          {status}
        </Badge>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distribution Zone</p>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{area}</h3>
        <p className={`text-xs font-semibold mt-1 ${isWarning ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`}>{nextSupply}</p>
      </div>
    </Card>
  );
}

function ActionCard({ title, desc, icon, btnText, btnClass }: { title: string; desc: string; icon: React.ReactNode; btnText: string; btnClass: string }) {
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
      <Button className={`w-full h-9 rounded-xl font-bold text-xs shadow-xs active:scale-95 transition-all ${btnClass}`}>
        {btnText} <ArrowRight className="ml-1.5 size-3.5" />
      </Button>
    </Card>
  );
}
