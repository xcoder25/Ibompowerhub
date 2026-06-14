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
import { PlusCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export function CreateTopicDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'forums'), {
        title,
        category,
        content,
        author: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        authorId: user.uid,
        authorEmail: user.email,
        replies: 0,
        upvotes: 0,
        imageId: 'forum-discussion',
        createdAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
      });

      setOpen(false);
      setTitle('');
      setCategory('');
      setContent('');

      toast({
        title: '✅ Topic Posted',
        description: 'Your topic is now live for the community.',
      });
    } catch (error: any) {
      console.error('Failed to post topic:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to post your topic. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold gap-2 rounded-xl h-11 shadow-lg shadow-purple-600/30">
          <PlusCircle className="h-4 w-4" />
          Start Topic
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Start a New Topic</DialogTitle>
          <DialogDescription>
            Share your thoughts or ask a question to the community. It&apos;s posted live instantly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-bold text-xs uppercase tracking-wider text-slate-500">Title</Label>
            <Input
              id="topic-title"
              placeholder="What's on your mind?"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>
          <div className="grid gap-2">
            <Label className="font-bold text-xs uppercase tracking-wider text-slate-500">Category</Label>
            <Select required onValueChange={setCategory} value={category}>
              <SelectTrigger className="h-11 rounded-xl" id="topic-category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Community">Community</SelectItem>
                <SelectItem value="Food & Drink">Food &amp; Drink</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Marketplace">Marketplace</SelectItem>
                <SelectItem value="Government">Government</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="topic-content" className="font-bold text-xs uppercase tracking-wider text-slate-500">Content</Label>
            <Textarea
              id="topic-content"
              placeholder="Elaborate on your topic..."
              className="h-32 rounded-xl resize-none"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title || !category || !content}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 font-bold gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</>
              ) : (
                'Post Topic'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
