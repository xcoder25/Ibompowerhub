
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function AppMobileNav() {
  const pathname = usePathname();

  // Do not render the mobile nav on the map page, as it has its own header controls.
  if (pathname === '/map') {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <nav className="flex items-center gap-2 rounded-full bg-sidebar p-2 shadow-lg">
        <TooltipProvider>
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
                <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                        <Link
                            href={item.href}
                            className={cn(
                                "flex items-center justify-center rounded-full p-3 transition-colors duration-200",
                                isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
                            )}
                            >
                            <item.icon className="h-6 w-6" />
                            <span className="sr-only">{item.label}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                        <p>{item.label}</p>
                    </TooltipContent>
                </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>
    </div>
  );
}
