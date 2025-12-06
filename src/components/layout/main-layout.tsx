
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppMobileNav } from "./app-mobile-nav";
import { AppHeader } from "./app-header";
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useEffect, useState } from 'react';
import { AssistantWidget } from '../assistant-widget';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNavRoutes = ['/', '/auth/login', '/auth/signup'];
  const showNav = !noNavRoutes.includes(pathname);
  const isMobile = useIsMobile();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!showNav) {
    return <main className="flex-1 flex flex-col">{children}</main>;
  }

  if (!isClient) {
    // Return a placeholder or null during server-side rendering
    // to avoid hydration mismatch for components that rely on client-side info.
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {!isMobile && <AppSidebar />}
        <div className="flex flex-col flex-1">
          <AppHeader />
          <SidebarInset>
            <main className={cn("flex-1 flex flex-col", "pb-24 md:pb-0")}>
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
