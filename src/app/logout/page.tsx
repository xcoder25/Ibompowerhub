
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';

export default function LogoutPage() {
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        // In a real app, you would clear the user's session or token here.
        if (typeof window !== 'undefined') {
            localStorage.removeItem('hasSignedUp');
        }

        toast({
            title: 'Logged Out',
            description: 'You have been successfully logged out.',
        });

        const timer = setTimeout(() => {
            router.push('/');
        }, 1500);

        return () => clearTimeout(timer);
    }, [router, toast]);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <Card glassy className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <LogOut />
            Logging Out
          </CardTitle>
          <CardDescription>Please wait while we securely log you out.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You are being redirected to the homepage.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
