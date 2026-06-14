'use client';

import Image from 'next/image';

export function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0d5c2e] min-h-[100dvh] pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      {/* Animated gradient orbs (AKS green → orange motion) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="aks-gradient-motion absolute -top-1/2 -left-1/2 w-full h-full opacity-30 rounded-full blur-3xl scale-[1.5]" />
        <div className="aks-gradient-motion absolute -bottom-1/2 -right-1/2 w-full h-full opacity-20 rounded-full blur-3xl scale-[1.5] [animation-delay:2s]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-7 px-6">
        <div className="relative">
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-3 ring-2 ring-white/20 shadow-[0_18px_45px_rgba(0,0,0,0.45)] animate-[fade-in-up_0.6s_ease-out]">
            <Image
              src="/aks.png"
              alt="Arise AKS Logo"
              width={120}
              height={120}
              priority
              className="drop-shadow-lg"
            />
          </div>
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#0d5c2e] via-[#ea580c] to-[#f97316] opacity-60 blur-xl animate-pulse" aria-hidden />
        </div>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-black/15 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Arise AKS Super App
          </span>

          <span className="font-headline text-4xl font-black tracking-tight text-white drop-shadow-md sm:text-5xl">
            Arise
          </span>
          <span className="font-headline text-4xl font-black tracking-tight text-white drop-shadow-md sm:text-5xl aks-text-gradient-orange">
            AKS
          </span>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="text-sm font-medium text-white/85 max-w-[260px] text-center sm:text-base">
            Your digital gateway to Akwa Ibom State
          </p>

          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-white/60">
            Preparing your experience…
          </p>

          <div className="w-32 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div className="aks-gradient-motion h-full min-w-full rounded-full" />
          </div>

          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.18s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.36s]" />
          </div>
        </div>
      </div>
    </div>
  );
}
