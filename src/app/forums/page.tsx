'use client';

import { useState, useEffect } from 'react';
import { CreateTopicDialog } from '@/components/forums/create-topic-dialog';
import { ForumTopicCard } from '@/components/forums/forum-topic-card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, Users, Sparkles, Plus, 
  Brain, ShieldCheck, TrendingUp, Info,
  Flame, Globe, ArrowRight, Star, Clock, Search, BadgeCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-32 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-purple-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-8 py-10 md:py-16 space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* ── Dynamic Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shadow-sm">
                  <Globe className="size-5 text-purple-600" />
               </div>
               <Badge className="bg-purple-600/10 text-purple-600 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                 Citizen Dialogue
               </Badge>
               <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                 <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                 Live Feed
               </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              COMMUNITY<span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent italic">FORUMS</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed max-w-xl">
              Hyper-local intel, community initiatives, and direct dialogue verified by the Arise Trust Protocol.
            </p>
          </div>
          
          <div className="flex-shrink-0">
             <CreateTopicDialog />
          </div>
        </div>

        {/* ── Stats Matrix ── */}
        <section className="grid gap-6 sm:grid-cols-3">
          <StatCard 
            label="Active Topics" 
            value={isLoading ? '...' : topics.length.toLocaleString()} 
            icon={<MessageSquare className="text-purple-500 size-6" />} 
            color="bg-purple-500/10" 
          />
          <StatCard 
            label="Live Participation" 
            value={isLoading ? '...' : totalReplies.toLocaleString()} 
            icon={<Users className="text-indigo-500 size-6" />} 
            color="bg-indigo-500/10" 
          />
          <StatCard 
            label="Trust Score" 
            value="98.2%" 
            icon={<ShieldCheck className="text-emerald-500 size-6" />} 
            color="bg-emerald-500/10" 
          />
        </section>

        {/* Search + Category Filters */}
        <div className="space-y-4">
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

        <div className="grid gap-10 lg:grid-cols-4">
           {/* Main Feed */}
           <div className="lg:col-span-3 space-y-8">
              <div className="flex items-center justify-between px-2">
                 <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <Flame className="size-6 text-orange-500" /> Discussion Board
                 </h2>
                 <div className="flex gap-2">
                    {['Latest', 'Hot', 'Verified'].map(t => (
                      <button key={t} className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800 hover:bg-slate-100 transition-colors">{t}</button>
                    ))}
                 </div>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
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
                <div className="grid gap-6 md:grid-cols-2">
                  {filtered.map((topic) => (
                    <div key={topic.id} className="relative group perspective-1000">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-[2rem] blur opacity-0 group-hover:opacity-20 transition duration-1000"></div>
                      <ForumTopicCard topic={topic} />
                    </div>
                  ))}
                </div>
              )}
           </div>

           {/* Sidebar Briefing */}
           <div className="space-y-8">
              <Card className="bg-slate-950 text-white border-none rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                 <div className="p-8 relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl group-hover:rotate-12 transition-transform">
                          <Brain className="size-6 text-purple-400" />
                       </div>
                       <Badge className="bg-purple-500/20 text-purple-400 border-none font-black uppercase text-[9px] px-3 py-1">Orion Curator</Badge>
                    </div>
                    <div className="space-y-4">
                       <p className="text-lg font-black italic leading-tight">"Boss, I've filtered out the noise. These topics have the highest community impact right now."</p>
                       <ul className="space-y-3">
                          {[
                            "Maintenance Cycle Update for OSG-4",
                            "Security Vigilante Schedule",
                            "Itam Market Traffic Solutions"
                          ].map((title, i) => (
                            <li key={i} className="flex items-start gap-2 group/item cursor-pointer">
                               <ArrowRight className="size-3 text-purple-500 mt-1 group-hover/item:translate-x-1 transition-transform" />
                               <span className="text-[11px] font-medium text-slate-400 group-hover/item:text-white transition-colors capitalize">{title}</span>
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
                 <div className="absolute bottom-[-10%] right-[-10%] size-48 bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />
              </Card>

              {/* Verified Voices */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-2">
                    <Star className="size-3 text-amber-500" /> Verified Voices
                 </p>
                 <div className="space-y-3">
                   {['Governor.eth', 'AKS_Admin', 'Dr. Udeme'].map(name => (
                      <div key={name} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-white/5">
                         <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-purple-500/10 flex items-center justify-center font-bold text-xs text-purple-600">
                              {name.charAt(0)}
                            </div>
                            <span className="text-xs font-black">{name}</span>
                         </div>
                         <BadgeCheck className="size-4 text-blue-500" />
                      </div>
                   ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl p-6 rounded-[2rem] flex items-center gap-6 border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-xl transition-all group">
      <div className={cn("size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:-rotate-12 transition-all", color)}>
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter leading-none mb-1">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
