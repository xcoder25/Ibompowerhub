'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Vote, Sparkles, CheckCircle2, TrendingUp, BarChart,
  ShieldCheck, Brain, Info, AlertCircle, Loader2, Plus, Lock
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser } from '@/firebase';
import {
  collection, query, orderBy, onSnapshot, doc,
  updateDoc, increment, setDoc, getDoc, serverTimestamp, addDoc
} from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin } from '@/hooks/use-admin';

type Poll = {
  id: string;
  title: string;
  description?: string;
  options: string[];
  votes: Record<string, number>;
  totalVotes: number;
  endsAt?: any;
  createdAt: any;
  createdBy?: string;
  status: 'active' | 'closed';
};

export default function VotingPage() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const isAdmin = useAdmin();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Map pollId -> option user voted for (fetched from their vote doc)
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);

  // Admin: Create Poll dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newPollTitle, setNewPollTitle] = useState('');
  const [newPollDesc, setNewPollDesc] = useState('');
  const [newPollOptions, setNewPollOptions] = useState('Option A\nOption B');
  const [isCreating, setIsCreating] = useState(false);

  // Load polls in real-time
  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'polls'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: Poll[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Poll));
      setPolls(list);
      setIsLoading(false);
    });
    return () => unsub();
  }, [firestore]);

  // Load this user's votes for all polls
  useEffect(() => {
    if (!firestore || !user || polls.length === 0) return;

    const fetchVotes = async () => {
      const votes: Record<string, string> = {};
      await Promise.all(
        polls.map(async (poll) => {
          const voteRef = doc(firestore, 'polls', poll.id, 'votes', user.uid);
          const voteSnap = await getDoc(voteRef);
          if (voteSnap.exists()) {
            votes[poll.id] = voteSnap.data().option as string;
          }
        })
      );
      setUserVotes(votes);
    };

    fetchVotes();
  }, [firestore, user, polls.length]);

  const handleVote = async (pollId: string, option: string) => {
    if (!firestore || !user) {
      toast({ variant: 'destructive', title: 'Sign in required', description: 'Please sign in to vote.' });
      return;
    }
    const poll = polls.find(p => p.id === pollId);
    if (poll?.status === 'closed') {
      toast({ variant: 'destructive', title: 'Poll Closed', description: 'This poll has ended.' });
      return;
    }
    if (userVotes[pollId]) return; // already voted
    if (votingPollId === pollId) return; // in-progress

    setVotingPollId(pollId);
    try {
      // Write the user's vote doc (one per user per poll — prevents double voting)
      const voteRef = doc(firestore, 'polls', pollId, 'votes', user.uid);
      const existing = await getDoc(voteRef);
      if (existing.exists()) {
        setUserVotes((v) => ({ ...v, [pollId]: existing.data().option }));
        return;
      }

      await setDoc(voteRef, {
        option,
        userId: user.uid,
        votedAt: serverTimestamp(),
      });

      // Increment vote count on the poll doc
      await updateDoc(doc(firestore, 'polls', pollId), {
        [`votes.${option}`]: increment(1),
        totalVotes: increment(1),
      });

      setUserVotes((v) => ({ ...v, [pollId]: option }));

      if (navigator.vibrate) {
        navigator.vibrate([10, 50, 10]);
      }

      toast({ title: '✅ Vote Recorded', description: `Your vote has been hashed to the Arise Ledger for "${option}"` });
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Vote Failed', description: err.message });
    } finally {
      setVotingPollId(null);
    }
  };

  const handleCreatePoll = async () => {
    if (!firestore || !user || isCreating) return;
    const options = newPollOptions.split('\n').map((o) => o.trim()).filter(Boolean);
    if (options.length < 2) {
      toast({ variant: 'destructive', title: 'Error', description: 'At least 2 options required.' });
      return;
    }

    setIsCreating(true);
    try {
      const votes: Record<string, number> = {};
      options.forEach((o) => { votes[o] = 0; });

      await addDoc(collection(firestore, 'polls'), {
        title: newPollTitle,
        description: newPollDesc,
        options,
        votes,
        totalVotes: 0,
        status: 'active',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      setCreateOpen(false);
      setNewPollTitle('');
      setNewPollDesc('');
      setNewPollOptions('Option A\nOption B');
      toast({ title: '✅ Poll Created', description: 'Your poll is now live.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-32 relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-blue-500/[0.07] to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-8 py-10 md:py-16 space-y-12 relative z-10 animate-in fade-in duration-1000">
        
        {/* ── Dynamic Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="size-10 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-sm">
                <Vote className="size-5 text-blue-500" />
              </div>
              <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                Civic Ledger V1.0
              </Badge>
              {!isLoading && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Results
                </span>
              )}
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tightest text-slate-950 dark:text-white leading-none">
              SECURE<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent italic">VOTING</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed max-w-xl">
              Engage with digital democracy via the Ibom Neural Matrix. Every vote is encrypted, verified, and immutable.
            </p>
          </div>
          
          <div className="flex items-center gap-6 bg-slate-50 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-inner">
             <div className="flex items-center gap-4">
                <div className="bg-blue-500/10 p-3 rounded-2xl">
                   <TrendingUp className="size-6 text-blue-600" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total System Votes</p>
                   <p className="text-xl font-black text-slate-900 dark:text-white">
                      {isLoading ? '...' : polls.reduce((a, p) => a + (p.totalVotes || 0), 0).toLocaleString()}
                   </p>
                </div>
             </div>
             {isAdmin && (
               <Button
                 onClick={() => setCreateOpen(true)}
                 className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl h-12 shadow-lg"
               >
                 <Plus className="size-4" />
                 Create Poll
               </Button>
             )}
          </div>
        </div>

        {/* Stats Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Polls', value: isLoading ? '...' : polls.filter(p => p.status === 'active').length.toString() },
            { label: 'Total Votes Hashed', value: isLoading ? '...' : polls.reduce((a, p) => a + (p.totalVotes || 0), 0).toLocaleString() },
            { label: 'Your Contributions', value: isLoading ? '...' : Object.keys(userVotes).length.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2rem] p-6 text-center border border-slate-100 dark:border-white/10 shadow-sm">
              <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Polls Matrix ── */}
        {isLoading ? (
          <div className="grid gap-12 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/60 dark:bg-slate-900/60 rounded-[2.5rem] p-8 space-y-4 border border-white/10 shadow-sm">
                <Skeleton className="h-24 w-full rounded-[1.5rem]" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-3xl" />
                <Skeleton className="h-16 w-full rounded-3xl" />
              </div>
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[2.5rem] border border-white/10 backdrop-blur-sm">
            <BarChart className="size-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-bold text-lg">No active propositions</p>
            <p className="text-slate-500 text-sm">Check back later for community voting events.</p>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-2">
            {polls.map((poll) => {
              const hasVoted = !!userVotes[poll.id];
              const userVote = userVotes[poll.id];
              const isClosed = poll.status === 'closed';
              const isVoting = votingPollId === poll.id;
              const isAnalyzing = showAnalysis === poll.id;

              return (
                <Card key={poll.id} className="border-none shadow-2xl bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] group transition-all duration-500 hover:-translate-y-2 overflow-hidden relative border border-slate-100 dark:border-white/10 p-0">
                  
                  {/* Visual Accent */}
                  <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
                     <div className="relative z-10 flex justify-between items-start">
                        <div className="space-y-2">
                           <div className="flex items-center gap-2">
                             <div className={cn("size-2 rounded-full animate-pulse", isClosed ? "bg-red-500" : "bg-blue-500")} />
                             <p className={cn("text-[9px] font-black uppercase tracking-[0.4em] italic", isClosed ? "text-red-400" : "text-blue-400")}>
                               {isClosed ? 'Proposition CLOSED' : 'Proposition ACTIVE'}
                             </p>
                           </div>
                           <h3 className="text-2xl sm:text-3xl font-black tracking-tightest leading-tight">{poll.title}</h3>
                           {poll.description && (
                             <p className="text-white/60 text-xs mt-1 font-medium leading-relaxed max-w-md">{poll.description}</p>
                           )}
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
                                 "Chairman, our dynamic forecast suggests this proposal boosts local commerce metrics by 14%. Current sentiment patterns indicate strong alignment among verified residents in Shelter Afrique."
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
                      {poll.options.map((option) => {
                        const count = poll.votes?.[option] || 0;
                        const percentage = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;
                        const isMyVote = userVote === option;

                        return (
                          <div key={option} className="relative perspective-1000">
                            {hasVoted || isClosed ? (
                              <div className={cn(
                                "p-6 rounded-3xl border-2 transition-all duration-700 backface-hidden",
                                isMyVote 
                                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-[0_15px_30px_-5px_rgba(59,130,246,0.2)]" 
                                  : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50"
                              )}>
                                <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-3">
                                     <div className={cn("size-6 rounded-full flex items-center justify-center", isMyVote ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400")}>
                                        {isMyVote ? <CheckCircle2 className="size-4" /> : <div className="size-2 rounded-full border border-current" />}
                                     </div>
                                     <span className={cn("font-black text-lg tracking-tight", isMyVote ? "text-blue-600 dark:text-blue-400" : "text-slate-950 dark:text-white")}>
                                       {option}
                                     </span>
                                  </div>
                                  <span className="font-black text-2xl text-slate-950 dark:text-white">{percentage}%</span>
                                </div>
                                <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                                  <div 
                                    className={cn("h-full rounded-full transition-all duration-[1.5s] ease-out-expo shadow-lg", isMyVote ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600")} 
                                    style={{ width: `${percentage}%` }} 
                                  />
                                </div>
                                <p className="text-xs text-slate-400 font-medium mt-2">{count.toLocaleString()} votes</p>
                              </div>
                            ) : (
                              <Button
                                disabled={isVoting}
                                className="w-full h-18 sm:h-20 justify-between px-8 rounded-3xl bg-white dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-blue-600 hover:text-white hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/20 font-black text-lg sm:text-xl shadow-lg border border-slate-100 dark:border-slate-700 transition-all active:scale-[0.98] group/btn"
                                onClick={() => handleVote(poll.id, option)}
                              >
                                <span className="tracking-tight">{option}</span>
                                {isVoting && votingPollId === poll.id ? (
                                  <Loader2 className="animate-spin size-6" />
                                ) : (
                                  <div className="size-10 rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center group-hover/btn:bg-white group-hover/btn:text-blue-600 transition-all">
                                    <ArrowRight className="size-5" />
                                  </div>
                                )}
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
        )}
      </div>

      {/* Admin: Create Poll Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">Create New Poll</DialogTitle>
            <DialogDescription>This poll will be live and visible to all citizens instantly.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Poll Question</Label>
              <Input
                placeholder="e.g. Should we expand the bike lane network?"
                value={newPollTitle}
                onChange={(e) => setNewPollTitle(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description (optional)</Label>
              <Textarea
                placeholder="Add context for voters..."
                value={newPollDesc}
                onChange={(e) => setNewPollDesc(e.target.value)}
                className="rounded-xl resize-none h-20"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Options (one per line)</Label>
              <Textarea
                placeholder="Yes&#10;No&#10;Maybe"
                value={newPollOptions}
                onChange={(e) => setNewPollOptions(e.target.value)}
                className="rounded-xl resize-none h-24 font-mono"
              />
              <p className="text-xs text-slate-400">Minimum 2 options required</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="rounded-xl">Cancel</Button>
            <Button
              onClick={handleCreatePoll}
              disabled={isCreating || !newPollTitle.trim()}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 font-bold gap-2"
            >
              {isCreating ? <><Loader2 className="size-4 animate-spin" /> Creating...</> : 'Launch Poll'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
