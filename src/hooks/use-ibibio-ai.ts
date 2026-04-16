'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { IBIBIO_DICTIONARY, findIbibioTranslation } from '@/lib/culture-data';

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
        Capacitor: any;
    }
}

export type TonalPattern = 'H' | 'L' | 'D' | string;

export function useIbibioAI() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const recognitionRef = useRef<any>(null);

    // Platform detection
    const isCapacitor = typeof window !== 'undefined' && !!window.Capacitor;
    const platform = isCapacitor ? window.Capacitor.getPlatform() : 'web';

    // Initialize Speech Recognition (English -> Ibibio bridge)
    useEffect(() => {
        if (typeof window !== 'undefined' && (window.webkitSpeechRecognition || window.SpeechRecognition)) {
            const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const result = event.results[0][0].transcript;
                setTranscript(result);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }
    }, []);

    /**
     * Explicit Permission Request
     * On Web, it uses standard navigator API.
     * On Android/iOS via Capacitor, it ensures the core mic permission is requested.
     */
    const requestPermissions = useCallback(async () => {
        try {
            if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // This triggers the native browser/app-view permission dialog
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                // Immediately stop the stream, we just validatd/requested permission
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

    const startListening = useCallback(async () => {
        if (!recognitionRef.current) {
            console.warn('Speech recognition not supported on this browser/platform.');
            return;
        }

        // Always check/ensure permission before starting, especially on native
        const granted = await requestPermissions();
        if (!granted) {
            console.warn('Microphone permission not granted.');
            return;
        }

        try {
            setTranscript('');
            setIsListening(true);
            recognitionRef.current.start();
        } catch (error) {
            console.error('Failed to start listening:', error);
            setIsListening(false);
        }
    }, [requestPermissions]);

    const stopListening = useCallback(() => {
        recognitionRef.current?.stop();
        setIsListening(false);
    }, []);

    /**
     * Pick the best female voice available on the device.
     * Priority: Nigerian English female → African female → Google UK English Female
     * → Microsoft female → any female → any en voice
     */
    const pickFemaleVoice = useCallback((): SpeechSynthesisVoice | null => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return null;
        
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return null;

        const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'hazel', 'susan',
            'samantha', 'victoria', 'karen', 'moira', 'tessa',
            'fiona', 'nicky', 'kate', 'ava', 'allison', 'joanna', 'salli', 'femi', 'ngozi'];

        // 1. Nigerian/African English Female
        const ngFemale = voices.find(v =>
            (v.lang.startsWith('en-NG') || v.lang.includes('NG'))
            && femaleKeywords.some(k => v.name.toLowerCase().includes(k))
        );
        if (ngFemale) return ngFemale;

        // 2. Any Nigerian voice
        const ngVoice = voices.find(v => v.lang.startsWith('en-NG'));
        if (ngVoice) return ngVoice;

        // 3. Google UK English Female (most natural)
        const googleUK = voices.find(v =>
            v.name === 'Google UK English Female'
        );
        if (googleUK) return googleUK;

        // 4. Microsoft Hazel / Zira (Windows)
        const msGood = voices.find(v =>
            v.name.toLowerCase().includes('hazel') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('aria')
        );
        if (msGood) return msGood;

        // 5. Any voice with "female" or a known female name
        const anyFemale = voices.find(v =>
            femaleKeywords.some(k => v.name.toLowerCase().includes(k))
        );
        if (anyFemale) return anyFemale;

        // 6. En-GB — usually warmer and less robotic than en-US
        const enGB = voices.find(v => v.lang.startsWith('en-GB'));
        if (enGB) return enGB;

        // 7. Fallback — first available English
        return voices.find(v => v.lang.startsWith('en')) || null;
    }, []);

    /**
     * Human-Like Tonal TTS Engine
     * Uses the best female voice with natural pitch, rate, and volume variation
     * to simulate Ibibio's tonal system with warmth instead of robotic delivery.
     */
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
        return `[Transcribing: ${englishText}]`;
    }, [speakTonal]);

    return {
        isListening,
        transcript,
        isSpeaking,
        hasPermission,
        requestPermissions,
        startListening,
        stopListening,
        speakTonal,
        translateAndSpeak,
        platform,
        isCapacitor
    };
}

