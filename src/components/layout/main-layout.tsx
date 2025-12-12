
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppMobileNav } from "./app-mobile-nav";
import { AppHeader } from "./app-header";
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState, useRef } from 'react';
import { AssistantWidget } from '../assistant-widget';
import { Toaster } from '../ui/toaster';
import { useUser, useFirestore, useFirebase } from '@/firebase';
import { SplashScreen } from '../splash-screen';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const noNavRoutes = ['/'];
  const authRoutes = ['/auth/login', '/auth/signup'];
  
  const showNav = !noNavRoutes.includes(pathname) && !authRoutes.includes(pathname);
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  // Ref to track if the welcome toast has been shown for the current session
  const welcomeToastShown = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isUserLoading) return; // Wait until auth state is confirmed

    // Handle user state changes
    if (user) {
      // User is logged in
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

      // Create user profile in Firestore if it doesn't exist
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (!docSnap.exists()) {
          setDoc(userDocRef, {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            profileImageUrl: user.photoURL,
            role: 'Resident', // Default role
          }, { merge: true });
        }
      });
      
      // If user is on an auth page, redirect to dashboard
      if (authRoutes.includes(pathname)) {
        if (!welcomeToastShown.current) {
            toast({
              title: isNewUser ? 'Account Created!' : 'Login Successful!',
              description: `Welcome, ${user.displayName || 'User'}!`,
            });
            welcomeToastShown.current = true;
        }
        router.push('/dashboard');
      }
    } else {
      // User is not logged in
      // If user is on a protected route, redirect to login
      if (!authRoutes.includes(pathname) && pathname !== '/') {
        router.push('/auth/login');
      }
      // Reset toast shown ref on sign-out
      welcomeToastShown.current = false;
    }
  }, [user, isUserLoading, pathname, router, firestore, toast, authRoutes]);


  if (isUserLoading && isClient) {
    return <SplashScreen />;
  }
  
  // For auth pages or landing, show children without layout
  if (authRoutes.includes(pathname) || pathname === '/') {
    return (
        <main className="flex-1 flex flex-col">
            {children}
            <Toaster />
        </main>
    );
  }

  // If still loading or no user on a protected page, show splash
  if (!user && isClient) {
    return <SplashScreen />;
  }

  const isMapPage = pathname === '/map';

  return (
    <SidebarProvider>
        {isClient ? (
            <div className="flex min-h-screen bg-background">
                {!isMobile && <AppSidebar />}
                <div className="flex flex-col flex-1">
                    {!isMapPage && <AppHeader />}
                    <SidebarInset>
                        <main className={cn("flex-1 flex flex-col", "pb-24 md:pb-0", isMapPage && "md:pb-0")}>
                           {children}
                        </main>
                    </SidebarInset>
                    <AssistantWidget />
                    {isMobile && <AppMobileNav />}
                </div>
                <Toaster />
            </div>
        ) : null}
    </SidebarProvider>
  );
}
