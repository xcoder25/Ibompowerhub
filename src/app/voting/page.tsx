'use client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { polls } from '@/lib/data';
import { 
  Vote, Sparkles, CheckCircle2, TrendingUp, BarChart, 
  ShieldCheck, Brain, Info, AlertCircle, Heart, 
  ArrowRight, Users, Loader2 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function VotingPage() {
  const { toast } = useToast();
  const [votedPolls, setVotedPolls] = useState<Record<number, string>>({});
  const [isCasting, setIsCasting] = useState<number | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<number | null>(null);

  const handleVote = (pollId: number, option: string) => {
    if (votedPolls[pollId]) return;
    
    setIsCasting(pollId);
    
    // Neural Verification Simulation
    setTimeout(() => {
      setVotedPolls(prev => ({ ...prev, [pollId]: option }));
      setIsCasting(null);
      if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
      toast({
        title: "Vote Authenticated",
        description: "Your selection has been hashed to the Arise Ledger.",
      });
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-32 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/[0.07] to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-8 py-10 md:py-16 space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* ── Dynamic Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm">
                  <Vote className="size-5 text-blue-500" />
               </div>
               <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                 Civic Ledger V1.0
               </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tightest text-slate-950 dark:text-white leading-none">
              SECURE<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent italic">VOTING</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed max-w-xl">
              Engage with digital democracy via the Ibom Neural Matrix. Every vote is encrypted, verified, and immutable.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-inner">
             <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="size-10 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 flex items-center justify-center overflow-hidden">
                     <Users className="size-5 text-slate-400" />
                  </div>
                ))}
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Participation</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">1,429 <span className="text-sm font-bold text-blue-500">RESIDENTS</span></p>
             </div>
          </div>
        </div>

        {/* ── Polls Matrix ── */}
        <div className="grid gap-12 lg:grid-cols-2">
          {polls.map((poll) => {
            const hasVoted = !!votedPolls[poll.id];
            const userVote = votedPolls[poll.id];
            const isAnalyzing = showAnalysis === poll.id;

            return (
              <Card key={poll.id} className="border-none shadow-2xl bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] group transition-all duration-500 hover:-translate-y-2 overflow-hidden relative border border-white/10 p-0">
                
                {/* Visual Accent */}
                <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
                   <div className="relative z-10 flex justify-between items-start">
                      <div className="space-y-2">
                         <div className="flex items-center gap-2">
                           <div className="size-2 rounded-full bg-blue-500 animate-pulse" />
                           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-400 italic">Proposition ACTIVE</p>
                         </div>
                         <h3 className="text-2xl sm:text-3xl font-black tracking-tightest leading-tight">{poll.title}</h3>
                      </div>
                      <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:rotate-12 transition-transform">
                         <BarChart className="size-6 text-blue-400" />
                      </div>
                   </div>
                   <div className="absolute top-0 right-0 p-32 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
                </div>

                <CardContent className="p-8 sm:p-10 space-y-8">
                   {/* AI Insight Bridge */}
                   <div className={cn("rounded-3xl border transition-all duration-500 overflow-hidden", isAnalyzing ? "bg-indigo-600 border-indigo-500 p-6 text-white" : "bg-slate-50 dark:bg-slate-950 p-4 border-slate-100 dark:border-slate-800")}>
                      <div className="flex items-center justify-between mb-2">
                         <div className="flex items-center gap-2">
                            <Brain className={cn("size-4", isAnalyzing ? "text-white" : "text-indigo-500")} />
                            <p className={cn("text-[10px] font-black uppercase tracking-widest", isAnalyzing ? "text-indigo-200" : "text-slate-400")}>Orion Analysis</p>
                         </div>
                         {!isAnalyzing && (
                            <Button onClick={() => setShowAnalysis(poll.id)} variant="ghost" className="h-6 text-[8px] font-black uppercase tracking-widest px-2 hover:bg-indigo-500/10">Show Prediction</Button>
                         )}
                      </div>
                      {isAnalyzing ? (
                         <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                            <p className="text-sm font-bold leading-relaxed mb-4 italic">
                               "Chairman, this policy could boost local infrastructure by 14%, but might require a temporary shift in Sector IV power cycles. Most of your neighbors in Shelter Afrique are tilting towards 'Yes'."
                            </p>
                            <Button onClick={() => setShowAnalysis(null)} className="h-8 rounded-xl bg-white/10 text-white font-bold text-[9px] uppercase tracking-widest border border-white/20">Minimize</Button>
                         </div>
                      ) : (
                         <div className="flex items-center gap-2">
                            <Info className="size-3 text-slate-300" />
                            <p className="text-[10px] font-medium text-slate-400">Connect to Orion for a high-fidelity impact forecast.</p>
                         </div>
                      )}
                   </div>

                   <div className="space-y-6">
                    {Object.entries(poll.votes).map(([option, count]) => {
                      const percentage = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;
                      return (
                        <div key={option} className="relative perspective-1000">
                          {hasVoted ? (
                            <div className={cn(
                              "p-6 rounded-3xl border-2 transition-all duration-700 backface-hidden",
                              userVote === option 
                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-[0_15px_30px_-5px_rgba(59,130,246,0.2)]" 
                                : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                            )}>
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-3">
                                   <div className={cn("size-6 rounded-full flex items-center justify-center", userVote === option ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400")}>
                                      {userVote === option ? <CheckCircle2 className="size-4" /> : <div className="size-2 rounded-full border border-current" />}
                                   </div>
                                   <span className={cn("font-black text-lg tracking-tight", userVote === option ? "text-blue-600 dark:text-blue-400" : "text-slate-950 dark:text-white")}>
                                     {option}
                                   </span>
                                </div>
                                <span className="font-black text-2xl text-slate-950 dark:text-white">{percentage}%</span>
                              </div>
                              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                                <div 
                                  className={cn("h-full rounded-full transition-all duration-[1.5s] ease-out-expo shadow-lg", userVote === option ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600")} 
                                  style={{ width: `${percentage}%` }} 
                                />
                              </div>
                            </div>
                          ) : (
                            <Button
                              disabled={isCasting !== null}
                              className="w-full h-18 sm:h-20 justify-between px-8 rounded-3xl bg-white dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-blue-600 hover:text-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 font-black text-lg sm:text-xl shadow-lg border border-slate-100 dark:border-slate-700 transition-all active:scale-[0.98] group/btn"
                              onClick={() => handleVote(poll.id, option)}
                            >
                              <span className="tracking-tight">{option}</span>
                              {isCasting === poll.id ? <Loader2 className="animate-spin size-6" /> : <div className="size-10 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-blue-600 transition-all"><ArrowRight className="size-5" /></div>}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                   </div>

                   <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                         <TrendingUp className="size-5 text-blue-500" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{poll.totalVotes} Verified Hashed Votes</p>
                      </div>
                      <div className="flex items-center gap-2">
                         <ShieldCheck className="size-4 text-emerald-500" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Encrypted End-to-End</span>
                      </div>
                   </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
