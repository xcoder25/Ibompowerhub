'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot, User, Send, Loader2, X, MessageSquare, Mic, Volume2, Sparkles, Waves, Languages,
  Brain, Zap, ExternalLink, ChevronRight, Shield, Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCrsAssistantResponse, CrsAssistantOutput } from '@/ai/flows/crs-assistant-flow';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AssistantFAB } from './assistant-fab';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIbibioAI } from '@/hooks/use-ibibio-ai';
import Link from 'next/link';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    actions?: CrsAssistantOutput['suggestedActions'];
    category?: string;
    isStreaming?: boolean;
};

// Quick-start prompts for Orion
const ORION_STARTERS = [
  { label: '💸 How do I AirSend?', q: 'How do I use AirSend to send money?' },
  { label: '🏛 Government services', q: 'What government services are available?' },
  { label: '🛡 Verify my KYC', q: 'How do I complete my KYC verification?' },
  { label: '✈ Book Ibom Air', q: 'How do I book a flight on Ibom Air?' },
];

const CATEGORY_COLORS: Record<string, string> = {
  airsend: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
  wallet: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  government: 'text-green-400 border-green-500/20 bg-green-500/5',
  flights: 'text-sky-400 border-sky-500/20 bg-sky-500/5',
  navigation: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
  emergency: 'text-red-400 border-red-500/20 bg-red-500/5',
  general: 'text-slate-400 border-slate-500/20 bg-slate-500/5',
};

export function AssistantWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'ibibio'>('chat');

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Ibibio state
    const { isListening, transcript, isSpeaking, startListening, stopListening, translateAndSpeak } = useIbibioAI();
    const [ibibioResult, setIbibioResult] = useState<string | null>(null);

    const isMobile = useIsMobile();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen && activeTab === 'chat') scrollToBottom();
    }, [messages, isOpen, activeTab, scrollToBottom]);

    useEffect(() => {
        if (transcript && !isListening) {
            const translated = translateAndSpeak(transcript);
            setIbibioResult(translated);
        }
    }, [transcript, isListening, translateAndSpeak]);

    const handleSendMessage = async (e: React.FormEvent | null, overrideText?: string) => {
        e?.preventDefault();
        const text = overrideText || input;
        if (!text.trim()) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await getCrsAssistantResponse({ query: text });
            const assistantMessage: Message = {
                role: 'assistant',
                content: result.response,
                actions: result.suggestedActions,
                category: result.category,
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Emedi! Something went wrong. Please try again.",
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    if (isOpen) {
        return (
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl">
                <Card className="flex flex-col h-[600px] w-[370px] rounded-[2rem] overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
                    {/* Header */}
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4 px-5 pt-5 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                        {/* Ambient glow */}
                        <div className="absolute -top-8 -left-8 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full pointer-events-none" />
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/10 blur-xl rounded-full pointer-events-none" />

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="relative">
                                <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/30">
                                    <Brain className="size-5 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 size-3 bg-emerald-400 rounded-full border-2 border-slate-800 animate-pulse" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <CardTitle className="font-black text-base uppercase tracking-widest text-white">Orion</CardTitle>
                                    <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5">
                                        Super AI
                                    </Badge>
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-0.5 flex items-center gap-1">
                                    <Cpu className="size-2.5 text-indigo-400" /> Orion AI · Gemini Powered
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0 h-8 w-8 relative z-10">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'ibibio')} className="flex-1 flex flex-col w-full h-full overflow-hidden">
                        <div className="px-5 pt-3 pb-2 border-b bg-white dark:bg-slate-950">
                            <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                                <TabsTrigger value="chat" className="rounded-lg font-bold text-xs uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                                    <Brain className="size-3 mr-1.5" /> Orion Chat
                                </TabsTrigger>
                                <TabsTrigger value="ibibio" className="rounded-lg font-bold text-xs flex items-center gap-1.5 uppercase tracking-widest">
                                    <Languages className="w-3.5 h-3.5" /> Ibibio
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* CHAT TAB */}
                        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 overflow-hidden outline-none data-[state=active]:flex bg-slate-50/50 dark:bg-slate-950/50">
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center pt-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500 gap-4">
                                        <div className="relative mb-2">
                                            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full scale-150" />
                                            <div className="relative bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 rounded-3xl shadow-xl text-white">
                                                <Brain className="h-10 w-10" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-1">Emedi! I'm Orion</h3>
                                            <p className="text-sm text-slate-500 max-w-[220px] leading-relaxed font-medium">Your Super AI for all things Ibom PowerHub. Ask me anything!</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 w-full mt-1">
                                            {ORION_STARTERS.map(s => (
                                                <button key={s.q} onClick={() => handleSendMessage(null, s.q)}
                                                    className="text-left px-3 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-snug hover:bg-indigo-50 dark:hover:bg-indigo-950/30">
                                                    {s.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map((message, index) => (
                                    <div key={index} className={cn('flex items-end gap-2 text-sm', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                        {message.role === 'assistant' && (
                                            <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0 mb-1 shadow-md">
                                                <Brain className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                        <div className={cn('max-w-[82%] flex flex-col gap-2')}>
                                            {/* Category badge */}
                                            {message.role === 'assistant' && message.category && (
                                                <span className={cn('text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border w-fit', CATEGORY_COLORS[message.category])}>
                                                    {message.category}
                                                </span>
                                            )}
                                            <div className={cn(
                                                'px-4 py-3 rounded-3xl shadow-sm',
                                                message.role === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-br-sm'
                                                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-bl-sm text-slate-800 dark:text-slate-200'
                                            )}>
                                                <p className="leading-relaxed text-sm">{message.content}</p>
                                            </div>
                                            {/* Action buttons */}
                                            {message.role === 'assistant' && message.actions && message.actions.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {message.actions.map(action => (
                                                        <Link key={action.href} href={action.href} onClick={() => setIsOpen(false)}>
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors cursor-pointer">
                                                                {action.label} <ChevronRight className="size-2.5" />
                                                            </span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-end gap-2 justify-start">
                                        <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shrink-0 mb-1 shadow-md">
                                            <Brain className="h-4 w-4 text-white animate-pulse" />
                                        </div>
                                        <div className="max-w-[80%] rounded-3xl rounded-bl-sm px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                                            {[0, 150, 300].map(delay => (
                                                <span key={delay} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </CardContent>
                            <CardFooter className="p-4 bg-white dark:bg-slate-950 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
                                    <div className="relative flex-1">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask Orion anything..."
                                            className="w-full rounded-full bg-slate-100 dark:bg-slate-900/50 border-transparent shadow-inner focus:bg-white dark:focus:bg-slate-900 h-12 pl-5 pr-12 font-medium transition-all focus-visible:ring-1 focus-visible:ring-indigo-500/50"
                                            disabled={isLoading}
                                        />
                                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}
                                            className="absolute right-1 top-1 bottom-1 h-10 w-10 shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-transform hover:scale-105">
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                                        </Button>
                                    </div>
                                </form>
                            </CardFooter>
                        </TabsContent>

                        {/* IBIBIO TAB */}
                        <TabsContent value="ibibio" className="flex-1 flex flex-col m-0 p-6 overflow-y-auto outline-none data-[state=active]:flex bg-slate-50/50 dark:bg-slate-950">
                            <div className="space-y-6 w-full flex-1 flex flex-col pb-4">
                                <div className="text-center space-y-2">
                                    <Badge className="bg-primary/10 text-primary border-none pointer-events-none tracking-widest uppercase font-black text-[9px]">Tonal Translator Active</Badge>
                                    <p className="text-xs font-medium text-slate-500 px-6">Press the mic and speak in English. Orion will generate the Ibibio tonal translation.</p>
                                </div>
                                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                                    <div className="relative group flex justify-center w-full">
                                        {isListening && <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150 animate-pulse" />}
                                        <Button onClick={isListening ? stopListening : startListening}
                                            className={cn("relative h-24 w-24 rounded-full shadow-2xl transition-all duration-300",
                                                isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105")}>
                                            <Mic className={cn("h-10 w-10 text-white", isListening && "animate-pulse")} />
                                        </Button>
                                    </div>
                                    <div className="w-full">
                                        <div className={cn("p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all min-h-[100px] flex flex-col justify-center text-center shadow-sm",
                                            isListening ? "border-red-500/30" : "border-slate-100 dark:border-slate-800")}>
                                            {isListening ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                                                    </div>
                                                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Listening...</p>
                                                </div>
                                            ) : transcript ? (
                                                <div className="text-left w-full">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">You said</p>
                                                    <p className="text-sm font-medium leading-tight">{transcript}</p>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-400 italic font-medium">Waiting for voice input...</p>
                                            )}
                                        </div>
                                    </div>
                                    {ibibioResult && !isListening && (
                                        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 animate-in fade-in slide-in-from-bottom-4 w-full text-left relative overflow-hidden shadow-inner">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-indigo-500/20 rounded-lg"><Languages className="h-4 w-4 text-indigo-500" /></div>
                                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Ibibio Translation</span>
                                                </div>
                                                <Button size="icon" variant="secondary" onClick={() => translateAndSpeak(transcript)} disabled={isSpeaking}
                                                    className="h-10 w-10 rounded-xl shadow-sm bg-white dark:bg-slate-800 text-indigo-500 border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform">
                                                    <Volume2 className={cn("h-5 w-5", isSpeaking && "animate-pulse")} />
                                                </Button>
                                            </div>
                                            <p className="text-xl font-black text-slate-950 dark:text-white leading-tight font-serif line-clamp-4">{ibibioResult}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>
        );
    }

    return <AssistantFAB onClick={toggleOpen} />;
}
