
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/95 backdrop-blur-sm border-t z-40">
      <div className="flex justify-around items-center h-full">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors duration-200",
              (pathname === item.href || (item.href === '/dashboard' && pathname === '/')) ? "text-primary" : "hover:text-primary"
            )}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
