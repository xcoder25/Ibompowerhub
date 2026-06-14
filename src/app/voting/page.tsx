'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Vote, Sparkles, CheckCircle2, TrendingUp, BarChart, Loader2, Plus, Lock } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      toast({ title: '✅ Vote Recorded', description: `You voted for "${option}"` });
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
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-600/10 text-blue-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
                Civic Engagement
              </Badge>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Results
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              COMMUNITY<span className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">VOTING</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Shape the future of Akwa Ibom. One account, one vote — results update live for everyone.
            </p>
          </div>
          {isAdmin && (
            <Button
              onClick={() => setCreateOpen(true)}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-11 shadow-lg"
            >
              <Plus className="size-4" />
              Create Poll
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Active Polls', value: isLoading ? '...' : polls.filter(p => p.status === 'active').length.toString() },
            { label: 'Total Votes Cast', value: isLoading ? '...' : polls.reduce((a, p) => a + (p.totalVotes || 0), 0).toLocaleString() },
            { label: 'Your Votes', value: isLoading ? '...' : Object.keys(userVotes).length.toString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-2xl p-4 text-center border border-white/20">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Polls Grid */}
        {isLoading ? (
          <div className="grid gap-10 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/60 rounded-2xl p-8 space-y-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                {Array.from({ length: 3 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            ))}
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-20 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm col-span-full">
            <BarChart className="size-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-bold text-lg">No polls yet</p>
            <p className="text-slate-500 text-sm">Check back soon for civic polls.</p>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-2">
            {polls.map((poll) => {
              const hasVoted = !!userVotes[poll.id];
              const userVote = userVotes[poll.id];
              const isClosed = poll.status === 'closed';
              const isVoting = votingPollId === poll.id;

              return (
                <Card key={poll.id} className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-5 sm:p-8 rounded-2xl group transition-all duration-300 hover:-translate-y-1 overflow-hidden relative border border-white/20">
                  <div className="absolute top-0 right-0 p-6 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0 rounded-bl-full">
                    <BarChart className="size-16 sm:size-20" />
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={cn(
                          "border-none font-black px-3 py-1 uppercase text-[10px] tracking-widest",
                          isClosed ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"
                        )}>
                          {isClosed ? 'Closed' : 'Active Poll'}
                        </Badge>
                        {isClosed && <Lock className="size-3.5 text-slate-400" />}
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white mb-2 leading-tight">{poll.title}</h3>
                      {poll.description && (
                        <p className="text-sm text-slate-500 leading-relaxed">{poll.description}</p>
                      )}
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2 mt-2">
                        <TrendingUp className="size-4 text-blue-500" />
                        {poll.totalVotes.toLocaleString()} Total Votes
                      </p>
                    </div>

                    <div className="space-y-4 mt-auto">
                      {poll.options.map((option) => {
                        const count = poll.votes?.[option] || 0;
                        const percentage = poll.totalVotes > 0 ? Math.round((count / poll.totalVotes) * 100) : 0;
                        const isMyVote = userVote === option;

                        return (
                          <div key={option} className="relative">
                            {hasVoted || isClosed ? (
                              <div className={cn(
                                "p-4 rounded-2xl border-2 transition-all",
                                isMyVote ? 'border-blue-500 bg-blue-500/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                              )}>
                                <div className="flex justify-between items-center mb-2">
                                  <span className={cn("font-black tracking-tight flex items-center gap-2", isMyVote ? "text-blue-600" : "text-slate-800 dark:text-white")}>
                                    {option}
                                    {isMyVote && <CheckCircle2 className="size-4 text-blue-500" />}
                                  </span>
                                  <span className="font-black text-xl text-slate-400">{percentage}%</span>
                                </div>
                                <Progress value={percentage} className="h-2.5" />
                                <p className="text-xs text-slate-400 font-medium mt-1">{count.toLocaleString()} votes</p>
                              </div>
                            ) : (
                              <Button
                                className="w-full h-12 md:h-14 justify-between px-4 sm:px-6 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-blue-600 hover:text-white font-bold text-base shadow-sm border border-slate-100 dark:border-slate-700 transition-all active:scale-[0.98]"
                                onClick={() => handleVote(poll.id, option)}
                                disabled={isVoting}
                              >
                                <span>{option}</span>
                                {isVoting ? (
                                  <Loader2 className="size-5 opacity-50 animate-spin" />
                                ) : (
                                  <Vote className="size-5 opacity-50" />
                                )}
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {!hasVoted && !isClosed && (
                      <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
                        <Lock className="size-3" />
                        One vote per account — results are live
                      </p>
                    )}
                  </div>
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
                placeholder="Yes\nNo\nMaybe"
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
