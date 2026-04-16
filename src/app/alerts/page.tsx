'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Bell, MapPin, Clock, AlertTriangle, Shield, CloudRain, HeartPulse, ChevronRight, ArrowDownLeft, ArrowUpRight, Zap, Info, Loader2, FileText, Share2, Download, Printer, Copy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp, Timestamp, query, orderBy, limit } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Alert = {
  id: string; type: string; category: string; location: string;
  time: Timestamp; description: string; upvotes: number;
  commentsCount: number; userId: string; status: string;
  user: { name: string; avatarUrl: string };
};

type TransactionAlert = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Timestamp;
  status: string;
  reference?: string;
  senderName?: string;
  receiverName?: string;
};

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800 border-blue-200',
  Verified: 'bg-amber-100 text-amber-800 border-amber-200',
  'In Progress': 'bg-orange-100 text-orange-800 border-orange-200',
  Resolved: 'bg-green-100 text-green-800 border-green-200',
};

function alertTypeIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'emergency': return <AlertTriangle className="size-4 text-red-500" />;
    case 'weather': return <CloudRain className="size-4 text-blue-500" />;
    case 'health': return <HeartPulse className="size-4 text-emerald-500" />;
    case 'security': return <Shield className="size-4 text-amber-500" />;
    case 'transaction': return <Zap className="size-4 text-amber-600" />;
    default: return <Bell className="size-4 text-slate-400" />;
  }
}

function CommentSection({ alertId }: { alertId: string }) {
  const [newComment, setNewComment] = useState('');
  const firestore = useFirestore();
  const { user } = useUser();
  const commentsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'reports', alertId, 'comments'), orderBy('timestamp', 'asc')) : null,
    [firestore, alertId]
  );
  const { data: comments, isLoading } = useCollection<Comment>(commentsQuery);

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || !firestore) return;
    await addDoc(collection(firestore, 'reports', alertId, 'comments'), {
      text: newComment, userId: user.uid, timestamp: serverTimestamp(),
      user: { name: user.displayName, avatarUrl: user.photoURL }
    });
    await updateDoc(doc(firestore, 'reports', alertId), { commentsCount: increment(1) });
    setNewComment('');
  };

  return (
    <div className="border-t border-slate-100 bg-slate-50/50 p-5">
      <h4 className="text-sm font-black text-slate-700 mb-4">Comments</h4>
      <div className="space-y-3 mb-4">
        {isLoading && [0, 1].map(i => (
          <div key={i} className="flex gap-3"><Skeleton className="size-8 rounded-full flex-shrink-0" /><Skeleton className="flex-1 h-12 rounded-xl" /></div>
        ))}
        {comments?.map(c => (
          <div key={c.id} className="flex gap-3">
            <Avatar className="size-8 flex-shrink-0">
              <AvatarImage src={c.user.avatarUrl} /><AvatarFallback>{c.user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="bg-white border border-slate-100 rounded-2xl px-3 py-2 flex-1 shadow-sm">
              <p className="text-xs font-black text-slate-700">{c.user.name}</p>
              <p className="text-sm text-slate-600">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Avatar className="size-8 flex-shrink-0">
          <AvatarImage src={user?.photoURL ?? undefined} /><AvatarFallback>Y</AvatarFallback>
        </Avatar>
        <Input
          placeholder="Add a comment..." value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          className="rounded-xl border-slate-200 bg-white flex-1 text-sm focus-visible:ring-green-500"
        />
        <Button size="sm" onClick={handleAddComment} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold">Post</Button>
      </div>
    </div>
  );
}

function TransactionReceipt({ tx }: { tx: TransactionAlert }) {
  const isCredit = tx.type === 'credit';
  const date = tx.timestamp?.toDate() || new Date();
  
  return (
    <div className="p-6 bg-white rounded-3xl selection:bg-indigo-100">
      <div className="flex flex-col items-center text-center mb-8">
        <div className={cn(
          "size-20 rounded-[2.5rem] flex items-center justify-center mb-4 shadow-xl border-4 border-white",
          isCredit ? "bg-emerald-500 text-white shadow-emerald-200" : "bg-slate-900 text-white shadow-slate-200"
        )}>
          {isCredit ? <ArrowDownLeft size={36} /> : <ArrowUpRight size={36} />}
        </div>
        <h3 className="text-3xl font-black text-slate-900 leading-none">₦{tx.amount?.toLocaleString()}</h3>
        <p className={cn("text-[10px] font-black uppercase tracking-[0.2em] mt-2", isCredit ? "text-emerald-600" : "text-slate-400")}>
          Transaction {tx.status || 'Successful'}
        </p>
      </div>

      <div className="space-y-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Reference</span>
          <span className="text-slate-900 font-mono font-bold tracking-tighter">{tx.reference || `TXN-${tx.id.slice(0, 8).toUpperCase()}`}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Description</span>
          <span className="text-slate-900 font-bold text-right">{tx.description}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Date & Time</span>
          <span className="text-slate-900 font-bold">{date.toLocaleDateString()} · {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex justify-between items-center text-sm border-t border-slate-200 pt-4">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">{isCredit ? 'Sender' : 'Receiver'}</span>
          <span className="text-slate-900 font-bold">{isCredit ? (tx.senderName || 'External Source') : (tx.receiverName || 'Service Provider')}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        <Button variant="outline" className="rounded-2xl border-2 border-slate-100 hover:bg-slate-50 font-black uppercase tracking-widest text-[10px] h-12">
          <Share2 className="size-4 mr-2" /> Share
        </Button>
        <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-12 shadow-lg">
          <Download className="size-4 mr-2" /> Download
        </Button>
      </div>
      
      <p className="text-center text-[9px] text-slate-400 font-bold mt-6 uppercase tracking-widest">
        Official Receipt · Ibom PowerHub Financial Services
      </p>
    </div>
  );
}

export default function AlertsPage() {
  const mapPreviewImage = PlaceHolderImages.find(img => img.id === 'map-preview');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('community');
  const [selectedTx, setSelectedTx] = useState<TransactionAlert | null>(null);
  const firestore = useFirestore();
  const { user } = useUser();

  // Community Alerts
  const alertsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'reports'), orderBy('time', 'desc')) : null,
    [firestore]
  );
  const { data: communityAlerts, isLoading: isCommunityLoading } = useCollection<Alert>(alertsQuery);

  // Transaction Alerts
  const txQuery = useMemoFirebase(() =>
    (firestore && user) ? query(collection(firestore, 'wallets', user.uid, 'transactions'), orderBy('timestamp', 'desc'), limit(30)) : null,
    [firestore, user]
  );
  const { data: txAlerts, isLoading: isTxLoading } = useCollection<TransactionAlert>(txQuery);

  // Grouped transactions by month
  const groupedTx = useMemo(() => {
    if (!txAlerts) return [];
    const groups: Record<string, { month: string, year: string, txs: TransactionAlert[], totalIn: number, totalOut: number }> = {};
    
    txAlerts.forEach(tx => {
      const date = tx.timestamp?.toDate() || new Date();
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear().toString();
      const key = `${month}-${year}`;
      
      if (!groups[key]) {
        groups[key] = { month, year, txs: [], totalIn: 0, totalOut: 0 };
      }
      
      groups[key].txs.push(tx);
      if (tx.type === 'credit') groups[key].totalIn += tx.amount || 0;
      else groups[key].totalOut += tx.amount || 0;
    });
    
    return Object.values(groups);
  }, [txAlerts]);

  const handleUpvote = async (alertId: string) => {
    if (!user || !firestore) return;
    await updateDoc(doc(firestore, 'reports', alertId), { upvotes: increment(1) });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-orange-50/10 relative overflow-hidden pb-24">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-red-300/10 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-300/10 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full px-4 py-1.5 mb-4 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase tracking-widest shadow-sm">
            <Bell className="h-3.5 w-3.5 text-orange-500" />
            Alert Center
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                Your{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Alerts
                </span>
              </h1>
              <p className="text-slate-500 text-sm">Stay informed about your community and account activity.</p>
            </div>
            <Link href="/report">
              <Button size="sm" className="rounded-xl bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 gap-2 hidden sm:flex">
                <AlertTriangle className="size-4" /> Report Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs for Category Selection */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl p-1 mb-6 shadow-sm">
            <TabsTrigger value="community" className="rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Community
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Financial
            </TabsTrigger>
            <TabsTrigger value="system" className="rounded-xl font-bold text-xs uppercase tracking-wider data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              Updates
            </TabsTrigger>
          </TabsList>

          {/* COMMUNITY ALERTS CONTENT */}
          <TabsContent value="community" className="space-y-4 focus-visible:outline-none">
            {isCommunityLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white/80 border border-white rounded-3xl p-5 space-y-3 shadow-sm">
                  <div className="flex gap-3"><Skeleton className="size-11 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div>
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ))
            ) : communityAlerts?.length === 0 ? (
              <div className="bg-white/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                <div className="bg-slate-100 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="size-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-700">No community alerts</h3>
                <p className="text-slate-500 text-sm mt-1">Check back later for neighbor reports.</p>
              </div>
            ) : (
              communityAlerts?.map((alert) => (
                <div key={alert.id} className="bg-white/80 backdrop-blur-md border border-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      <Avatar className="size-10 flex-shrink-0 ring-2 ring-slate-100">
                        <AvatarImage src={alert.user?.avatarUrl} /><AvatarFallback>{alert.user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-slate-900 truncate">{alert.user?.name}</p>
                          <p className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
                            <Clock className="size-3" /> {alert.time ? new Date(alert.time.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                          </p>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mt-0.5 uppercase tracking-widest">
                          <MapPin className="size-2.5 text-orange-500" /> {alert.location}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
                        {alertTypeIcon(alert.type)} {alert.category || alert.type}
                      </span>
                      <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border shadow-sm", statusColors[alert.status] || 'bg-slate-50 text-slate-600 border-slate-200')}>
                        {alert.status}
                      </span>
                    </div>

                    <p className="text-slate-700 text-sm leading-relaxed mb-4">{alert.description}</p>

                    {mapPreviewImage && (
                      <div className="rounded-2xl overflow-hidden border border-slate-100 grayscale hover:grayscale-0 transition-all duration-500 opacity-60 hover:opacity-100">
                        <Image src={mapPreviewImage.imageUrl} alt="Map" width={600} height={120} className="object-cover w-full h-24" />
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center gap-3">
                    <Button variant="ghost" size="sm" onClick={() => handleUpvote(alert.id)} className="rounded-xl h-9 gap-2 text-slate-600 hover:bg-green-50 hover:text-green-700 font-bold">
                      <ThumbsUp className="size-4" /> {alert.upvotes || 0}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setExpandedComments(p => ({ ...p, [alert.id]: !p[alert.id] }))} className="rounded-xl h-9 gap-2 text-slate-600 hover:bg-orange-50 hover:text-orange-700 font-bold">
                      <MessageSquare className="size-4" /> {alert.commentsCount || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="rounded-xl h-9 gap-1 text-slate-400 hover:text-indigo-700 ml-auto text-[10px] font-black uppercase tracking-widest">
                      Detail <ChevronRight className="size-3" />
                    </Button>
                  </div>
                  {expandedComments[alert.id] && <CommentSection alertId={alert.id} />}
                </div>
              ))
            )}
          </TabsContent>

          {/* FINANCIAL ALERTS CONTENT */}
          <TabsContent value="transactions" className="space-y-10 focus-visible:outline-none pt-4">
            {isTxLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/80 border border-white rounded-3xl p-4 flex gap-4 items-center shadow-sm">
                  <Skeleton className="size-10 rounded-xl" />
                  <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))
            ) : groupedTx.length === 0 ? (
              <div className="bg-white/50 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                <div className="bg-slate-100 size-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="size-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-700">No transactions</h3>
                <p className="text-slate-500 text-sm mt-1">Your transactional history will appear here.</p>
              </div>
            ) : (
              groupedTx.map((group) => (
                <div key={`${group.month}-${group.year}`} className="space-y-4">
                  <div className="flex items-end justify-between px-2">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-none">{group.month}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{group.year}</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-0.5">Money In</p>
                        <p className="text-sm font-black text-emerald-600">₦{group.totalIn.toLocaleString()}</p>
                      </div>
                      <div className="text-right border-l border-slate-200 pl-4">
                        <p className="text-[9px] font-black uppercase tracking-widest text-rose-500 mb-0.5">Money Out</p>
                        <p className="text-sm font-black text-rose-600">₦{group.totalOut.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {group.txs.map((tx) => (
                      <Dialog key={tx.id}>
                        <DialogTrigger asChild>
                          <div className="bg-white/80 backdrop-blur-md border border-white rounded-[1.5rem] p-4 hover:bg-white transition-all shadow-sm cursor-pointer flex items-center gap-4 group">
                            <div className={cn(
                              "size-11 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105",
                              tx.type === 'credit' ? 'bg-green-50/50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-800 border-slate-200'
                            )}>
                              {tx.type === 'credit' ? <ArrowDownLeft className="size-5" /> : <ArrowUpRight className="size-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-slate-900 truncate text-[13px]">{tx.description}</p>
                              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest mt-0.5">
                                <Clock className="size-3" /> {tx.timestamp ? new Date(tx.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                <span>· {new Date(tx.timestamp.toDate()).toLocaleDateString([], { day: 'numeric', month: 'short' })}</span>
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={cn("font-black text-sm", tx.type === 'credit' ? 'text-green-600' : 'text-slate-900')}>
                                {tx.type === 'credit' ? '+' : '-'}₦{tx.amount?.toLocaleString()}
                              </p>
                              <FileText className="size-3 text-slate-300 ml-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-sm">
                          <DialogTitle className="sr-only">Transaction Receipt</DialogTitle>
                          <TransactionReceipt tx={tx} />
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          {/* SYSTEM UPDATES CONTENT */}
          <TabsContent value="system" className="space-y-4 focus-visible:outline-none">
            <div className="bg-white/80 border border-white rounded-3xl p-6 shadow-sm flex gap-4 items-start ring-1 ring-slate-100">
              <div className="size-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-sm border border-blue-100">
                <Info className="size-6" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-black text-slate-900">Service Update</h3>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-500 text-white shadow-sm">Official</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">Scheduled maintenance for Ibom Water pipes in Uyo North on Saturday. Expect low pressure between 10 AM and 4 PM.</p>
                <p className="text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-tighter">Ibom Infrastructure Center · 2h ago</p>
              </div>
            </div>
            <div className="bg-white/80 border border-white rounded-3xl p-6 shadow-sm flex gap-4 items-start">
              <div className="size-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-sm border border-purple-100">
                <Shield className="size-6" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-black text-slate-900">KYC Requirement</h3>
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-500 text-white shadow-sm">Security</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">Level 2 KYC is now required for transactions above ₦50,000. Complete your verification to avoid service disruption.</p>
                <div className="mt-4 flex gap-2">
                  <Link href="/kyc"><Button size="sm" className="h-8 rounded-lg bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-4">Verify Now</Button></Link>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

