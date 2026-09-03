'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Mic, Fingerprint, CheckCircle2, Loader2, Sparkles, Volume2,
    ShieldCheck, Zap, Database, ArrowRight, AlertTriangle, RefreshCw,
    X, Languages, Globe2, ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useIbibioAI } from '@/hooks/use-ibibio-ai';
import { processVoiceBankingIntent, VoiceBankingIntent } from '@/ai/flows/voice-banking-flow';

// ─── Dialect options ──────────────────────────────────────────────────────────
type DialectMode = 'auto' | 'ibibio' | 'pidgin' | 'english';
const DIALECT_OPTIONS: { mode: DialectMode; label: string; flag: string; color: string }[] = [
    { mode: 'auto',    label: 'Auto',    flag: '🤖', color: 'from-emerald-500 to-teal-400' },
    { mode: 'ibibio',  label: 'Ibibio',  flag: '🌿', color: 'from-green-600 to-emerald-500' },
    { mode: 'pidgin',  label: 'Pidgin',  flag: '🇳🇬', color: 'from-green-700 to-green-500' },
    { mode: 'english', label: 'English', flag: '🇬🇧', color: 'from-blue-600 to-indigo-500' },
];

// ─── Sample prompt chips ──────────────────────────────────────────────────────
const PROMPT_CHIPS: { label: string; query: string; dialect: string }[] = [
    { label: 'Nọ Bassey tosin ition', query: 'no okuk tosin ition to Bassey', dialect: 'ibibio' },
    { label: 'Check balance', query: 'check my balance', dialect: 'english' },
    { label: 'Lock my card sharp', query: 'lock my card sharp sharp', dialect: 'pidgin' },
    { label: 'Fuel spend?', query: 'how much did I spend on fuel this month?', dialect: 'english' },
    { label: 'Abeg send 10k Kufre', query: 'abeg transfer 10k to Kufre OPay', dialect: 'pidgin' },
    { label: 'Nse akpa mi', query: 'nse akpa mi', dialect: 'ibibio' },
];

type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'CLARIFY' | 'BIOMETRICS' | 'SUCCESS' | 'INSIGHTS';

export function VoiceBankingWidget() {
    const [state, setState] = useState<VoiceState>('IDLE');
    const [actionPreview, setActionPreview] = useState<React.ReactNode>(null);
    const [clarificationIntent, setClarificationIntent] = useState<VoiceBankingIntent | null>(null);
    const [dialect, setDialect] = useState<DialectMode>('auto');
    const [detectedBankDialect, setDetectedBankDialect] = useState<string | null>(null);
    const [lastResponse, setLastResponse] = useState<{ spoken: string; translation?: string } | null>(null);

    const {
        isListening, transcript, interimTranscript, confidence,
        detectedLang, retryCount, waveform,
        startListening, stopListening, resetTranscript, speakTonal,
    } = useIbibioAI();

    const shouldProcessRef = useRef(false);

    useEffect(() => {
        if (isListening) {
            setState('LISTENING');
            if (state !== 'CLARIFY') setActionPreview(null);
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
        setLastResponse(null);
        speakTonal('Action cancelled. No wahala.');
    };

    const handleRealtimeIntent = async (text: string) => {
        setState('PROCESSING');
        try {
            let query = text;
            if (clarificationIntent) {
                query = `Clarification for previous: ${clarificationIntent.recipient || ''} ${clarificationIntent.amount || ''} -> User says: ${text}`;
            }

            const intent: VoiceBankingIntent = await processVoiceBankingIntent(query, null, dialect !== 'auto' ? dialect : undefined);
            setDetectedBankDialect(intent.detectedDialect);
            setLastResponse({ spoken: intent.spokenResponse, translation: intent.englishTranslation });

            if (intent.type === 'transfer') {
                if (intent.isAmbiguous) {
                    setState('CLARIFY');
                    setClarificationIntent(intent);
                    setActionPreview(
                        <div className="flex flex-col items-center gap-2.5 w-full animate-in fade-in slide-in-from-bottom-4">
                            <div className="bg-amber-500/10 p-3.5 rounded-2xl border border-amber-500/20 w-full text-center">
                                <div className="flex justify-center mb-1.5">
                                    <AlertTriangle className="h-5 w-5 text-amber-400 animate-bounce" />
                                </div>
                                <p className="text-amber-400 font-bold text-[10px] uppercase tracking-wider mb-1">Details Needed</p>
                                <p className="text-white text-xs font-medium leading-relaxed">{intent.spokenResponse}</p>
                                {intent.englishTranslation && (
                                    <p className="text-white/40 text-[10px] mt-1 italic">{intent.englishTranslation}</p>
                                )}
                            </div>
                            <div className="flex gap-2 w-full">
                                <Button
                                    onClick={() => { resetTranscript(); startListening(); }}
                                    className="flex-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs rounded-xl h-9 flex items-center justify-center gap-1.5"
                                >
                                    <Mic className="h-3 w-3" /> Speak Answer
                                </Button>
                                <Button
                                    onClick={cancelTransaction}
                                    variant="ghost"
                                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs rounded-xl h-9 px-3"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    );
                    speakTonal(intent.spokenResponse);
                    return;
                }

                setState('BIOMETRICS');
                setClarificationIntent(null);
                setActionPreview(
                    <div className="flex flex-col items-center gap-2 w-full animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-2.5 bg-white/10 p-3 rounded-2xl border border-white/20 w-full mb-1">
                            <div className="bg-emerald-500/20 p-1.5 rounded-xl border border-emerald-500/30 flex-shrink-0">
                                <ArrowRight className="h-4 w-4 text-emerald-400 animate-pulse" />
                            </div>
                            <div className="text-left flex-1 border-r border-white/10 pr-3">
                                <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider mb-0.5">Transfer</p>
                                <p className="text-white font-semibold text-sm">₦{intent.amount?.toLocaleString()}</p>
                            </div>
                            <div className="text-left pl-2 min-w-0">
                                <p className="text-[9px] text-white/50 font-bold uppercase tracking-wider mb-0.5">{intent.bank || 'Bank'}</p>
                                <p className="text-white font-semibold text-xs truncate max-w-[80px]">{intent.recipient || 'Unknown'}</p>
                            </div>
                        </div>
                        <p className="text-white/60 text-[11px] text-center leading-relaxed max-w-[220px]">{intent.spokenResponse}</p>
                        {intent.englishTranslation && (
                            <p className="text-white/30 text-[10px] text-center italic">{intent.englishTranslation}</p>
                        )}
                        <Badge className="bg-amber-500/20 text-amber-300 border-none px-2.5 py-0.5 animate-pulse text-[10px]">
                            <Fingerprint className="h-3 w-3 mr-1" /> Voice-Print 2FA Verifying
                        </Badge>
                    </div>
                );
                speakTonal(intent.spokenResponse);

                setTimeout(() => {
                    setState('SUCCESS');
                    speakTonal('Idoho! Voice Biometrics Verified. Transfer Successful. Sosong!');
                    setActionPreview(
                        <div className="flex flex-col items-center gap-2.5 w-full animate-in fade-in zoom-in duration-500 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 pointer-events-none opacity-50">
                                <div className="absolute top-0 left-0 w-2 h-2 bg-pink-500 rounded-full animate-ping" style={{ animationDelay: '0.1s' }} />
                                <div className="absolute top-8 right-4 w-3 h-3 bg-yellow-400 rotate-45 animate-bounce" />
                                <div className="absolute bottom-4 left-5 w-2 h-4 bg-sky-400 rotate-12 animate-pulse" />
                                <div className="absolute bottom-8 right-6 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }} />
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-60 rounded-full animate-pulse" />
                                <div className="bg-emerald-500 p-3.5 rounded-full relative z-10 shadow-lg shadow-emerald-500/50 border-2 border-emerald-300">
                                    <CheckCircle2 className="h-8 w-8 text-white animate-[bounce_1s_infinite]" />
                                </div>
                            </div>
                            <div className="text-center mt-1 bg-white/5 border border-white/10 rounded-2xl p-3 w-full">
                                <h3 className="text-white font-bold text-sm mb-0.5">Transfer Successful</h3>
                                <p className="text-emerald-400 text-[9px] font-bold uppercase tracking-wider mb-2">Voice Verified ✓ Idoho!</p>
                                <div className="flex justify-between text-[11px] border-t border-white/5 pt-1.5 text-slate-400">
                                    <span>To:</span>
                                    <span className="text-white font-semibold">{intent.recipient}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                                    <span>Bank:</span>
                                    <span className="text-white font-semibold">{intent.bank || 'Main Bank'}</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                                    <span>Amount:</span>
                                    <span className="text-emerald-400 font-bold">₦{intent.amount?.toLocaleString()}</span>
                                </div>
                            </div>
                            <Button
                                onClick={cancelTransaction}
                                className="mt-1 bg-slate-800 hover:bg-slate-700 text-white text-xs py-1.5 px-4 h-8 rounded-xl"
                            >
                                Done
                            </Button>
                        </div>
                    );
                }, 3500);

            } else if (intent.type === 'insight') {
                setState('INSIGHTS');
                setActionPreview(
                    <div className="flex flex-col items-center gap-2 w-full animate-in fade-in">
                        <div className="flex items-center gap-2 text-sky-300 text-[10px] uppercase tracking-widest font-bold mb-1">
                            <Database className="h-3.5 w-3.5 animate-pulse" /> Audio CFO — Text-to-SQL
                        </div>
                        <code className="bg-black/50 text-sky-300 p-2.5 rounded-xl text-[10px] border border-sky-500/20 w-full overflow-hidden text-left font-mono break-all leading-normal">
                            {intent.sqlQuery}
                        </code>
                        <div className="bg-sky-500/10 border border-sky-500/20 w-full p-3.5 rounded-2xl relative overflow-hidden mt-1">
                            <div className="absolute right-[-10%] top-[-10%] opacity-10 text-sky-400 scale-150 rotate-12 pointer-events-none">
                                <Zap className="h-24 w-24" />
                            </div>
                            <Badge className="bg-sky-500/20 text-sky-300 border border-sky-500/30 mb-2 text-[9px] font-bold">
                                {intent.insightCategory} • {intent.insightPeriod || 'This Month'}
                            </Badge>
                            <h3 className="text-white font-black text-2xl tracking-tight mb-1">{intent.insightAnswer || '₦...'}</h3>
                            <p className="text-sky-200/90 text-xs font-medium leading-relaxed">{intent.spokenResponse}</p>
                            {intent.englishTranslation && (
                                <p className="text-white/30 text-[10px] mt-1 italic">{intent.englishTranslation}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-white/50 text-[10px] font-semibold bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <Volume2 className="h-3 w-3 text-sky-400 animate-pulse" /> Voice Synthesis Active
                        </div>
                    </div>
                );
                speakTonal(intent.spokenResponse);

            } else if (intent.type === 'balance') {
                setState('IDLE');
                setActionPreview(
                    <div className="flex flex-col items-center gap-2 w-full animate-in fade-in">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 w-full p-4 rounded-2xl text-center">
                            <p className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Live Balance</p>
                            <h3 className="text-white font-black text-2xl mb-1">₦42,500.00</h3>
                            <p className="text-slate-400 text-xs">{intent.spokenResponse}</p>
                            {intent.englishTranslation && (
                                <p className="text-white/30 text-[10px] mt-1 italic">{intent.englishTranslation}</p>
                            )}
                        </div>
                        <Button onClick={cancelTransaction} className="mt-1 bg-slate-800 hover:bg-slate-700 text-white text-xs h-8 px-4 rounded-xl">Done</Button>
                    </div>
                );
                speakTonal(intent.spokenResponse);

            } else if (intent.type === 'freeze_card' || intent.type === 'unfreeze_card') {
                setState('SUCCESS');
                const frozen = intent.type === 'freeze_card';
                setActionPreview(
                    <div className="flex flex-col items-center gap-2 w-full animate-in fade-in">
                        <div className={cn("p-3.5 rounded-full border-2", frozen ? "bg-red-500/20 border-red-400" : "bg-emerald-500/20 border-emerald-400")}>
                            <ShieldCheck className={cn("h-8 w-8", frozen ? "text-red-400" : "text-emerald-400")} />
                        </div>
                        <p className="text-white font-bold text-sm">{frozen ? 'Card Locked 🔒' : 'Card Unlocked 🔓'}</p>
                        <p className="text-slate-400 text-xs text-center leading-relaxed max-w-[200px]">{intent.spokenResponse}</p>
                        {intent.englishTranslation && (
                            <p className="text-white/30 text-[10px] text-center italic">{intent.englishTranslation}</p>
                        )}
                        <Button onClick={cancelTransaction} className="mt-1 bg-slate-800 hover:bg-slate-700 text-white text-xs h-8 px-4 rounded-xl">Done</Button>
                    </div>
                );
                speakTonal(intent.spokenResponse);

            } else if (intent.type === 'greeting') {
                setState('IDLE');
                speakTonal(intent.spokenResponse);
                setActionPreview(
                    <div className="text-center p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl w-full">
                        <p className="text-emerald-400 text-sm font-bold">Emedi! 👋</p>
                        <p className="text-slate-300 text-xs mt-1">{intent.spokenResponse}</p>
                    </div>
                );

            } else {
                setState('IDLE');
                setActionPreview(
                    <div className="text-center p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl w-full">
                        <p className="text-red-400 text-xs font-medium leading-relaxed">{intent.spokenResponse}</p>
                    </div>
                );
                speakTonal(intent.spokenResponse);
            }
        } catch (error) {
            console.error('Agent processing failed', error);
            setState('IDLE');
        }
    };

    const dialectInfo = DIALECT_OPTIONS.find(d => d.mode === dialect) || DIALECT_OPTIONS[0];

    const dialectBadgeLabel = () => {
        if (!detectedBankDialect) return '🎙️ Dialect: Auto';
        const labels: Record<string, string> = {
            ibibio: '🌿 Ibibio / Annang',
            pidgin: '🇳🇬 Nigerian Pidgin',
            english: '🇬🇧 English (NG)',
            'code-switching': '🔀 Code-Switching',
        };
        return labels[detectedBankDialect] || '🎙️ Dialect: NG';
    };

    return (
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-[#080E1C] rounded-2xl sm:rounded-[2rem]">
            {/* Background ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-br from-emerald-600/12 via-teal-600/8 to-sky-600/12 blur-[140px] rounded-full" />
                <div className="absolute bottom-0 right-0 w-48 h-48 bg-green-700/10 rounded-full blur-[80px]" />
            </div>

            <CardContent className="relative z-10 p-4 sm:p-6 md:p-8">

                {/* ── Header ────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5">
                            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 font-bold tracking-widest uppercase text-[9px]">
                                <Sparkles className="h-2.5 w-2.5 mr-1" /> Orion Voice AI
                            </Badge>
                            <Badge className="bg-white/5 text-slate-300 border border-white/10 px-2.5 py-0.5 text-[9px] font-bold">
                                {dialectBadgeLabel()}
                            </Badge>
                            {detectedBankDialect && (
                                <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-0.5 text-[9px] font-bold">
                                    <Languages className="h-2.5 w-2.5 mr-1" /> Dialect Active
                                </Badge>
                            )}
                        </div>

                        <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                            Dialect-Aware{' '}
                            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 bg-clip-text text-transparent">
                                Voice Banking
                            </span>
                        </h2>

                        <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                            Speak in Ibibio, Pidgin, or English. Orion understands and responds in your dialect.
                        </p>
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap sm:flex-col gap-1.5 sm:items-end">
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                            <ShieldCheck className="h-3 w-3 text-emerald-400" /> Voice 2FA
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                            <Globe2 className="h-3 w-3 text-purple-400" /> 3 Dialects
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                            <Database className="h-3 w-3 text-sky-400" /> Audio CFO
                        </div>
                    </div>
                </div>

                {/* ── Dialect Selector ──────────────────────────────────── */}
                <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
                    {DIALECT_OPTIONS.map((opt) => (
                        <button
                            key={opt.mode}
                            onClick={() => setDialect(opt.mode)}
                            className={cn(
                                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border',
                                dialect === opt.mode
                                    ? 'bg-white/15 border-white/30 text-white shadow-sm'
                                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                            )}
                        >
                            <span>{opt.flag}</span>
                            <span>{opt.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── Main two-column layout ────────────────────────────── */}
                <div className="flex flex-col md:flex-row gap-4">

                    {/* ── Left: Prompt chips ─────────────────────────────── */}
                    <div className="flex-1 space-y-2">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Try These Commands</p>
                        <div className="grid grid-cols-2 gap-1.5">
                            {PROMPT_CHIPS.map((chip) => (
                                <button
                                    key={chip.label}
                                    onClick={() => handleRealtimeIntent(chip.query)}
                                    disabled={state === 'LISTENING' || state === 'PROCESSING'}
                                    className={cn(
                                        'flex items-center gap-1.5 text-left px-2.5 py-2 rounded-xl border transition-all group',
                                        'bg-white/5 border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/10',
                                        'text-slate-300 hover:text-white text-[11px] font-medium disabled:opacity-40 disabled:cursor-not-allowed'
                                    )}
                                >
                                    <ChevronRight className="h-3 w-3 text-emerald-500/70 flex-shrink-0 group-hover:text-emerald-400" />
                                    <span className="truncate">{chip.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Bilingual subtitle area */}
                        {lastResponse && (
                            <div className="mt-2 p-2.5 bg-white/5 border border-white/10 rounded-xl space-y-1">
                                <p className="text-white/80 text-[11px] leading-relaxed">{lastResponse.spoken}</p>
                                {lastResponse.translation && (
                                    <p className="text-white/40 text-[10px] italic border-t border-white/10 pt-1">{lastResponse.translation}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Right: Voice orb ───────────────────────────────── */}
                    <div className="w-full md:w-[260px] flex flex-col items-center justify-center bg-slate-900/60 border border-white/10 rounded-2xl p-4 relative shadow-inner min-h-[220px]">

                        {/* Confidence meter */}
                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            {confidence > 0 && (
                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-black/60 border border-white/10">
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
                                    <RefreshCw className="h-2.5 w-2.5 mr-0.5 animate-spin" /> #{retryCount}
                                </Badge>
                            )}
                        </div>

                        {/* Preview / Waveform area */}
                        <div className="h-[120px] sm:h-[130px] w-full flex items-center justify-center mb-3 overflow-hidden relative">
                            {actionPreview ? (
                                <div className="w-full">{actionPreview}</div>
                            ) : state === 'LISTENING' ? (
                                <div className="flex flex-col items-center gap-2 w-full">
                                    <div className="flex items-center gap-[2px] h-10 justify-center w-full">
                                        {waveform.bars.map((bar, i) => (
                                            <div
                                                key={i}
                                                className="w-[2px] sm:w-[3px] rounded-full bg-gradient-to-t from-emerald-500 to-teal-400 transition-all duration-75"
                                                style={{ height: `${Math.max(6, bar)}%`, opacity: 0.3 + (bar / 100) * 0.7 }}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-center px-2 w-full max-h-16 overflow-y-auto">
                                        {transcript ? (
                                            <p className="text-white text-xs font-semibold leading-relaxed">
                                                &ldquo;{transcript}&rdquo;
                                                {interimTranscript && (
                                                    <span className="text-emerald-400/80 italic font-normal"> {interimTranscript}</span>
                                                )}
                                            </p>
                                        ) : interimTranscript ? (
                                            <p className="text-emerald-400/90 text-xs font-medium italic">&ldquo;{interimTranscript}&rdquo;</p>
                                        ) : (
                                            <p className="text-emerald-400 font-bold uppercase tracking-widest text-[10px] animate-pulse">Listening...</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <Mic className="h-6 w-6 text-slate-500 mb-1.5 mx-auto" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Tap Mic to Command</p>
                                    <p className="text-slate-500 text-[10px] mt-0.5 max-w-[170px] mx-auto">
                                        e.g. &ldquo;No okuk Bassey 5k&rdquo; or &ldquo;Check my aza&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Mic button */}
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
                                    "relative z-10 w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center overflow-hidden border",
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
                                {state === 'IDLE' && <Mic className="h-6 w-6 text-white" />}
                                {state === 'LISTENING' && <div className="w-3 h-3 bg-white rounded-full animate-ping" />}
                                {state === 'PROCESSING' && <Loader2 className="h-6 w-6 text-white animate-spin" />}
                                {state === 'BIOMETRICS' && <Fingerprint className="h-6 w-6 text-white animate-pulse" />}
                                {state === 'CLARIFY' && <AlertTriangle className="h-6 w-6 text-white" />}
                                {(state === 'SUCCESS' || state === 'INSIGHTS') && <CheckCircle2 className="h-6 w-6 text-white" />}
                            </Button>
                        </div>

                        {/* State label */}
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-2">
                            {state === 'IDLE' && `Orion • ${dialectInfo.flag} ${dialectInfo.label}`}
                            {state === 'LISTENING' && '🔴 Live Listening'}
                            {state === 'PROCESSING' && '⚡ Orion Processing'}
                            {state === 'BIOMETRICS' && '🔐 Voice-Print 2FA'}
                            {state === 'CLARIFY' && '❓ Needs Clarification'}
                            {state === 'SUCCESS' && '✅ Idoho! Done'}
                            {state === 'INSIGHTS' && '📊 CFO Insight'}
                        </p>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
