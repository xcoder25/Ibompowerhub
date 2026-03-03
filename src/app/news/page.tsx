'use client';

import { Button } from '@/components/ui/button';
import { newsArticles } from '@/lib/data';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Newspaper, Clock, Tag, ChevronRight, TrendingUp, Bell } from 'lucide-react';
import { useState } from 'react';

const categoryColors: Record<string, string> = {
  Government: 'bg-green-100 text-green-800 border-green-200',
  Health: 'bg-red-100 text-red-700 border-red-200',
  Education: 'bg-blue-100 text-blue-700 border-blue-200',
  Economy: 'bg-orange-100 text-orange-700 border-orange-200',
  Sports: 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(newsArticles.map((a) => a.category).filter(Boolean)))];
  const filtered = newsArticles.filter(
    (a) => activeCategory === 'All' || a.category === activeCategory
  );
  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-green-300/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/20 rounded-full px-4 py-1.5 mb-4 text-green-800 text-xs font-bold uppercase tracking-widest">
            <Newspaper className="h-3.5 w-3.5" />
            AKS News & Announcements
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
                Latest{' '}
                <span className="bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                  Updates
                </span>
              </h1>
              <p className="text-slate-500 text-lg">Official news, announcements, and happenings across Akwa Ibom State.</p>
            </div>
            <Button className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold gap-2 hidden md:flex">
              <Bell className="size-4" /> Subscribe
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                  ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                  : 'bg-white/70 text-slate-600 border border-white/80 hover:bg-white'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Article */}
        {featured && (() => {
          const image = PlaceHolderImages.find((img) => img.id === featured.imageId);
          const badgeClass = categoryColors[featured.category] || 'bg-slate-100 text-slate-700 border-slate-200';
          return (
            <div className="group relative overflow-hidden rounded-3xl bg-white/80 backdrop-blur-md border border-white/90 shadow-lg hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 mb-8 md:grid md:grid-cols-5">
              {image && (
                <div className="relative h-56 md:col-span-2 md:h-auto overflow-hidden">
                  <Image
                    src={image.imageUrl}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 hidden md:block" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden" />
                </div>
              )}
              <div className="md:col-span-3 p-7 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeClass}`}>
                    {featured.category}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="size-3" /> {featured.date}
                  </span>
                  <span className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">Featured</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3 leading-tight">{featured.title}</h2>
                <p className="text-slate-500 leading-relaxed line-clamp-3 mb-6">{featured.summary}</p>
                <Button className="w-fit rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-md gap-2">
                  Read Full Story <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          );
        })()}

        {/* Article Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((article) => {
            const image = PlaceHolderImages.find((img) => img.id === article.imageId);
            const badgeClass = categoryColors[article.category] || 'bg-slate-100 text-slate-700 border-slate-200';
            return (
              <div
                key={article.id}
                className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {image && (
                  <div className="relative h-44 overflow-hidden">
                    <Image
                      src={image.imageUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                      {article.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 ml-auto">
                      <Clock className="size-3" /> {article.date}
                    </span>
                  </div>
                  <h3 className="font-black text-slate-900 mb-2 line-clamp-2 leading-tight">{article.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 flex-1 mb-4">{article.summary}</p>
                  <Button size="sm" variant="outline" className="rounded-xl border-slate-200 hover:border-green-300 hover:text-green-700 font-bold gap-1 w-fit">
                    Read More <ChevronRight className="size-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Newspaper className="size-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No articles in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
