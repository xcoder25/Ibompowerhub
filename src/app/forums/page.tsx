'use client';

import { useState, useEffect } from 'react';
import { CreateTopicDialog } from '@/components/forums/create-topic-dialog';
import { ForumTopicCard } from '@/components/forums/forum-topic-card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Sparkles, Flame, Clock, TrendingUp, Search } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

type ForumTopic = {
  id: string;
  title: string;
  category: string;
  content: string;
  author: string;
  authorId: string;
  replies: number;
  upvotes: number;
  imageId?: string;
  createdAt: any;
  lastActivity?: any;
};

const CATEGORIES = ['All', 'General', 'Community', 'Safety', 'Marketplace', 'Food & Drink', 'Government'];

export default function ForumsPage() {
  const firestore = useFirestore();
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalReplies, setTotalReplies] = useState(0);

  useEffect(() => {
    if (!firestore) return;

    const q = query(
      collection(firestore, 'forums'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const topicList: ForumTopic[] = [];
      let replySum = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        topicList.push({ id: doc.id, ...data } as ForumTopic);
        replySum += data.replies || 0;
      });
      setTopics(topicList);
      setTotalReplies(replySum);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const filtered = topics.filter((t) => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-10 relative z-10 animate-in fade-in duration-1000">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600/10 text-purple-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
                Digital Townhall
              </Badge>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              COMMUNITY<span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">FORUMS</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Engage in open discussions, share hyper-local news, and connect with fellow citizens.
            </p>
          </div>
          <div className="flex-shrink-0">
            <CreateTopicDialog />
          </div>
        </div>

        {/* Live Stats */}
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Active Topics"
            value={isLoading ? '...' : topics.length.toLocaleString()}
            icon={<MessageSquare className="text-purple-500 size-6" />}
            live
          />
          <StatCard
            label="Total Replies"
            value={isLoading ? '...' : totalReplies.toLocaleString()}
            icon={<Users className="text-indigo-500 size-6" />}
            live
          />
          <StatCard
            label="Ideas Sparked"
            value={isLoading ? '...' : `${(topics.length * 12).toLocaleString()}`}
            icon={<Sparkles className="text-amber-500 size-6" />}
          />
        </section>

        {/* Search + Category Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-11 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-white/30 backdrop-blur-xl"
            />
          </div>
          <div className="flex gap-2 flex-wrap bg-white/40 dark:bg-slate-900/40 p-2 rounded-2xl border border-white/20 backdrop-blur-3xl shadow-sm">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat
                    ? 'bg-slate-950 dark:bg-purple-600 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Grid */}
        {isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/60 dark:bg-slate-900/60 rounded-2xl p-5 space-y-3">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm">
            <MessageSquare className="size-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-bold text-lg">
              {searchQuery ? 'No topics match your search' : 'No topics yet'}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {searchQuery ? 'Try a different keyword' : 'Be the first to start a discussion!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {filtered.map((topic) => (
              <div key={topic.id} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <ForumTopicCard topic={topic} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, live }: { label: string; value: string; icon: React.ReactNode; live?: boolean }) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-white/20 shadow-sm hover:-translate-y-1 transition-transform">
      <div className="size-12 rounded-xl bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter">{value}</p>
          {live && (
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </div>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
