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
      <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-red-500/10 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-emerald-500/10 rounded-full blur-[200px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 md:p-12 space-y-16 relative z-10 animate-in fade-in duration-1000">

        {/* Hero Section - High-Impact Dispatch */}
        <section className="relative h-[550px] w-full rounded-[4rem] overflow-hidden group shadow-[0_80px_160px_-30px_rgba(0,0,0,0.3)]">
          <Image
            src="/safety_hero_high_tech_dispatch_1772465345096.png"
            alt="Guardian Response Control"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-[3000ms] opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-center p-12 md:p-24 space-y-6">
            <Badge className="w-fit bg-red-600 text-white border-none px-6 py-2 rounded-full font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-red-500/20">
              Live State Security Feed
            </Badge>
            <h1 className="text-6xl md:text-9xl font-black text-white tracking-tightest leading-none drop-shadow-2xl">
              GUARDIAN <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent italic">RESPONSE.</span>
            </h1>
            <p className="text-slate-300 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed drop-shadow-lg">
              Tactical coordination and rapid emergency stabilization across the ARISE ecosystem. Your safety is our primary objective.
            </p>
            <div className="flex gap-4 pt-4">
              <Button className="h-20 px-10 bg-red-600 hover:bg-red-700 text-white rounded-3xl font-black text-lg transition-all shadow-2xl shadow-red-600/30 active:scale-95 group/btn">
                Emergency Hotline <Phone className="ml-3 size-6 group-hover/btn:rotate-12 transition-transform" />
              </Button>
            </div>
          </div>
          <div className="absolute top-12 right-12 flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-red-600/20 backdrop-blur-3xl px-6 py-3 rounded-full border border-red-500/30">
              <span className="size-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Response Active</span>
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

        <div className="grid lg:grid-cols-3 gap-16 pt-8">
          {/* Active Situational Stream */}
          <div className="lg:col-span-2 space-y-12">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white flex items-center gap-4">
                <GanttChart className="size-10 text-red-600" /> Situational Stream
              </h2>
              <Button variant="ghost" className="font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-red-500 transition-colors">
                View Archive <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>

            <div className="grid gap-8">
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
          <div className="space-y-12">
            <h2 className="text-4xl font-black tracking-tighter px-6 text-slate-900 dark:text-white">Safety Intel</h2>
            <Card className="overflow-hidden border-none shadow-[0_80px_160px_-30px_rgba(0,0,0,0.3)] bg-slate-950 rounded-[4rem] relative group min-h-[550px] flex flex-col">
              <div className="absolute top-0 right-0 p-32 bg-orange-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1557597774-9d273605dfa9?q=80&w=800"
                  alt="Safety Intelligence"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-[2000ms] opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              </div>
              <CardHeader className="p-12 space-y-6">
                <Badge className="w-fit bg-red-600 text-white border-none px-5 py-2 font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-red-500/20">
                  Strategic Advisory
                </Badge>
                <CardTitle className="text-4xl text-white font-black leading-none group-hover:text-red-500 transition-colors tracking-tighter">Digital Perimeter Protection</CardTitle>
              </CardHeader>
              <CardContent className="px-12 pb-8 flex-grow">
                <p className="text-slate-400 leading-relaxed font-medium text-lg italic">
                  &quot;Deploy Multi-Factor Authentication on all financial interfaces. The State Command will
                  never request credentials via unverified channels. Vigilance is your first line of defense.&quot;
                </p>
              </CardContent>
              <CardFooter className="p-12 pt-0">
                <Button className="w-full h-18 bg-white hover:bg-red-600 text-slate-950 hover:text-white font-black text-lg rounded-2xl transition-all shadow-2xl active:scale-95 py-8">
                  Access Encyclopedia <ArrowRight className="ml-3 size-6" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Emergency Lifelines - Ultra Premium Grid */}
        <section className="space-y-12 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-6">
            <div className="space-y-3">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter">Emergency Lifelines</h2>
              <p className="text-slate-500 text-2xl font-medium max-w-3xl leading-relaxed">Single-origin access to elite state-wide response services. Tactical coordination at your fingertips.</p>
            </div>
            <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-black px-8 py-3 rounded-full uppercase tracking-[0.3em] text-[10px] shadow-2xl">
              Network: 100% Online
            </Badge>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {emergencyContacts.map((contact, idx) => (
              <Card key={contact.id} className="group border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_120px_-30px_rgba(220,38,38,0.2)] transition-all duration-700 rounded-[3.5rem] overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-3xl hover:-translate-y-4">
                <div className={`h-3 w-full ${idx === 0 ? 'bg-red-600' : idx === 1 ? 'bg-blue-600' : idx === 2 ? 'bg-slate-950' : 'bg-emerald-600'} opacity-30 group-hover:opacity-100 transition-opacity`} />
                <CardHeader className="p-12 space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-800 size-20 rounded-[2rem] flex items-center justify-center group-hover:bg-red-600 group-hover:text-white group-hover:rotate-12 transition-all duration-500 shadow-inner">
                    <Phone className="size-10" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Unit Designation</p>
                    <CardTitle className="text-3xl font-black tracking-tighter leading-none">{contact.name}</CardTitle>
                  </div>
                  <CardDescription className="text-5xl font-black font-mono tracking-tighter text-slate-950 dark:text-white pt-2 group-hover:text-red-600 transition-colors">
                    {contact.number}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-12 pt-0">
                  <Button asChild className="w-full h-20 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-red-600 hover:text-white rounded-3xl font-black text-xl transition-all shadow-xl active:scale-95 group/btn">
                    <a href={`tel:${contact.number}`}>
                      Initialize Call <ExternalLink className="ml-3 size-6 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
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
    <Card className="border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[3rem] hover:bg-slate-950 group transition-all duration-700 hover:-translate-y-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Sparkles className="size-32" />
      </div>
      <div className="flex items-center gap-8 relative z-10">
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 group-hover:bg-white/10 transition-all shadow-inner group-hover:scale-110 group-hover:-rotate-12">
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

function AlertCard({ title, desc, type, loc, time }: { title: string, desc: string, type: 'warning' | 'critical' | 'info', loc: string, time: string }) {
  const isCritical = type === 'critical';
  const isWarning = type === 'warning';

  return (
    <Card className={`border-none ${isCritical ? 'bg-red-500/5 shadow-red-500/10' : isWarning ? 'bg-orange-500/5 shadow-orange-500/10' : 'bg-slate-500/5'} backdrop-blur-3xl rounded-[3.5rem] p-12 transition-all hover:scale-[1.02] hover:shadow-2xl group border border-white/5`}>
      <div className="flex flex-col md:flex-row gap-10 md:items-center">
        <div className={`size-24 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl ${isCritical ? 'bg-red-600 text-white animate-pulse' : isWarning ? 'bg-orange-600 text-white' : 'bg-slate-950 text-white'} group-hover:scale-110 transition-transform`}>
          {isCritical ? <AlertTriangle className="size-12" /> : isWarning ? <Shield className="size-12" /> : <Activity className="size-12" />}
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            <Badge className={`${isCritical ? 'bg-red-600' : isWarning ? 'bg-orange-600' : 'bg-slate-950'} text-white border-none font-black text-[10px] uppercase tracking-[0.3em] px-5 py-2 rounded-xl shadow-xl`}>
              {type} Priority
            </Badge>
            <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest">
              <Clock className="size-4" /> {time}
            </div>
          </div>
          <h4 className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-red-500 transition-colors tracking-tighter leading-tight">{title}</h4>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed text-lg italic">{desc}</p>
          <div className="flex items-center gap-4 p-4 bg-white/40 dark:bg-slate-900/40 rounded-2xl w-fit border border-white/5">
            <MapPin className="size-6 text-red-600" />
            <span className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{loc}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="md:ml-auto rounded-3xl h-20 w-20 bg-slate-100 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-inner group-hover:rotate-45">
          <ChevronRight className="size-12 text-slate-400" />
        </Button>
      </div>
    </Card>
  );
}
