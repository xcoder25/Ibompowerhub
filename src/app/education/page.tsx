'use client';

import { Card, CardContent } from '@/components/ui/card';
import { educationalInstitutions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { 
  BookOpen, Search, GraduationCap, MapPin, 
  Users, Award, ChevronRight, Building2,
  Sparkles, Brain, ArrowRight, ShieldCheck,
  Zap, Globe
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function EducationPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = educationalInstitutions.filter((inst) => {
    const matchesSearch =
      !search ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.type?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' ||
      inst.type?.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-32 relative overflow-hidden">
      {/* Background Neural Matrix */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[1200px] h-[800px] bg-orange-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-8 py-10 md:py-16 space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* ── Dynamic Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
           <div className="space-y-5 max-w-3xl">
              <div className="flex items-center gap-3">
                 <div className="size-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-sm">
                    <GraduationCap className="size-5 text-orange-600" />
                 </div>
                 <Badge className="bg-orange-600/10 text-orange-600 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                   Knowledge Nexus V3
                 </Badge>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tightest text-slate-950 dark:text-white leading-none uppercase">
                LEARN<span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent italic">MATRIX</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed max-w-xl">
                 Verified educational infrastructure under the ARISE Agenda. Access schools, specialized colleges, and neural learning hubs.
              </p>
           </div>
           
           <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-inner">
              <div className="size-14 rounded-2xl bg-orange-500/10 flex items-center justify-center">
                 <Brain className="size-7 text-orange-600" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Arise Learning AI</p>
                 <p className="text-xl font-black text-slate-900 dark:text-white">ACTIVE</p>
              </div>
           </div>
        </div>

        {/* ── Search & Filter ── */}
        <div className="flex flex-col md:flex-row gap-6 items-center">
           <div className="relative group flex-1 w-full">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input 
                 type="search" 
                 placeholder="Search Institutions, Programs..." 
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-14 pr-6 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl font-black text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide whitespace-nowrap">
              {['All', 'University', 'Polytechnic', 'Secondary'].map(cat => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest transition-all",
                    activeCategory === cat 
                      ? "bg-slate-950 text-white shadow-xl scale-105" 
                      : "bg-white dark:bg-slate-900 text-slate-500 border border-slate-100 dark:border-white/5"
                  )}
                >
                  {cat}
                </button>
              ))}
           </div>
        </div>

        {/* ── Institution Grid ── */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inst) => {
            const image = PlaceHolderImages.find((img) => img.id === inst.imageId);
            return (
              <div
                key={inst.id}
                className="group relative bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3rem] overflow-hidden shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(245,158,11,0.15)] transition-all duration-700 hover:-translate-y-4 flex flex-col"
              >
                {/* Visual Header */}
                <div className="relative h-64 w-full overflow-hidden p-2">
                   <div className="relative h-full w-full rounded-[2.5rem] overflow-hidden">
                      {image ? (
                        <Image
                          src={image.imageUrl} alt={inst.name} fill
                          className="object-cover transition-transform duration-[4000ms] group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="h-full bg-slate-950 flex items-center justify-center">
                          <GraduationCap className="size-16 text-white/5" />
                        </div>
                      )}
                      
                      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      <div className="absolute top-5 left-5 flex gap-2">
                         <Badge className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-xl text-white font-black uppercase text-[8px] tracking-widest">
                            {inst.type || 'Institutional Node'}
                         </Badge>
                         <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-xl font-black uppercase text-[8px] tracking-widest flex items-center gap-2">
                           <ShieldCheck className="size-3" /> State SECURE
                         </Badge>
                      </div>

                      <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between text-white">
                         <div className="flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-orange-500" />
                            <span className="font-black text-[10px] uppercase tracking-widest">Akwa Ibom State</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-10 flex-1 flex flex-col space-y-8">
                   <h3 className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter leading-tight group-hover:text-orange-600 transition-colors uppercase italic">{inst.name}</h3>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10 mt-auto">
                      <div className="flex gap-4">
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Status</span>
                            <span className="text-xs font-black text-emerald-500">OPEN</span>
                         </div>
                      </div>
                      <Link href={`/education/${inst.id}`} className="block">
                         <Button className="h-14 rounded-2xl bg-slate-950 text-white font-black uppercase tracking-widest text-[9px] px-8 hover:bg-orange-600 shadow-xl active:scale-95 transition-all group/btn">
                            Access Portal <ArrowRight className="size-4 ml-3 group-hover/btn:translate-x-1 transition-transform" />
                         </Button>
                      </Link>
                   </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global CTS */}
        <div className="relative group overflow-hidden rounded-[3.5rem] bg-slate-950 p-12 md:p-20 text-white border border-white/5 shadow-2xl">
           <div className="absolute top-0 right-0 w-[800px] h-full bg-orange-600/10 rounded-full blur-[100px] translate-x-1/2 pointer-events-none" />
           <div className="relative z-10 space-y-10 max-w-2xl">
              <div className="size-20 rounded-[2rem] bg-orange-500/10 flex items-center justify-center border border-white/10">
                 <Award className="size-10 text-orange-500" />
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl md:text-6xl font-black tracking-tightest leading-none">ARISE<br/><span className="text-orange-500 italic">SCHOLARSHIPS</span></h2>
                 <p className="text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
                   Synchronize your Neural ID to access global bursary programs and specialized state funding.
                 </p>
              </div>
              <Button className="h-16 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest px-12 hover:bg-orange-500 hover:text-white transition-all shadow-2xl group flex items-center gap-4">
                 Open Scholarship Ledger <ArrowRight className="size-6 group-hover:translate-x-1 transition-transform" />
              </Button>
           </div>
        </div>
      </div>
    </main>
  );
}

}
