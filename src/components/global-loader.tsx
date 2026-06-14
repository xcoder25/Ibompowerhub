'use client';

import Image from 'next/image';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Image
          src="/aks.png"
          alt="Arise AKS Logo"
          width={80}
          height={80}
        />
        <span className="font-headline text-2xl font-bold text-gradient">Arise AKS</span>
      </div>
      <div className="mt-6 w-64 h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full aks-gradient-motion rounded-full animate-progress min-w-[30%]" />
      </div>
    </div>
  );
}
