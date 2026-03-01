'use client';

import { useState, useEffect } from 'react';
import { useIbibioAI } from '@/hooks/use-ibibio-ai';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Mic,
    Volume2,
    RotateCcw,
    Sparkles,
    Waves,
    X,
    Languages
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * IbibioVoiceTool: A compact, non-intrusive component for Ibibio 
 * Speech-to-Text (STT) and Tonal Text-to-Speech (TTS).
 */
export function IbibioVoiceTool() {
    const {
        isListening,
        transcript,
        isSpeaking,
        startListening,
        stopListening,
        translateAndSpeak
    } = useIbibioAI();

    const [result, setResult] = useState<string | null>(null);
    const [active, setActive] = useState(false);

    useEffect(() => {
        if (transcript && !isListening) {
            const translated = translateAndSpeak(transcript);
            setResult(translated);
        }
    }, [transcript, isListening, translateAndSpeak]);

    if (!active) {
        return (
            <Button
                onClick={() => setActive(true)}
                variant="outline"
                className="fixed bottom-24 right-5 rounded-full h-12 w-12 p-0 shadow-lg bg-primary text-white border-none hover:scale-110 transition-transform z-40"
            >
                <Languages className="h-6 w-6" />
            </Button>
        );
    }

    return (
        <Card className="fixed bottom-24 right-5 w-72 rounded-3xl shadow-2xl border-none bg-white dark:bg-slate-900 z-50 animate-in slide-in-from-bottom-5">
            <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <Badge className="bg-primary/10 text-primary border-none text-[9px] font-black uppercase tracking-widest">
                        Ibibio AI Active
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActive(false)}
                        className="h-6 w-6 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-2">
                    <div className="relative group">
                        <div className={cn(
                            "p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 transition-all min-h-[80px] flex flex-col justify-center",
                            isListening ? "border-red-500/20" : "border-transparent"
                        )}>
                            {isListening ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="w-1 h-4 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                                        ))}
                                    </div>
                                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Listening to English...</p>
                                </div>
                            ) : transcript ? (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Transcription</p>
                                    <p className="text-sm font-bold leading-tight">{transcript}</p>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center italic font-medium">Tap mic and speak in English to get Ibibio translation.</p>
                            )}
                        </div>

                        <Button
                            onClick={isListening ? stopListening : startListening}
                            size="icon"
                            className={cn(
                                "absolute -right-2 -bottom-2 h-10 w-10 rounded-full shadow-lg transition-all",
                                isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-primary hover:bg-primary/90"
                            )}
                        >
                            <Mic className={cn("h-5 w-5", isListening && "animate-pulse")} />
                        </Button>
                    </div>

                    {result && !isListening && (
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-1">
                                    <Waves className="h-3 w-3 text-primary" />
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Tonal Translation</span>
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => translateAndSpeak(transcript)}
                                    disabled={isSpeaking}
                                    className="h-6 w-6 rounded-full"
                                >
                                    <Volume2 className={cn("h-4 w-4 text-primary", isSpeaking && "animate-pulse")} />
                                </Button>
                            </div>
                            <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                                {result}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <p className="text-[9px] text-slate-400 font-medium italic">
                        Integrated Ibibio Tonal Synthesis v2.0
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
