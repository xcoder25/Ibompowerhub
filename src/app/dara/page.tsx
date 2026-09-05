'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2, Mic, MicOff, ChevronRight, Sparkles, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getDaraResponse, DaraMessage } from '@/ai/flows/dara-assistant-flow';
import { getOfflinePowerTokens, getOfflineFlightTickets } from '@/lib/offline-vault';
import { cn } from '@/lib/utils';

type UserProfile = {
  name: string;
  role: string;
  bio?: string;
  location?: string;
};

type KycData = {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  bvnVerified?: boolean;
  identityVerified?: boolean;
  addressVerified?: boolean;
  faceVerified?: boolean;
};

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: Array<{ label: string; href: string }>;
  timestamp: Date;
  isTyping?: boolean;
}

const STARTER_PROMPTS = [
  { label: '💳 My wallet balance', q: 'What is my current wallet balance and recent transactions?' },
  { label: '⚡ My power tokens', q: 'Show me my saved electricity tokens and how to use them.' },
  { label: '✈️ My flight tickets', q: 'Do I have any saved boarding passes or upcoming flights?' },
  { label: '🛡️ My KYC status', q: 'What is my KYC verification level and what steps are left?' },
  { label: '📱 App features', q: 'What can I do in this app? Give me a full overview.' },
  { label: '🆘 Emergency help', q: 'I need emergency assistance — what should I do?' },
];

export default function DaraPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState<string[]>([]);
  const [kycLevel, setKycLevel] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [showStarters, setShowStarters] = useState(true);

  // Profile ref
  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  // KYC ref
  const kycDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'kyc', user.uid) : null),
    [firestore, user]
  );
  const { data: kycData } = useDoc<KycData>(kycDocRef);

  // Compute KYC level
  useEffect(() => {
    if (!kycData) return;
    const checks = [
      user?.emailVerified,
      kycData.phoneVerified,
      kycData.bvnVerified,
      kycData.identityVerified,
      kycData.addressVerified,
      kycData.faceVerified,
    ];
    setKycLevel(checks.filter(Boolean).length);
  }, [kycData, user]);

  // Load wallet balance
  useEffect(() => {
    if (!user || !firestore) return;
    const walletRef = doc(firestore, 'wallets', user.uid);
    const unsubWallet = onSnapshot(walletRef, (snap) => {
      if (snap.exists()) {
        setWalletBalance(snap.data()?.balance ?? 0);
      }
    });

    const txnRef = collection(firestore, 'wallets', user.uid, 'transactions');
    const q = query(txnRef, orderBy('timestamp', 'desc'), limit(5));
    const unsubTxn = onSnapshot(q, (snap) => {
      const txns: string[] = [];
      snap.forEach((d) => {
        const data = d.data();
        txns.push(`${data.type === 'credit' ? '+' : '-'}₦${data.amount?.toLocaleString()} (${data.description})`);
      });
      setRecentTransactions(txns);
    });

    return () => { unsubWallet(); unsubTxn(); };
  }, [user, firestore]);

  // Auto-play video silently
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Greet user on load
  useEffect(() => {
    if (!user) return;
    const name = userProfile?.name || user.displayName || 'there';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `${greeting}, ${name.split(' ')[0]}! 💜 I'm **Dara**, your personal assistant inside Ibom Power Hub.\n\nI know your wallet balance (₦${walletBalance.toLocaleString()}), your ${getOfflinePowerTokens().length} cached power token(s), and everything about the app. Ask me anything!`,
      timestamp: new Date(),
    }]);
  }, [user, userProfile]);

  const buildUserContext = useCallback(() => ({
    name: userProfile?.name || user?.displayName || undefined,
    email: user?.email || undefined,
    role: userProfile?.role || 'Resident',
    location: userProfile?.location || 'Uyo, Akwa Ibom State',
    kycLevel,
    walletBalance,
    recentTransactions,
    offlinePowerTokens: getOfflinePowerTokens().length,
    offlineFlightTickets: getOfflineFlightTickets().length,
    isVerified: kycLevel >= 3,
  }), [userProfile, user, kycLevel, walletBalance, recentTransactions]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    setShowStarters(false);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    // Typing indicator
    const typingMsg: ChatMessage = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true,
    };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history: DaraMessage[] = messages
        .filter(m => !m.isTyping)
        .map(m => ({ role: m.role, content: m.content }));

      const result = await getDaraResponse({
        query: text.trim(),
        userContext: buildUserContext(),
        conversationHistory: history,
      });

      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: result.response,
        suggestedActions: result.suggestedActions,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev.filter(m => m.id !== 'typing'), assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev.filter(m => m.id !== 'typing'), {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: "Emedi! Something went wrong on my end. Please try asking again! 💜",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isLoading, messages, buildUserContext]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-NG';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const formatContent = (text: string) => {
    // Convert markdown bold **text** to spans, and line breaks
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 flex items-center gap-3 px-4 h-14">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
          <ArrowLeft className="size-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2.5 flex-1">
          <div className="size-8 rounded-full overflow-hidden shadow-sm">
            <img src="/dara.png" alt="Dara" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 leading-none">Dara</p>
            <p className="text-[10px] text-violet-600 font-semibold leading-none mt-0.5">
              {isLoading ? 'Thinking…' : 'AI Assistant • Always here'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setMessages([]);
            setShowStarters(true);
          }}
          className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          title="New conversation"
        >
          <RefreshCw className="size-4 text-slate-500" />
        </button>
      </header>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Dara animated video — always visible at top */}
        <div className="flex flex-col items-center pt-6 pb-4 px-4 bg-gradient-to-b from-violet-50/60 to-white">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-violet-300/25 blur-xl scale-110 animate-pulse" />
            <div className="relative size-28 rounded-full overflow-hidden shadow-2xl shadow-violet-400/30 border-2 border-violet-100">
              <video
                ref={videoRef}
                src="/daravid.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h1 className="mt-3 text-lg font-black text-slate-900 tracking-tight">
            Hi, I'm <span className="text-violet-600">Dara</span> 💜
          </h1>
          <p className="text-xs text-slate-500 text-center max-w-xs mt-0.5">
            Your personal AI guide for Ibom Power Hub. I know everything about the app and about you.
          </p>
        </div>

        {/* Starter prompts */}
        {showStarters && (
          <div className="px-4 pb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Suggested questions</p>
            <div className="grid grid-cols-2 gap-2">
              {STARTER_PROMPTS.map((s) => (
                <button
                  key={s.q}
                  onClick={() => sendMessage(s.q)}
                  className="text-left p-3 rounded-2xl border border-slate-200 bg-white hover:bg-violet-50 hover:border-violet-200 transition-all text-xs font-semibold text-slate-700 active:scale-95 shadow-sm"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="px-4 pb-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2.5',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              {msg.role === 'assistant' && (
                <div className="size-7 rounded-full overflow-hidden shrink-0 shadow-sm mt-1">
                  <img src="/dara.png" alt="Dara" className="w-full h-full object-cover" />
                </div>
              )}
              {msg.role === 'user' && (
                <div className="size-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-1">
                  <User className="size-3.5 text-violet-700" />
                </div>
              )}

              <div className={cn('flex flex-col gap-1.5 max-w-[80%]', msg.role === 'user' ? 'items-end' : 'items-start')}>
                {/* Bubble */}
                {msg.isTyping ? (
                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="size-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="size-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                    )}
                    dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                  />
                )}

                {/* Suggested Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && !msg.isTyping && (
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((action) => (
                      <Link key={action.href} href={action.href}>
                        <button className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-xs font-bold hover:bg-violet-100 transition-colors active:scale-95">
                          {action.label}
                          <ChevronRight className="size-3" />
                        </button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={cn(
              'size-10 rounded-full flex items-center justify-center shrink-0 transition-all',
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-600'
            )}
          >
            {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Dara anything…"
              className="rounded-2xl border-slate-200 bg-slate-50 pr-10 text-sm h-10 focus:border-violet-400 focus:ring-violet-400/20"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={cn(
              'size-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm',
              input.trim() && !isLoading
                ? 'bg-violet-600 text-white hover:bg-violet-700 active:scale-95'
                : 'bg-slate-100 text-slate-400'
            )}
          >
            {isLoading
              ? <Loader2 className="size-4 animate-spin" />
              : <Send className="size-4" />
            }
          </button>
        </form>
      </div>
    </div>
  );
}
