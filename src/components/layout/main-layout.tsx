'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppMobileNav } from "./app-mobile-nav";
import { AppHeader } from "./app-header";
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { AssistantFAB } from '../assistant-fab';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNavRoutes = ['/', '/auth/login', '/auth/signup'];
  const showNav = !noNavRoutes.includes(pathname);
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {showNav && isClient && !isMobile && <AppSidebar />}
        <div className="flex flex-col flex-1">
          {showNav && <AppHeader />}
          <SidebarInset>
            <main className={cn("flex-1 flex flex-col", showNav && "pb-24 md:pb-0")}>
              {children}
            </main>
          </SidebarInset>
          {showNav && isClient && <AssistantFAB />}
          {showNav && isClient && isMobile && <AppMobileNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}
