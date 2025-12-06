
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Bell, User, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReportIssueDialog } from '../report-issue-dialog';
import { DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40 h-16">
      <div className="relative w-full h-full bg-primary/90 backdrop-blur-lg rounded-full shadow-lg flex items-center justify-around text-primary-foreground">
        {mobileNavItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-center p-2 rounded-lg transition-colors duration-200 w-16",
                isActive ? "text-white" : "text-primary-foreground/70"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}

        <div className="absolute -top-6 left-1/2 -translate-x-1/2">
          <ReportIssueDialog>
            <DialogTrigger asChild>
              <Button
                className="h-16 w-16 rounded-full shadow-lg border-4 border-background"
                aria-label="Report an issue"
                size="icon"
              >
                <Plus className="h-8 w-8" />
              </Button>
            </DialogTrigger>
          </ReportIssueDialog>
        </div>

        {mobileNavItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-center p-2 rounded-lg transition-colors duration-200 w-16",
                 isActive ? "text-white" : "text-primary-foreground/70"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
