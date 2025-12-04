
'use client';

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppMobileNav } from "./app-mobile-nav";
import { AppHeader } from "./app-header";
import { cn } from '@/lib/utils';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const noNavRoutes = ['/', '/login', '/signup'];
  const showNav = !noNavRoutes.includes(pathname);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-violet-950">
        {showNav && <AppSidebar />}
        <div className="flex flex-col flex-1">
          {showNav && <AppHeader />}
          <SidebarInset>
            <main className={cn("flex-1", showNav && "pb-20 md:pb-0")}>
              {children}
            </main>
          </SidebarInset>
          {showNav && <AppMobileNav />}
        </div>
      </div>
    </SidebarProvider>
  );
}
