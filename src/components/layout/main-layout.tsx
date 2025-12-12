
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
import { useUser, useFirestore } from '@/firebase';
import { SplashScreen } from '../splash-screen';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore(); // This is safe now because MainLayout is wrapped in the provider.
  const { toast } = useToast();
  
  const noNavRoutes = ['/'];
  const authRoutes = ['/auth/login', '/auth/signup'];
  
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  const welcomeToastShown = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isUserLoading || !firestore || !isClient) return;

    if (user) {
      const isNewUser = user.metadata.creationTime === user.metadata.lastSignInTime;

      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (!docSnap.exists()) {
          setDoc(userDocRef, {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            profileImageUrl: user.photoURL,
            role: 'Resident',
            createdAt: serverTimestamp()
          }, { merge: true });
        }
      });
      
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
      if (!authRoutes.includes(pathname) && pathname !== '/') {
        router.push('/auth/login');
      }
      welcomeToastShown.current = false;
    }
  }, [user, isUserLoading, pathname, router, firestore, toast, isClient]);


  if (!isClient || isUserLoading) {
    return <SplashScreen />;
  }
  
  if (authRoutes.includes(pathname) || pathname === '/') {
    return (
        <main className="flex-1 flex flex-col">
            {children}
            <Toaster />
        </main>
    );
  }

  if (!user) {
    return <SplashScreen />;
  }

  const isMapPage = pathname === '/map';
  const showNav = !noNavRoutes.includes(pathname) && !authRoutes.includes(pathname);
  
  if (!showNav) {
    return (
        <main className="flex-1 flex flex-col">
            {children}
            <Toaster />
        </main>
    );
  }


  return (
    <SidebarProvider>
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
    </SidebarProvider>
  );
}
