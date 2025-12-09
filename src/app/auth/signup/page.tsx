
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
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Update user profile with full name
      await updateProfile(user, { displayName: values.fullName });

      // Create user profile in Firestore
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
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create user profile in Firestore if it doesn't exist
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

  const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-1.5c-1.1 0-1.5.9-1.5 1.5V12h3l-.5 3h-2.5v6.8c4.56-.93 8-4.96 8-9.8z"/>
        <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" stroke="none" fill="#4285F4"/>
        <path d="M12 22V12h10c0 5.523-4.477 10-10 10z" stroke="none" fill="#34A853"/>
        <path d="M2 12h10V2C6.477 2 2 6.477 2 12z" stroke="none" fill="#FBBC05"/>
        <path d="M12 12V2C17.523 2 22 6.477 22 12H12z" stroke="none" fill="#EA4335"/>
        <path d="M15.5 10.5h-7v3h4.2c-.2.8-.8 1.5-1.7 1.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.6 0 1.1.2 1.5.6l1.2-1.2c-.7-.7-1.7-1.1-2.7-1.1-2.2 0-4 1.8-4 4s1.8 4 4 4c2.5 0 3.8-1.7 3.8-3.8 0-.3 0-.5-.1-.7z" stroke="none" fill="white"/>
    </svg>
  );

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
