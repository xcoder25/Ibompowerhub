
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
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40">
      <div className="bg-foreground text-background rounded-xl shadow-lg p-2">
        <div className="grid h-full grid-cols-4">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg p-2 transition-colors duration-200",
                  isActive ? "bg-black/20" : "hover:bg-black/10"
                )}
              >
                <item.icon className={cn("h-6 w-6", isActive ? "text-white" : "text-gray-400")} />
                <span className={cn("text-xs mt-1",  isActive ? "font-bold text-white" : "text-gray-400")}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  );
}
