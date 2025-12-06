
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, User, Send, Loader2, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCrsAssistantResponse } from '@/ai/flows/crs-assistant-flow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AssistantFAB } from './assistant-fab';
import { useIsMobile } from '@/hooks/use-mobile';


type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export function AssistantWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen, scrollToBottom]);

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
        <div className="fixed z-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Card className="flex flex-col shadow-2xl h-[500px] w-80 rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div className="flex items-center gap-3">
                        <Avatar className="size-8 border">
                            <AvatarFallback><Bot className='size-5'/></AvatarFallback>
                        </Avatar>
                        <CardTitle className='font-headline text-lg'>AI Assistant</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground pt-8">
                            <Bot className="mx-auto h-10 w-10 mb-2" />
                            <p>Ask me anything about PowerHub CRS!</p>
                        </div>
                    )}
                    {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'assistant' && (
                        <Avatar className="size-8 border">
                            <AvatarFallback><Bot className='size-5'/></AvatarFallback>
                        </Avatar>
                        )}
                        <div
                        className={cn(
                            'max-w-xs rounded-xl px-4 py-3 text-sm shadow-md',
                            message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background'
                        )}
                        >
                        <p>{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                        <Avatar className="size-8 border">
                            <AvatarFallback><User className='size-5'/></AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                    ))}
                    {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <Avatar className="size-8 border">
                        <AvatarFallback><Bot className='size-5'/></AvatarFallback>
                        </Avatar>
                        <div className="max-w-xs rounded-xl px-4 py-3 text-sm shadow-md bg-background flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                        </div>
                    </div>
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>
                <CardFooter className="border-t p-4">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 w-full">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="How do I report an issue?"
                        className="flex-1 bg-background"
                        disabled={isLoading}
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
  }

  return <AssistantFAB onClick={toggleOpen} />;
}
