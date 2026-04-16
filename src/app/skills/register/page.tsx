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
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { artisanSkills, availabilityOptions } from '@/lib/skills';
import { useLoading } from '@/context/loading-context';
import { useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Image as ImageIcon, Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRef, useState } from 'react';

const formSchema = z.object({
  skill: z.string({
    required_error: "Please select a skill.",
  }),
  hourlyRate: z.string().min(2, { message: 'Please enter a valid rate (e.g., ₦5000)'}),
  availability: z.string({
    required_error: "Please select your availability.",
  }),
  description: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export default function BecomeArtisanPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const router = useRouter();
  const { isLoading, setIsLoading } = useLoading();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hourlyRate: '',
      description: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore || !storage) {
        toast({ variant: 'destructive', title: 'Error', description: 'System not ready. Please try again.' });
        return;
    }

    setIsLoading(true);
    let finalImageUrl = user.photoURL || '';

    try {
      // Step 0: Upload Image if selected
      if (imageFile) {
        setIsUploading(true);
        try {
          const storageRef = ref(storage, `artisans/${user.uid}/profile_${Date.now()}`);
          await uploadBytes(storageRef, imageFile);
          finalImageUrl = await getDownloadURL(storageRef);
        } catch (err) {
          console.error("Image upload failed:", err);
          toast({ title: "Upload Warning", description: "Could not upload image, using default profile picture." });
        } finally {
          setIsUploading(false);
        }
      }

      const artisanDocRef = doc(firestore, 'artisans', user.uid);
      const userDocRef = doc(firestore, 'users', user.uid);

      // Step 1: Create Artisan Record
      try {
        await setDoc(artisanDocRef, {
          ...values,
          id: user.uid,
          name: user.displayName,
          profileImageUrl: finalImageUrl,
          rating: 4.0,
          distance: '0km',
          imageId: `artisan-${Math.floor(Math.random() * 3) + 1}`,
          coords: { latitude: 0, longitude: 0 },
          createdAt: serverTimestamp()
        });
      } catch (err: any) {
        throw new Error(`Profile creation failed: ${err.message}`);
      }

      // Step 2: Update User Role
      try {
        await setDoc(userDocRef, {
            role: 'Artisan',
            profileImageUrl: finalImageUrl // Keep user profile in sync
        }, { merge: true });
      } catch (err: any) {
        throw new Error(`Account update failed: ${err.message}`);
      }

      toast({
        title: "Registration Complete!",
        description: "Your official artisan profile is now active.",
      });

      router.push('/skills/dashboard');

    } catch (error: any) {
        console.error("Artisan registration error:", error);
        toast({ 
          variant: 'destructive', 
          title: 'Registration Failed', 
          description: error.message || 'Check your internet connection and try again.' 
        });
    } finally {
        setIsLoading(false);
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
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <Avatar className="h-28 w-28 border-4 border-white dark:border-slate-800 shadow-xl relative">
                            <AvatarImage src={previewUrl || user?.photoURL || undefined} className="object-cover" />
                            <AvatarFallback className="bg-emerald-50 text-emerald-600 text-3xl font-bold">
                                {user?.displayName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <Button
                            type="button"
                            size="icon"
                            variant="secondary"
                            className="absolute -bottom-1 -right-1 size-10 rounded-full shadow-lg border-2 border-white dark:border-slate-800"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera className="size-5" />
                        </Button>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</p>
                        <p className="text-xs text-slate-500">Professional photos build trust</p>
                    </div>
                    <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                </div>

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
                        
                        <Button type="submit" className="w-full h-12 rounded-xl font-bold bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-emerald-600 hover:text-white transition-all shadow-lg text-lg uppercase tracking-wider" disabled={isLoading || isUploading}>
                            {isUploading ? (
                                <><Loader2 className="mr-3 size-5 animate-spin" /> Uploading Profile...</>
                            ) : isLoading ? (
                                <><Loader2 className="mr-3 size-5 animate-spin" /> Creating Profile...</>
                            ) : (
                                'Complete Registration'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
