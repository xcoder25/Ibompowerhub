
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, CircleUser, Bell, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Compass, label: 'Discover' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: CircleUser, label: 'Profile' },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/70 backdrop-blur-lg border-t">
      <nav className="flex items-center justify-around h-16">
        {mobileNavItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <React.Fragment key={item.href}>
              {index === 2 && (
                 <Link href="/report" passHref>
                    <Button size="icon" className='rounded-full size-12 -mt-8 shadow-lg'>
                        <Plus className="size-6"/>
                    </Button>
                 </Link>
              )}
              <Link
                  href={item.href}
                  className={cn(
                      "flex flex-col items-center justify-center gap-1 transition-colors duration-200 w-16",
                      isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                  >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium">{item.label}</span>
              </Link>
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}

    