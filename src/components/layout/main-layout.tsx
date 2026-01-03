
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  if (!isClient) {
    return <SplashScreen />;
  }

  // Auth logic is now in a separate component that is only rendered on the client
  return (
    <>
        <AuthHandler>{children}</AuthHandler>
        <Toaster />
    </>
  );
}


function AuthHandler({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const noNavRoutes = ['/'];
    const authRoutes = ['/auth/login', '/auth/signup'];
    const isMobile = useIsMobile();
    const welcomeToastShown = useRef(false);

    useEffect(() => {
        if (isUserLoading || !firestore) return;

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
    }, [user, isUserLoading, pathname, router, firestore, toast]);

    if (isUserLoading) {
        return <SplashScreen />;
    }

    const isDashboard = pathname.startsWith('/dashboard');

    if (authRoutes.includes(pathname) || pathname === '/') {
        return (
            <main className="flex-1 flex flex-col">
                {children}
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
            </main>
        );
    }

    return (
        <SidebarProvider>
            <div className={cn("flex min-h-screen", isDashboard ? "bg-slate-50" : "bg-background")}>
                {!isMobile && <AppSidebar />}
                <div className="flex flex-col flex-1">
                    <AppHeader />
                    <SidebarInset>
                        <main className={cn("flex-1 flex flex-col", "pb-24 md:pb-0", isMapPage && "md:pb-0")}>
                            {children}
                        </main>
                    </SidebarInset>
                    <AssistantWidget />
                    {isMobile && <AppMobileNav />}
                </div>
            </div>
        </SidebarProvider>
    );
}

    

    

    