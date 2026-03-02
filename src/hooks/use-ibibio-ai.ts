'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { IBIBIO_DICTIONARY, findIbibioTranslation } from '@/lib/culture-data';

declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}

export type TonalPattern = 'H' | 'L' | 'D' | string;

export function useIbibioAI() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recognitionRef = useRef<any>(null);

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
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current) {
            setTranscript('');
            setIsListening(true);
            recognitionRef.current.start();
        }
    }, []);

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
        const voices = window.speechSynthesis.getVoices();
        if (!voices.length) return null;

        const femaleKeywords = ['female', 'woman', 'girl', 'zira', 'hazel', 'susan',
            'samantha', 'victoria', 'karen', 'moira', 'tessa',
            'fiona', 'nicky', 'kate', 'ava', 'allison', 'joanna', 'salli'];

        // 1. Nigerian/African English Female
        const ngFemale = voices.find(v =>
            (v.lang === 'en-NG' || v.lang.includes('NG'))
            && femaleKeywords.some(k => v.name.toLowerCase().includes(k))
        );
        if (ngFemale) return ngFemale;

        // 2. Any Nigerian voice
        const ngVoice = voices.find(v => v.lang === 'en-NG');
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
        const enGB = voices.find(v => v.lang === 'en-GB');
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

        // Wait for voices to load if needed, then pick best female voice
        const setVoiceAndSpeak = () => {
            const femaleVoice = pickFemaleVoice();
            if (femaleVoice) utterance.voice = femaleVoice;

            // ─── Tonal pitch simulation ───────────────────────────────────
            // H (High) = raise pitch, L (Low) = lower pitch, mix = neutral
            if (tones) {
                const parts = tones.split(/[-\s]+/);
                const highCount = parts.filter(t => t === 'H').length;
                const lowCount = parts.filter(t => t === 'L').length;

                if (highCount > lowCount) {
                    utterance.pitch = 1.25;  // Warm high — not squeaky
                } else if (lowCount > highCount) {
                    utterance.pitch = 0.85;  // Warm low — not monotone robot
                } else {
                    utterance.pitch = 1.05;  // Slightly above centre for warmth
                }
            } else {
                utterance.pitch = 1.05;
            }

            // ─── Human-like delivery params ───────────────────────────────
            utterance.rate = 0.80;  // Slightly slower — measured & clear
            utterance.volume = 1.0;   // Full volume

            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        };

        // Voices are loaded asynchronously in some browsers
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = setVoiceAndSpeak;
        } else {
            setVoiceAndSpeak();
        }
    }, [pickFemaleVoice]);

    const translateAndSpeak = useCallback((englishText: string) => {
        const found = findIbibioTranslation(englishText);

        if (found) {
            speakTonal(found.ibibio, found.tones || '');
            return found.ibibio;
        }

        // AI Fallback for unknown words — speak as-is
        speakTonal(englishText);
        return `[No Ibibio translation found for "${englishText}"]`;
    }, [speakTonal]);

    return {
        isListening,
        transcript,
        isSpeaking,
        startListening,
        stopListening,
        speakTonal,
        translateAndSpeak
    };
}
