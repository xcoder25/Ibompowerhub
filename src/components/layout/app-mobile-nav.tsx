
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportIssueDialog } from '../report-issue-dialog';
import { DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';


const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const VShape = () => (
    <svg
      className="absolute bottom-0 left-0 w-full h-[70px]"
      viewBox="0 0 375 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 70V20C0 8.95431 8.95431 0 20 0H162.5C168.023 0 173.264 2.23858 177.071 6.04569L187.5 16.4741L197.929 6.04569C201.736 2.23858 206.977 0 212.5 0H355C366.046 0 375 8.95431 375 20V70H0Z"
        className="fill-[hsl(var(--primary))]"
      />
    </svg>
  );

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[90px]">
      <div className="relative w-full h-full">
        <VShape />
        <div className="absolute inset-0 flex items-center justify-around text-primary-foreground">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center text-center p-2 rounded-lg transition-colors duration-200",
                  "hover:bg-primary/80"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive ? "text-white" : "text-primary-foreground/70")} />
                <span className={cn("text-xs mt-1", isActive ? "font-bold text-white" : "text-primary-foreground/70")}>{item.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="absolute -top-7 left-1/2 -translate-x-1/2">
            <ReportIssueDialog>
                <DialogTrigger asChild>
                    <Button
                        className="h-14 w-14 rounded-full shadow-lg border-4 border-background"
                        aria-label="Report an issue"
                        size="icon"
                    >
                        <Plus className="h-7 w-7" />
                    </Button>
                </DialogTrigger>
            </ReportIssueDialog>
        </div>
      </div>
    </nav>
  );
}
