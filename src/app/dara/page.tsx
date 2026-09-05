'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Loader2,
  Mic,
  MicOff,
  ChevronRight,
  Sparkles,
  User,
  RefreshCw,
  Volume2,
  VolumeX,
  Fingerprint,
  CheckCircle2,
  ShieldCheck,
  Database,
  Zap,
  ArrowRight,
  AlertTriangle,
  Lock,
  Globe2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { getDaraResponse, DaraMessage } from '@/ai/flows/dara-assistant-flow';
import { processVoiceBankingIntent, VoiceBankingIntent } from '@/ai/flows/voice-banking-flow';
import { useIbibioAI } from '@/hooks/use-ibibio-ai';
import { useWakeWord } from '@/hooks/use-wake-word';
import { HeyDaraWakeButton } from '@/components/hey-dara-wake-button';
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

type DialectMode = 'auto' | 'ibibio' | 'pidgin' | 'english';

const DIALECT_OPTIONS: { mode: DialectMode; label: string; flag: string }[] = [
  { mode: 'auto', label: 'Auto', flag: '🤖' },
  { mode: 'ibibio', label: 'Ibibio', flag: '🌿' },
  { mode: 'pidgin', label: 'Pidgin', flag: '🇳🇬' },
  { mode: 'english', label: 'English', flag: '🇬🇧' },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  englishTranslation?: string;
  detectedDialect?: string;
  suggestedActions?: Array<{ label: string; href: string }>;
  timestamp: Date;
  isTyping?: boolean;
  bankingData?: {
    type: 'transfer' | 'balance' | 'freeze_card' | 'insight' | 'clarify';
    intent: VoiceBankingIntent;
    state?: 'clarify' | 'biometrics' | 'success';
  };
}

const STARTER_PROMPTS = [
  { label: '🌿 Nọ Bassey tosin ition', q: 'no okuk tosin ition to Bassey' },
  { label: '🇳🇬 Lock my card sharp', q: 'lock my card sharp sharp' },
  { label: '💳 My wallet balance', q: 'What is my current wallet balance and recent transactions?' },
  { label: '📊 Audio CFO: Fuel spend', q: 'how much did I spend on fuel this month?' },
  { label: '⚡ My power tokens', q: 'Show me my saved electricity tokens and how to use them.' },
  { label: '✈️ My flight tickets', q: 'Do I have any saved boarding passes or upcoming flights?' },
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
  const [showStarters, setShowStarters] = useState(true);
  const [dialect, setDialect] = useState<DialectMode>('auto');
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);

  // Dialect-aware speech recognition & tonal synthesis hook
  const {
    isListening,
    transcript,
    interimTranscript,
    waveform,
    startListening,
    stopListening,
    resetTranscript,
    speakTonal,
  } = useIbibioAI();

  const shouldProcessVoiceRef = useRef(false);

  // ── Wake overlay state ──────────────────────────────────────────────────
  const [showWakeOverlay, setShowWakeOverlay] = useState(false);
  const wakeOverlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── "Dara" wake word hook (Google Assistant style) ────────────────────────
  const {
    state: wakeState,
    isSupported: wakeSupported,
    lastPhrase: wakePhrase,
    enableWakeWord,
    disableWakeWord,
    setActive: setWakeActive,
    setStandby: setWakeStandby,
  } = useWakeWord({
    onWake: (payload) => {
      // Instant activation — zero time wasted
      setWakeActive();
      setShowWakeOverlay(true);

      // If user said "Dara [command]" in one natural breath, execute the command directly!
      if (payload.command && payload.command.trim().length > 1) {
        if (wakeOverlayTimerRef.current) clearTimeout(wakeOverlayTimerRef.current);
        wakeOverlayTimerRef.current = setTimeout(() => {
          setShowWakeOverlay(false);
          sendMessage(payload.command);
          setWakeStandby();
        }, 400);
      } else {
        // User said standalone "Dara" — open microphone INSTANTLY!
        resetTranscript();
        startListening();

        if (wakeOverlayTimerRef.current) clearTimeout(wakeOverlayTimerRef.current);
        wakeOverlayTimerRef.current = setTimeout(() => {
          setShowWakeOverlay(false);
          setWakeStandby();
        }, 7000); // fallback auto-hide
      }
    },
  });

  // Auto-dismiss wake overlay when speech input finishes
  useEffect(() => {
    if (!isListening && showWakeOverlay) {
      const t = setTimeout(() => setShowWakeOverlay(false), 300);
      return () => clearTimeout(t);
    }
  }, [isListening, showWakeOverlay]);

  // Cleanup overlay timer on unmount
  useEffect(() => {
    return () => {
      if (wakeOverlayTimerRef.current) clearTimeout(wakeOverlayTimerRef.current);
    };
  }, []);


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

  // Handle voice auto-submission when recording ends
  useEffect(() => {
    if (isListening) {
      shouldProcessVoiceRef.current = true;
    } else if (!isListening && transcript && shouldProcessVoiceRef.current) {
      shouldProcessVoiceRef.current = false;
      const textToSubmit = transcript;
      resetTranscript();
      sendMessage(textToSubmit);
    }
  }, [isListening, transcript]);

  // Greet user on load
  useEffect(() => {
    if (!user) return;
    const name = userProfile?.name || user.displayName || 'there';
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `${greeting}, ${name.split(' ')[0]}! 💜 I'm **Dara**, your dialect-aware AI assistant inside Ibom Power Hub.\n\nI can answer questions about the state, check your tokens, and **execute voice banking in Ibibio, Pidgin, or English** (transfers, balance inquiries, card freeze, and Audio CFO analytics). Speak or type anything to begin!`,
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
      // 1. First test if input triggers dialect-aware voice banking intent
      let bankingIntent: VoiceBankingIntent | null = null;
      try {
        bankingIntent = await processVoiceBankingIntent(
          text.trim(),
          null,
          dialect !== 'auto' ? dialect : undefined
        );
      } catch (err) {
        console.warn('Voice banking classification fallback:', err);
      }

      const isBankingAction = bankingIntent && [
        'transfer', 'balance', 'insight', 'freeze_card', 'unfreeze_card'
      ].includes(bankingIntent.type);

      if (isBankingAction && bankingIntent) {
        // --- TRANSFER INTENT ---
        if (bankingIntent.type === 'transfer') {
          if (bankingIntent.isAmbiguous) {
            const assistantMsg: ChatMessage = {
              id: `ai-${Date.now()}`,
              role: 'assistant',
              content: bankingIntent.spokenResponse,
              englishTranslation: bankingIntent.englishTranslation,
              detectedDialect: bankingIntent.detectedDialect,
              timestamp: new Date(),
              bankingData: {
                type: 'clarify',
                intent: bankingIntent,
                state: 'clarify',
              },
            };
            setMessages(prev => [...prev.filter(m => m.id !== 'typing'), assistantMsg]);
            if (voiceSpeechEnabled) speakTonal(bankingIntent.spokenResponse);
            return;
          }

          // Full transfer flow with biometric 2FA animation
          const msgId = `ai-${Date.now()}`;
          const transferMsg: ChatMessage = {
            id: msgId,
            role: 'assistant',
            content: bankingIntent.spokenResponse,
            englishTranslation: bankingIntent.englishTranslation,
            detectedDialect: bankingIntent.detectedDialect,
            timestamp: new Date(),
            bankingData: {
              type: 'transfer',
              intent: bankingIntent,
              state: 'biometrics',
            },
          };
          setMessages(prev => [...prev.filter(m => m.id !== 'typing'), transferMsg]);
          if (voiceSpeechEnabled) speakTonal(bankingIntent.spokenResponse);

          // Simulate 2FA voice verification & completion
          setTimeout(() => {
            const successVoice = 'Idoho! Voice Biometrics Verified. Transfer Successful. Sosong!';
            if (voiceSpeechEnabled) speakTonal(successVoice);

            setMessages(prev =>
              prev.map(m =>
                m.id === msgId && m.bankingData
                  ? {
                      ...m,
                      content: `Transfer of ₦${bankingIntent!.amount?.toLocaleString()} to ${bankingIntent!.recipient} (${bankingIntent!.bank || 'Bank'}) successful!`,
                      bankingData: {
                        ...m.bankingData,
                        state: 'success',
                      },
                    }
                  : m
              )
            );
          }, 3200);
          return;
        }

        // --- BALANCE INTENT ---
        if (bankingIntent.type === 'balance') {
          const balanceMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: bankingIntent.spokenResponse,
            englishTranslation: bankingIntent.englishTranslation,
            detectedDialect: bankingIntent.detectedDialect,
            timestamp: new Date(),
            suggestedActions: [
              { label: 'Open IbomPay Wallet', href: '/wallet' },
              { label: 'Transfer via AirSend', href: '/wallet/transfer' },
            ],
            bankingData: {
              type: 'balance',
              intent: bankingIntent,
            },
          };
          setMessages(prev => [...prev.filter(m => m.id !== 'typing'), balanceMsg]);
          if (voiceSpeechEnabled) speakTonal(bankingIntent.spokenResponse);
          return;
        }

        // --- FREEZE / LOCK CARD INTENT ---
        if (bankingIntent.type === 'freeze_card' || bankingIntent.type === 'unfreeze_card') {
          const lockMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: bankingIntent.spokenResponse,
            englishTranslation: bankingIntent.englishTranslation,
            detectedDialect: bankingIntent.detectedDialect,
            timestamp: new Date(),
            suggestedActions: [
              { label: 'Manage Virtual Cards', href: '/wallet/cards' },
            ],
            bankingData: {
              type: 'freeze_card',
              intent: bankingIntent,
            },
          };
          setMessages(prev => [...prev.filter(m => m.id !== 'typing'), lockMsg]);
          if (voiceSpeechEnabled) speakTonal(bankingIntent.spokenResponse);
          return;
        }

        // --- AUDIO CFO INSIGHT INTENT ---
        if (bankingIntent.type === 'insight') {
          const insightMsg: ChatMessage = {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: bankingIntent.spokenResponse,
            englishTranslation: bankingIntent.englishTranslation,
            detectedDialect: bankingIntent.detectedDialect,
            timestamp: new Date(),
            bankingData: {
              type: 'insight',
              intent: bankingIntent,
            },
          };
          setMessages(prev => [...prev.filter(m => m.id !== 'typing'), insightMsg]);
          if (voiceSpeechEnabled) speakTonal(bankingIntent.spokenResponse);
          return;
        }
      }

      // 2. Standard Dara smart city & app conversational flow
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
      if (voiceSpeechEnabled && !isListening) {
        const firstSentence = result.response.split('.')[0] + '.';
        speakTonal(firstSentence);
      }
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
  }, [isLoading, messages, buildUserContext, dialect, voiceSpeechEnabled, isListening, speakTonal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 flex items-center justify-between px-3 sm:px-4 h-14">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft className="size-5 text-slate-700" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full overflow-hidden shadow-sm">
              <img src="/dara.png" alt="Dara" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-black text-slate-900 leading-none">Dara</p>
                <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-none text-[8px] font-black uppercase px-1.5 py-0 leading-none">
                  Dialect AI
                </Badge>
              </div>
              <p className="text-[10px] text-violet-600 font-semibold leading-none mt-0.5">
                {isLoading ? 'Thinking…' : 'AI Assistant • Voice Banking Ready'}
              </p>
            </div>
          </div>
        </div>

        {/* Dialect selector & actions */}
        <div className="flex items-center gap-1.5">
          {/* Hey Dara Wake Word Button */}
          <HeyDaraWakeButton
            state={wakeState}
            isSupported={wakeSupported}
            onEnable={enableWakeWord}
            onDisable={disableWakeWord}
            lastPhrase={wakePhrase}
            waveformBars={waveform.bars}
            compact
          />

          {/* Dialect pills */}
          <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200">
            {DIALECT_OPTIONS.map(d => (
              <button
                key={d.mode}
                onClick={() => setDialect(d.mode)}
                className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full transition-all flex items-center gap-1',
                  dialect === d.mode
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
                title={`Dialect mode: ${d.label}`}
              >
                <span>{d.flag}</span>
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>

          {/* Voice output toggle */}
          <button
            onClick={() => setVoiceSpeechEnabled(!voiceSpeechEnabled)}
            className={cn(
              'p-2 rounded-full transition-colors',
              voiceSpeechEnabled ? 'text-violet-600 bg-violet-50 hover:bg-violet-100' : 'text-slate-400 hover:bg-slate-100'
            )}
            title={voiceSpeechEnabled ? 'Mute voice audio' : 'Unmute voice audio'}
          >
            {voiceSpeechEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>

          {/* New chat button */}
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
        </div>
      </header>

      {/* Google Assistant-Style "Dara" Ambient Voice Glow & Bar */}
      {showWakeOverlay && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-6 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent pointer-events-auto animate-in slide-in-from-bottom duration-200">
          {/* Ambient Multi-Color Light Bar at Bottom Edge */}
          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-400 via-fuchsia-500 to-sky-400 animate-pulse shadow-[0_-4px_25px_rgba(168,85,247,0.7)]" />

          <div className="max-w-md mx-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-violet-500/30 p-3.5 sm:p-4 shadow-2xl text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative size-10 sm:size-11 rounded-2xl overflow-hidden border-2 border-violet-400/80 shadow-lg shadow-violet-500/40 shrink-0">
                  <img src="/dara.png" alt="Dara" className="w-full h-full object-cover" />
                  <span className="absolute inset-0 rounded-2xl border border-white/20" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-300">Dara Assistant</span>
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                    <span className="text-[9px] text-slate-400 hidden sm:inline">Listening…</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate mt-0.5">
                    {transcript || interimTranscript || (wakePhrase ? `"${wakePhrase}"` : "Listening to you…")}
                  </p>
                </div>
              </div>

              {/* 4 Google-Assistant style dynamic pulsing color dots */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 shrink-0 border border-white/10">
                <span className="size-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="size-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '450ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Dara animated video avatar banner */}
        <div className="flex flex-col items-center pt-6 pb-4 px-4 bg-gradient-to-b from-violet-50/60 to-white">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-violet-300/25 blur-xl scale-110 animate-pulse" />
            <div className="relative size-24 sm:size-28 rounded-full overflow-hidden shadow-2xl shadow-violet-400/30 border-2 border-violet-100">
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
            Your personal AI assistant & dialect voice banking engine for Akwa Ibom State.
          </p>
        </div>

        {/* Starter prompts */}
        {showStarters && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Voice & Dialect Commands
              </p>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-bold">
                Ibibio • Pidgin • English
              </Badge>
            </div>
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

              <div className={cn('flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]', msg.role === 'user' ? 'items-end' : 'items-start')}>
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
                      'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm w-full',
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-tr-sm'
                        : 'bg-slate-100 text-slate-900 rounded-tl-sm'
                    )}
                  >
                    {/* Dialect tag */}
                    {msg.detectedDialect && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-violet-600 bg-violet-100 px-1.5 py-0.2 rounded">
                          {msg.detectedDialect}
                        </span>
                      </div>
                    )}

                    <div dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }} />

                    {/* Translation if available */}
                    {msg.englishTranslation && (
                      <p className="text-[11px] italic text-slate-500 mt-1.5 border-t border-slate-200/60 pt-1">
                        "{msg.englishTranslation}"
                      </p>
                    )}

                    {/* --- Interactive Banking Action Components --- */}
                    {msg.bankingData && (
                      <div className="mt-2.5">
                        {/* Biometrics Verifying */}
                        {msg.bankingData.type === 'transfer' && msg.bankingData.state === 'biometrics' && (
                          <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-white/10 space-y-2.5">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <div className="flex items-center gap-2">
                                <div className="size-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                  <ArrowRight className="size-4 animate-pulse" />
                                </div>
                                <div>
                                  <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Dialect Transfer</p>
                                  <p className="text-sm font-black">₦{msg.bankingData.intent.amount?.toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-[9px] uppercase tracking-wider text-white/50 font-bold">{msg.bankingData.intent.bank || 'Bank'}</p>
                                <p className="text-xs font-semibold text-white truncate max-w-[120px]">{msg.bankingData.intent.recipient || 'Beneficiary'}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-center py-1">
                              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] py-1 px-3 animate-pulse flex items-center gap-1.5">
                                <Fingerprint className="size-3.5 animate-bounce" />
                                Voice-Print 2FA Verifying…
                              </Badge>
                            </div>
                          </div>
                        )}

                        {/* Transfer Success */}
                        {msg.bankingData.type === 'transfer' && msg.bankingData.state === 'success' && (
                          <div className="bg-emerald-950 text-white p-3.5 rounded-2xl border border-emerald-500/30 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="size-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                <CheckCircle2 className="size-4" />
                              </div>
                              <div>
                                <h4 className="font-bold text-xs">Transfer Complete</h4>
                                <p className="text-[10px] text-emerald-300 font-semibold">Voice Verified ✓ Idoho!</p>
                              </div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-2.5 text-xs space-y-1 border border-white/5">
                              <div className="flex justify-between text-slate-300">
                                <span>Beneficiary:</span>
                                <span className="font-bold text-white">{msg.bankingData.intent.recipient}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Bank:</span>
                                <span className="font-semibold text-white">{msg.bankingData.intent.bank || 'Main Bank'}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span>Amount:</span>
                                <span className="font-black text-emerald-400">₦{msg.bankingData.intent.amount?.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Clarification Needed */}
                        {msg.bankingData.type === 'clarify' && (
                          <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-2xl space-y-2">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                              <AlertTriangle className="size-4 shrink-0" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Details Needed</span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => { resetTranscript(); startListening(); }}
                              className="w-full h-8 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold gap-1.5"
                            >
                              <Mic className="size-3.5" /> Speak Missing Details
                            </Button>
                          </div>
                        )}

                        {/* Live Balance Card */}
                        {msg.bankingData.type === 'balance' && (
                          <div className="bg-gradient-to-br from-violet-900 to-indigo-950 text-white p-3.5 rounded-2xl border border-violet-500/30 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Live IbomPay Balance</span>
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Active</span>
                            </div>
                            <p className="text-xl font-black text-white">₦{walletBalance.toLocaleString()}</p>
                          </div>
                        )}

                        {/* Card Freeze Security */}
                        {msg.bankingData.type === 'freeze_card' && (
                          <div className="bg-red-950/90 border border-red-500/30 text-white p-3.5 rounded-2xl flex items-center gap-3">
                            <div className="size-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                              <Lock className="size-4" />
                            </div>
                            <div>
                              <h4 className="font-bold text-xs text-white">Card Security Locked</h4>
                              <p className="text-[10px] text-red-300">All outbound transactions halted sharp sharp.</p>
                            </div>
                          </div>
                        )}

                        {/* Audio CFO Insight */}
                        {msg.bankingData.type === 'insight' && (
                          <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-sky-500/30 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-sky-400 text-[10px] font-bold uppercase tracking-wider">
                                <Database className="size-3.5" />
                                <span>Audio CFO Analytics</span>
                              </div>
                              <Badge className="bg-sky-500/20 text-sky-300 text-[9px] border-none">
                                {msg.bankingData.intent.insightCategory || 'Spend'}
                              </Badge>
                            </div>
                            {msg.bankingData.intent.sqlQuery && (
                              <code className="block bg-black/50 text-sky-300 p-2 rounded-xl text-[10px] font-mono break-all leading-relaxed">
                                {msg.bankingData.intent.sqlQuery}
                              </code>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && !msg.isTyping && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
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

      {/* Voice Recording Waveform Banner (Active when listening) */}
      {isListening && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-700 text-white px-4 py-2.5 flex items-center justify-between shadow-lg animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="size-2.5 rounded-full bg-red-400 animate-ping shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-200">
                  Listening ({dialect.toUpperCase()})
                </span>
                <div className="flex items-center gap-0.5 h-3">
                  {waveform.bars.slice(0, 14).map((bar, i) => (
                    <span
                      key={i}
                      className="w-0.5 bg-white/80 rounded-full transition-all duration-75"
                      style={{ height: `${Math.max(3, bar * 0.16)}px` }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs font-medium text-white truncate mt-0.5">
                {interimTranscript || 'Speak your banking command or question…'}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={stopListening}
            className="h-7 text-[10px] uppercase font-bold text-white hover:bg-white/10 rounded-lg shrink-0 px-2.5 ml-2"
          >
            Done
          </Button>
        </div>
      )}

      {/* Input Bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Dialect-aware Mic toggle button */}
          <button
            type="button"
            onClick={handleMicToggle}
            className={cn(
              'size-10 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm',
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-red-500/30 ring-4 ring-red-500/20'
                : 'bg-violet-50 text-violet-600 hover:bg-violet-100'
            )}
            title={isListening ? 'Stop listening' : 'Start dialect voice banking'}
          >
            {isListening ? <MicOff className="size-4" /> : <Mic className="size-4" />}
          </button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                dialect === 'ibibio'
                  ? 'Kere Dara n̄kpọ m̀mê dɔk okuk…'
                  : dialect === 'pidgin'
                  ? 'Tell Dara make e transfer or ask anything…'
                  : 'Ask Dara anything or say a banking command…'
              }
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
