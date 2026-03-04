'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { polls } from '@/lib/data';
import { Vote, Sparkles, CheckCircle2, TrendingUp, BarChart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function VotingPage() {
  const [votedPolls, setVotedPolls] = useState<Record<number, string>>({});

  const handleVote = (pollId: number, option: string) => {
    if (votedPolls[pollId]) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: option }));
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Civic Engagement
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              COMMUNITY<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">VOTING</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Shape the future of Akwa Ibom. Participate in localized polls and institutional decision-making.
            </p>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {polls.map((poll) => {
            const hasVoted = !!votedPolls[poll.id];
            const userVote = votedPolls[poll.id];

            return (
              <Card key={poll.id} className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-5 sm:p-8 rounded-2xl group transition-all duration-300 hover:-translate-y-1 overflow-hidden relative border border-white/20">
                <div className="absolute top-0 right-0 p-6 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0 rounded-bl-full">
                  <BarChart className="size-16 sm:size-20" />
                </div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="mb-8">
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest mb-4">
                      Active Poll
                    </Badge>
                    <h3 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white mb-2 leading-none">{poll.title}</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                      <TrendingUp className="size-4 text-blue-500" /> {poll.totalVotes} Total Votes
                    </p>
                  </div>

                  <div className="space-y-5 mt-auto">
                    {Object.entries(poll.votes).map(([option, count]) => {
                      const percentage = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={option} className="relative">
                          {hasVoted ? (
                            <div className={`p-4 rounded-2xl border-2 transition-all ${userVote === option ? 'border-blue-500 bg-blue-500/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}>
                              <div className="flex justify-between items-center mb-3">
                                <span className={cn("font-black tracking-tight", userVote === option ? "text-blue-500" : "text-slate-950 dark:text-white")}>
                                  {option} {userVote === option && <CheckCircle2 className="inline ml-2 size-4 text-blue-500" />}
                                </span>
                                <span className="font-black text-xl text-slate-400">{percentage}%</span>
                              </div>
                              <Progress value={percentage} className="h-3" />
                            </div>
                          ) : (
                            <Button
                              className="w-full h-12 md:h-14 justify-between px-4 sm:px-6 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-blue-600 hover:text-white font-bold text-base sm:text-lg shadow-sm border border-slate-100 dark:border-slate-700 transition-all active:scale-[0.98]"
                              onClick={() => handleVote(poll.id, option)}
                            >
                              <span>{option}</span>
                              <Vote className="size-5 opacity-50" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
