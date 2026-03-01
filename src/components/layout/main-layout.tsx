
'use client';

import { usePathname, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const AppSidebar = dynamic(() => import('./app-sidebar').then(mod => mod.AppSidebar));
const AppMobileNav = dynamic(() => import('./app-mobile-nav').then(mod => mod.AppMobileNav));
const AppHeader = dynamic(() => import('./app-header').then(mod => mod.AppHeader));
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState, useRef } from 'react';
import { AssistantWidget } from '../assistant-widget';
import { IbibioVoiceTool } from '../ibibio-voice-tool';
import { Toaster } from '../ui/toaster';
import { useUser, useFirestore } from '@/firebase';
import { SplashScreen } from '../splash-screen';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { LoadingProvider } from '@/context/loading-context';
import { CartProvider } from '@/context/cart-context';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

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
        <LoadingProvider>
            <CartProvider>
                <AuthHandler>{children}</AuthHandler>
                <Toaster />
            </CartProvider>
        </LoadingProvider>
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
            <WalletMonitor />
            <div className={cn("flex min-h-screen", isDashboard ? "bg-slate-50" : "bg-background")}>
                {!isMobile && <AppSidebar />}
                <div className="flex flex-col flex-1">
                    <AppHeader />
                    <SidebarInset>
                        <main className={cn("flex-1 flex flex-col", "pb-24 md:pb-0")}>
                            {children}
                        </main>
                    </SidebarInset>
                    <AssistantWidget />
                    <IbibioVoiceTool />
                    {isMobile && <AppMobileNav />}
                </div>
            </div>
        </SidebarProvider>
    );
}

function WalletMonitor() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const lastNotifiedTxnId = useRef<string | null>(null);

    useEffect(() => {
        if (!user || !firestore) return;

        const transactionsRef = collection(firestore, 'wallets', user.uid, 'transactions');
        const q = query(transactionsRef, orderBy('timestamp', 'desc'), limit(1));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const data = change.doc.data();
                    const txnId = change.doc.id;

                    if (lastNotifiedTxnId.current === txnId) return;

                    const timestamp = data.timestamp?.toDate() || new Date();
                    const now = new Date();

                    // Only notify if transaction happened in the last 10 seconds
                    if (now.getTime() - timestamp.getTime() < 10000) {
                        toast({
                            title: data.type === 'credit' ? 'Funds Received' : 'Payment Sent',
                            description: `${data.description}: ₦${data.amount?.toLocaleString()}`,
                        });
                        lastNotifiedTxnId.current = txnId;
                    }
                }
            });
        });

        return () => unsubscribe();
    }, [user, firestore, toast]);

    return null;
}
