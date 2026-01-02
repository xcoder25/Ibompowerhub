
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Droplets, Heart, Sparkles, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/cycle', icon: Droplets, label: 'Cycle' },
  { href: '/recovery', icon: Heart, label: 'Recovery' },
  { href: '/wellbeing', icon: Sparkles, label: 'Wellbeing' },
  { href: '/breathe', icon: Wind, label: 'Breathe' },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-20 bg-black border-t border-gray-800">
      <div className="w-full h-full flex items-center justify-around text-gray-400">
        {mobileNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-center p-2 transition-colors duration-200 w-16 relative",
                isActive ? "text-blue-300" : "hover:text-white"
              )}
            >
              {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-400 rounded-full" />}
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
