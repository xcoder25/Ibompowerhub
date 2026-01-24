'use client';

import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Clock } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ForumTopicCardProps {
    topic: {
        id: number;
        title: string;
        category: string;
        replies: number;
        author: string;
        imageId: string;
        createdAt?: string;
    };
}

export function ForumTopicCard({ topic }: ForumTopicCardProps) {
    const image = PlaceHolderImages.find((img) => img.id === topic.imageId);
    // Deterministic avatar based on author name length for variety
    const avatarId = `user-avatar-${(topic.author.length % 3) + 1}`;
    const authorAvatar = PlaceHolderImages.find((img) => img.id === avatarId);

    return (
        <Link href={`/forums/${topic.id}`}>
            <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50 group cursor-pointer h-full border border-border/60 bg-card/60 backdrop-blur-sm">
                <CardHeader className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                            <Badge variant="secondary" className="mb-1.5 transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                                {topic.category}
                            </Badge>
                            <CardTitle className="font-headline text-lg sm:text-xl leading-snug group-hover:text-primary transition-colors">
                                {topic.title}
                            </CardTitle>
                            {topic.createdAt && (
                                <div className="flex items-center text-xs text-muted-foreground pt-1">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {topic.createdAt}
                                </div>
                            )}
                        </div>
                        {image && (
                            <div className="relative h-20 w-24 sm:h-24 sm:w-32 hidden xs:block rounded-md overflow-hidden shrink-0 border border-border/50">
                                <Image
                                    src={image.imageUrl}
                                    alt={topic.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardFooter className="p-4 sm:p-5 pt-0 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground transition-colors">
                        <Avatar className="h-6 w-6 border border-border">
                            <AvatarImage src={authorAvatar?.imageUrl} alt={topic.author} />
                            <AvatarFallback className="text-[10px]">{topic.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs sm:text-sm">{topic.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full text-xs font-medium">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{topic.replies}</span>
                        <span className="hidden sm:inline">replies</span>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
