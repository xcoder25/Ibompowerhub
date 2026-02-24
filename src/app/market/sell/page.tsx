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
import { doc, setDoc, collection } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2 } from 'lucide-react';
import { sellerCategories } from '@/lib/market';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLoading } from '@/context/loading-context';

const productSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  price: z.number().min(1, { message: 'Price must be at least ₦1.' }),
  quantity: z.number().min(1, { message: 'Quantity must be at least 1.' }),
});

const formSchema = z.object({
  product: productSchema,
  category: z.string({
    required_error: "Please select a category.",
  }),
  images: z.array(z.string()).optional(),
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
      product: {
        name: '',
        description: '',
        price: 0,
        quantity: 1,
      },
      category: '',
      images: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    setIsLoading(true);
    try {
      const pendingProductRef = doc(collection(firestore, 'pending_products'));

      await setDoc(pendingProductRef, {
        ...values.product,
        category: values.category,
        images: values.images || [],
        sellerId: user.uid,
        sellerName: user.displayName || 'Unknown Seller',
        status: 'pending',
        submittedAt: new Date(),
      });

      toast({
        title: "Product Submitted!",
        description: "Your product has been submitted for approval. We'll review it soon.",
      });

      form.reset();
      router.push('/market');

    } catch (error) {
        console.error("Failed to submit product:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not submit product.' });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-2xl mx-auto" glassy>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Upload Product</CardTitle>
                <CardDescription>Submit your fresh produce for approval on AgroConnect Market.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="product.name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Fresh Tomatoes" {...field} />
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
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="product.price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (₦)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="1000" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="product.quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="10" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="product.description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe your product..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            Submit for Approval
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
}
