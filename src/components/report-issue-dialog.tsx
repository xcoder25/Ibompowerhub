'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Paperclip } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function ReportIssueDialog({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const { toast } = useToast();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // Here you would normally handle form submission to a backend
        // For now, we just show a toast and close the dialog
        toast({
            title: "Report Submitted",
            description: "Thank you for helping improve our community!",
        });
        setOpen(false);
    }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Report an Issue</DialogTitle>
          <DialogDescription>
            Help us improve our community by reporting issues. Your location will be automatically filled.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select required>
              <SelectTrigger id="category" className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="power">Power Outage</SelectItem>
                <SelectItem value="flood">Flooding</SelectItem>
                <SelectItem value="waste">Waste Management</SelectItem>
                <SelectItem value="illegal-dumping">Illegal Dumping</SelectItem>
                <SelectItem value="missed-pickup">Missed Waste Pickup</SelectItem>
                <SelectItem value="transport">Transport Issue</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Provide a brief description of the issue"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="photo" className="text-right">
              Photo
            </Label>
            <div className="col-span-3">
                <Button asChild variant="outline" className='w-full'>
                    <label htmlFor="photo-upload" className='cursor-pointer'>
                        <Paperclip className="mr-2 h-4 w-4" /> Attach Photo
                    </label>
                </Button>
                <Input id="photo-upload" type="file" className="sr-only" />
            </div>
          </div>
        <DialogFooter>
          <Button type="submit">Submit Report</Button>
        </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
