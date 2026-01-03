
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Paperclip, PlusCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function ReportIssuePage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to report an issue.' });
            return;
        }

        const formData = new FormData(event.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            const reportsRef = collection(firestore, 'reports');
            await addDoc(reportsRef, {
                userId: user.uid,
                category: data.category,
                description: data.description,
                location: "Calabar, CRS", // This would be dynamic in a real app
                status: 'New',
                time: serverTimestamp(),
                upvotes: 0,
                commentsCount: 0,
                user: {
                    name: user.displayName,
                    avatarUrl: user.photoURL
                }
            });

            toast({
                title: "Report Submitted",
                description: "Thank you for helping improve our community!",
            });
            router.push('/alerts');
        } catch (error) {
            console.error("Error submitting report: ", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit report. Please try again.' });
        }
    }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
        <Card className="max-w-2xl mx-auto" glassy>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Report a New Issue</CardTitle>
                <CardDescription>
                    Help us improve our community by reporting issues. Your location will be automatically filled if permissions are granted.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select name="category" required>
                        <SelectTrigger id="category">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="power">Power Outage</SelectItem>
                            <SelectItem value="flood">Flooding</SelectItem>
                            <SelectItem value="waste">Waste Management</SelectItem>
                            <SelectItem value="transport">Transport Issue</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Provide a brief description of the issue"
                            className="min-h-28"
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="photo">Attach a Photo (Optional)</Label>
                        <Button asChild variant="outline" className='w-full cursor-pointer'>
                            <label htmlFor="photo-upload">
                                <Paperclip className="mr-2 h-4 w-4" /> Attach Photo
                            </label>
                        </Button>
                        <Input id="photo-upload" name="photo" type="file" className="sr-only" />
                    </div>
                    <Button type="submit" className="w-full">Submit Report</Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
