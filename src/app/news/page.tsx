'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Newspaper, Clock, Bell, Search, RefreshCw, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

type Article = {
  id: string;
  title: string;
  summary: string;
  category: string;
  date: any;
  imageUrl?: string;
  author?: string;
  readTime?: string;
};

const categoryColors: Record<string, string> = {
  Government: 'text-emerald-600 bg-emerald-500/10',
  Health: 'text-red-500 bg-red-500/10',
  Education: 'text-blue-500 bg-blue-500/10',
  Economy: 'text-orange-500 bg-orange-500/10',
  Sports: 'text-purple-500 bg-purple-500/10',
  Infrastructure: 'text-amber-600 bg-amber-500/10',
  Security: 'text-rose-600 bg-rose-500/10',
};

// Fallback images for categories
const FALLBACK_IMAGES: Record<string, string> = {
  Government: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop',
  Health: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop',
  Education: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop',
  Economy: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
  Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop',
  Infrastructure: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&auto=format&fit=crop',
  Security: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop',
};
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop';

export default function NewsPage() {
  const firestore = useFirestore();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (!firestore) return;

    const q = query(
      collection(firestore, 'news'),
      orderBy('date', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Article[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as Article);
      });
      setArticles(list);
      setLastUpdated(new Date());
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category).filter(Boolean)))];

  const filtered = articles.filter((a) => {
    const matchCat = activeCategory === 'All' || a.category === activeCategory;
    const matchSearch = !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const [featured, ...rest] = filtered;

  const getImage = (article: Article) =>
    article.imageUrl || FALLBACK_IMAGES[article.category] || DEFAULT_IMAGE;

  const formatDate = (date: any) => {
    if (!date) return 'Recently';
    try {
      const d = date?.toDate ? date.toDate() : new Date(date);
      return formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return String(date);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 relative z-10 animate-in fade-in duration-1000">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
                Information Network
              </Badge>
              {lastUpdated && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live — updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              GLOBAL<span className="bg-gradient-to-r from-blue-500 to-emerald-500 bg-clip-text text-transparent">FEED</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Real-time intelligence and official bulletins from Akwa Ibom State.
            </p>
          </div>
          <Button className="h-12 px-6 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-blue-600 hover:text-white font-bold uppercase tracking-widest text-xs shadow-md transition-all w-full md:w-auto gap-2">
            <Bell className="size-4" /> Subscribe
          </Button>
        </div>

        {/* Search */}
        <div className="relative px-0.5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-white/30 backdrop-blur-xl text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap bg-white/40 dark:bg-slate-900/40 p-2 md:p-3 rounded-2xl border border-white/20 backdrop-blur-3xl shadow-sm">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeCategory === cat
                  ? 'bg-slate-950 dark:bg-blue-500 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="w-full h-72 rounded-3xl" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3 bg-white/60 rounded-2xl p-4">
                  <Skeleton className="h-40 rounded-xl" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm">
            <Newspaper className="size-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-bold text-lg">
              {searchQuery ? 'No articles match your search' : 'No articles published yet'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {searchQuery ? 'Try a different keyword' : 'Check back soon for breaking news.'}
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featured && (
              <div className="group relative overflow-hidden rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 shadow-sm hover:shadow-lg transition-all duration-300 md:grid md:grid-cols-5 hover:-translate-y-1 p-2">
                <div className="absolute inset-y-2 left-2 w-[38%] overflow-hidden rounded-2xl shadow-inner hidden md:block">
                  <Image
                    src={getImage(featured)}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-[4000ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60" />
                </div>
                <div className="relative h-48 w-full overflow-hidden rounded-2xl shadow-inner md:hidden">
                  <Image
                    src={getImage(featured)}
                    alt={featured.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60" />
                </div>
                <div className="md:col-span-3 p-6 md:p-8 lg:p-10 flex flex-col justify-center relative col-start-3">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge className={`border-none ${categoryColors[featured.category] || 'text-slate-500 bg-slate-500/10'} font-bold text-[10px] uppercase tracking-widest px-3 py-1`}>
                      {featured.category}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="size-3 text-blue-500" /> {formatDate(featured.date)}
                    </span>
                    <Badge className="bg-orange-500/10 text-orange-500 border-none font-black px-2.5 py-1 rounded-full uppercase text-[9px] tracking-widest shadow-inner ml-auto">
                      Featured
                    </Badge>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white mb-4 leading-none tracking-tight group-hover:text-blue-500 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-3 mb-8">
                    {featured.summary}
                  </p>
                  <Button className="w-fit h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-slate-950 hover:text-white dark:hover:bg-blue-600 font-bold uppercase tracking-widest text-xs px-6 transition-colors group/btn">
                    Read Full Story <ArrowRight className="ml-2 size-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            )}

            {/* Article Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((article) => (
                <div
                  key={article.id}
                  className="group bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col p-1.5"
                >
                  <div className="relative h-48 rounded-t-xl overflow-hidden shadow-inner">
                    <Image
                      src={getImage(article)}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-[3000ms]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
                  </div>
                  <div className="p-5 pb-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className={`border-none ${categoryColors[article.category] || 'text-slate-500 bg-slate-500/10'} font-bold text-[9px] uppercase tracking-widest px-2.5 py-1`}>
                        {article.category}
                      </Badge>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5 ml-auto">
                        <Clock className="size-3" /> {formatDate(article.date)}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2 tracking-tight leading-tight group-hover:text-blue-500 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2 mb-6 flex-1">
                      {article.summary}
                    </p>
                    <Button variant="ghost" className="h-11 w-full rounded-xl font-bold uppercase tracking-widest text-xs bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-blue-500 hover:text-white transition-colors group/sub mt-auto">
                      Read Report <ArrowRight className="size-4 ml-2 group-hover/sub:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
