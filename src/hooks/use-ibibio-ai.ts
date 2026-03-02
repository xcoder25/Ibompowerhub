'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { IBIBIO_DICTIONARY, findIbibioTranslation } from '@/lib/culture-data';

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
     * Tonal TTS Engine
     * Dynamically adjusts pitch to simulate Ibibio's tonal system
     */
    const speakTonal = useCallback((text: string, tones?: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        // Fallback: Using en-NG (Nigerian English) as it handles West African phonemes better
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const ngVoice = voices.find(v => v.lang === 'en-NG') || voices.find(v => v.lang.includes('en'));

        if (ngVoice) utterance.voice = ngVoice;

        // Tonal Simulation Logic:
        // H (High) = Pitch 1.4-1.6
        // L (Low) = Pitch 0.6-0.8
        // D (Downstep) = Pitch 1.0
        if (tones) {
            const parts = tones.split('-');
            // For short phrases, we modulate the overall pitch of the utterance 
            // based on the dominant tone to give it the "Ibibio feel"
            const highCount = parts.filter(t => t === 'H').length;
            const lowCount = parts.filter(t => t === 'L').length;

            if (highCount > lowCount) utterance.pitch = 1.3;
            else if (lowCount > highCount) utterance.pitch = 0.7;
            else utterance.pitch = 1.0;
        } else {
            utterance.pitch = 1.0;
        }

        utterance.rate = 0.85; // Slightly slower for clarity
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const translateAndSpeak = useCallback((englishText: string) => {
        const found = findIbibioTranslation(englishText);

        if (found) {
            speakTonal(found.ibibio, found.tones);
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
