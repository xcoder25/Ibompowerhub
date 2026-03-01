'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, User, Send, Loader2, X, MessageSquare, Mic, Volume2, Sparkles, Waves, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCrsAssistantResponse } from '@/ai/flows/crs-assistant-flow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AssistantFAB } from './assistant-fab';
import { useIsMobile } from '@/hooks/use-mobile';
import { useIbibioAI } from '@/hooks/use-ibibio-ai';

type Message = {
    role: 'user' | 'assistant';
    content: string;
};

export function AssistantWidget() {
    // Shared state
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'chat' | 'ibibio'>('chat');

    // Chat state
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Ibibio state
    const {
        isListening,
        transcript,
        isSpeaking,
        startListening,
        stopListening,
        translateAndSpeak
    } = useIbibioAI();
    const [ibibioResult, setIbibioResult] = useState<string | null>(null);

    const isMobile = useIsMobile();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        if (isOpen && activeTab === 'chat') {
            scrollToBottom();
        }
    }, [messages, isOpen, activeTab, scrollToBottom]);

    // Ibibio translation effect
    useEffect(() => {
        if (transcript && !isListening) {
            const translated = translateAndSpeak(transcript);
            setIbibioResult(translated);
        }
    }, [transcript, isListening, translateAndSpeak]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await getCrsAssistantResponse({ query: input });
            const assistantMessage: Message = { role: 'assistant', content: result.response };
            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error getting assistant response:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    }

    if (isOpen) {
        return (
            <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-2xl">
                <Card className="flex flex-col h-[550px] w-[350px] rounded-[2rem] overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
                    <CardHeader className="flex flex-row items-center justify-between border-b pb-4 px-6 pt-6 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-md relative z-20">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-xl text-primary shadow-inner">
                                <Sparkles className="size-6" />
                            </div>
                            <div>
                                <CardTitle className='font-black text-lg uppercase tracking-widest'>AI Hub</CardTitle>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Unified Intelligence</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0 h-8 w-8">
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'ibibio')} className="flex-1 flex flex-col w-full h-full overflow-hidden relative z-10">
                        <div className="px-6 pt-4 pb-2 border-b bg-white dark:bg-slate-950">
                            <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
                                <TabsTrigger value="chat" className="rounded-lg font-bold text-xs uppercase tracking-widest">Support</TabsTrigger>
                                <TabsTrigger value="ibibio" className="rounded-lg font-bold text-xs flex items-center gap-1.5 uppercase tracking-widest">
                                    <Languages className="w-3.5 h-3.5" />
                                    Ibibio
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* CHAT TAB */}
                        <TabsContent value="chat" className="flex-1 flex flex-col m-0 p-0 overflow-hidden outline-none data-[state=active]:flex bg-slate-50/50 dark:bg-slate-950/50">
                            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 && (
                                    <div className="text-center pt-10 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150"></div>
                                            <div className="relative bg-gradient-to-br from-primary to-primary/80 p-5 rounded-3xl shadow-xl text-white">
                                                <Bot className="h-10 w-10" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-2">How can I help you today?</h3>
                                        <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed font-medium">Ask questions, report issues, or get guidance on using Ibom PowerHub.</p>
                                    </div>
                                )}
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'flex items-end gap-2 text-sm',
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-1">
                                                <Bot className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                        <div
                                            className={cn(
                                                'max-w-[80%] px-4 py-3 rounded-3xl shadow-sm',
                                                message.role === 'user'
                                                    ? 'bg-primary text-white rounded-br-sm'
                                                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-bl-sm text-slate-800 dark:text-slate-200'
                                            )}
                                        >
                                            <p className="leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-end gap-2 justify-start">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mb-1">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                        <div className="max-w-[80%] rounded-3xl rounded-bl-sm px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </CardContent>
                            <CardFooter className="p-4 bg-white dark:bg-slate-950 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
                                    <div className="relative flex-1">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Message AI Support..."
                                            className="w-full rounded-full bg-slate-100 dark:bg-slate-900/50 border-transparent shadow-inner focus:bg-white dark:focus:bg-slate-900 h-12 pl-5 pr-12 font-medium transition-all focus-visible:ring-1 focus-visible:ring-primary/50"
                                            disabled={isLoading}
                                        />
                                        <Button
                                            type="submit"
                                            size="icon"
                                            disabled={isLoading || !input.trim()}
                                            className="absolute right-1 top-1 bottom-1 h-10 w-10 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-white shadow-sm transition-transform hover:scale-105"
                                        >
                                            <Send className="h-4 w-4 ml-0.5" />
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
                                    <p className="text-xs font-medium text-slate-500 px-6">Press the mic and speak in English. We will generate the tonal Ibibio translation.</p>
                                </div>

                                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                                    {/* Mic Button in center */}
                                    <div className="relative group flex justify-center w-full">
                                        {isListening && (
                                            <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150 animate-pulse"></div>
                                        )}
                                        <Button
                                            onClick={isListening ? stopListening : startListening}
                                            className={cn(
                                                "relative h-24 w-24 rounded-full shadow-2xl transition-all duration-300",
                                                isListening ? "bg-red-500 hover:bg-red-600 scale-110" : "bg-primary hover:bg-primary/90 hover:scale-105"
                                            )}
                                        >
                                            <Mic className={cn("h-10 w-10 text-white", isListening && "animate-pulse")} />
                                        </Button>
                                    </div>

                                    {/* Status / Transcription */}
                                    <div className="w-full">
                                        <div className={cn(
                                            "p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all min-h-[100px] flex flex-col justify-center text-center shadow-sm",
                                            isListening ? "border-red-500/30" : "border-slate-100 dark:border-slate-800"
                                        )}>
                                            {isListening ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-1.5 h-6 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />
                                                        ))}
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

                                    {/* Translation Box */}
                                    {ibibioResult && !isListening && (
                                        <div className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 w-full text-left relative overflow-hidden shadow-inner">
                                            <div className="absolute right-[-10%] top-[-10%] opacity-[0.03] text-primary scale-150 rotate-12 pointer-events-none">
                                                <Waves className="h-32 w-32" />
                                            </div>
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-primary/20 rounded-lg">
                                                        <Languages className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Ibibio Translation</span>
                                                </div>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    onClick={() => translateAndSpeak(transcript)}
                                                    disabled={isSpeaking}
                                                    className="h-10 w-10 rounded-xl shadow-sm bg-white dark:bg-slate-800 text-primary border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform"
                                                >
                                                    <Volume2 className={cn("h-5 w-5", isSpeaking && "animate-pulse")} />
                                                </Button>
                                            </div>
                                            <p className="text-xl font-black text-slate-950 dark:text-white leading-tight relative z-10 font-serif line-clamp-4">
                                                {ibibioResult}
                                            </p>
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
