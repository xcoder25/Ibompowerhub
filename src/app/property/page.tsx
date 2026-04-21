'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { propertyListings } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  Building2, Search, SlidersHorizontal, MapPin, 
  BedDouble, Bath, Maximize, ChevronRight, Home, 
  TrendingUp, Key, Tag, Sparkles, Brain, 
  ShieldCheck, ArrowRight, Zap, Droplets
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const typeColors: Record<string, string> = {
  Rent: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  Sale: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'Short-let': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

export default function PropertyPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');

  const filtered = propertyListings.filter((l) => {
    const matchesSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType === 'All' || l.type === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-32 relative overflow-hidden">
      {/* Background Dynamics */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[1200px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-8 py-10 md:py-16 space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* ── Futuristic Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div className="space-y-5 max-w-3xl">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-sm">
                    <Building2 className="size-5 text-emerald-600" />
                 </div>
                 <Badge className="bg-emerald-600/10 text-emerald-600 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                   Property Ledger V2.4
                 </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tightest text-slate-950 dark:text-white leading-none">
                SHELTER<span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent italic">MATRIX</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed max-w-xl">
                 Verified real estate listings with integrated ARISE utility telemetry and AI-driven valuation.
              </p>
           </div>
           
           <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="relative group w-full md:w-80">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                 <input 
                    type="search" 
                    placeholder="Search Metropolis..." 
                    className="w-full pl-12 pr-4 h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                 />
              </div>
           </div>
        </div>

        {/* ── Category Filters ── */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
           {['All', 'Rent', 'Sale', 'Short-let'].map(type => (
             <button 
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  "px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap border shadow-sm",
                  activeType === type 
                    ? "bg-slate-950 text-white border-slate-950 shadow-xl scale-105" 
                    : "bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-white/5 hover:bg-slate-50"
                )}
             >
                {type}
             </button>
           ))}
        </div>

        {/* ── Listings Grid ── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => {
            const image = PlaceHolderImages.find(img => img.id === listing.imageId);
            const badgeClass = typeColors[listing.type] || 'bg-slate-100 text-slate-700 border-slate-200';
            
            return (
              <div
                key={listing.id}
                className="group relative bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.15)] transition-all duration-700 hover:-translate-y-4 flex flex-col"
              >
                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden p-2">
                   <div className="relative h-full w-full rounded-[2rem] overflow-hidden">
                      {image ? (
                        <Image
                          src={image.imageUrl} alt={listing.title} fill
                          className="object-cover transition-transform duration-[3000ms] group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full bg-slate-950 flex items-center justify-center">
                          <Building2 className="size-16 text-white/5" />
                        </div>
                      )}
                      
                      {/* Gradient Overlays */}
                      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      {/* Tags */}
                      <div className="absolute top-4 left-4 flex gap-2">
                         <Badge className={cn("border px-4 py-1.5 rounded-xl font-black uppercase text-[8px] tracking-widest shadow-2xl", badgeClass)}>
                            {listing.type}
                         </Badge>
                         <Badge className="bg-emerald-500/20 text-emerald-400 backdrop-blur-xl border border-emerald-500/30 px-3 py-1.5 rounded-xl font-black uppercase text-[8px] tracking-widest shadow-2xl flex items-center gap-2">
                            <Brain className="size-3" /> AI Fair-Val
                         </Badge>
                      </div>

                      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-white">
                         <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-emerald-400" />
                            <span className="font-black text-[10px] uppercase tracking-widest">Metropolitan Area</span>
                         </div>
                         <p className="font-black text-2xl tracking-tightest">{listing.price}</p>
                      </div>
                   </div>
                </div>

                <div className="p-8 flex-1 flex flex-col space-y-6">
                   <div className="space-y-2">
                      <h3 className="font-black text-2xl text-slate-950 dark:text-white tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">{listing.title}</h3>
                      <div className="flex gap-4">
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-white/5">
                            <Zap className="size-3 text-amber-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Power: Optimal</span>
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-white/5">
                            <Droplets className="size-3 text-blue-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">AQUA: Stable</span>
                         </div>
                      </div>
                   </div>

                   {listing.features && (
                      <div className="grid grid-cols-3 gap-3">
                         {[
                            { icon: BedDouble, label: 'Beds', val: listing.features.beds, color: 'text-emerald-500' },
                            { icon: Bath, label: 'Baths', val: listing.features.baths, color: 'text-orange-500' },
                            { icon: Maximize, label: 'Sqft', val: listing.features.area, color: 'text-blue-500' }
                         ].map(f => (
                            <div key={f.label} className="bg-slate-50/50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center gap-1">
                               <f.icon className={cn("size-4", f.color)} />
                               <span className="text-sm font-black text-slate-900 dark:text-white">{f.val}</span>
                               <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{f.label}</span>
                            </div>
                         ))}
                      </div>
                   )}

                   <div className="pt-4 border-t border-slate-100 dark:border-white/10 mt-auto">
                      <Button 
                         onClick={() => toast({ title: 'Viewing Scheduled', description: 'Agent proximity established.' })}
                         className="w-full h-16 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl hover:bg-emerald-600 active:scale-[0.98] group/btn"
                      >
                         Access Full Dossier <ArrowRight className="size-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
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

