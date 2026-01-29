'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { type artisans } from '@/lib/data';
import { useLoading } from '@/context/loading-context';
import { Phone } from 'lucide-react';

type Artisan = (typeof artisans)[number];

export function RequestQuoteDialog({ children, artisan }: { children: React.ReactNode, artisan: Artisan }) {
    const [open, setOpen] = useState(false);
    const { isLoading, setIsLoading } = useLoading();
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if(isLoading) return;
        setIsLoading(true);

        setTimeout(() => {
            toast({
                title: "Quote Request Sent",
                description: `Your request has been sent to ${artisan.name}.`,
            });
            setIsLoading(false);
            setOpen(false);
        }, 3000);
    }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Request a Quote</DialogTitle>
          <DialogDescription>
            Send a message to {artisan.name} ({artisan.skill}) to get a quote for your job.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Job Details
            </Label>
            <Textarea
              id="description"
              placeholder="Please describe the work you need done..."
              className="col-span-3 h-28"
              required
            />
          </div>
        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            Send Request
          </Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
