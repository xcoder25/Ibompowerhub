'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Phone,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
  Activity,
  Zap,
  Radio,
  GanttChart
} from 'lucide-react';
import { emergencyContacts } from '@/lib/data';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

export default function SafetyPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Hero Section - High-Impact Dispatch */}
        <section className="relative h-[400px] md:h-[500px] w-full rounded-3xl overflow-hidden group shadow-lg">
          <Image
            src="/safety_hero_high_tech_dispatch_1772465345096.png"
            alt="Guardian Response Control"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-[3000ms] opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-center p-6 md:p-12 space-y-4">
            <Badge className="w-fit bg-red-600 text-white border-none px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-red-500/20">
              Live State Security Feed
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none drop-shadow-xl">
              GUARDIAN <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent italic">RESPONSE.</span>
            </h1>
            <p className="text-slate-300 text-base md:text-lg font-medium max-w-2xl leading-relaxed drop-shadow-md">
              Tactical coordination and rapid emergency stabilization across the ARISE ecosystem. Your safety is our primary objective.
            </p>
            <div className="flex gap-3 pt-2">
              <Button className="h-12 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 group/btn">
                Emergency Hotline <Phone className="ml-2 size-4 group-hover/btn:rotate-12 transition-transform" />
              </Button>
            </div>
          </div>
          <div className="absolute top-6 right-6 flex flex-col items-end gap-1.5 hidden sm:flex">
            <div className="flex items-center gap-2 bg-red-600/20 backdrop-blur-3xl px-4 py-2 rounded-full border border-red-500/30">
              <span className="size-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-red-500">Response Active</span>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Average Response: 4m 12s</p>
          </div>
        </section>

        {/* Tactical Stats Grid */}
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Active Units" value="2,482" icon={<Shield className="size-8 text-blue-500" />} />
          <StatCard label="Civic Safety" value="98.4%" icon={<Activity className="size-8 text-emerald-500" />} />
          <StatCard label="Stabilization" value="Stable" icon={<Zap className="size-8 text-orange-500" />} />
          <StatCard label="Network Nodes" value="Offline-Resistant" icon={<Radio className="size-8 text-indigo-500" />} />
        </section>

        <div className="grid lg:grid-cols-3 gap-10 pt-4">
          {/* Active Situational Stream */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <GanttChart className="size-6 text-red-600" /> Situational Stream
              </h2>
              <Button variant="ghost" className="font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-red-500 transition-colors">
                View Archive <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </div>

            <div className="grid gap-4">
              <AlertCard
                title="Logistics Alert: Ikot Ekpene Road"
                desc="Tactical obstruction due to infrastructure maintenance. Strategic bypass advised via Abak corridor."
                type="warning"
                loc="Uyo Metropolis"
                time="12m ago"
              />
              <AlertCard
                title="Critical Utility: Aka Road Junction"
                desc="High-voltage structural failure. Rapid Response Team Alpha deployed. Area cordoned."
                type="critical"
                loc="Uyo Central"
                time="45m ago"
              />
              <AlertCard
                title="Optimization Clear: Itam Market"
                desc="Normal movement flow restoration complete. Market wardens maintaining compliance protocols."
                type="info"
                loc="Itam District"
                time="2h ago"
              />
            </div>
          </div>

          {/* Safety Knowledge Panel */}
          <div className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-black tracking-tight px-2 text-slate-900 dark:text-white">Safety Intel</h2>
            <Card className="overflow-hidden border-none shadow-sm bg-slate-950 rounded-3xl relative group min-h-[400px] flex flex-col">
              <div className="absolute top-0 right-0 p-24 bg-orange-500/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800"
                  alt="Safety Intelligence"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-[2000ms] opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              </div>
              <CardHeader className="p-6 md:p-8 space-y-4">
                <Badge className="w-fit bg-red-600 text-white border-none px-4 py-1.5 font-bold uppercase text-[9px] tracking-widest shadow-md">
                  Strategic Advisory
                </Badge>
                <CardTitle className="text-2xl text-white font-black leading-tight group-hover:text-red-500 transition-colors tracking-tight">Digital Perimeter Protection</CardTitle>
              </CardHeader>
              <CardContent className="px-6 md:px-8 pb-6 flex-grow">
                <p className="text-slate-400 text-sm leading-relaxed font-medium italic">
                  &quot;Deploy Multi-Factor Authentication on all financial interfaces. The State Command will
                  never request credentials via unverified channels.&quot;
                </p>
              </CardContent>
              <CardFooter className="p-6 md:p-8 pt-0">
                <Button className="w-full h-12 bg-white hover:bg-red-600 text-slate-950 hover:text-white font-bold text-sm rounded-xl transition-all shadow-md active:scale-95">
                  Access Encyclopedia <ArrowRight className="ml-2 size-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Emergency Lifelines - Ultra Premium Grid */}
        <section className="space-y-8 pt-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter">Emergency Lifelines</h2>
              <p className="text-slate-500 text-base md:text-lg font-medium max-w-3xl leading-relaxed">Single-origin access to elite state-wide response services. Tactical coordination at your fingertips.</p>
            </div>
            <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-bold px-4 py-2 rounded-full uppercase tracking-widest text-[9px] shadow-sm">
              Network: 100% Online
            </Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {emergencyContacts.map((contact, idx) => (
              <Card key={contact.id} className="group border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl hover:-translate-y-1">
                <div className={`h-1.5 w-full ${idx === 0 ? 'bg-red-600' : idx === 1 ? 'bg-blue-600' : idx === 2 ? 'bg-slate-950' : 'bg-emerald-600'} opacity-30 group-hover:opacity-100 transition-opacity`} />
                <CardHeader className="p-6 md:p-8 space-y-4">
                  <div className="bg-slate-50 dark:bg-slate-800 size-14 rounded-xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white group-hover:rotate-12 transition-all duration-300 shadow-inner">
                    <Phone className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Unit Designation</p>
                    <CardTitle className="text-2xl font-black tracking-tight leading-none">{contact.name}</CardTitle>
                  </div>
                  <CardDescription className="text-3xl lg:text-4xl font-black font-mono tracking-tighter text-slate-950 dark:text-white pt-2 group-hover:text-red-600 transition-colors">
                    {contact.number}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-6 md:p-8 pt-0">
                  <Button asChild className="w-full h-12 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-red-600 hover:text-white rounded-xl font-bold text-base transition-all shadow-md active:scale-95 group/btn">
                    <a href={`tel:${contact.number}`}>
                      Initialize Call <ExternalLink className="ml-2 size-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border border-white/20 shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-5 sm:p-6 rounded-2xl hover:bg-slate-950 group transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Sparkles className="size-20" />
      </div>
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white/10 transition-all shadow-inner group-hover:scale-105 group-hover:-rotate-6">
          {icon}
        </div>
        <div>
          <p className="text-[9px] uppercase font-bold tracking-widest text-slate-400 group-hover:text-slate-500 mb-1 leading-none">{label}</p>
          <p className="text-2xl font-black text-slate-950 dark:text-white group-hover:text-white leading-none tracking-tight">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function AlertCard({ title, desc, type, loc, time }: { title: string, desc: string, type: 'warning' | 'critical' | 'info', loc: string, time: string }) {
  const isCritical = type === 'critical';
  const isWarning = type === 'warning';

  return (
    <Card className={`border-none ${isCritical ? 'bg-red-500/5 shadow-red-500/10' : isWarning ? 'bg-orange-500/5 shadow-orange-500/10' : 'bg-slate-500/5'} backdrop-blur-3xl rounded-2xl p-5 sm:p-6 transition-all hover:scale-[1.01] hover:shadow-md group border border-white/10`}>
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-center">
        <div className={`size-14 rounded-xl flex items-center justify-center shrink-0 shadow-md ${isCritical ? 'bg-red-600 text-white animate-pulse' : isWarning ? 'bg-orange-600 text-white' : 'bg-slate-950 text-white'} group-hover:scale-105 transition-transform`}>
          {isCritical ? <AlertTriangle className="size-6" /> : isWarning ? <Shield className="size-6" /> : <Activity className="size-6" />}
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <Badge className={`${isCritical ? 'bg-red-600' : isWarning ? 'bg-orange-600' : 'bg-slate-950'} text-white border-none font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm`}>
              {type} Priority
            </Badge>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Clock className="size-3" /> {time}
            </div>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-red-500 transition-colors tracking-tight leading-tight">{title}</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-sm italic">{desc}</p>
          <div className="flex items-center gap-2 p-2 px-3 bg-white/60 dark:bg-slate-900/60 rounded-xl w-fit border border-white/10 shadow-sm">
            <MapPin className="size-4 text-red-600" />
            <span className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">{loc}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="md:ml-auto rounded-xl h-12 w-12 bg-slate-100 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-inner group-hover:rotate-12">
          <ChevronRight className="size-6 text-slate-400" />
        </Button>
      </div>
    </Card>
  );
}
