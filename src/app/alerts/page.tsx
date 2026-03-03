'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare, Bell, MapPin, Clock, AlertTriangle, Shield, CloudRain, HeartPulse, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp, Timestamp, query, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

type Alert = {
  id: string; type: string; category: string; location: string;
  time: Timestamp; description: string; upvotes: number;
  commentsCount: number; userId: string; status: string;
  user: { name: string; avatarUrl: string };
};
type Comment = {
  id: string; text: string; userId: string; timestamp: Timestamp;
  user: { name: string; avatarUrl: string };
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
            <div className="bg-white border border-slate-100 rounded-2xl px-3 py-2 flex-1">
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
          className="rounded-xl border-slate-200 bg-white flex-1 text-sm"
        />
        <Button size="sm" onClick={handleAddComment} className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold">Post</Button>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  const mapPreviewImage = PlaceHolderImages.find(img => img.id === 'map-preview');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const firestore = useFirestore();
  const { user } = useUser();

  const alertsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'reports'), orderBy('time', 'desc')) : null,
    [firestore]
  );
  const { data: alerts, isLoading } = useCollection<Alert>(alertsQuery);

  const handleUpvote = async (alertId: string) => {
    if (!user || !firestore) return;
    await updateDoc(doc(firestore, 'reports', alertId), { upvotes: increment(1) });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-red-300/15 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-green-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4 text-red-800 text-xs font-bold uppercase tracking-widest">
            <Bell className="h-3.5 w-3.5" />
            Live Community Alerts
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-2">
                Community{' '}
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                  Alerts
                </span>
              </h1>
              <p className="text-slate-500">Real-time reports from citizens across Akwa Ibom State. Upvote to confirm.</p>
            </div>
            <Link href="/report">
              <Button className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold shadow-md gap-2 hidden sm:flex">
                <Bell className="size-4" /> Report Issue
              </Button>
            </Link>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-5">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl p-5 space-y-3">
              <div className="flex gap-3"><Skeleton className="size-12 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></div></div>
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ))}

          {!isLoading && alerts?.length === 0 && (
            <div className="text-center py-20">
              <Bell className="size-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold">No alerts yet</p>
              <p className="text-slate-400 text-sm">Be the first to report an issue in your area.</p>
            </div>
          )}

          {alerts?.map((alert) => (
            <div key={alert.id} className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              {/* Card Header */}
              <div className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <Avatar className="size-11 flex-shrink-0">
                    <AvatarImage src={alert.user?.avatarUrl} /><AvatarFallback>{alert.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-slate-900 truncate">{alert.user?.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                        <Clock className="size-3" /> {alert.time ? new Date(alert.time.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-orange-500" /> {alert.location}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {alertTypeIcon(alert.type)} {alert.category || alert.type}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusColors[alert.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                    {alert.status}
                  </span>
                </div>

                <p className="text-slate-700 text-sm leading-relaxed">{alert.description}</p>

                {mapPreviewImage && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100">
                    <Image src={mapPreviewImage.imageUrl} alt="Map" width={600} height={150} className="object-cover w-full" />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-3">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => handleUpvote(alert.id)}
                  className="rounded-xl gap-2 text-slate-600 hover:bg-green-50 hover:text-green-700 font-bold"
                >
                  <ThumbsUp className="size-4" /> {alert.upvotes || 0}
                </Button>
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setExpandedComments(p => ({ ...p, [alert.id]: !p[alert.id] }))}
                  className="rounded-xl gap-2 text-slate-600 hover:bg-orange-50 hover:text-orange-700 font-bold"
                >
                  <MessageSquare className="size-4" /> {alert.commentsCount || 0}
                </Button>
                <Button variant="ghost" size="sm" className="rounded-xl gap-1 text-slate-400 hover:text-green-700 ml-auto text-xs font-bold">
                  View <ChevronRight className="size-3" />
                </Button>
              </div>

              {expandedComments[alert.id] && <CommentSection alertId={alert.id} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
