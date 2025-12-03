import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { AppMobileNav } from "./app-mobile-nav";
import { AppHeader } from "./app-header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-950 via-slate-900 to-violet-950">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <AppHeader />
          <SidebarInset>
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
          </SidebarInset>
          <AppMobileNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
