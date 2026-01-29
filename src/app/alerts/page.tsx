
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, addDoc, doc, updateDoc, increment, serverTimestamp, Timestamp, query, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from '@/components/ui/skeleton';

type Alert = {
  id: string;
  type: string;
  category: string;
  location: string;
  time: Timestamp;
  description: string;
  upvotes: number;
  commentsCount: number;
  userId: string;
  status: string;
  user: {
    name: string;
    avatarUrl: string;
  }
};

type Comment = {
  id: string;
  text: string;
  userId: string;
  timestamp: Timestamp;
  user: {
    name: string;
    avatarUrl: string;
  }
}

const statusColors: { [key: string]: string } = {
  New: 'bg-blue-100 text-blue-800 border-blue-300',
  Verified: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'In Progress': 'bg-orange-100 text-orange-800 border-orange-300',
  Resolved: 'bg-green-100 text-green-800 border-green-300',
};

export default function AlertsPage() {
  const mapPreviewImage = PlaceHolderImages.find((img) => img.id === 'map-preview');
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const firestore = useFirestore();
  const { user } = useUser();

  const alertsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'reports'), orderBy('time', 'desc')) : null,
    [firestore]
  );
  const { data: alerts, isLoading: alertsLoading } = useCollection<Alert>(alertsQuery);

  const handleUpvote = async (alertId: string) => {
    if (!user || !firestore) return;
    const alertRef = doc(firestore, 'reports', alertId);
    await updateDoc(alertRef, {
      upvotes: increment(1)
    });
  };

  const toggleComments = (alertId: string) => {
    setExpandedComments((prev) => ({ ...prev, [alertId]: !prev[alertId] }));
  };

  function CommentSection({ alertId }: { alertId: string }) {
    const [newComment, setNewComment] = useState('');
    const firestore = useFirestore();
    const { user } = useUser();

    const commentsQuery = useMemoFirebase(() =>
      firestore ? query(collection(firestore, 'reports', alertId, 'comments'), orderBy('timestamp', 'asc')) : null,
      [firestore, alertId]
    );
    const { data: comments, isLoading: commentsLoading } = useCollection<Comment>(commentsQuery);

    const handleAddComment = async () => {
      if (!user || !newComment.trim() || !firestore) return;

      const commentsRef = collection(firestore, 'reports', alertId, 'comments');
      await addDoc(commentsRef, {
        text: newComment,
        userId: user.uid,
        timestamp: serverTimestamp(),
        user: {
          name: user.displayName,
          avatarUrl: user.photoURL
        }
      });

      const alertRef = doc(firestore, 'reports', alertId);
      await updateDoc(alertRef, {
        commentsCount: increment(1)
      });

      setNewComment('');
    }

    return (
      <div className="p-4 border-t bg-muted/50">
        <h4 className='text-sm font-semibold mb-3'>Comments</h4>
        <div className='space-y-4'>
          {commentsLoading && Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className='flex items-start gap-3'>
              <Skeleton className='size-8 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-4 w-48' />
              </div>
            </div>
          ))}
          {comments?.map(comment => {
            return (
              <div key={comment.id} className='flex items-start gap-3'>
                <Avatar className='size-8'>
                  <AvatarImage src={comment.user.avatarUrl} alt={comment.user.name} />
                  <AvatarFallback>{comment.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className='flex items-center gap-2'>
                    <p className='font-semibold text-sm'>{comment.user.name}</p>
                    <p className='text-xs text-muted-foreground'>{comment.timestamp ? new Date(comment.timestamp?.toDate()).toLocaleTimeString() : ''}</p>
                  </div>
                  <p className='text-sm'>{comment.text}</p>
                </div>
              </div>
            )
          })}
          <div className='flex flex-col sm:flex-row items-center gap-2 pt-2'>
            <div className='flex items-center gap-2 w-full'>
              <Avatar className='size-8'>
                <AvatarImage src={user?.photoURL ?? undefined} alt="You" />
                <AvatarFallback>Y</AvatarFallback>
              </Avatar>
              <Input
                placeholder='Add a comment...'
                className='bg-background flex-1'
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
            </div>
            <Button size='sm' className='w-full sm:w-auto' onClick={handleAddComment}>Post</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Alerts</h1>
        <p className="text-muted-foreground">
          Live feed of reports from your community. Upvote to confirm.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {alertsLoading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} glassy>
            <CardHeader className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className='size-12 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-5 w-32' />
                  <Skeleton className='h-4 w-24' />
                </div>
              </div>
            </CardHeader>
            <CardContent className='px-4 space-y-3'>
              <Skeleton className='h-5 w-4/5' />
              <Skeleton className='h-36 w-full rounded-lg' />
            </CardContent>
            <CardFooter className='p-4 flex justify-end gap-2 border-t'>
              <Skeleton className='h-9 w-20' />
              <Skeleton className='h-9 w-20' />
            </CardFooter>
          </Card>
        ))}
        {alerts?.map((alert) => {
          const isExpanded = expandedComments[alert.id];
          return (
            <Card key={alert.id} glassy className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start gap-4">
                  <Avatar className='size-12'>
                    <AvatarImage src={alert.user?.avatarUrl} alt={alert.user?.name} />
                    <AvatarFallback>{alert.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{alert.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{alert.time ? new Date(alert.time?.toDate()).toLocaleString() : ''}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">in {alert.location}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 space-y-3">
                <div className='flex items-center gap-2 flex-wrap'>
                  <Badge variant="outline" className='border-2'>
                    {alert.category}
                  </Badge>
                  <Badge className={cn('border', statusColors[alert.status])}>{alert.status}</Badge>
                </div>
                <p>{alert.description}</p>
                {mapPreviewImage && (
                  <div className="rounded-lg overflow-hidden border">
                    <Image
                      src={mapPreviewImage.imageUrl}
                      alt="Map preview"
                      width={600}
                      height={150}
                      className="object-cover w-full"
                      data-ai-hint={mapPreviewImage.imageHint}
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-4 flex justify-end gap-2 border-t">
                <Button variant="ghost" size="sm" onClick={() => handleUpvote(alert.id)}>
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  {alert.upvotes}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => toggleComments(alert.id)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  {alert.commentsCount}
                </Button>
              </CardFooter>
              {isExpanded && <CommentSection alertId={alert.id} />}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
