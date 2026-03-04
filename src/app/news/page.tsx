'use client';

import { Button } from '@/components/ui/button';
import { newsArticles } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Newspaper, Clock, TrendingUp, Bell } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const categoryColors: Record<string, string> = {
  Government: 'text-emerald-500 bg-emerald-500/10',
  Health: 'text-red-500 bg-red-500/10',
  Education: 'text-blue-500 bg-blue-500/10',
  Economy: 'text-orange-500 bg-orange-500/10',
  Sports: 'text-purple-500 bg-purple-500/10',
};

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(newsArticles.map((a) => a.category).filter(Boolean)))];
  const filtered = newsArticles.filter(
    (a) => activeCategory === 'All' || a.category === activeCategory
  );
  const [featured, ...rest] = filtered;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Information Network
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              GLOBAL<span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">FEED</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Real-time intelligence and official bulletins regarding Akwa Ibom State infrastructure and policies.
            </p>
          </div>
          <Button className="h-12 px-6 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white font-bold uppercase tracking-widest text-xs shadow-md active:scale-95 transition-all w-full md:w-auto">
            <Bell className="mr-2 size-4" /> Subscribe
          </Button>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap bg-white/40 dark:bg-slate-900/40 p-2 md:p-3 rounded-2xl border border-white/20 backdrop-blur-3xl shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeCategory === cat
                ? 'bg-slate-950 dark:bg-blue-500 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featured && (() => {
          const image = PlaceHolderImages.find((img) => img.id === featured.imageId);
          const badgeClass = categoryColors[featured.category] || 'text-slate-500 bg-slate-500/10';
          return (
            <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-300 md:grid md:grid-cols-5 hover:-translate-y-1 p-2">
              {image && (
                <div className="relative h-48 md:col-span-2 md:h-auto overflow-hidden rounded-2xl shadow-inner hidden md:block" />
              )}
              {image && (
                <div className="absolute inset-y-2 left-2 w-[38%] overflow-hidden rounded-2xl shadow-inner hidden md:block">
                  <Image
                    src={image.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-[4000ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60" />
                </div>
              )}
              {image && (
                <div className="relative h-48 w-full overflow-hidden rounded-2xl shadow-inner md:hidden">
                  <Image
                    src={image.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60" />
                </div>
              )}
              <div className="md:col-span-3 p-6 md:p-8 lg:p-10 flex flex-col justify-center relative col-start-3">
                <div className="absolute top-0 right-0 p-16 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
                  <Newspaper className="size-64" />
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className={`border-none ${badgeClass} font-bold text-[10px] uppercase tracking-widest px-3 py-1`}>
                    {featured.category}
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="size-3 text-blue-500" /> {featured.date}
                  </span>
                  <Badge className="bg-orange-500/10 text-orange-500 border-none font-black px-2.5 py-1 rounded-full uppercase text-[9px] tracking-widest shadow-inner ml-auto">
                    Priority Uplink
                  </Badge>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white mb-4 leading-none tracking-tight group-hover:text-blue-500 transition-colors">{featured.title}</h2>
                <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3 mb-8">{featured.summary}</p>
                <Button className="w-fit h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-slate-950 hover:text-white dark:hover:bg-blue-600 font-bold uppercase tracking-widest text-xs px-6 transition-colors group/btn">
                  Descrypt Dossier <ArrowRight className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Article Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => {
            const image = PlaceHolderImages.find((img) => img.id === article.imageId);
            const badgeClass = categoryColors[article.category] || 'text-slate-500 bg-slate-500/10';
            return (
              <div
                key={article.id}
                className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col p-1.5"
              >
                {image && (
                  <div className="relative h-48 rounded-t-xl overflow-hidden shadow-inner">
                    <Image
                      src={image.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  </div>
                )}
                <div className="p-5 pb-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <Badge className={`border-none ${badgeClass} font-bold text-[9px] uppercase tracking-widest px-2.5 py-1`}>
                      {article.category}
                    </Badge>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 ml-auto">
                      <Clock className="size-3" /> {article.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2 tracking-tight leading-tight group-hover:text-blue-500 transition-colors">{article.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mb-6 flex-1">{article.summary}</p>
                  <Button variant="ghost" className="h-11 w-full rounded-xl font-bold uppercase tracking-widest text-xs bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-blue-500 hover:text-white transition-colors group/sub mt-auto">
                    Read Report <ArrowRight className="size-4 ml-2 group-hover/sub:translate-x-1 transition-transform" />
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
