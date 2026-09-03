'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Fingerprint, CheckCircle2, Loader2, Sparkles, Volume2, ShieldCheck, Zap, Database, ArrowRight, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIbibioAI } from '@/hooks/use-ibibio-ai';
import { processVoiceBankingIntent, VoiceBankingIntent } from '@/ai/flows/voice-banking-flow';

type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'CLARIFY' | 'BIOMETRICS' | 'SUCCESS' | 'INSIGHTS';

export function VoiceBankingWidget() {
    const [state, setState] = useState<VoiceState>('IDLE');
    const [actionPreview, setActionPreview] = useState<React.ReactNode>(null);
    const [clarificationIntent, setClarificationIntent] = useState<VoiceBankingIntent | null>(null);

    const {
        isListening,
        transcript,
        interimTranscript,
        confidence,
        detectedLang,
        retryCount,
        waveform,
        startListening,
        stopListening,
        resetTranscript,
        speakTonal
    } = useIbibioAI();

    // Use a ref to track when we should process so we don't double fire
    const shouldProcessRef = useRef(false);

    useEffect(() => {
        if (isListening) {
            setState('LISTENING');
            if (state !== 'CLARIFY') {
                setActionPreview(null);
            }
            shouldProcessRef.current = true;
        } else if (!isListening && transcript && shouldProcessRef.current) {
            shouldProcessRef.current = false;
            handleRealtimeIntent(transcript);
        } else if (!isListening && !transcript && state === 'LISTENING') {
            setState('IDLE');
        }
    }, [isListening, transcript]);

    const handleMicClick = () => {
        if (state === 'LISTENING') {
            stopListening();
        } else {
            resetTranscript();
            startListening();
        }
    };

    const cancelTransaction = () => {
        stopListening();
        resetTranscript();
        setState('IDLE');
        setActionPreview(null);
        setClarificationIntent(null);
        speakTonal("Transaction canceled.");
    };

    const handleRealtimeIntent = async (text: string) => {
        setState('PROCESSING');
        try {
            // If we are clarifying, we can combine the previous intent with the new input
            let query = text;
            if (clarificationIntent) {
                query = `Clarification: ${clarificationIntent.recipient || ''} ${clarificationIntent.amount || ''} -> User says: ${text}`;
            }

            const intent: VoiceBankingIntent = await processVoiceBankingIntent(query);

            if (intent.type === 'transfer') {
                if (intent.isAmbiguous) {
                    setState('CLARIFY');
                    setClarificationIntent(intent);
                    setActionPreview(
                        <div className="flex flex-col items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20 w-full text-center">
                                <div className="flex justify-center mb-2">
                                    <AlertTriangle className="h-5 w-5 text-amber-400 animate-bounce" />
                                </div>
                                <p className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">Details Needed</p>
                                <p className="text-white text-sm font-medium">{intent.spokenResponse}</p>
                            </div>
                            <div className="flex gap-2 w-full">
                                <Button
                                    onClick={() => {
                                        resetTranscript();
                                        startListening();
                                    }}
                                    className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs rounded-xl py-2.5 h-auto flex items-center justify-center gap-1.5"
                                >
                                    <Mic className="h-3.5 w-3.5" /> Speak Answer
                                </Button>
                                <Button
                                    onClick={cancelTransaction}
                                    variant="ghost"
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-xl py-2.5 h-auto"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    );
                    speakTonal(intent.spokenResponse);
                    return;
                }

                // Regular transfer processing with Biometrics
                setState('BIOMETRICS');
                setClarificationIntent(null);
                setActionPreview(
                    <div className="flex flex-col items-center gap-2 w-full animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/20 w-full mb-2">
                            <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30">
                                <ArrowRight className="h-5 w-5 text-emerald-400 animate-pulse" />
                            </div>
                            <div className="text-left flex-1 border-r border-white/10 pr-4">
                                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">Intent Detected</p>
                                <p className="text-white font-semibold text-sm">Transfer ₦{intent.amount?.toLocaleString() || '...'}</p>
                            </div>
                            <div className="text-left pl-2">
                                <p className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-0.5">To ({intent.bank || 'Bank'})</p>
                                <p className="text-white font-semibold text-sm truncate max-w-[90px]">{intent.recipient || 'Unknown'}</p>
                            </div>
                        </div>
                        <Badge className="bg-amber-500/20 text-amber-300 border-none px-3 py-1 animate-pulse">Voice-Print 2FA Securing</Badge>
                        <p className="text-white/60 text-xs text-center mt-2 max-w-[250px]">
                            {intent.spokenResponse}
                        </p>
                    </div>
                );
                speakTonal(intent.spokenResponse);

                // Simulate biometric signature analysis and success trigger
                setTimeout(() => {
                    setState('SUCCESS');
                    speakTonal("Voice Biometrics Verified. Transfer Successful.");
                    setActionPreview(
                        <div className="flex flex-col items-center gap-3 w-full animate-in fade-in zoom-in duration-500 relative">
                            {/* Confetti simulator */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 pointer-events-none opacity-60">
                                <div className="absolute top-0 left-0 w-2 h-2 bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '0.1s' }} />
                                <div className="absolute top-10 right-4 w-3.5 h-3.5 bg-yellow-400 rotate-45 animate-bounce" />
                                <div className="absolute bottom-4 left-6 w-2 h-4 bg-sky-400 rotate-12 animate-pulse" />
                                <div className="absolute bottom-10 right-8 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-60 rounded-full animate-pulse" />
                                <div className="bg-emerald-500 p-4 rounded-full relative z-10 shadow-lg shadow-emerald-500/50 border-2 border-emerald-300">
                                    <CheckCircle2 className="h-10 w-10 text-white animate-[bounce_1s_infinite]" />
                                </div>
                            </div>
                            <div className="text-center mt-2 bg-white/5 border border-white/10 rounded-2xl p-4 w-full">
                                <h3 className="text-white font-bold text-base mb-0.5">Transfer Successful</h3>
                                <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-2">Voice Verified ✓</p>
                                <div className="flex justify-between text-xs border-t border-white/5 pt-2 text-slate-400">
                                    <span>Recipient:</span>
                                    <span className="text-white font-semibold">{intent.recipient}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Bank:</span>
                                    <span className="text-white font-semibold">{intent.bank || 'Main Bank'}</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-400 mt-1">
                                    <span>Amount:</span>
                                    <span className="text-emerald-400 font-bold">₦{intent.amount?.toLocaleString()}</span>
                                </div>
                            </div>
                            <Button
                                onClick={cancelTransaction}
                                className="mt-2 bg-slate-800 hover:bg-slate-700 text-white text-xs py-1.5 px-4 h-auto rounded-xl"
                            >
                                Done
                            </Button>
                        </div>
                    );
                }, 4000);

            } else if (intent.type === 'insight') {
                setState('INSIGHTS');
                setActionPreview(
                    <div className="flex flex-col items-center gap-2 w-full animate-in fade-in pb-4">
                        <div className="flex items-center gap-2 text-sky-300 text-xs uppercase tracking-widest font-bold mb-2">
                            <Database className="h-4 w-4 animate-pulse" /> Text-to-SQL Engine
                        </div>
                        <code className="bg-black/50 text-sky-300 p-3.5 rounded-xl text-xs border border-sky-500/20 w-full overflow-hidden text-left font-mono mb-2 break-all leading-normal">
                            {intent.sqlQuery}
                        </code>
                        <div className="bg-sky-500/10 border border-sky-500/20 w-full p-5 rounded-3xl relative overflow-hidden mt-2">
                            <div className="absolute right-[-10%] top-[-10%] opacity-10 text-sky-400 scale-150 rotate-12 pointer-events-none">
                                <Zap className="h-32 w-32" />
                            </div>
                            <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-3 text-[9px] font-bold">Audio CFO Insight</Badge>
                            <h3 className="text-white font-black text-3xl tracking-tight mb-2">{intent.insightAnswer || '₦...'}</h3>
                            <p className="text-sky-200/90 text-sm font-medium leading-relaxed">{intent.spokenResponse}</p>
                        </div>
                        <div className="flex items-center gap-2 text-white/50 text-xs font-semibold bg-white/5 px-4 py-2 rounded-full mt-2 border border-white/5">
                            <Volume2 className="h-3.5 w-3.5 text-sky-400 animate-pulse" /> ElevenLabs Voice Synth
                        </div>
                    </div>
                );
                speakTonal(intent.spokenResponse);
            } else {
                setState('IDLE');
                setActionPreview(
                    <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-2xl w-full">
                        <p className="text-red-400 text-sm font-medium">{intent.spokenResponse}</p>
                    </div>
                );
                speakTonal(intent.spokenResponse);
            }
        } catch (error) {
            console.error("Agent processing failed", error);
            setState('IDLE');
        }
    };

    const getLangLabel = (code: string) => {
        switch (code) {
            case 'en-NG': return '🇳🇬 English (NG)';
            case 'ha-NG': return '🇳🇬 Hausa';
            case 'yo-NG': return '🇳🇬 Yoruba';
            case 'ig-NG': return '🇳🇬 Igbo';
            case 'en-GB': return '🇬🇧 UK English';
            default: return '🎙️ Dialect: NG';
        }
    };

    return (
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-[#0B1121] rounded-2xl sm:rounded-[2rem] col-span-1 lg:col-span-2 group">
            {/* Visual background rings */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-br from-emerald-600/15 via-teal-600/10 to-sky-600/15 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02] mix-blend-overlay" />
            </div>

            <CardContent className="relative z-10 p-4 sm:p-7 md:p-9 flex flex-col md:flex-row items-center gap-5 md:gap-8">

                <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-3">
                        <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors px-2.5 py-0.5 font-bold tracking-widest uppercase text-[9px] sm:text-[10px]">
                            <Sparkles className="h-3 w-3 mr-1 text-emerald-400" /> Edge Voice AI
                        </Badge>
                        <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold">
                            {getLangLabel(detectedLang)}
                        </Badge>
                    </div>

                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                        Dialect-Aware <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">Voice Banking</span>
                    </h2>

                    <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-3 md:mb-6 max-w-md mx-auto md:mx-0 font-medium">
                        Speak naturally in English, Yoruba, Igbo, Hausa, or Pidgin. Authorize transfers with your unique voice print and get instant Audio CFO insights.
                    </p>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Voice 2FA
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                            <Zap className="h-3 w-3 text-amber-400" /> AI Agent
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleRealtimeIntent("how much did I spend on fuel this month?")}>
                            <Database className="h-3 w-3 text-sky-400" /> Test SQL
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-auto md:min-w-[280px] max-w-sm flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px] bg-slate-900/50 border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 relative shadow-inner">
                    
                    {/* Live Match Accuracy Meter / Status indicator */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        {confidence > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-black/50 border border-white/10">
                                <span className={cn(
                                    "h-1.5 w-1.5 rounded-full",
                                    confidence >= 0.8 ? "bg-emerald-400 animate-pulse" :
                                    confidence >= 0.55 ? "bg-amber-400" : "bg-red-500 animate-pulse"
                                )} />
                                <span className="text-white/80">{Math.round(confidence * 100)}%</span>
                            </div>
                        )}
                        {retryCount > 0 && (
                            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] animate-pulse">
                                <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" /> #{retryCount}
                            </Badge>
                        )}
                    </div>

                    <div className="h-[130px] sm:h-[150px] w-full flex items-center justify-center mb-3 overflow-hidden relative">
                        {actionPreview ? (
                            <div className="w-full">{actionPreview}</div>
                        ) : state === 'LISTENING' ? (
                            <div className="flex flex-col items-center gap-2 sm:gap-3 w-full">
                                {/* Waveform Visualizer */}
                                <div className="flex items-center gap-[2px] sm:gap-[3px] h-12 justify-center w-full">
                                    {waveform.bars.map((bar, i) => (
                                        <div
                                            key={i}
                                            className="w-[2.5px] sm:w-[3px] rounded-full bg-gradient-to-t from-emerald-500 to-teal-400 transition-all duration-75"
                                            style={{
                                                height: `${Math.max(8, bar)}%`,
                                                opacity: 0.3 + (bar / 100) * 0.7
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="text-center px-3 w-full max-h-20 overflow-y-auto">
                                    {transcript ? (
                                        <p className="text-white text-xs sm:text-sm font-semibold leading-relaxed">
                                            "{transcript}"
                                            {interimTranscript && (
                                                <span className="text-emerald-400/80 italic font-normal"> {interimTranscript}</span>
                                            )}
                                        </p>
                                    ) : interimTranscript ? (
                                        <p className="text-emerald-400/90 text-xs sm:text-sm font-medium italic">
                                            "{interimTranscript}"
                                        </p>
                                    ) : (
                                        <p className="text-emerald-400 font-bold uppercase tracking-widest text-[11px] animate-pulse">
                                            Listening...
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Mic className="h-7 w-7 text-slate-500 mb-1.5 mx-auto" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">
                                    Tap Mic to Command
                                </p>
                                <p className="text-slate-500 text-[11px] mt-0.5 max-w-[200px]">
                                    e.g., "Send ₦5,000 to Udeme" or "Check fuel expense"
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        {state === 'LISTENING' && (
                            <>
                                <div className="absolute inset-0 rounded-full border border-emerald-500/30 scale-[1.3] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute inset-0 rounded-full border border-teal-500/20 scale-[1.6] animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                                <div className="absolute inset-0 rounded-full border border-sky-500/10 scale-[1.9] animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />
                            </>
                        )}

                        <Button
                            onClick={handleMicClick}
                            className={cn(
                                "relative z-10 w-16 h-16 sm:w-18 sm:h-18 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center overflow-hidden border",
                                state === 'IDLE'
                                    ? "bg-slate-800 hover:bg-slate-700 border-white/10 hover:scale-105"
                                    : state === 'SUCCESS' || state === 'INSIGHTS'
                                        ? "bg-emerald-600 border-emerald-400"
                                        : state === 'BIOMETRICS'
                                            ? "bg-amber-600 border-amber-400 shadow-[0_0_40px_rgba(217,119,6,0.4)] animate-pulse"
                                            : state === 'CLARIFY'
                                                ? "bg-amber-500 border-amber-300"
                                                : "bg-emerald-500 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.35)]"
                            )}
                        >
                            {state === 'IDLE' && <Mic className="h-6 w-6 sm:h-7 sm:w-7 text-white" />}
                            {state === 'LISTENING' && (
                                <div className="w-3.5 h-3.5 bg-white rounded-full animate-ping" />
                            )}
                            {state === 'PROCESSING' && <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 text-white animate-spin" />}
                            {state === 'BIOMETRICS' && <Fingerprint className="h-6 w-6 sm:h-7 sm:w-7 text-white animate-pulse" />}
                            {state === 'CLARIFY' && <AlertTriangle className="h-6 w-6 sm:h-7 sm:w-7 text-white" />}
                            {(state === 'SUCCESS' || state === 'INSIGHTS') && <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-white" />}
                        </Button>
                    </div>

                </div>

            </CardContent>
        </Card>
    );
}
