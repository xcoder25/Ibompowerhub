
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
    <nav className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-background/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg z-40">
      <div className="flex justify-around items-center h-full">
        {mobileNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full text-muted-foreground transition-colors duration-200 rounded-lg",
              (pathname === item.href || (item.href === '/dashboard' && pathname === '/')) ? "text-primary bg-primary/10" : "hover:text-primary"
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
