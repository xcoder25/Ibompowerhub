'use client';

import Image from 'next/image';
import { tourismSpots } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Camera, ChevronRight, Compass, Globe, Waves, Trees, ArrowRight, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const categories = ['All', 'Beach', 'Park', 'Cultural', 'Heritage', 'Waterfall'];

const highlights = [
  { icon: Waves, label: 'Coastal Beaches', value: '8+' },
  { icon: Trees, label: 'Nature Parks', value: '12+' },
  { icon: Globe, label: 'UNESCO Sites', value: '2' },
  { icon: Camera, label: 'Photo Spots', value: '50+' },
];

export default function TourismPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Hero Section */}
        <section className="relative h-[400px] sm:h-[500px] w-full rounded-3xl overflow-hidden group shadow-lg border border-white/10">
          <Image
            src="https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1500&auto=format&fit=crop"
            alt="Akwa Ibom Nature"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-[4000ms] opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 md:p-10 space-y-4 sm:space-y-6">
            <Badge className="w-fit bg-emerald-600/20 text-emerald-400 backdrop-blur-xl border border-emerald-500/30 px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest shadow-md">
              Virtual Expedition
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-none drop-shadow-xl">
              LAND OF <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent italic">PROMISE.</span>
            </h1>
            <p className="text-slate-300 text-base md:text-xl font-medium max-w-2xl leading-relaxed drop-shadow-md">
              Immerse yourself in breathtaking coastal beaches, lush tropical reserves, and rich cultural heritage.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button className="h-12 md:h-14 px-6 md:px-8 bg-white hover:bg-emerald-500 text-slate-950 hover:text-white rounded-xl font-bold text-base transition-all shadow-md hover:shadow-lg active:scale-95 group/btn">
                Begin Journey <ArrowRight className="ml-2 size-5 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
              <Button variant="ghost" className="h-12 md:h-14 px-6 text-white hover:bg-white/10 rounded-xl font-bold text-base backdrop-blur-xl transition-all">
                <PlayCircle className="mr-2 size-5" /> Watch Trailer
              </Button>
            </div>
          </div>
        </section>

        {/* Highlights Grid */}
        <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-5 sm:p-6 rounded-2xl flex items-center gap-4 border border-white/20 shadow-sm hover:-translate-y-1 transition-transform group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity bg-white/5 pointer-events-none">
                <Icon className="size-16" />
              </div>
              <div className="size-12 rounded-xl bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-12 transition-all group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900">
                <Icon className="size-6 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter leading-none mb-1">{value}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap bg-white/40 dark:bg-slate-900/40 p-2 rounded-xl border border-white/20 backdrop-blur-3xl w-fit mx-auto shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === cat
                ? 'bg-slate-950 dark:bg-emerald-500 text-white shadow-md scale-105'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Spot Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tourismSpots.map((spot) => {
            const image = PlaceHolderImages.find((img) => img.id === spot.imageId);
            return (
              <div
                key={spot.id}
                className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-[200px] md:h-[240px] w-full overflow-hidden p-1 pb-0">
                  <div className="relative h-full w-full rounded-t-xl overflow-hidden shadow-inner hidden md:block" /> {/* Dummy div for spacing if needed; actual image replaces this */}
                  <div className="relative h-full w-full rounded-t-xl overflow-hidden shadow-inner">
                    {image ? (
                      <Image
                        src={image.imageUrl}
                        alt={spot.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                      />
                    ) : (
                      <div className="h-full bg-slate-950 flex items-center justify-center">
                        <Trees className="size-12 text-white/10" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full px-2.5 py-1 shadow-md">
                      <Star className="size-3 text-amber-400 fill-amber-400" />
                      <span className="text-white text-[10px] font-bold">4.8</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col">
                  <h3 className="font-black text-2xl text-slate-950 dark:text-white tracking-tight leading-none mb-2 group-hover:text-emerald-500 transition-colors">{spot.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="size-3.5 text-emerald-500" />
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Akwa Ibom State</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium line-clamp-2 mb-6 flex-1">{spot.description}</p>

                  <Button className="w-full h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 font-bold uppercase tracking-widest text-xs transition-colors group/btn">
                    Explore Details
                    <ArrowRight className="size-4 ml-auto group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
