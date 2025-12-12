
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
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { useAuth, useFirestore } from '@/firebase';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: 'Full name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z.string().min(8, {
    message: 'Password must be at least 8 characters.',
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 3.08-5.19 3.08-4.39 0-7.99-3.61-7.99-7.99s3.6-7.99 7.99-7.99c2.53 0 4.14.99 5.14 1.94l2.4-2.39C17.4.99 15.19 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.2 0 12.04-4.82 12.04-12.04 0-.85-.08-1.63-.22-2.34h-11.8v.01Z" />
    </svg>
  );

export default function SignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth || !firestore) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.fullName });

      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        name: values.fullName,
        email: user.email,
        role: 'Resident', // Default role
      }, { merge: true });

      toast({
        title: 'Account Created',
        description: "You've successfully signed up!",
      });
      router.push('/dashboard');
    } catch (error) {
        if (error instanceof FirebaseError) {
            toast({
                variant: "destructive",
                title: "Sign Up Failed",
                description: error.message,
            });
        }
    }
  }

  const handleGoogleSignIn = async () => {
    if (!auth || !firestore) return;
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(firestore, 'users', user.uid);
      await setDoc(userRef, {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        profileImageUrl: user.photoURL,
        role: 'Resident', // Default role
      }, { merge: true });

      toast({
        title: 'Sign Up Successful',
        description: `Welcome, ${user.displayName}!`,
      });
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof FirebaseError) {
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message,
        });
      }
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
                    name="password"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
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
                        <Input type="password" placeholder="••••••••" {...field} />
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
