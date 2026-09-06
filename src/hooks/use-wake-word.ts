'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWakeWord — Industry-standard dual wake word engine
 *
 * Primary: Picovoice Porcupine (WASM on-device keyword spotting via Web Worker)
 *  - Ultra low-latency, zero false-drop rate, runs on-device without cloud dictation
 *  - Automatically active when NEXT_PUBLIC_PICOVOICE_ACCESS_KEY and /dara.ppn are present
 *
 * Fallback: Battle-hardened Web SpeechRecognition + AudioContext Keep-Alive
 *  - Runs immediately with zero configuration
 *  - Silent AudioContext pinger prevents browser garbage collection of mic stream
 *  - Page Visibility API pauses on tab-hide, auto-resumes on return
 *  - Fast recovery (80ms) on soft speech timeouts
 */

export type WakeWordState =
  | 'idle'
  | 'standby'
  | 'heard'
  | 'active'
  | 'error'
  | 'unsupported';

export type WakeWordEngine = 'porcupine' | 'web-speech' | 'none';

export interface WakePayload {
  phrase: string;
  command: string;
  wakeWord: string;
}

/**
 * Robust phonetic & dialect matching for "Dara":
 * Handles: "Dara", "Hey Dara", "Idara", "Edara", "Adara", "Darah",
 *          "Dra", "Da ra", "Oya Dara", "Dollar", "Dalla", etc.
 */
export function extractDaraCommand(transcript: string): {
  isMatch: boolean;
  command: string;
  wakeWord: string;
} {
  if (!transcript) return { isMatch: false, command: '', wakeWord: '' };
  const clean = transcript.trim().toLowerCase();

  // Broad net: optional conversational prefix + Dara variant + optional trailing command
  const regex =
    /(?:^|.*?\b)(?:hey\s+|hi\s+|hello\s+|oya\s+|ok\s+|okay\s+|yo\s+|ah+\s+|di\s+)?((?:i|e|a)?dar+a+h?|da\s+ra|dalah|dalla|dollar)\b[\s,:!?]*(.*)/i;

  const match = clean.match(regex);
  if (match) {
    const wakeWord = match[1].trim();
    const command = (match[2] || '').trim();
    return { isMatch: true, command, wakeWord };
  }

  // Fallback: isolated "dara" anywhere in transcript
  if (/\b(?:i|e|a)?dar+a+h?\b/i.test(clean)) {
    const parts = clean.split(/\b(?:i|e|a)?dar+a+h?\b/i);
    return {
      isMatch: true,
      command: (parts[1] || '').trim(),
      wakeWord: 'Dara',
    };
  }

  return { isMatch: false, command: '', wakeWord: '' };
}

/** Play instant Google-Assistant style double-tone chime */
export function playWakeChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const t = ctx.currentTime;

    // First note: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, t);
    gain1.gain.setValueAtTime(0, t);
    gain1.gain.linearRampToValueAtTime(0.2, t + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.13);

    // Second note: A5 (880 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, t + 0.09);
    gain2.gain.setValueAtTime(0, t + 0.09);
    gain2.gain.linearRampToValueAtTime(0.24, t + 0.105);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.09);
    osc2.stop(t + 0.30);

    setTimeout(() => { ctx.close().catch(() => {}); }, 1200);
  } catch {
    // Web Audio not available
  }
}

// ── Timing Constants ──────────────────────────────────────────────────────────
const SOFT_RESTART_MS = 80;
const HARD_RESTART_BASE_MS = 500;
const HARD_RESTART_MAX_MS = 8000;
const HEARD_COOLDOWN_MS = 1800;
const KEEP_ALIVE_INTERVAL_MS = 4000;

export interface UseWakeWordOptions {
  onWake: (payload: WakePayload) => void;
  enabled?: boolean;
  autoStart?: boolean;
}

export function useWakeWord({ onWake, enabled = true, autoStart = true }: UseWakeWordOptions) {
  const [state, setState] = useState<WakeWordState>('idle');
  const [engine, setEngine] = useState<WakeWordEngine>('none');
  const [lastPhrase, setLastPhrase] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Porcupine instances
  const porcupineWorkerRef = useRef<any>(null);
  const webVoiceProcessorRef = useRef<any>(null);

  // Web Speech instances
  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Session guards
  const sessionIdRef = useRef(0);
  const isRunningRef = useRef(false);
  const enabledRef = useRef(enabled);
  const onWakeRef = useRef(onWake);
  const lastWakeTimeRef = useRef<number>(0);
  const hardErrorCountRef = useRef(0);
  const isSuspendedRef = useRef(false);

  // AudioContext Keep-Alive
  const keepAliveCtxRef = useRef<AudioContext | null>(null);
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startKeepAlive = useCallback(() => {
    if (keepAliveCtxRef.current) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      keepAliveCtxRef.current = ctx;

      const ping = () => {
        if (!keepAliveCtxRef.current) return;
        try {
          const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
        } catch {}
      };

      ping();
      keepAliveTimerRef.current = setInterval(ping, KEEP_ALIVE_INTERVAL_MS);
    } catch {}
  }, []);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current);
      keepAliveTimerRef.current = null;
    }
    try { keepAliveCtxRef.current?.close(); } catch {}
    keepAliveCtxRef.current = null;
  }, []);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onWakeRef.current = onWake; }, [onWake]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      setState('unsupported');
      return;
    }
    const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(hasMedia || !!SpeechRec);
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  // ── Stop Any Active Listener ────────────────────────────────────────────────
  const stopAllListeners = useCallback(async () => {
    clearRestartTimer();
    isRunningRef.current = false;
    sessionIdRef.current++;

    // Stop Web Speech
    try { recognitionRef.current?.abort(); } catch {}
    recognitionRef.current = null;

    // Stop Porcupine & Web Voice Processor
    try {
      if (webVoiceProcessorRef.current && porcupineWorkerRef.current) {
        await webVoiceProcessorRef.current.unsubscribe(porcupineWorkerRef.current);
      }
    } catch {}
    try {
      if (porcupineWorkerRef.current) {
        await porcupineWorkerRef.current.release();
      }
    } catch {}
    porcupineWorkerRef.current = null;
    webVoiceProcessorRef.current = null;
  }, [clearRestartTimer]);

  // ── Web Speech Fallback Listener ────────────────────────────────────────────
  const startSpeechRecognition = useCallback(() => {
    if (!enabledRef.current || isRunningRef.current || isSuspendedRef.current) return;
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    const currentSession = ++sessionIdRef.current;

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }

      const rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = navigator.language || 'en-NG';
      rec.maxAlternatives = 5;
      recognitionRef.current = rec;
      isRunningRef.current = true;
      setEngine('web-speech');

      rec.onresult = (event: any) => {
        if (sessionIdRef.current !== currentSession || !enabledRef.current) return;

        const now = Date.now();
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          for (let j = 0; j < result.length; j++) {
            const rawTranscript: string = result[j].transcript;
            const { isMatch, command, wakeWord } = extractDaraCommand(rawTranscript);

            if (isMatch) {
              if (now - lastWakeTimeRef.current < HEARD_COOLDOWN_MS) return;
              lastWakeTimeRef.current = now;
              hardErrorCountRef.current = 0;

              playWakeChime();
              setState('heard');
              setLastPhrase(rawTranscript.trim());

              onWakeRef.current({ phrase: rawTranscript.trim(), command, wakeWord });
              return;
            }
          }
        }
      };

      rec.onend = () => {
        if (sessionIdRef.current !== currentSession) return;
        isRunningRef.current = false;
        if (!enabledRef.current || isSuspendedRef.current) return;

        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          if (enabledRef.current && !isSuspendedRef.current) startSpeechRecognition();
        }, SOFT_RESTART_MS);
      };

      rec.onerror = (event: any) => {
        if (sessionIdRef.current !== currentSession) return;
        isRunningRef.current = false;

        const err: string = event.error;
        if (err === 'no-speech' || err === 'aborted') {
          clearRestartTimer();
          restartTimerRef.current = setTimeout(() => {
            if (enabledRef.current && !isSuspendedRef.current) startSpeechRecognition();
          }, SOFT_RESTART_MS);
          return;
        }

        if (err === 'not-allowed' || err === 'permission-denied') {
          setState('error');
          setHasPermission(false);
          return;
        }

        hardErrorCountRef.current = Math.min(hardErrorCountRef.current + 1, 6);
        const backoff = Math.min(
          HARD_RESTART_BASE_MS * Math.pow(2, hardErrorCountRef.current - 1),
          HARD_RESTART_MAX_MS
        );

        if (!enabledRef.current) return;
        clearRestartTimer();
        restartTimerRef.current = setTimeout(() => {
          if (enabledRef.current && !isSuspendedRef.current) startSpeechRecognition();
        }, backoff);
      };

      rec.start();
      setState('standby');
      setHasPermission(true);
      hardErrorCountRef.current = 0;
    } catch {
      isRunningRef.current = false;
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => {
        if (enabledRef.current && !isSuspendedRef.current) startSpeechRecognition();
      }, HARD_RESTART_BASE_MS);
    }
  }, [clearRestartTimer]);

  // ── Porcupine Primary Engine ────────────────────────────────────────────────
  const tryStartPorcupine = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;

    // Check for AccessKey from env or localStorage
    const accessKey =
      process.env.NEXT_PUBLIC_PICOVOICE_ACCESS_KEY ||
      (typeof window !== 'undefined' ? localStorage.getItem('picovoice_access_key') : null);

    if (!accessKey) return false;

    try {
      // Check if custom /dara.ppn exists in public
      const headCheck = await fetch('/dara.ppn', { method: 'HEAD' });
      if (!headCheck.ok) {
        console.warn('Picovoice AccessKey found, but /dara.ppn is missing in /public. Falling back to Web Speech.');
        return false;
      }

      // Dynamically load packages so there is zero SSR break
      const { PorcupineWorker } = await import('@picovoice/porcupine-web');
      const { WebVoiceProcessor } = await import('@picovoice/web-voice-processor');

      const onDetection = (detection: { label: string; index: number }) => {
        const now = Date.now();
        if (now - lastWakeTimeRef.current < HEARD_COOLDOWN_MS) return;
        lastWakeTimeRef.current = now;

        playWakeChime();
        setState('heard');
        setLastPhrase(detection.label || 'Dara');

        onWakeRef.current({
          phrase: detection.label || 'Dara',
          command: '',
          wakeWord: 'Dara',
        });
      };

      const worker = await PorcupineWorker.create(
        accessKey,
        [{ publicPath: '/dara.ppn', label: 'Dara' }],
        onDetection
      );

      await WebVoiceProcessor.subscribe(worker);

      porcupineWorkerRef.current = worker;
      webVoiceProcessorRef.current = WebVoiceProcessor;
      isRunningRef.current = true;
      setEngine('porcupine');
      setState('standby');
      setHasPermission(true);
      console.log('⚡ Picovoice Porcupine WASM engine active for Dara wake word.');
      return true;
    } catch (err) {
      console.warn('Porcupine initialization error, falling back to Web Speech:', err);
      return false;
    }
  }, []);

  // ── Unified Start Dispatcher ────────────────────────────────────────────────
  const startWakeListener = useCallback(async () => {
    if (!enabledRef.current || isRunningRef.current || isSuspendedRef.current) return;

    // 1. Try Porcupine first
    const porcupineStarted = await tryStartPorcupine();
    if (porcupineStarted) return;

    // 2. Fall back to keep-alive Web Speech
    startKeepAlive();
    startSpeechRecognition();
  }, [tryStartPorcupine, startKeepAlive, startSpeechRecognition]);

  // ── Public Control API ──────────────────────────────────────────────────────
  const enableWakeWord = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setHasPermission(true);
      setState('standby');
      await startWakeListener();
      return true;
    } catch {
      setHasPermission(false);
      setState('error');
      return false;
    }
  }, [startWakeListener]);

  const disableWakeWord = useCallback(async () => {
    await stopAllListeners();
    stopKeepAlive();
    setState('idle');
  }, [stopAllListeners, stopKeepAlive]);

  const setActive = useCallback(() => setState('active'), []);
  const setStandby = useCallback(() => setState('standby'), []);

  // ── Lifecycle: Page Visibility API ──────────────────────────────────────────
  useEffect(() => {
    if (!autoStart || !enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isSuspendedRef.current = true;
        stopAllListeners();
      } else {
        isSuspendedRef.current = false;
        if (enabledRef.current && !isRunningRef.current) {
          setTimeout(() => startWakeListener(), 300);
        }
      }
    };

    const handleWindowFocus = () => {
      isSuspendedRef.current = false;
      if (enabledRef.current && !isRunningRef.current) {
        setTimeout(() => startWakeListener(), 200);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [autoStart, enabled, startWakeListener, stopAllListeners]);

  // ── Auto-Start On Mount & First Gesture ──────────────────────────────────────
  useEffect(() => {
    if (!autoStart || !enabled) return;

    const userInteractedRef = { current: false };

    const handleFirstGesture = () => {
      if (!userInteractedRef.current) {
        userInteractedRef.current = true;
        startKeepAlive();
        if (!isRunningRef.current && enabledRef.current) {
          startWakeListener();
        }
      }
    };

    const timer = setTimeout(() => {
      startWakeListener();
    }, 400);

    window.addEventListener('click', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true, passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      stopAllListeners();
      stopKeepAlive();
    };
  }, [autoStart, enabled, startWakeListener, stopAllListeners, startKeepAlive, stopKeepAlive]);

  return {
    state,
    engine,
    isSupported,
    hasPermission,
    lastPhrase,
    enableWakeWord,
    disableWakeWord,
    setActive,
    setStandby,
    isListening: state === 'standby' || state === 'heard' || state === 'active',
    isWoken: state === 'heard' || state === 'active',
  };
}
