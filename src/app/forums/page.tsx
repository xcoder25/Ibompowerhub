'use client';

import { useState } from 'react';
import { forumTopics } from '@/lib/data';
import { CreateTopicDialog } from '@/components/forums/create-topic-dialog';
import { ForumTopicCard } from '@/components/forums/forum-topic-card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Sparkles, Plus } from 'lucide-react';

export default function ForumsPage() {
  const [topics, setTopics] = useState(forumTopics);

  const handleCreateTopic = (newTopic: any) => {
    setTopics((prev) => [newTopic, ...prev]);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-purple-600/10 text-purple-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Digital Townhall
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              COMMUNITY<span className="bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">FORUMS</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Engage in open discussions, share hyper-local news, and connect with fellow citizens.
            </p>
          </div>
          <div className="flex-shrink-0">
            <CreateTopicDialog onCreateTopic={handleCreateTopic} />
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Active Topics" value="1,248" icon={<MessageSquare className="text-purple-500 size-6" />} />
          <StatCard label="Online Citizens" value="5,492" icon={<Users className="text-indigo-500 size-6" />} />
          <StatCard label="Ideas Sparked" value="28.4k" icon={<Sparkles className="text-amber-500 size-6" />} />
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {topics.map((topic) => (
            <div key={topic.id} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <ForumTopicCard topic={topic} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-white/20 shadow-sm hover:-translate-y-1 transition-transform">
      <div className="size-12 rounded-xl bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter">{value}</p>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
