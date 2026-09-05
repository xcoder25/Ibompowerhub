'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useWakeWord — "Dara" always-on, low-latency wake word engine
 * Designed to behave like Google Assistant:
 * - Direct wake on "Dara" (plus natural prefixes and phonetic/dialect variations: Idara, Edara, etc.)
 * - Zero-delay instant chime
 * - Continuous command extraction: saying "Dara what's my balance" immediately forwards the command!
 */

export type WakeWordState =
  | 'idle'
  | 'standby'
  | 'heard'
  | 'active'
  | 'error'
  | 'unsupported';

export interface WakePayload {
  phrase: string;
  command: string;
  wakeWord: string;
}

/**
 * Robust phonetic & dialect matching for "Dara":
 * Handles: "Dara", "Hey Dara", "Idara", "Edara", "Adara", "Darah", "Dra", "Da ra", "Oya Dara", etc.
 */
export function extractDaraCommand(transcript: string): { isMatch: boolean; command: string; wakeWord: string } {
  if (!transcript) return { isMatch: false, command: '', wakeWord: '' };
  const clean = transcript.trim();

  // Pattern: matches optional conversational preface + Dara (or Idara/Edara/Darah) + trailing command
  const regex = /(?:^|.*?\b)(?:hey\s+|hi\s+|hello\s+|oya\s+|ok\s+|okay\s+|yo\s+|ahh\s+|di\s+)?((?:i|e|a)?dar+a+h?|da\s+ra)\b[\s,:!?]*(.*)$/i;
  const match = clean.match(regex);

  if (match) {
    const wakeWord = match[1].trim();
    const command = (match[2] || '').trim();
    return { isMatch: true, command, wakeWord };
  }

  // Fallback: direct isolated "dara" check
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
    gain1.gain.linearRampToValueAtTime(0.18, t + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.13);

    // Second note: A5 (880.00 Hz) - higher confirmation ping
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, t + 0.09);
    gain2.gain.setValueAtTime(0, t + 0.09);
    gain2.gain.linearRampToValueAtTime(0.22, t + 0.105);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.09);
    osc2.stop(t + 0.30);

    setTimeout(() => { ctx.close().catch(() => {}); }, 1200);
  } catch {
    // Web Audio not available or blocked by policy
  }
}

const RESTART_DELAY_MS = 150;
const HEARD_COOLDOWN_MS = 1800;

export interface UseWakeWordOptions {
  onWake: (payload: WakePayload) => void;
  enabled?: boolean;
}

export function useWakeWord({ onWake, enabled = true }: UseWakeWordOptions) {
  const [state, setState] = useState<WakeWordState>('idle');
  const [lastPhrase, setLastPhrase] = useState<string>('');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);
  const enabledRef = useRef(enabled);
  const onWakeRef = useRef(onWake);
  const lastWakeTimeRef = useRef<number>(0);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);
  useEffect(() => { onWakeRef.current = onWake; }, [onWake]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      setState('unsupported');
      return;
    }
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSupported(!!SpeechRec);
    if (!SpeechRec) setState('unsupported');
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const startWakeListener = useCallback(() => {
    if (!enabledRef.current || isRunningRef.current) return;
    if (typeof window === 'undefined') return;
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    isRunningRef.current = true;
    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-NG'; // Dialect-aware primary
    rec.maxAlternatives = 3;
    recognitionRef.current = rec;

    rec.onresult = (event: any) => {
      if (!enabledRef.current) return;

      const now = Date.now();
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        for (let j = 0; j < result.length; j++) {
          const rawTranscript = result[j].transcript;
          const { isMatch, command, wakeWord } = extractDaraCommand(rawTranscript);

          if (isMatch) {
            // Check cooldown to prevent duplicate triggers within 1.8s
            if (now - lastWakeTimeRef.current < HEARD_COOLDOWN_MS) {
              return;
            }
            lastWakeTimeRef.current = now;

            // Instant audio chime like Google Assistant
            playWakeChime();

            setState('heard');
            setLastPhrase(rawTranscript.trim());

            // Fire onWake immediately with extracted command if present
            onWakeRef.current({
              phrase: rawTranscript.trim(),
              command,
              wakeWord,
            });
            return;
          }
        }
      }
    };

    rec.onend = () => {
      isRunningRef.current = false;
      if (!enabledRef.current) return;
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => startWakeListener(), RESTART_DELAY_MS);
    };

    rec.onerror = (event: any) => {
      isRunningRef.current = false;
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setState('error');
        setHasPermission(false);
        return;
      }
      if (!enabledRef.current) return;
      clearRestartTimer();
      restartTimerRef.current = setTimeout(() => startWakeListener(), RESTART_DELAY_MS * 2);
    };

    try {
      rec.start();
      setState(prev => prev === 'idle' || prev === 'standby' ? 'standby' : prev);
    } catch {
      isRunningRef.current = false;
    }
  }, [clearRestartTimer]);

  const stopWakeListener = useCallback(() => {
    clearRestartTimer();
    isRunningRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch { }
    recognitionRef.current = null;
  }, [clearRestartTimer]);

  const enableWakeWord = useCallback(async () => {
    if (isSupported === false) {
      setState('unsupported');
      return false;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setHasPermission(true);
      setState('standby');
      startWakeListener();
      return true;
    } catch {
      setHasPermission(false);
      setState('error');
      return false;
    }
  }, [isSupported, startWakeListener]);

  const disableWakeWord = useCallback(() => {
    stopWakeListener();
    setState('idle');
  }, [stopWakeListener]);

  const setActive = useCallback(() => { setState('active'); }, []);
  const setStandby = useCallback(() => { setState('standby'); }, []);

  useEffect(() => {
    return () => { stopWakeListener(); };
  }, [stopWakeListener]);

  return {
    state,
    isSupported,
    hasPermission,
    lastPhrase,
    enableWakeWord,
    disableWakeWord,
    setActive,
    setStandby,
    isListening: state === 'standby',
    isWoken: state === 'heard' || state === 'active',
  };
}

