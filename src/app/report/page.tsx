
'use client';

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
import { Paperclip, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const reportSchema = z.object({
    category: z.string({ required_error: 'Please select a category.' }),
    description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
});

export default function ReportIssuePage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof reportSchema>>({
        resolver: zodResolver(reportSchema),
    });

    const onSubmit = async (data: z.infer<typeof reportSchema>) => {
        if (!user || !firestore) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'You must be logged in to report an issue.' });
            return;
        }

        setIsLoading(true);

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
        } finally {
            setIsLoading(false);
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
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Category</Label>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} required>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Power">Power Outage</SelectItem>
                                            <SelectItem value="Flood">Flooding</SelectItem>
                                            <SelectItem value="Waste">Waste Management</SelectItem>
                                            <SelectItem value="Transport">Transport Issue</SelectItem>
                                            <SelectItem value="Other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <Label>Description</Label>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide a detailed description of the issue"
                                            className="min-h-28"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       
                        <div className="grid gap-2">
                            <Label htmlFor="photo">Attach a Photo (Optional)</Label>
                            <Button asChild variant="outline" className='w-full cursor-pointer'>
                                <label htmlFor="photo-upload">
                                    <Paperclip className="mr-2 h-4 w-4" /> Attach Photo
                                </label>
                            </Button>
                            <Input id="photo-upload" name="photo" type="file" className="sr-only" />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit Report
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
