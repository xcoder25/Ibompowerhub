'use client';

import { useRouter } from 'next/navigation';
import { forumTopics } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Clock, ThumbsUp, MessageSquare, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface ForumTopicDetailsProps {
    id: number;
}

export function ForumTopicDetails({ id }: ForumTopicDetailsProps) {
    const router = useRouter();
    const topic = forumTopics.find((t) => t.id === id);

    if (!topic) {
        return (
            <div className="flex flex-col items-center justify-center h-96">
                <h2 className="text-2xl font-bold mb-4">Topic not found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const image = PlaceHolderImages.find((img) => img.id === topic.imageId);
    const authorAvatar = PlaceHolderImages.find((img) => img.id === `user-avatar-${(topic.author.length % 3) + 1}`);

    return (
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Forums
            </Button>

            <div className="mb-6">
                <Badge variant="outline" className="mb-3 text-primary border-primary/20 bg-primary/5">{topic.category}</Badge>
                <h1 className="font-headline text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">{topic.title}</h1>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b">
                    <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={authorAvatar?.imageUrl} alt={topic.author} />
                            <AvatarFallback>{topic.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{topic.author}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{topic.createdAt || 'Recently'}</span>
                    </div>
                    <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                    <div className="flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{topic.replies} replies</span>
                    </div>
                </div>

                {image && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-8 shadow-sm">
                        <Image src={image.imageUrl} alt={topic.title} fill className="object-cover" />
                    </div>
                )}

                <div className="prose prose-slate dark:prose-invert max-w-none mb-8">
                    <p className="text-lg leading-relaxed">{topic.content}</p>
                </div>

                <div className="flex items-center gap-3 mb-10">
                    <Button variant="outline" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Like
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Flag className="h-4 w-4" />
                        Report
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                <h3 className="font-headline text-2xl font-bold">Discussion ({topic.comments?.length || 0})</h3>

                {/* Comment Input */}
                <Card className="bg-muted/30 border-none">
                    <CardContent className="p-4">
                        <div className="flex gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>ME</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-4">
                                <Textarea placeholder="Join the discussion..." className="min-h-[100px] resize-none bg-background" />
                                <div className="flex justify-end">
                                    <Button>
                                        <Send className="mr-2 h-4 w-4" />
                                        Post Reply
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comments List */}
                <div className="space-y-6">
                    {topic.comments?.map((comment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{comment.author}</span>
                                        <span className="text-xs text-muted-foreground">{comment.time}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-foreground/80 leading-relaxed">{comment.text}</p>
                                <div className="flex items-center gap-4 pt-1">
                                    <button className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Reply</button>
                                    <button className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Like</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {(!topic.comments || topic.comments.length === 0) && (
                        <div className="text-center py-10 text-muted-foreground">
                            <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                            <p>No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
