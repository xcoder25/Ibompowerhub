'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { forumTopics } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { MessageSquare, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function ForumsPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">Community Forums</h1>
          <p className="text-muted-foreground">Discuss topics with your neighbors.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2" />
          Start Topic
        </Button>
      </div>

      <div className="grid gap-6">
        {forumTopics.map((topic) => {
          const image = PlaceHolderImages.find((img) => img.id === topic.imageId);
          const authorAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');
          return (
            <Card key={topic.id} glassy className="overflow-hidden">
                <CardHeader>
                    <div className='flex items-start justify-between gap-4'>
                        <div>
                             <Badge variant="secondary" className='mb-2'>{topic.category}</Badge>
                            <CardTitle className="font-headline text-xl">{topic.title}</CardTitle>
                        </div>
                        {image && (
                            <div className="relative h-20 w-28 hidden sm:block rounded-md overflow-hidden">
                            <Image src={image.imageUrl} alt={topic.title} fill className="object-cover" data-ai-hint={image.imageHint} />
                            </div>
                        )}
                    </div>
                </CardHeader>
              <CardFooter className='flex items-center justify-between'>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                     {authorAvatar && (
                        <Avatar className='size-6'>
                            <AvatarImage src={authorAvatar.imageUrl} alt={topic.author} />
                            <AvatarFallback>{topic.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                     )}
                    <span>{topic.author}</span>
                </div>
                <div className='text-sm flex items-center gap-2'>
                    <MessageSquare className='size-4 text-muted-foreground'/>
                    <span>{topic.replies} replies</span>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
