
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t z-40">
      <div className="grid h-full grid-cols-4">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-muted-foreground transition-colors duration-200",
                !isActive && "hover:text-primary"
              )}
            >
              <div className={cn(
                "flex items-center justify-center rounded-full p-2 transition-all duration-300 ease-in-out",
                 isActive ? 'bg-primary/10' : 'bg-transparent'
              )}>
                <item.icon className={cn("h-6 w-6", isActive && "text-primary")} />
              </div>
              <span className={cn("text-xs mt-1", isActive ? "font-bold text-primary" : "text-muted-foreground")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  );
}
