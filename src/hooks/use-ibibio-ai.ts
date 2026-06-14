'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { findIbibioTranslation } from '@/lib/culture-data';

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
        Capacitor: any;
    }
}

export type TonalPattern = 'H' | 'L' | 'D' | string;

// Languages to try in order of preference
const LANG_PRIORITY = ['en-NG', 'en-GB', 'en-US'];

// Minimum confidence to accept a result (0–1)
const MIN_CONFIDENCE = 0.45;

// Auto-silence timeout — how long after last interim result before we submit
const SILENCE_MS = 1800;

// Max auto-retries on no-speech errors
const MAX_RETRIES = 3;

export interface WaveformData {
    bars: number[];   // 0–100 amplitude values for rendering
    rms: number;      // overall loudness 0–1
}

export function useIbibioAI() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [confidence, setConfidence] = useState<number>(0);
    const [detectedLang, setDetectedLang] = useState<string>('en-NG');
    const [retryCount, setRetryCount] = useState(0);
    const [waveform, setWaveform] = useState<WaveformData>({ bars: Array(20).fill(0), rms: 0 });
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const retryRef = useRef(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const isListeningRef = useRef(false);

    // Platform detection
    const isCapacitor = typeof window !== 'undefined' && !!window.Capacitor;
    const platform = isCapacitor ? window.Capacitor.getPlatform() : 'web';

    // ── Waveform engine (Web Audio API) ──────────────────────────────────────
    const startWaveform = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            micStreamRef.current = stream;

            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = ctx;

            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            analyser.smoothingTimeConstant = 0.7;
            analyserRef.current = analyser;

            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            const draw = () => {
                if (!isListeningRef.current) return;
                const data = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(data);

                // Normalize to 0–100
                const bars = Array.from(data.slice(0, 20)).map(v => Math.round((v / 255) * 100));
                const rms = bars.reduce((a, b) => a + b, 0) / bars.length / 100;
                setWaveform({ bars, rms });
                animFrameRef.current = requestAnimationFrame(draw);
            };

            draw();
        } catch {
            // Mic permission denied — use animated fallback
        }
    }, []);

    const stopWaveform = useCallback(() => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach(t => t.stop());
            micStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => {});
            audioContextRef.current = null;
        }
        setWaveform({ bars: Array(20).fill(0), rms: 0 });
    }, []);

    // ── Speech Recognition setup ──────────────────────────────────────────────
    const createRecognition = useCallback((lang: string) => {
        if (typeof window === 'undefined') return null;
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return null;

        const rec = new SpeechRecognition();
        rec.continuous = true;         // Keep listening until we decide to stop
        rec.interimResults = true;     // Real-time words as they're spoken
        rec.lang = lang;
        rec.maxAlternatives = 3;       // Get top 3 alternatives for better selection
        return rec;
    }, []);

    const clearSilenceTimer = useCallback(() => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
    }, []);

    /**
     * Explicit Permission Request
     * On Web, it uses navigator API.
     * On Android/iOS via Capacitor, it ensures the core mic permission is requested.
     */
    const requestPermissions = useCallback(async () => {
        try {
            if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // This triggers the native browser/app-view permission dialog
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Immediately stop the stream, we just validated/requested permission
                stream.getTracks().forEach(track => track.stop());
                setHasPermission(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Permission denied for microphone:', error);
            setHasPermission(false);
            return false;
        }
    }, []);

    // ── Core: Start listening ─────────────────────────────────────────────────
    const startListening = useCallback(async () => {
        const SpeechRecognition = typeof window !== 'undefined'
            ? (window.SpeechRecognition || window.webkitSpeechRecognition)
            : null;
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported on this browser/platform.');
            return;
        }

        // Always check/ensure permission before starting
        const granted = await requestPermissions();
        if (!granted) {
            console.warn('Microphone permission not granted.');
            return;
        }

        retryRef.current = 0;
        setRetryCount(0);
        setTranscript('');
        setInterimTranscript('');
        setConfidence(0);
        setIsListening(true);
        isListeningRef.current = true;
        startWaveform();

        const lang = LANG_PRIORITY[0];
        setDetectedLang(lang);
        const rec = createRecognition(lang);
        if (!rec) return;
        recognitionRef.current = rec;

        // ── onresult: fires on every interim/final result ─────────────────
        rec.onresult = (event: any) => {
            clearSilenceTimer();

            let interim = '';
            let bestFinal = '';
            let bestConf = 0;

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];

                if (result.isFinal) {
                    // Pick the alternative with highest confidence
                    let topAlt = result[0];
                    for (let j = 1; j < result.length; j++) {
                        if (result[j].confidence > topAlt.confidence) topAlt = result[j];
                    }

                    if (topAlt.confidence >= MIN_CONFIDENCE || bestFinal === '') {
                        bestFinal += topAlt.transcript + ' ';
                        bestConf = Math.max(bestConf, topAlt.confidence);
                    }
                } else {
                    interim += result[0].transcript;
                }
            }

            if (interim) setInterimTranscript(interim);

            if (bestFinal.trim()) {
                setTranscript(prev => (prev + ' ' + bestFinal).trim());
                setInterimTranscript('');
                setConfidence(bestConf);
            }

            // Restart silence timer — submit 1.8s after last speech activity
            silenceTimerRef.current = setTimeout(() => {
                if (isListeningRef.current) {
                    isListeningRef.current = false;
                    setIsListening(false);
                    stopWaveform();
                    try { rec.stop(); } catch {}
                }
            }, SILENCE_MS);
        };

        // ── onerror: smart retry on silence / aborted ─────────────────────
        rec.onerror = (event: any) => {
            console.warn('[VoiceAI] Recognition error:', event.error);

            if (event.error === 'no-speech' && retryRef.current < MAX_RETRIES) {
                retryRef.current++;
                setRetryCount(retryRef.current);
                // Brief pause then restart
                setTimeout(() => {
                    if (isListeningRef.current) {
                        try { rec.start(); } catch {}
                    }
                }, 300 * retryRef.current); // Exponential backoff
            } else if (event.error === 'aborted') {
                // Normal stop — ignore
            } else {
                setIsListening(false);
                isListeningRef.current = false;
                stopWaveform();
            }
        };

        rec.onend = () => {
            // If we're still in listening mode (e.g., Android ends session early), restart
            if (isListeningRef.current && retryRef.current < MAX_RETRIES) {
                try { rec.start(); } catch {}
            }
        };

        try { rec.start(); } catch (e) {
            console.error('[VoiceAI] Failed to start recognition:', e);
        }
    }, [createRecognition, startWaveform, stopWaveform, clearSilenceTimer, requestPermissions]);

    // ── Core: Stop listening ──────────────────────────────────────────────────
    const stopListening = useCallback(() => {
        clearSilenceTimer();
        isListeningRef.current = false;
        setIsListening(false);
        stopWaveform();
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch {}
        }
    }, [clearSilenceTimer, stopWaveform]);

    // Reset transcript for a new command
    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
        setConfidence(0);
        setRetryCount(0);
    }, []);

    // ── TTS: Pick best female voice ───────────────────────────────────────────
    const pickFemaleVoice = useCallback((): SpeechSynthesisVoice | null => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return null;
        
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return null;

        const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'hazel', 'susan',
            'samantha', 'victoria', 'karen', 'moira', 'tessa',
            'fiona', 'nicky', 'kate', 'ava', 'allison', 'joanna', 'salli', 'femi', 'ngozi'];

        const ngFemale = voices.find(v =>
            (v.lang.startsWith('en-NG') || v.lang.includes('NG'))
            && femaleKeywords.some(k => v.name.toLowerCase().includes(k))
        );
        if (ngFemale) return ngFemale;

        const ngVoice = voices.find(v => v.lang.startsWith('en-NG'));
        if (ngVoice) return ngVoice;

        const googleUK = voices.find(v => v.name === 'Google UK English Female');
        if (googleUK) return googleUK;

        const msGood = voices.find(v =>
            v.name.toLowerCase().includes('hazel') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('aria')
        );
        if (msGood) return msGood;

        const anyFemale = voices.find(v =>
            femaleKeywords.some(k => v.name.toLowerCase().includes(k))
        );
        if (anyFemale) return anyFemale;

        const enGB = voices.find(v => v.lang.startsWith('en-GB'));
        if (enGB) return enGB;

        return voices.find(v => v.lang.startsWith('en')) || null;
    }, []);

    // ── TTS: Tonal speech engine ──────────────────────────────────────────────
    const speakTonal = useCallback((text: string, tones?: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        const setVoiceAndSpeak = () => {
            const femaleVoice = pickFemaleVoice();
            if (femaleVoice) {
                utterance.voice = femaleVoice;
                // On native, standard voices might be different, logging for debug
                if (isCapacitor) console.log(`[NativeVoice] Speaking with: ${femaleVoice.name}`);
            }

            // ─── Tonal pitch simulation ───────────────────────────────────
            if (tones) {
                const parts = tones.split(/[-\s]+/);
                const highCount = parts.filter(t => t === 'H').length;
                const lowCount = parts.filter(t => t === 'L').length;
                if (highCount > lowCount) {
                    utterance.pitch = 1.25;
                } else if (lowCount > highCount) {
                    utterance.pitch = 0.85;
                } else {
                    utterance.pitch = 1.05;
                }
            } else {
                utterance.pitch = 1.05;
            }

            // ─── Human-like delivery params ───────────────────────────────
            utterance.rate = isCapacitor ? 0.85 : 0.80; // Slightly faster on native for responsiveness
            utterance.volume = 1.0;
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e) => {
                console.error('Speech synthesis error:', e);
                setIsSpeaking(false);
            };

            window.speechSynthesis.speak(utterance);
        };

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
        } else {
            setVoiceAndSpeak();
        }
    }, [pickFemaleVoice, isCapacitor]);

    const translateAndSpeak = useCallback((englishText: string) => {
        const found = findIbibioTranslation(englishText);
        if (found) {
            speakTonal(found.ibibio, found.tones || '');
            return found.ibibio;
        }
        speakTonal(englishText);
        return `[No Ibibio translation for "${englishText}"]`;
    }, [speakTonal]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearSilenceTimer();
            stopWaveform();
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch {}
            }
        };
    }, [clearSilenceTimer, stopWaveform]);

    return {
        isListening,
        transcript,
        interimTranscript,
        isSpeaking,
        confidence,
        detectedLang,
        retryCount,
        waveform,
        hasPermission,
        requestPermissions,
        startListening,
        stopListening,
        resetTranscript,
        speakTonal,
        translateAndSpeak,
        platform,
        isCapacitor
    };
}

