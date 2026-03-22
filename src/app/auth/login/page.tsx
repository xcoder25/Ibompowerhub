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
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useAuth } from '@/firebase';
import { useState } from 'react';
import { Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useLoading } from '@/context/loading-context';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
    <title>Google</title>
    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 3.08-5.19 3.08-4.39 0-7.99-3.61-7.99-7.99s3.6-7.99 7.99-7.99c2.53 0 4.14.99 5.14 1.94l2.4-2.39C17.4.99 15.19 0 12.48 0 5.6 0 0 5.6 0 12.48s5.6 12.48 12.48 12.48c7.2 0 12.04-4.82 12.04-12.04 0-.85-.08-1.63-.22-2.34h-11.8v.01Z" />
  </svg>
);

export default function LoginPage() {
  const auth = useAuth();
  const { setIsLoading } = useLoading();
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!auth) return;
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
    } catch (error) {
      console.error("Login failed", error);
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
    <div className="relative min-h-screen bg-[#040d06] text-white flex flex-col overflow-hidden selection:bg-emerald-500/30">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-emerald-900/40 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-amber-600/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-12 pb-6">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <Logo withText={false} className="text-white" size={28} />
        <div className="w-10" /> {/* Spacer for alignment */}
      </div>

      <div className="relative z-10 flex-1 flex flex-col px-6 pb-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black mb-2 text-white tracking-tight">Welcome Back</h1>
          <p className="text-white/60 text-base leading-relaxed">Sign in to your Ibom PowerHub account to continue.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-white/80 text-xs font-semibold uppercase tracking-wider">Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="name@example.com" 
                      className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 rounded-2xl px-5 text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-white/80 text-xs font-semibold uppercase tracking-wider">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500 rounded-2xl px-5 text-base pr-12" 
                        {...field} 
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-14 w-14 flex items-center justify-center text-white/40 hover:text-white transition"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-rose-400 text-xs" />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-1">
              <Link href="#" className="text-emerald-400 text-sm font-semibold hover:text-emerald-300">Forgot password?</Link>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-base shadow-[0_0_40px_rgba(16,185,129,0.3)] mt-6">
              Sign In
            </Button>
          </form>
        </Form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-widest font-semibold">
            <span className="bg-[#040d06] px-4 text-white/40">
              Or
            </span>
          </div>
        </div>

        <button 
          onClick={handleGoogleSignIn}
          className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition active:scale-[0.98]"
        >
          <GoogleIcon className="h-6 w-6 fill-current" />
          Continue with Google
        </button>

        <div className="mt-auto pt-8 text-center pb-6">
          <p className="text-white/50 text-sm">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-emerald-400 font-bold hover:text-emerald-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
