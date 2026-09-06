'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useWakeWord } from '@/hooks/use-wake-word';
import { X, ArrowRight, MicOff } from 'lucide-react';

export function GlobalDaraWakeAssistant() {
  const pathname = usePathname();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If we are already on the dedicated /dara page, /dara handles its own voice UI
  const isDaraPage = pathname === '/dara';

  const {
    state,
    engine,
    hasPermission,
    setStandby,
    enableWakeWord,
  } = useWakeWord({
    enabled: !isDaraPage,
    autoStart: true,
    onWake: (payload) => {
      if (isDaraPage) return;

      setIsVisible(true);
      setDisplayText(payload.command || payload.phrase || 'Listening to you…');

      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);

      if (payload.command && payload.command.trim().length > 1) {
        // Spoke command in one breath: navigate to Dara and execute immediately
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
          router.push(`/dara?prompt=${encodeURIComponent(payload.command.trim())}`);
        }, 500);
      } else {
        // Called "Dara" only: open prompt for 4.5s
        hideTimerRef.current = setTimeout(() => {
          setIsVisible(false);
          setStandby();
        }, 4500);
      }
    },
  });

  const handleOpenDara = () => {
    setIsVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    const query = displayText && displayText !== 'Listening to you…' ? displayText : '';
    router.push(query ? `/dara?prompt=${encodeURIComponent(query)}` : '/dara');
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  const handleRetryPermission = async () => {
    await enableWakeWord();
  };

  if (isDaraPage) return null;

  const isStandby = state === 'standby';
  const isError = state === 'error' || hasPermission === false;

  return (
    <>
      {/* ── Persistent standby indicator (bottom-right subtle mic dot) ── */}
      {!isVisible && isStandby && (
        <div
          className="fixed bottom-20 right-4 md:bottom-6 z-40 pointer-events-none"
          aria-label="Dara is listening"
        >
          <div className="relative flex items-center justify-center size-2.5">
            {/* Outer ping */}
            <span className="absolute inline-flex size-full rounded-full bg-violet-400 opacity-60 animate-ping" />
            {/* Inner solid dot */}
            <span className="relative inline-flex size-2 rounded-full bg-violet-500" />
          </div>
        </div>
      )}

      {/* ── Permission denied / error state — tap to retry ── */}
      {!isVisible && isError && (
        <button
          onClick={handleRetryPermission}
          className="fixed bottom-20 right-4 md:bottom-6 z-40 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900/90 backdrop-blur border border-red-500/40 text-red-400 text-[10px] font-semibold shadow-lg hover:bg-slate-800 transition-colors"
          title="Tap to enable Dara voice"
        >
          <MicOff className="size-3" />
          <span>Tap to enable voice</span>
        </button>
      )}

      {/* ── Wake overlay (Google Assistant–style bottom bar) ── */}
      {isVisible && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-6 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent animate-in slide-in-from-bottom duration-200 pointer-events-auto">
          {/* Ambient glowing multi-colour sweep along bottom edge */}
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-400 via-fuchsia-500 to-sky-400 animate-pulse shadow-[0_-4px_30px_rgba(168,85,247,0.8)]" />

          <div className="max-w-md mx-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-violet-500/40 p-3.5 sm:p-4 shadow-2xl text-white">
            <div className="flex items-center justify-between gap-3">
              <div
                onClick={handleOpenDara}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group"
              >
                {/* Dara avatar */}
                <div className="relative size-11 rounded-2xl overflow-hidden border-2 border-violet-400 shadow-lg shadow-violet-500/40 shrink-0 group-hover:scale-105 transition-transform">
                  <img src="/dara.png" alt="Dara AI" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 rounded-2xl border border-white/20" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">
                      Dara AI Assistant
                    </span>
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-[9px] text-slate-400">
                      {engine === 'porcupine' ? 'Porcupine WASM' : 'Heard "Dara"'}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white truncate mt-0.5">
                    {displayText || 'Listening to your command…'}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenDara}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black shadow-md transition-all"
                  title="Open Dara Assistant"
                >
                  <span>Open</span>
                  <ArrowRight className="size-3" />
                </button>

                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Dismiss"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* 4 Google-style animated colour dots */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-2.5 border-t border-white/10">
              <span className="size-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="size-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="size-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="size-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '450ms' }} />
              <span className="text-[10px] text-violet-300/80 font-medium ml-2">Speak now or tap Open</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
