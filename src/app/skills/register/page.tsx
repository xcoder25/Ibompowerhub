
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { artisanSkills, availabilityOptions } from '@/lib/skills';

const formSchema = z.object({
  skill: z.string({
    required_error: "Please select a skill.",
  }),
  hourlyRate: z.string().min(2, { message: 'Please enter a valid rate (e.g., ₦5000)'}),
  availability: z.string({
    required_error: "Please select your availability.",
  }),
  description: z.string().optional(),
});

export default function BecomeArtisanPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hourlyRate: '',
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }

    try {
      const artisanDocRef = doc(firestore, 'artisans', user.uid);
      const userDocRef = doc(firestore, 'users', user.uid);

      await setDoc(artisanDocRef, {
        ...values,
        id: user.uid,
        name: user.displayName,
        rating: 4.0, // Default rating
        distance: '0km', // This would be calculated dynamically
        imageId: `artisan-${Math.floor(Math.random() * 3) + 1}`, // Placeholder image
        coords: { latitude: 0, longitude: 0 } // Placeholder coords
      });

      await setDoc(userDocRef, {
          role: 'Artisan'
      }, { merge: true });

      toast({
        title: "Registration Complete!",
        description: "You are now listed as an artisan on SkillsHub.",
      });

      router.push('/profile');

    } catch (error) {
        console.error("Failed to create artisan profile:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create artisan profile.' });
    }
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-2xl mx-auto" glassy>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Become an Artisan</CardTitle>
                <CardDescription>Fill out your details to offer your services on SkillsHub.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="skill"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Primary Skill</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a skill" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {artisanSkills.map(skill => <SelectItem key={skill} value={skill}>{skill}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                         <FormField
                            control={form.control}
                            name="hourlyRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hourly Rate</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., ₦5000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       
                         <FormField
                            control={form.control}
                            name="availability"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Availability</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your status" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availabilityOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
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
                                    <FormLabel>Service Description (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Briefly describe the services you offer..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Button type="submit" className="w-full">
                            Complete Registration
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}

