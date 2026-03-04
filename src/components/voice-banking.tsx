'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Fingerprint, CheckCircle2, Loader2, Sparkles, Volume2, ShieldCheck, Zap, Database, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIbibioAI } from '@/hooks/use-ibibio-ai';
import { processVoiceBankingIntent, VoiceBankingIntent } from '@/ai/flows/voice-banking-flow';

type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'BIOMETRICS' | 'SUCCESS' | 'INSIGHTS';

export function VoiceBankingWidget() {
    const [state, setState] = useState<VoiceState>('IDLE');
    const [actionPreview, setActionPreview] = useState<React.ReactNode>(null);
    const { isListening, transcript, startListening, stopListening, translateAndSpeak, speakTonal } = useIbibioAI();

    // Use a ref to track when we should process so we don't double fire
    const shouldProcessRef = useRef(false);

    useEffect(() => {
        if (isListening) {
            setState('LISTENING');
            setActionPreview(null);
            shouldProcessRef.current = true;
        } else if (!isListening && transcript && shouldProcessRef.current) {
            // Speech ended, process using AI
            shouldProcessRef.current = false;
            handleRealtimeIntent(transcript);
        } else if (!isListening && !transcript) {
            setState('IDLE');
        }
    }, [isListening, transcript]);

    const handleMicClick = () => {
        if (state === 'IDLE' || state === 'SUCCESS' || state === 'INSIGHTS') {
            startListening();
        } else {
            stopListening();
            setState('IDLE');
        }
    };

    const handleRealtimeIntent = async (text: string) => {
        setState('PROCESSING');
        try {
            const intent: VoiceBankingIntent = await processVoiceBankingIntent(text);

            if (intent.type === 'transfer') {
                setState('BIOMETRICS');
                setActionPreview(
                    <div className="flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/20 w-full mb-2">
                            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                                <ArrowRight className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="text-left flex-1 border-r border-white/10 pr-4">
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">Intent Detected</p>
                                <p className="text-white font-semibold text-sm">Transfer ₦{intent.amount?.toLocaleString() || '...'}</p>
                            </div>
                            <div className="text-left pl-2">
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-0.5">To</p>
                                <p className="text-white font-semibold text-sm truncate max-w-[80px]">{intent.recipient || 'Unknown'}</p>
                            </div>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-300 border-none px-3 py-1">Voice-Print 2FA Required</Badge>
                        <p className="text-white/60 text-xs text-center mt-2 max-w-[250px]">
                            {intent.spokenResponse}
                        </p>
                    </div>
                );
                speakTonal(intent.spokenResponse);

                // Simulate biometric delay then success
                setTimeout(() => {
                    setState('SUCCESS');
                    speakTonal("Voice Biometrics Verified. Transfer Successful.");
                    setActionPreview(
                        <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50 rounded-full animate-pulse" />
                                <div className="bg-emerald-500 p-4 rounded-full relative z-10 shadow-lg shadow-emerald-500/50">
                                    <CheckCircle2 className="h-10 w-10 text-white" />
                                </div>
                            </div>
                            <div className="text-center mt-2">
                                <h3 className="text-white font-bold text-xl mb-1">Transfer Successful</h3>
                                <p className="text-emerald-300 text-sm font-medium">Voice Biometrics Verified</p>
                            </div>
                        </div>
                    );
                }, 4000);

            } else if (intent.type === 'insight') {
                setState('INSIGHTS');
                setActionPreview(
                    <div className="flex flex-col items-center gap-2 animate-in fade-in pb-4">
                        <div className="flex items-center gap-2 text-sky-300 text-xs uppercase tracking-widest font-bold mb-2">
                            <Database className="h-4 w-4" /> Text-to-SQL Engine
                        </div>
                        <code className="bg-black/40 text-sky-200 p-3 rounded-xl text-xs sm:text-sm border border-sky-500/20 w-full overflow-hidden text-left font-mono mb-2">
                            {intent.sqlQuery?.split('WHERE').map((part, i) => (
                                <span key={i}>
                                    {i === 1 ? <><br /><span className="text-pink-400">WHERE</span></> : ''}
                                    {part}
                                </span>
                            ))}
                        </code>
                        <div className="bg-sky-500/20 border border-sky-500/30 w-full p-5 rounded-3xl relative overflow-hidden mt-2">
                            <div className="absolute right-[-10%] top-[-10%] opacity-10 text-sky-400 scale-150 rotate-12">
                                <Zap className="h-32 w-32" />
                            </div>
                            <Badge className="bg-sky-500 text-white border-none mb-3">Audio CFO</Badge>
                            <h3 className="text-white font-black text-3xl tracking-tight mb-1">{intent.insightAnswer || '₦...'}</h3>
                            <p className="text-sky-200 text-sm font-medium">{intent.spokenResponse}</p>
                        </div>
                        <div className="flex items-center gap-2 text-white/50 text-xs font-semibold bg-white/5 px-4 py-2 rounded-full mt-2">
                            <Volume2 className="h-3.5 w-3.5" /> ElevenLabs TTS Synthesizing...
                        </div>
                    </div>
                );
                speakTonal(intent.spokenResponse);
            } else {
                setState('IDLE');
                speakTonal(intent.spokenResponse);
            }
        } catch (error) {
            console.error("Agent processing failed", error);
            setState('IDLE');
        }
    };

    return (
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-[#0B1121] rounded-[2rem] col-span-1 lg:col-span-2 group">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-emerald-600/20 via-sky-600/20 to-indigo-600/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
            </div>

            <CardContent className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center gap-10">

                <div className="flex-1 text-center md:text-left">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors mb-4 px-3 py-1 font-bold tracking-widest uppercase text-[10px]">
                        <Sparkles className="h-3 w-3 mr-1.5" /> Edge Voice AI
                    </Badge>

                    <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                        Dialect-Aware <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">Voice Banking</span>
                    </h2>

                    <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-md mx-auto md:mx-0 font-medium">
                        Speak naturally in English, Yoruba, Igbo, Hausa, or Pidgin. Authorize transfers with your unique voice print, and ask your "Audio CFO" for insights.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Voice 2FA
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                            <Zap className="h-3.5 w-3.5 text-amber-400" /> AI LLM Agent
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleRealtimeIntent("how much did I spend on fuel this month?")}>
                            <Database className="h-3.5 w-3.5 text-sky-400" /> Test SQL Demo
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center min-h-[300px]">

                    <div className="h-[200px] w-full flex items-end justify-center mb-6">
                        {actionPreview}
                        {state === 'LISTENING' && transcript && (
                            <p className="text-white text-lg font-serif italic text-center animate-in fade-in slide-in-from-bottom-2">
                                "{transcript}"
                            </p>
                        )}
                        {state === 'LISTENING' && !transcript && (
                            <p className="text-emerald-400 font-bold uppercase tracking-widest animate-pulse text-sm">
                                Listening...
                            </p>
                        )}
                        {state === 'IDLE' && (
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                                Tap the microphone
                            </p>
                        )}
                    </div>

                    <div className="relative">
                        {state !== 'IDLE' && state !== 'SUCCESS' && state !== 'INSIGHTS' && (
                            <>
                                <div className="absolute inset-0 rounded-full border border-emerald-500/30 scale-[1.3] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute inset-0 rounded-full border border-teal-500/20 scale-[1.6] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute inset-0 rounded-full border border-sky-500/10 scale-[1.9] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            </>
                        )}

                        <Button
                            onClick={handleMicClick}
                            className={cn(
                                "relative z-10 w-24 h-24 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center overflow-hidden",
                                state === 'IDLE'
                                    ? "bg-slate-800 hover:bg-slate-700 hover:scale-105 border border-white/10"
                                    : state === 'SUCCESS' || state === 'INSIGHTS'
                                        ? "bg-emerald-600 scale-100 border border-emerald-400"
                                        : state === 'BIOMETRICS'
                                            ? "bg-amber-600 scale-110 border-2 border-amber-400 shadow-[0_0_50px_rgba(217,119,6,0.5)]"
                                            : "bg-emerald-500 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.4)]"
                            )}
                        >
                            {state === 'IDLE' && <Mic className="h-10 w-10 text-white" />}
                            {state === 'LISTENING' && (
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="w-1.5 bg-white rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }} />
                                    ))}
                                </div>
                            )}
                            {state === 'PROCESSING' && <Loader2 className="h-10 w-10 text-white animate-spin" />}
                            {state === 'BIOMETRICS' && <Fingerprint className="h-10 w-10 text-white animate-pulse" />}
                            {(state === 'SUCCESS' || state === 'INSIGHTS') && <CheckCircle2 className="h-10 w-10 text-white" />}
                        </Button>
                    </div>

                </div>

            </CardContent>
        </Card>
    );
}
