'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2 } from 'lucide-react';
import { sellerCategories } from '@/lib/market';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLoading } from '@/context/loading-context';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
});

const formSchema = z.object({
  businessName: z.string().min(2, {
    message: 'Business name must be at least 2 characters.',
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  priceRange: z.string().min(3, { message: 'e.g., ₦500 - ₦5000'}),
  products: z.array(productSchema).min(1, { message: 'Please add at least one product.' }),
  description: z.string().optional(),
});

export default function BecomeSellerPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const { isLoading, setIsLoading } = useLoading();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: '',
      products: [{ name: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsLoading(true);
    try {
      const sellerDocRef = doc(firestore, 'sellers', user.uid);
      const userDocRef = doc(firestore, 'users', user.uid);

      await setDoc(sellerDocRef, {
        ...values,
        id: user.uid,
        name: values.businessName,
        products: values.products.map(p => p.name),
        distance: '0km', // This would be calculated dynamically
        imageId: 'seller-new' // Placeholder image
      });

      await setDoc(userDocRef, {
          role: 'Seller'
      }, { merge: true });

      toast({
        title: "Congratulations!",
        description: "You are now a seller on AgroConnect Market.",
      });

      router.push('/profile');

    } catch (error) {
        console.error("Failed to create seller profile:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not create seller profile.' });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-2xl mx-auto" glassy>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Become a Seller</CardTitle>
                <CardDescription>Fill out your business details to start selling on AgroConnect Market.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="businessName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Business Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Grace's Fresh Produce" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {sellerCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="priceRange"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price Range</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., ₦1,000 - ₦10,000" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div>
                            <FormLabel>Products</FormLabel>
                            <FormDescription className="text-xs mb-2">List the items you have for sale.</FormDescription>
                            <div className='space-y-2'>
                                {fields.map((field, index) => (
                                    <div key={field.id} className='flex items-center gap-2'>
                                         <FormField
                                            control={form.control}
                                            name={`products.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem className='flex-1'>
                                                    <FormControl>
                                                        <Input placeholder={`Product ${index + 1}`} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                             <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => append({ name: "" })}
                                >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>
                        
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            Submit Application
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
