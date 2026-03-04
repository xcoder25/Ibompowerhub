'use client';

import { powerSchedule } from '@/lib/data';
import { Power, Zap, ZapOff, AlertTriangle, CheckCircle2, Clock, MapPin, ChevronRight, BatteryFull, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PowerPage() {
  const onPercent = 42;
  const offPercent = 58;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Grid Diagnostics
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              POWER<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">SERVICES</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Real-time grid status telemetry, outage schedules, and load shedding forecasts for Akwa Ibom State.
            </p>
          </div>
        </div>

        {/* Live Status Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 border border-white/10 p-6 md:p-8 shadow-lg">
          <div className="absolute right-0 top-0 w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center backdrop-blur shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <Power className="size-8 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Sector 4, Group A</p>
                <div className="flex items-center">
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Grid 100% Online</h2>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest">
                    <CheckCircle2 className="size-3.5" /> Stability Confirmed
                  </span>
                  <span className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest">
                    <Clock className="size-3.5" /> Next Shedding: 4H 12M
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10">
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Telemetry Sync</p>
              <p className="text-white font-black text-2xl flex items-center gap-2 md:justify-end">
                <Activity className="size-5 text-emerald-500" /> Live
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Power ON */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 shadow-sm hover:-translate-y-1 transition-all group">
            <div className="flex items-start gap-4 mb-6">
              <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shadow-inner group-hover:bg-emerald-500/20 transition-colors">
                <BatteryFull className="size-6 text-emerald-500" />
              </div>
              <div>
                <p className="font-black text-slate-950 dark:text-white text-xl">Daily Up-time</p>
                <p className="text-[10px] tracking-widest uppercase font-bold text-slate-400">Continuous Delivery</p>
              </div>
            </div>
            <p className="text-4xl font-black text-slate-950 dark:text-white mb-3">10 <span className="text-2xl text-emerald-500 outline-text">hrs</span></p>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${onPercent}%` }}
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{onPercent}% Grid Saturation</p>
          </div>

          {/* Power OFF */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 shadow-sm hover:-translate-y-1 transition-all group">
            <div className="flex items-start gap-4 mb-6">
              <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center shadow-inner group-hover:bg-red-500/20 transition-colors">
                <ZapOff className="size-6 text-red-500" />
              </div>
              <div>
                <p className="font-black text-slate-950 dark:text-white text-xl">Load Shedding</p>
                <p className="text-[10px] tracking-widest uppercase font-bold text-slate-400">Maintenance Cycle</p>
              </div>
            </div>
            <p className="text-4xl font-black text-slate-950 dark:text-white mb-3">14 <span className="text-2xl text-red-500 outline-text">hrs</span></p>
            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${offPercent}%` }}
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{offPercent}% Down-time</p>
          </div>

          {/* Next Outage */}
          <div className="bg-orange-600 rounded-3xl p-6 shadow-md text-white relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-transparent" />
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <AlertTriangle className="size-24" />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-start gap-3 mb-auto">
                <div className="size-12 rounded-xl bg-black/10 flex items-center justify-center backdrop-blur">
                  <AlertTriangle className="size-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-xl">Scheduled Cut</p>
                  <p className="text-[10px] tracking-widest uppercase font-bold text-orange-200">System</p>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <p className="text-4xl font-black tracking-tighter">4:00<span className="text-xl font-bold ml-1 text-orange-200">PM</span></p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="bg-black/20 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <Clock className="size-3" /> 6 Hours
                  </span>
                  <span className="bg-black/20 font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">
                    Groups A, B, C
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Load Shedding Schedule */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 border-b border-white/10 dark:border-slate-800/50 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center shadow-inner">
              <Zap className="size-6 text-amber-500" />
            </div>
            <div>
              <h2 className="font-black text-2xl tracking-tight text-slate-950 dark:text-white">Distribution Schedule</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Load Shedding</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-white/10 dark:border-slate-800/50">
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Sector / Topology</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Sub-Group</th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-emerald-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> Energy Distributed</span>
                  </th>
                  <th className="text-left px-6 py-4 text-[10px] font-black text-red-500 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5"><ZapOff className="size-3.5" /> Supply Cut</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {powerSchedule.map((item, index) => (
                  <tr key={index} className="hover:bg-white/50 dark:hover:bg-slate-950/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                          <MapPin className="size-3.5" />
                        </div>
                        <span className="font-bold text-base text-slate-950 dark:text-white">{item.area}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white border-none font-bold text-[10px] uppercase tracking-widest px-3 py-1 shadow-inner">
                        Group {item.group}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-emerald-500 font-black flex items-center gap-2 text-base">
                        <Clock className="size-3.5 opacity-50" /> {item.in}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-red-500 font-black flex items-center gap-2 text-base">
                        <Clock className="size-3.5 opacity-50" /> {item.out}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
