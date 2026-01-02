
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Map, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-20 bg-background/95 backdrop-blur-sm border-t">
      <div className="w-full h-full flex items-center justify-around text-muted-foreground">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-center p-2 transition-colors duration-200 w-16 relative",
                isActive ? "text-primary" : "hover:text-primary"
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
