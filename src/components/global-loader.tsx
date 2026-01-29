'use client';

import { Logo } from '@/components/logo';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="animate-pulse">
        <Logo withText={true} layout="col" size={80} className="text-4xl" />
      </div>
    </div>
  );
}
