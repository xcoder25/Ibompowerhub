'use client';

/**
 * HeyDaraWakeButton
 * ─────────────────────────────────────────────────────────────────────────────
 * A floating always-on "Hey Dara" wake word button.
 *
 * States:
 *  idle     → grey pill with mic icon, tap to enable
 *  standby  → animated violet orb, pulsing softly — "listening"
 *  heard    → explosive violet burst + Dara face, "Dara is waking…"
 *  active   → full glow with waveform
 *  error    → red mic-off with tooltip
 *  unsupported → hidden
 */

import { useEffect, useRef } from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WakeWordState } from '@/hooks/use-wake-word';

interface HeyDaraWakeButtonProps {
  state: WakeWordState;
  isSupported: boolean | null;
  onEnable: () => void;
  onDisable: () => void;
  lastPhrase?: string;
  /** waveform bars from useIbibioAI (0-100) */
  waveformBars?: number[];
  className?: string;
  /** Compact mode: small floating pill (for dashboard) */
  compact?: boolean;
}

export function HeyDaraWakeButton({
  state,
  isSupported,
  onEnable,
  onDisable,
  lastPhrase,
  waveformBars = [],
  className,
  compact = false,
}: HeyDaraWakeButtonProps) {
  if (isSupported === false) return null;

  // ── IDLE state: subtle enable button ─────────────────────────────────────
  if (state === 'idle') {
    return (
      <button
        onClick={onEnable}
        className={cn(
          'group flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700',
          'text-slate-500 dark:text-slate-400 text-[11px] font-bold hover:bg-violet-50',
          'hover:border-violet-300 hover:text-violet-600 transition-all duration-200',
          compact ? 'text-[10px] gap-1.5 px-2.5 py-1' : '',
          className
        )}
        title="Enable 'Dara' wake listener"
      >
        <Mic className={cn('shrink-0', compact ? 'size-3' : 'size-3.5')} />
        <span>Dara</span>
      </button>
    );
  }

  // ── ERROR state ──────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <button
        onClick={onEnable}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-red-50 border border-red-200 text-red-500 text-[11px] font-bold',
          'hover:bg-red-100 transition-all',
          compact ? 'text-[10px] px-2.5 py-1' : '',
          className
        )}
        title="Microphone permission denied — tap to retry"
      >
        <MicOff className={cn('shrink-0', compact ? 'size-3' : 'size-3.5')} />
        <span>Mic denied</span>
      </button>
    );
  }

  // ── STANDBY state: pulsing violet orb ──────────────────────────────────
  if (state === 'standby') {
    return (
      <button
        onClick={onDisable}
        className={cn(
          'group relative flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-violet-50 dark:bg-violet-950/60 border border-violet-200/70 dark:border-violet-700/50',
          'text-violet-600 dark:text-violet-300 text-[11px] font-bold',
          'hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-all duration-200',
          compact ? 'text-[10px] px-2.5 py-1' : '',
          className
        )}
        title="Say 'Dara' — listening continuously. Tap to disable."
      >
        {/* Pulsing live dot */}
        <span className="relative flex shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60" />
          <span className={cn(
            'relative inline-flex rounded-full bg-violet-500',
            compact ? 'size-1.5' : 'size-2'
          )} />
        </span>
        <span>Dara</span>
        <Radio className={cn('shrink-0 opacity-60', compact ? 'size-3' : 'size-3.5')} />
      </button>
    );
  }

  // ── HEARD / ACTIVE state: cinematic wake burst ──────────────────────────
  if (state === 'heard' || state === 'active') {
    return (
      <div
        className={cn(
          'relative flex items-center gap-2.5 px-4 py-2 rounded-full',
          'bg-gradient-to-r from-violet-600 to-indigo-600',
          'border border-violet-400/50 text-white text-[11px] font-bold',
          'shadow-lg shadow-violet-500/30',
          'animate-in zoom-in-95 duration-200',
          compact ? 'text-[10px] px-3 py-1.5' : '',
          className
        )}
      >
        {/* Burst rings */}
        <span className="absolute inset-0 rounded-full border-2 border-violet-400/40 animate-ping" />

        {/* Dara avatar */}
        <div className={cn(
          'rounded-full overflow-hidden shrink-0 border-2 border-white/30',
          compact ? 'size-5' : 'size-6'
        )}>
          <img src="/dara.png" alt="Dara" className="w-full h-full object-cover" />
        </div>

        {/* Live waveform or "waking" text */}
        {waveformBars.length > 0 ? (
          <div className="flex items-center gap-0.5 h-3">
            {waveformBars.slice(0, 10).map((bar, i) => (
              <span
                key={i}
                className="w-0.5 bg-white/90 rounded-full transition-all duration-75"
                style={{ height: `${Math.max(3, bar * 0.14)}px` }}
              />
            ))}
          </div>
        ) : (
          <span className="animate-pulse">
            {state === 'heard' ? 'Waking…' : 'Listening…'}
          </span>
        )}

        {/* Last detected phrase (compact) */}
        {lastPhrase && !compact && (
          <span className="text-white/70 text-[9px] italic truncate max-w-[80px]">
            "{lastPhrase}"
          </span>
        )}
      </div>
    );
  }

  return null;
}
