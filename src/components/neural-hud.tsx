'use client';

import { useState, useEffect } from 'react';
import { Brain, Zap, ShieldCheck, Activity, Wifi, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function NeuralHUD() {
  const [pulse, setPulse] = useState(84);
  const [grid, setGrid] = useState(96.2);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setPulse(p => Math.min(100, Math.max(70, p + (Math.random() * 2 - 1))));
      setGrid(g => Math.min(100, Math.max(90, g + (Math.random() * 0.4 - 0.2))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-8 left-8 z-[100] pointer-events-none group select-none hidden xl:block">
      {/* HUD Scanner Ring Effect */}
      <div className="relative">
         <div className="absolute -inset-10 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
         
         <div className="flex items-start gap-6 bg-slate-950/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 shadow-2xl skew-x-[-2deg]">
            {/* Main Sector */}
            <div className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="size-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center relative overflow-hidden">
                     <Brain className="size-8 text-blue-400 relative z-10" />
                     <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
                     {/* Scanning Line */}
                     <div className="absolute inset-x-0 h-1 bg-blue-500/50 blur-[2px] animate-scan-y top-0" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">Neural Sync</p>
                     <p className="text-2xl font-black text-white italic tracking-tighter">ORION<span className="text-blue-500 ml-1">v4.0</span></p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <HUDStat label="Pulse" value={`${pulse.toFixed(1)}%`} icon={Activity} color="text-rose-500" />
                  <HUDStat label="Grid" value={`${grid.toFixed(1)}Hz`} icon={Zap} color="text-amber-500" />
               </div>
            </div>

            {/* Vertical Separator */}
            <div className="w-[1px] h-32 bg-white/5 self-center" />

            {/* Right Sector */}
            <div className="space-y-6">
               <div className="flex gap-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className={cn("w-1 h-3 rounded-full", i < 4 ? "bg-blue-500/80" : "bg-white/10")} />
                  ))}
               </div>
               <div className="space-y-3">
                  <HUDMetric icon={ShieldCheck} label="Secuirty" value="DEEP-SCAN" color="text-blue-400" />
                  <HUDMetric icon={UserCheck} label="Trust" value="VERIFIED" color="text-emerald-400" />
               </div>
               
               <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-500">State Connection: Prime</span>
               </div>
            </div>
         </div>

         {/* Tech-Decoration */}
         <div className="absolute -top-2 -left-2 size-8 border-t-2 border-l-2 border-blue-500/30 rounded-tl-xl" />
         <div className="absolute -bottom-2 -right-2 size-8 border-b-2 border-r-2 border-blue-500/30 rounded-br-xl" />
      </div>
    </div>
  );
}

function HUDStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-1 min-w-[90px]">
      <div className="flex items-center justify-between">
         <Icon className={cn("size-3", color)} />
         <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest">{label}</p>
      </div>
      <p className="text-sm font-black text-white">{value}</p>
    </div>
  );
}

function HUDMetric({ icon: Icon, label, value, color }: any) {
  return (
    <div className="flex items-center gap-3">
       <div className={cn("size-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/5", color)}>
          <Icon className="size-3" />
       </div>
       <div>
          <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest leading-none mb-0.5">{label}</p>
          <p className={cn("text-[9px] font-black", color)}>{value}</p>
       </div>
    </div>
  );
}
