'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLoading } from '@/context/loading-context';

interface CreateTopicDialogProps {
    onCreateTopic: (topic: any) => void;
}

export function CreateTopicDialog({ onCreateTopic }: CreateTopicDialogProps) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();
    const { isLoading, showLoader } = useLoading();

    // Form state
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        showLoader(3000);

        const newTopic = {
            id: Date.now(), // Simple ID generation
            title,
            category,
            replies: 0,
            author: 'Current User', // Placeholder
            imageId: 'forum-discussion',
            content,
            createdAt: 'Just now',
            comments: []
        };

        onCreateTopic(newTopic);

        setOpen(false);

        // Reset form
        setTitle('');
        setCategory('');
        setContent('');

        toast({
            title: 'Topic Created',
            description: 'Your topic has been posted successfully.',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Start Topic
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Start a New Topic</DialogTitle>
                    <DialogDescription>
                        Share your thoughts or ask a question to the community.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="What's on your mind?"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select required onValueChange={setCategory} value={category}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Community">Community</SelectItem>
                                <SelectItem value="Food & Drink">Food & Drink</SelectItem>
                                <SelectItem value="Safety">Safety</SelectItem>
                                <SelectItem value="Marketplace">Marketplace</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Content</Label>
                        <Textarea
                            id="content"
                            placeholder="Elaborate on your topic..."
                            className="h-32"
                            required
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            Post Topic
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
