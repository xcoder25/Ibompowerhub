
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useLoading } from '@/context/loading-context';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const AKWA_IBOM_LGAS = [
    "Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim", "Etim Ekpo",
    "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono Ibom", "Ika", "Ikono",
    "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu", "Mbo", "Mkpat Enin",
    "Nsit Atai", "Nsit Ibom", "Nsit Ubium", "Obot Akara", "Okobo", "Onna",
    "Oron", "Oruk Anam", "Udung Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"
];

const formSchema = z.object({
    fullName: z.string().min(2, {
        message: 'Full name must be at least 2 characters.',
    }),
    email: z.string().email({
        message: 'Please enter a valid email address.',
    }),
    password: z.string().min(8, {
        message: 'Password must be at least 6 characters.',
    }),
    confirmPassword: z.string(),
    isFromAkwaIbom: z.enum(['yes', 'no']),
    localGov: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
}).refine((data) => {
    if (data.isFromAkwaIbom === 'yes' && (!data.localGov || data.localGov.trim() === '')) {
        return false;
    }
    return true;
}, {
    message: "Please select your Local Government Area.",
    path: ["localGov"],
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 3.08-5.19 3.08-4.39 0-7.99-3.61-7.99-7.99s3.6-7.99 7.99-7.99c2.53 0 4.14.99 5.14 1.94l2.4-2.39C17.4.99 15.19 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.2 0 12.04-4.82 12.04-12.04 0-.85-.08-1.63-.22-2.34h-11.8v.01Z" />
    </svg>
);

export default function SignupPage() {
    const auth = useAuth();
    const firestore = useFirestore();
    const { setIsLoading } = useLoading();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
            isFromAkwaIbom: 'yes',
            localGov: '',
        },
    });

    const isFromAkwaIbom = form.watch('isFromAkwaIbom');

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!auth || !firestore) return;
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            await updateProfile(userCredential.user, { displayName: values.fullName });

            // Create user document in firestore with signup info
            const userDocRef = doc(firestore, 'users', userCredential.user.uid);
            await setDoc(userDocRef, {
                id: userCredential.user.uid,
                name: values.fullName,
                email: values.email,
                role: 'Resident',
                isFromAkwaIbom: values.isFromAkwaIbom === 'yes',
                localGov: values.isFromAkwaIbom === 'yes' ? values.localGov : null,
                location: values.isFromAkwaIbom === 'yes' ? `${values.localGov}, Akwa Ibom` : 'Other State',
                createdAt: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Signup failed", error);
            setIsLoading(false);
        }
    }

    const handleGoogleSignIn = async () => {
        if (!auth) return;
        setIsLoading(true);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google sign-in failed", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-2">
                    <Logo withText={true} className="text-3xl justify-center" />
                    <h1 className="text-2xl font-headline">Create an Account</h1>
                    <p className="text-muted-foreground">Join our community to get started</p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isFromAkwaIbom"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Are you from Akwa Ibom State?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an option" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="yes">Yes, I am from Akwa Ibom</SelectItem>
                                            <SelectItem value="no">No, I am from another state</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {isFromAkwaIbom === 'yes' && (
                            <FormField
                                control={form.control}
                                name="localGov"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Local Government Area</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select LGA" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {AKWA_IBOM_LGAS.map((lga) => (
                                                    <SelectItem key={lga} value={lga}>
                                                        {lga}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showPassword ? "text" : "password"} className="pr-10" placeholder="••••••••" {...field} />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input type={showConfirmPassword ? "text" : "password"} className="pr-10" placeholder="••••••••" {...field} />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="w-full mt-2">
                            Create Account
                        </Button>
                    </form>
                </Form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Sign up with Google
                </Button>


                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="underline font-semibold">
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
