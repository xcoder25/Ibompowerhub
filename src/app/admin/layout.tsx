
'use client';

import { useAdmin } from '@/hooks/use-admin';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SplashScreen } from '@/components/splash-screen';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { isAdmin, isLoading } = useAdmin();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAdmin) {
            router.replace('/dashboard');
        }
    }, [isAdmin, isLoading, router]);

    if (isLoading) {
        return <SplashScreen />;
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex-1 flex flex-col bg-slate-50 overflow-auto">
            {children}
        </div>
    );
}
