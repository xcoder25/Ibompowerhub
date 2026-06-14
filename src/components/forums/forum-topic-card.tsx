'use client';

import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Clock, ShieldCheck, TrendingUp, Sparkles, ThumbsUp } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface ForumTopicCardProps {
  topic: {
    id: string;
    title: string;
    category: string;
    content?: string;
    replies: number;
    upvotes: number;
    author: string;
    authorId?: string;
    imageId?: string;
    createdAt?: any;
  };
}

export function ForumTopicCard({ topic }: ForumTopicCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [localUpvotes, setLocalUpvotes] = useState(topic.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!firestore || !user || hasUpvoted) return;

    setHasUpvoted(true);
    setLocalUpvotes((v) => v + 1);

    try {
      await updateDoc(doc(firestore, 'forums', topic.id), {
        upvotes: increment(1),
      });
    } catch {
      setHasUpvoted(false);
      setLocalUpvotes((v) => v - 1);
    }
  };

  const image = PlaceHolderImages.find((img) => img.id === topic.imageId);
  const avatarId = `user-avatar-${(topic.author.length % 3) + 1}`;
  const authorAvatar = PlaceHolderImages.find((img) => img.id === avatarId);
  const isOfficial = topic.author.includes('Admin') || topic.author.includes('Governor');

  const timeAgo = topic.createdAt?.toDate
    ? formatDistanceToNow(topic.createdAt.toDate(), { addSuffix: true })
    : topic.createdAt || 'recently';

  return (
    <Link href={`/forums/${topic.id}`}>
      <Card className="group relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(139,92,246,0.3)] hover:-translate-y-2 border-none bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] flex flex-col h-full shadow-lg border border-slate-100 dark:border-white/5">
        
        {/* Visual Header / Image */}
        <div className="relative h-48 w-full overflow-hidden p-2">
           <div className="relative h-full w-full rounded-[2rem] overflow-hidden">
              {image ? (
                <Image
                  src={image.imageUrl}
                  alt={topic.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                />
              ) : (
                <div className="h-full w-full bg-slate-950 flex items-center justify-center">
                   <MessageSquare className="size-12 text-white/5" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
              
              {isOfficial && (
                <div className="absolute top-4 left-4">
                   <Badge className="bg-blue-600 text-white border-none py-1.5 px-4 rounded-xl font-black uppercase text-[8px] tracking-[0.2em] shadow-2xl flex items-center gap-2">
                      <ShieldCheck className="size-3" /> State Intelligence
                   </Badge>
                </div>
              )}

              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-xl group-hover:bg-purple-600 transition-colors">
                 <TrendingUp className="size-4 text-white" />
              </div>
           </div>
        </div>

        <CardHeader className="p-8 space-y-4 flex-1">
            <div className="flex items-center gap-2">
               <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-purple-500/30 text-purple-600 py-1 px-3 rounded-lg">
                  {topic.category}
               </Badge>
               <div className="h-0.5 w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
            </div>
            
            <CardTitle className="font-black text-2xl tracking-tighter leading-tight group-hover:text-purple-600 transition-colors">
                {topic.title}
            </CardTitle>
            
            {topic.content && (
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                {topic.content}
              </p>
            )}
            
            {timeAgo && (
                <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Clock className="mr-2 h-3.5 w-3.5 text-purple-500" />
                    {timeAgo}
                </div>
            )}
        </CardHeader>

        <CardFooter className="p-8 pt-0 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="relative">
                   <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800 shadow-md">
                       <AvatarImage src={authorAvatar?.imageUrl} alt={topic.author} />
                       <AvatarFallback className="font-black text-xs">{topic.author.charAt(0)}</AvatarFallback>
                   </Avatar>
                   <div className="absolute -bottom-1 -right-1 size-4 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                </div>
                <div className="space-y-0.5">
                   <p className="font-black text-xs text-slate-950 dark:text-white">{topic.author}</p>
                   <p className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Resident</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
               <button
                 onClick={handleUpvote}
                 className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all ${
                   hasUpvoted
                     ? 'bg-purple-100 text-purple-700 border-purple-200'
                     : 'bg-slate-50 dark:bg-slate-900/20 text-slate-500 hover:bg-purple-50 hover:text-purple-600 border-slate-100 dark:border-slate-800'
                 }`}
               >
                 <ThumbsUp className="h-3 w-3" />
                 <span>{localUpvotes}</span>
               </button>
               <div className="flex items-center gap-1.5 text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-inner border border-purple-100 dark:border-purple-900/50">
                   <MessageSquare className="h-3.5 w-3.5" />
                   <span>{topic.replies} Replies</span>
               </div>
            </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
