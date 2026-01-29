'use client';

import Image from 'next/image';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
      <div className="relative h-24 w-24">
        {/* The spinner */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
        {/* The logo image in the center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/crs.png"
            alt="PowerHub CRS Logo"
            width={56}
            height={56}
          />
        </div>
      </div>
      <p className="font-headline text-lg font-semibold animate-pulse">
        Loading...
      </p>
    </div>
  );
}
