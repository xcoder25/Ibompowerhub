'use client';

import { Card, CardContent } from '@/components/ui/card';
import { healthFacilities } from '@/lib/data';
import { 
  HeartPulse, Phone, Clock, MapPin, 
  ChevronRight, Search, Star, Stethoscope, 
  Pill, Activity, Brain, ShieldPlus, 
  Zap, ArrowRight, Microchip
} from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const facilityTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hospital: HeartPulse,
  clinic: Stethoscope,
  pharmacy: Pill,
  default: Activity,
};

export default function HealthPage() {
  const [search, setSearch] = useState('');

  const filtered = healthFacilities.filter(
    (f) =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-32 relative overflow-hidden">
      {/* Background Micro-Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[1200px] h-[800px] bg-rose-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-8 py-10 md:py-16 space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* ── Futuristic Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div className="space-y-5 max-w-3xl">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 shadow-sm">
                    <HeartPulse className="size-5 text-rose-600" />
                 </div>
                 <Badge className="bg-rose-600/10 text-rose-600 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                   Bio-Digital Nexus V2.1
                 </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tightest text-slate-950 dark:text-white leading-none uppercase">
                HEALTH<span className="bg-gradient-to-r from-rose-500 to-red-500 bg-clip-text text-transparent italic">MATRIX</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed max-w-xl">
                 Real-time access to Akwa Ibom medical infrastructure. Verified by the State Health Ledger.
              </p>
           </div>
           
           <div className="flex-shrink-0 bg-slate-950 text-white p-6 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-4 w-full lg:w-72 relative group overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                 <Brain className="size-6 text-rose-400 group-hover:rotate-12 transition-transform" />
                 <Badge className="bg-rose-500/20 text-rose-400 border-none text-[8px] font-black uppercase tracking-widest">Orion Diagnostic</Badge>
              </div>
              <p className="text-xs font-bold leading-relaxed relative z-10 italic">"Boss, I've mapped 14 active clinics near your current node."</p>
              <div className="absolute -bottom-10 -right-10 size-32 bg-rose-500/10 blur-[40px] rounded-full pointer-events-none" />
           </div>
        </div>

        {/* ── Search & Telemetry ── */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
           <div className="relative group flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <input 
                 type="search" 
                 placeholder="Search medical facilities, specialists..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-14 pr-6 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl font-black text-sm focus:outline-none focus:ring-4 focus:ring-rose-500/10 transition-all"
              />
           </div>
        </div>

        {/* ── Facility Grid ── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 pt-4">
          {filtered.map((facility) => {
            const image = PlaceHolderImages.find((img) => img.id === facility.imageId);
            const typeKey = facility.type?.toLowerCase() || 'default';
            const TypeIcon = facilityTypeIcons[typeKey] || facilityTypeIcons.default;

            return (
              <div
                key={facility.id}
                className="group relative bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(244,63,94,0.15)] transition-all duration-700 hover:-translate-y-4 flex flex-col"
              >
                {/* Visual Header */}
                <div className="relative h-64 w-full overflow-hidden p-2">
                   <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden">
                      {image ? (
                        <Image
                          src={image.imageUrl} alt={facility.name} fill
                          className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full bg-slate-950 flex items-center justify-center">
                          <HeartPulse className="size-16 text-white/5" />
                        </div>
                      )}
                      
                      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute top-5 left-5">
                         <Badge className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl text-white font-black uppercase text-[8px] tracking-widest flex items-center gap-2">
                            <TypeIcon className="size-3 text-rose-400" /> {facility.type || 'Facility'}
                         </Badge>
                      </div>
                   </div>
                </div>

                <div className="p-10 flex-1 flex flex-col space-y-8">
                   <div className="space-y-4">
                      <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter leading-tight group-hover:text-rose-600 transition-colors uppercase italic">{facility.name}</h3>
                      
                      <div className="grid gap-3">
                         <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5">
                            <Clock className="size-4 text-rose-500" />
                            <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{facility.hours}</p>
                         </div>
                         <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5">
                            <MapPin className="size-4 text-rose-500" />
                            <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Node: Akwa Ibom State</p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-4 border-t border-slate-100 dark:border-white/10 mt-auto">
                      <a href={`tel:${facility.phone}`} className="block">
                         <Button className="w-full h-16 rounded-[1.5rem] bg-slate-950 text-white font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 shadow-2xl transition-all group/btn group-hover:shadow-rose-500/20 active:scale-95">
                            <Phone className="size-4 mr-3" /> Initialize Comms <ArrowRight className="size-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                         </Button>
                      </a>
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
