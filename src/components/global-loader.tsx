'use client';

import Image from 'next/image';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Image
          src="/crs.png"
          alt="PowerHub CRS Logo"
          width={80}
          height={80}
        />
        <span className="font-headline text-2xl font-bold text-foreground">PowerHub CRS</span>
      </div>
    </div>
  );
}
