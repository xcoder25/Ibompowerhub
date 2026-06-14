'use client';

import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Clock, ThumbsUp, ChevronRight } from 'lucide-react';
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

const categoryColors: Record<string, string> = {
  General: 'bg-slate-100 text-slate-700',
  Community: 'bg-purple-100 text-purple-700',
  Safety: 'bg-red-100 text-red-700',
  Marketplace: 'bg-emerald-100 text-emerald-700',
  Government: 'bg-blue-100 text-blue-700',
  'Food & Drink': 'bg-orange-100 text-orange-700',
};

export function ForumTopicCard({ topic }: ForumTopicCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const [localUpvotes, setLocalUpvotes] = useState(topic.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const timeAgo = topic.createdAt?.toDate
    ? formatDistanceToNow(topic.createdAt.toDate(), { addSuffix: true })
    : topic.createdAt || 'recently';

  const colorClass = categoryColors[topic.category] || 'bg-slate-100 text-slate-600';

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

  const initials = topic.author
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link href={`/forums/${topic.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md hover:border-purple-300/60 group cursor-pointer h-full border border-border/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
        <CardHeader className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Avatar className="h-9 w-9 border-2 border-purple-100 shrink-0 mt-0.5">
              <AvatarFallback className="text-[11px] font-black bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-[10px] font-bold uppercase tracking-wider border-0 px-2.5 py-0.5 ${colorClass}`}>
                  {topic.category}
                </Badge>
                <div className="flex items-center text-[10px] text-slate-400 font-medium gap-1 ml-auto">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </div>
              </div>
              <CardTitle className="font-headline text-base sm:text-lg leading-snug group-hover:text-purple-600 transition-colors line-clamp-2">
                {topic.title}
              </CardTitle>
              {topic.content && (
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                  {topic.content}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardFooter className="p-4 sm:p-5 pt-0 flex items-center justify-between text-sm border-t border-slate-100 dark:border-slate-800 mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all ${
                hasUpvoted
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-slate-100 text-slate-500 hover:bg-purple-50 hover:text-purple-600'
              }`}
            >
              <ThumbsUp className="h-3 w-3" />
              {localUpvotes}
            </button>
            <div className="flex items-center gap-1.5 text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full text-xs font-bold">
              <MessageSquare className="h-3.5 w-3.5" />
              {topic.replies}
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 font-medium group-hover:text-purple-500 transition-colors">
            <span>{topic.author}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
