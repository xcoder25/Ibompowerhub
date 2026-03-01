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
                sellerName: user.displayName || 'Ibom Merchant',
                status: 'pending',
                submittedAt: new Date(),
            });

            toast({
                title: "Application Received",
                description: "Your quality check is underway. We'll notify you soon.",
            });

            form.reset();
            router.push('/market');

        } catch (error) {
            console.error("Failed to submit product:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Technical error. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 min-h-screen pb-12">
            <div className="relative h-48 sm:h-64 bg-slate-900 overflow-hidden">
                <Image
                    src="/artifacts/market_hero_banner_1772224391536.png"
                    alt="Seller Banner"
                    fill
                    className="object-cover opacity-50 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter">Become a Merchant</h1>
                    <p className="text-slate-300 font-medium max-w-md mt-2">Join Akwa Ibom's fastest growing agricultural network.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
                <Card className="border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="pt-10 pb-2 text-center">
                        <CardTitle className="text-2xl font-black tracking-tight">Product Listing</CardTitle>
                        <CardDescription className="text-slate-500 font-medium font-medium">Verify your inventory for the Ibom Market.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="product.name"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., Premium Oron Crayfish" className="h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold focus:ring-2 ring-primary/20 transition-all" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Select Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold focus:ring-2 ring-primary/20">
                                                        <SelectValue placeholder="Choose a department" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                    {sellerCategories.map(cat => <SelectItem key={cat} value={cat} className="rounded-xl font-bold">{cat}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="product.price"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Price (₦)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="5000" className="h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold focus:ring-2 ring-primary/20" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="product.quantity"
                                        render={({ field }) => (
                                            <FormItem className="space-y-3">
                                                <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Inventory Level</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="50" className="h-14 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-6 font-bold focus:ring-2 ring-primary/20" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} />
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
                                        <FormItem className="space-y-3">
                                            <FormLabel className="text-xs font-black uppercase tracking-widest text-slate-400">Merchant Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="Tell us about the quality, source, and harvest date..." className="min-h-[120px] bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-6 font-medium focus:ring-2 ring-primary/20 transition-all" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" className="w-full h-16 rounded-2xl font-black text-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-200 dark:shadow-none active:scale-95 transition-all" disabled={isLoading}>
                                    {isLoading ? "Broadcasting..." : "Register Product"}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import Image from 'next/image';
