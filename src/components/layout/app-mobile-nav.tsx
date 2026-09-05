'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bell, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { QuickNav } from '../quick-nav';

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-primary/10 pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-16 min-h-16">
        {mobileNavItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <React.Fragment key={item.href}>
              {index === 2 && (
                <Link href="/dara" passHref>
                  {/* Dara logo floating center button */}
                  <div className="relative -mt-8 flex items-center justify-center">
                    {/* Outer glow ring */}
                    <span className="absolute inset-0 rounded-full bg-violet-400/30 blur-md scale-110 animate-pulse" />
                    <div className="relative size-14 rounded-full shadow-xl shadow-violet-500/30 overflow-hidden border-2 border-white/20 hover:scale-105 active:scale-95 transition-transform duration-200">
                      <img
                        src="/dara.png"
                        alt="Dara AI"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
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

        <QuickNav>
          <button
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-colors duration-200 w-16 text-muted-foreground hover:text-primary"
            )}
          >
            <LayoutGrid className="h-6 w-6" />
            <span className="text-xs font-medium">More</span>
          </button>
        </QuickNav>
      </nav>
    </div>
  );
}
