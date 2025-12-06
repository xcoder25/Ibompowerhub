'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCrsAssistantResponse } from '@/ai/flows/crs-assistant-flow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div className="flex-1 flex flex-col h-full bg-muted/30">
        <header className="p-4 border-b">
             <h1 className="font-headline text-2xl font-bold tracking-tight">AI Assistant</h1>
            <p className="text-muted-foreground">Ask me anything about the PowerHub CRS app!</p>
        </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'flex items-start gap-4',
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
                'max-w-md rounded-xl px-4 py-3 text-sm shadow-md',
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
          <div className="flex items-start gap-4 justify-start">
            <Avatar className="size-8 border">
              <AvatarFallback><Bot className='size-5'/></AvatarFallback>
            </Avatar>
            <div className="max-w-md rounded-xl px-4 py-3 text-sm shadow-md bg-background flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-background/95 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="How do I report a power outage?"
            className="flex-1 bg-background"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
