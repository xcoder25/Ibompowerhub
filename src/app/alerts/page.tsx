
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { alerts as initialAlerts } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

const statusColors: { [key: string]: string } = {
  New: 'bg-blue-100 text-blue-800 border-blue-300',
  Verified: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  'In Progress': 'bg-orange-100 text-orange-800 border-orange-300',
  Resolved: 'bg-green-100 text-green-800 border-green-300',
};

export default function AlertsPage() {
  const mapPreviewImage = PlaceHolderImages.find((img) => img.id === 'map-preview');
  const [alerts, setAlerts] = useState(initialAlerts);
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

  const handleUpvote = (alertId: number) => {
    setAlerts((prevAlerts) =>
      prevAlerts.map((alert) =>
        alert.id === alertId ? { ...alert, upvotes: alert.upvotes + 1 } : alert
      )
    );
  };

  const toggleComments = (alertId: number) => {
    setExpandedComments((prev) => ({ ...prev, [alertId]: !prev[alertId] }));
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Alerts</h1>
        <p className="text-muted-foreground">
          Live feed of reports from your community. Upvote to confirm.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {alerts.map((alert) => {
          const userAvatar = PlaceHolderImages.find((img) => img.id === alert.user.avatarId);
          const isExpanded = expandedComments[alert.id];
          return (
            <Card key={alert.id} glassy className="overflow-hidden">
              <CardHeader className="p-4">
                <div className="flex items-start gap-4">
                  {userAvatar && (
                    <Avatar>
                      <AvatarImage src={userAvatar.imageUrl} alt={alert.user.name} />
                      <AvatarFallback>{alert.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{alert.user.name}</p>
                      <p className="text-xs text-muted-foreground">{alert.time}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">in {alert.location}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 space-y-3">
                 <div className='flex items-center gap-2'>
                    <Badge variant="outline" className='border-2'>
                        <alert.Icon className={cn("mr-2 h-4 w-4", alert.iconColor)} />
                        {alert.type}
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
              {isExpanded && (
                <div className="p-4 border-t bg-muted/50">
                    <h4 className='text-sm font-semibold mb-3'>Comments</h4>
                    <div className='space-y-4'>
                        {alert.comments.map(comment => {
                             const commentUserAvatar = PlaceHolderImages.find((img) => img.id === comment.user.avatarId);
                             return (
                                <div key={comment.id} className='flex items-start gap-3'>
                                    {commentUserAvatar && (
                                        <Avatar className='size-8'>
                                            <AvatarImage src={commentUserAvatar.imageUrl} alt={comment.user.name} />
                                            <AvatarFallback>{comment.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <p className='font-semibold text-sm'>{comment.user.name}</p>
                                            <p className='text-xs text-muted-foreground'>{comment.time}</p>
                                        </div>
                                        <p className='text-sm'>{comment.text}</p>
                                    </div>
                                </div>
                             )
                        })}
                         <div className='flex items-center gap-2 pt-2'>
                            <Avatar className='size-8'>
                                <AvatarImage src={PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl} alt="You" />
                                <AvatarFallback>Y</AvatarFallback>
                            </Avatar>
                            <Input placeholder='Add a comment...' className='bg-background'/>
                            <Button size='sm'>Post</Button>
                        </div>
                    </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
