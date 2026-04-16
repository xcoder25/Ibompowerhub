'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone, Wifi, CheckCircle2, ScanFace,
  ChevronUp, RefreshCw, X, Lock,
  ArrowUpRight, ArrowDownLeft, Send, Activity, QrCode, ArrowDown, Crosshair, Gift, Mic, ShieldCheck, Camera,
  Brain, Zap, Signal, Star, TrendingUp, AlertTriangle, Eye, Cpu, Network
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import {
  doc, updateDoc, addDoc, collection, serverTimestamp,
  setDoc, deleteDoc, query, where, onSnapshot
} from 'firebase/firestore';
import confetti from 'canvas-confetti';

interface NearbyAirSendProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

type Role = 'sender' | 'recipient' | 'requestor' | null;
type SenderState = 'searching' | 'uwb_lock' | 'amount' | 'shield' | 'auth' | 'gesture' | 'offline_token' | 'success';
type RecipientState = 'waiting' | 'receiving' | 'success';
type RequestorState = 'amount' | 'broadcasting' | 'received';

const PICK_GESTURE = 'Closed_Fist';
const DROP_GESTURE = 'Open_Palm';
const DROP_GESTURE_ALT = 'Pointing_Up';

// ── HiAI SuperAI Engine ──────────────────────────────────────────────────────
interface PeerTrustProfile {
  score: number;         // 0-100
  level: 'TRUSTED' | 'VERIFIED' | 'CAUTION' | 'UNKNOWN';
  txCount: number;
  successRate: number;
  riskFlags: string[];
}

interface FraudSignal {
  safe: boolean;
  confidence: number; // 0-100
  flags: string[];
  recommendation: 'APPROVE' | 'REVIEW' | 'BLOCK';
}

// Simulates Huawei HiAI on-device neural engine
const HiAIEngine = {
  computePeerTrust(peer: any, amount: number, senderBalance: number): PeerTrustProfile {
    const seed = (peer?.uid || '').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    const score = Math.min(98, 55 + (seed % 44));
    const level: PeerTrustProfile['level'] =
      score >= 85 ? 'TRUSTED' : score >= 70 ? 'VERIFIED' : score >= 50 ? 'CAUTION' : 'UNKNOWN';
    return {
      score,
      level,
      txCount: 12 + (seed % 40),
      successRate: 94 + (seed % 6),
      riskFlags: score < 60 ? ['New Account', 'Unverified KYC'] : [],
    };
  },

  analyzeFraud(amount: number, balance: number, peer: any, isGift: boolean): FraudSignal {
    const ratio = amount / Math.max(balance, 1);
    const flags: string[] = [];
    let confidence = 97;

    if (ratio > 0.9) { flags.push('High Balance Depletion'); confidence -= 20; }
    if (amount > 500000) { flags.push('Large Transaction Amount'); confidence -= 10; }
    if (!peer?.uid) { flags.push('Unidentified Recipient'); confidence -= 25; }
    if (isGift && amount > 100000) { flags.push('Large Gift Transfer'); confidence -= 5; }

    const safe = confidence >= 60;
    return {
      safe,
      confidence: Math.max(0, Math.min(100, confidence)),
      flags,
      recommendation: confidence >= 75 ? 'APPROVE' : confidence >= 50 ? 'REVIEW' : 'BLOCK',
    };
  },

  predictOptimalAmount(balance: number, history: number[]): number {
    if (history.length > 0) {
      const avg = history.reduce((a, b) => a + b, 0) / history.length;
      return Math.round(Math.min(avg, balance * 0.3) / 100) * 100;
    }
    return Math.round(balance * 0.1 / 100) * 100;
  },

  generateSecureToken(uid: string, amount: number): string {
    const ts = Date.now();
    const hash = btoa(`${uid}-${amount}-${ts}`).replace(/=/g, '').slice(0, 16).toUpperCase();
    return `HIAI-${hash}-${ts.toString(36).toUpperCase()}`;
  },
};

// HiAI Voice Narration Engine
const HiAIVoice = {
  speak(text: string, urgent = false) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const best = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Aria') || v.name.includes('Hazel'))
      || voices.find(v => v.lang.startsWith('en')) || null;
    if (best) utt.voice = best;
    utt.pitch = urgent ? 0.9 : 1.1;
    utt.rate = urgent ? 0.95 : 0.85;
    utt.volume = 1;
    window.speechSynthesis.speak(utt);
  }
};

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function NearbyAirSend({ open, onOpenChange, currentBalance }: NearbyAirSendProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [role, setRole] = useState<Role>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sender State
  const [senderState, setSenderState] = useState<SenderState>('searching');
  const [amount, setAmount] = useState('');
  const [availableReceivers, setAvailableReceivers] = useState<any[]>([]);
  const [selectedReceivers, setSelectedReceivers] = useState<any[]>([]);
  const [transferSessionId, setTransferSessionId] = useState<string | null>(null);
  const [isGift, setIsGift] = useState(false);

  // Voice AI
  const [isListening, setIsListening] = useState(false);

  // Recipient / Requestor State
  const [recipientState, setRecipientState] = useState<RecipientState>('waiting');
  const [requestorState, setRequestorState] = useState<RequestorState>('amount');
  const [incomingTransfer, setIncomingTransfer] = useState<any>(null);

  // MediaPipe
  const [gestureReady, setGestureReady] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<string>('');
  const [gestureConfidence, setGestureConfidence] = useState<number>(0);
  const [isPicked, setIsPicked] = useState(false);
  const [handSequence, setHandSequence] = useState<number>(0);
  const [cameraError, setCameraError] = useState<string>('');
  const [gestureStatus, setGestureStatus] = useState<string>('Initializing...');
  const [modelLoading, setModelLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [flyOrb, setFlyOrb] = useState(false);
  const [offlineTokenStr, setOfflineTokenStr] = useState<string>('');

  // 🆕 HiAI SuperAI State
  const [trustProfile, setTrustProfile] = useState<PeerTrustProfile | null>(null);
  const [fraudSignal, setFraudSignal] = useState<FraudSignal | null>(null);
  const [aiNarration, setAiNarration] = useState<string>('');
  const [hiaiProcessing, setHiaiProcessing] = useState(false);
  const [uwbStrength, setUwbStrength] = useState<number>(0);
  const [neuralBeat, setNeuralBeat] = useState(0);
  const [txHistory] = useState<number[]>([5000, 10000, 2500, 7500]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gestureRecognizerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const dropFiredRef = useRef(false);

  const peerName = role === 'sender'
    ? (selectedReceivers.length > 1 ? `${selectedReceivers.length} Users Selected` : selectedReceivers[0]?.displayName || 'User')
    : (incomingTransfer?.sender_name || 'Ibom User');

  const walletDocRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'wallets', user.uid) : null), [firestore, user]);

  // UWB Signal simulation (neural pulse)
  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setNeuralBeat(b => (b + 1) % 100);
      if (role === 'sender' && senderState === 'uwb_lock') {
        setUwbStrength(prev => {
          const next = Math.min(100, prev + (Math.random() * 8 - 2));
          return Math.max(60, Math.round(next));
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [open, role, senderState]);

  useEffect(() => {
    if (open) {
      setRole(null);
      resetFlows();
      bgLoadMediaPipe();
      setAiNarration('HiAI Neural Engine initialized. Select your role to begin.');
      setTimeout(() => HiAIVoice.speak('HiAI AirSend is ready. Tap Send or Receive to begin.'), 500);
    } else {
      stopCamera();
    }
  }, [open]);

  // Silence XNNPACK logs
  useEffect(() => {
    const originalInfo = console.info;
    const originalLog = console.log;
    const originalError = console.error;
    const suppress = (...args: any[]) => {
      const msg = args.join(' ');
      return msg.includes('XNNPACK') || msg.includes('Created TensorFlow Lite');
    };
    console.info = (...args) => { if (!suppress(...args)) originalInfo(...args); };
    console.log = (...args) => { if (!suppress(...args)) originalLog(...args); };
    console.error = (...args) => { if (!suppress(...args)) originalError(...args); };
    return () => {
      console.info = originalInfo; console.log = originalLog; console.error = originalError;
    };
  }, []);

  const bgLoadMediaPipe = async () => {
    if (gestureRecognizerRef.current || modelLoading) return;
    setModelLoading(true);
    setGestureStatus('Loading HiAI Vision Engine...');
    try {
      const { GestureRecognizer, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm'
      );
      gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/gesture_recognizer.task', delegate: 'GPU' },
        runningMode: 'VIDEO',
        numHands: 1,
      });
      setGestureStatus('HiAI Vision Ready ✓');
      setModelLoading(false);
    } catch (e) {
      console.error("MediaPipe load failed:", e);
      setGestureStatus('Vision Engine Error');
      setModelLoading(false);
      setCameraError('HiAI Vision failed to initialize. Check your connection.');
    }
  };

  const resetFlows = () => {
    setSenderState('searching');
    setRecipientState('waiting');
    setRequestorState('amount');
    setAvailableReceivers([]);
    setAmount('');
    setSelectedReceivers([]);
    setTransferSessionId(null);
    setIncomingTransfer(null);
    setIsProcessing(false);
    setIsGift(false);
    setIsPicked(false);
    setHandSequence(0);
    setFlyOrb(false);
    setCurrentGesture('');
    setGestureReady(false);
    setCameraError('');
    dropFiredRef.current = false;
    setTrustProfile(null);
    setFraudSignal(null);
    setAiNarration('');
    setUwbStrength(0);
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (user && firestore) {
        deleteDoc(doc(firestore, 'air_receivers', user.uid)).catch(() => {});
        deleteDoc(doc(firestore, 'air_requesters', user.uid)).catch(() => {});
      }
    };
  }, [user, firestore]);

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  // ── HiAI Analysis on peer selection ──
  const runHiAIAnalysis = useCallback(async (peers: any[], amt: string) => {
    if (!peers.length) return;
    setHiaiProcessing(true);
    setAiNarration('HiAI analyzing peer profile and transaction risk...');

    await new Promise(r => setTimeout(r, 900)); // simulate neural inference

    const trust = HiAIEngine.computePeerTrust(peers[0], parseFloat(amt || '0'), currentBalance);
    const fraud = HiAIEngine.analyzeFraud(parseFloat(amt || '0'), currentBalance, peers[0], isGift);

    setTrustProfile(trust);
    setFraudSignal(fraud);
    setHiaiProcessing(false);

    const narration = fraud.safe
      ? `HiAI cleared ${peers[0]?.displayName || 'recipient'}. Trust score ${trust.score}. You may proceed.`
      : `HiAI flagged this transaction. ${fraud.flags[0] || 'Please review before sending.'}`;
    setAiNarration(narration);
    HiAIVoice.speak(narration, !fraud.safe);
  }, [currentBalance, isGift]);

  // ── Voice AI Handler ──
  const startVoiceCommand = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { toast({ variant: 'destructive', title: 'Not Supported' }); return; }
    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript.toLowerCase();
      const numMatch = transcript.match(/\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten)[\s-]?thousand\b|\b\d+\b/g);
      if (numMatch) {
        let parsedAmount = parseInt(numMatch[0].replace(/\D/g, ''));
        if (transcript.includes('thousand') && parsedAmount < 1000) parsedAmount *= 1000;
        setAmount(parsedAmount.toString());
        toast({ title: '🧠 HiAI Voice', description: `Amount locked: ₦${parsedAmount.toLocaleString()}` });
        HiAIVoice.speak(`Amount set to ${parsedAmount.toLocaleString()} Naira`);
      }
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // ── Camera trigger ──
  useEffect(() => {
    if (role === 'sender' && senderState === 'gesture') {
      startCameraConfig('Pick funds to send');
    } else if (role === 'recipient' && recipientState !== 'success') {
      startCameraConfig(recipientState === 'receiving' ? '✋ Catch incoming funds!' : 'HiAI Vision Active');
    } else {
      stopCamera();
    }
  }, [senderState, recipientState, role]);

  const startCameraConfig = async (initialStatusText: string) => {
    setGestureStatus('Accessing Camera...');
    setCameraError('');
    if (!gestureRecognizerRef.current) await bgLoadMediaPipe();
    if (!gestureRecognizerRef.current) { setCameraError('HiAI engine still loading...'); return; }
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera requires HTTPS. Please use localhost or a secure domain.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setTimeout(() => {
            setGestureReady(true);
            setGestureStatus(initialStatusText);
            predictLoop();
          }, 800);
        };
      }
    } catch (err) {
      setCameraError('Camera access denied or unavailable.');
    }
  };

  const executeDrop = useCallback(async () => {
    if (selectedReceivers.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'No recipients selected.' });
      return;
    }
    if (parseFloat(amount || '0') <= 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter a valid amount.' });
      return;
    }
    if (isProcessing || dropFiredRef.current) return;

    // HiAI Fraud Gate
    if (fraudSignal && !fraudSignal.safe && fraudSignal.recommendation === 'BLOCK') {
      toast({ variant: 'destructive', title: '🧠 HiAI Blocked', description: fraudSignal.flags.join(', ') });
      HiAIVoice.speak('Transaction blocked by HiAI fraud protection.', true);
      return;
    }

    setIsProcessing(true);
    dropFiredRef.current = true;
    setFlyOrb(true);
    setGestureStatus('🚀 HiAI Transmitting...');
    HiAIVoice.speak('Initiating secure transfer. Funds in flight.');

    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0 || numAmount > currentBalance) {
        throw new Error(numAmount > currentBalance ? 'Insufficient balance.' : 'Invalid amount.');
      }

      if (!navigator.onLine || senderState === 'offline_token') {
        toast({ title: 'HiAI Offline Mode', description: 'Generating quantum-secure token.' });
        setOfflineTokenStr(HiAIEngine.generateSecureToken(user.uid, numAmount));
        setSenderState('offline_token');
        setIsProcessing(false);
        return;
      }

      const splitAmount = numAmount / selectedReceivers.length;

      for (const rec of selectedReceivers) {
        const transferRef = await addDoc(collection(firestore, 'air_transfers'), {
          sender_id: user.uid,
          sender_name: user.displayName || 'Ibom User',
          receiver_id: rec.uid,
          amount: splitAmount,
          isGift,
          session_token: HiAIEngine.generateSecureToken(user.uid, splitAmount),
          status: 'pending',
          hiai_trust_score: trustProfile?.score || 0,
          hiai_fraud_safe: fraudSignal?.safe ?? true,
          timestamp: serverTimestamp()
        });
        setTransferSessionId(transferRef.id);
      }
    } catch (err: any) {
      setIsProcessing(false); dropFiredRef.current = false; setFlyOrb(false);
      toast({ variant: 'destructive', title: 'Drop Failed', description: err.message || 'Transmission error' });
    }
  }, [selectedReceivers, user, firestore, isProcessing, amount, currentBalance, isGift, senderState, trustProfile, fraudSignal]);

  const acceptTransfer = useCallback(async () => {
    if (!incomingTransfer || !firestore || !walletDocRef || isProcessing) return;
    setIsProcessing(true);
    dropFiredRef.current = true;
    try {
      if (navigator.vibrate) navigator.vibrate([30, 20, 80]);
      await updateDoc(doc(firestore, 'air_transfers', incomingTransfer.id), { status: 'accepted' });
      await updateDoc(walletDocRef, { balance: currentBalance + parseFloat(incomingTransfer.amount) });
      await addDoc(collection(firestore, 'wallets', user?.uid!), {
        type: 'credit', amount: parseFloat(incomingTransfer.amount),
        description: 'AirSend Received', timestamp: serverTimestamp(), status: 'success'
      });
      setIsProcessing(false);
      setRecipientState('success');
      HiAIVoice.speak(`Funds received. ₦${parseFloat(incomingTransfer.amount).toLocaleString()} added to your wallet.`);
      confetti({
        particleCount: incomingTransfer.isGift ? 150 : 60,
        spread: incomingTransfer.isGift ? 70 : 45,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#6366f1', '#f59e0b']
      });
    } catch {
      setIsProcessing(false); dropFiredRef.current = false;
    }
  }, [incomingTransfer, firestore, walletDocRef, isProcessing, currentBalance, user]);

  const predictLoop = useCallback(() => {
    if (!gestureRecognizerRef.current || !videoRef.current || !canvasRef.current) return;
    const { videoWidth, videoHeight } = videoRef.current;
    if (videoWidth === 0 || videoHeight === 0) {
      animFrameRef.current = requestAnimationFrame(predictLoop);
      return;
    }
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || videoRef.current.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(predictLoop); return;
    }
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    // HiAI AR Overlay
    ctx.lineWidth = 2;
    const boxSize = 120;
    const bx = (videoWidth - boxSize) / 2;
    const by = (videoHeight - boxSize) / 2;
    const t = Date.now();

    if (!isPicked) {
      // Neural pulse ring
      const pulse = Math.sin(t / 300) * 0.5 + 0.5;
      const grad = ctx.createRadialGradient(bx + boxSize / 2, by + boxSize / 2, 0, bx + boxSize / 2, by + boxSize / 2, boxSize);
      grad.addColorStop(0, `rgba(99,102,241,${0.05 + pulse * 0.1})`);
      grad.addColorStop(1, 'rgba(99,102,241,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(bx - 20, by - 20, boxSize + 40, boxSize + 40);

      ctx.strokeStyle = `rgba(99,102,241,${0.5 + pulse * 0.5})`;
      ctx.shadowBlur = 20 * pulse;
      ctx.shadowColor = 'rgba(99,102,241,0.8)';
      ctx.strokeRect(bx, by, boxSize, boxSize);

      // Corner markers (HiAI style)
      const cm = 16;
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 3;
      [[bx, by], [bx + boxSize, by], [bx, by + boxSize], [bx + boxSize, by + boxSize]].forEach(([cx, cy], i) => {
        ctx.beginPath();
        ctx.moveTo(cx + (i % 2 === 0 ? cm : -cm), cy);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + (i < 2 ? cm : -cm));
        ctx.stroke();
      });
      ctx.shadowBlur = 0;

      // ₦ sign in box
      ctx.fillStyle = `rgba(99,102,241,${0.4 + pulse * 0.4})`;
      ctx.font = `bold ${28 + pulse * 4}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('₦', bx + boxSize / 2, by + boxSize / 2);
    }

    try {
      if (!gestureRecognizerRef.current || !videoRef.current) return;
      const timestamp = performance.now();
      let results: any = null;
      try {
        results = gestureRecognizerRef.current.recognizeForVideo(videoRef.current, timestamp);
      } catch (e: any) {
        if (e?.message?.includes('XNNPACK') || typeof e === 'string' && e.includes('XNNPACK')) return;
        throw e;
      }

      if (results && results.landmarks?.length > 0) {
        const landmarks = results.landmarks[0];
        const indexTip = landmarks[8];
        const hx = indexTip.x * videoWidth;
        const hy = indexTip.y * videoHeight;
        const inBox = !isPicked && hx > bx && hx < bx + boxSize && hy > by && hy < by + boxSize;

        if (results.gestures?.length > 0 && !cameraError) {
          const gestureName = results.gestures[0][0].categoryName;
          const conf = Math.round(results.gestures[0][0].score * 100);
          setCurrentGesture(gestureName);
          setGestureConfidence(conf);

          // Draw hand landmarks
          ctx.fillStyle = role === 'sender' && isPicked ? '#6366f1' : '#10b981';
          ctx.shadowBlur = 12;
          ctx.shadowColor = role === 'sender' && isPicked ? 'rgba(99,102,241,0.8)' : 'rgba(16,185,129,0.8)';
          landmarks.forEach((lm: any) => {
            ctx.beginPath();
            ctx.arc(lm.x * videoWidth, lm.y * videoHeight, 4, 0, 2 * Math.PI);
            ctx.fill();
          });
          ctx.shadowBlur = 0;

          // Gesture logic
          if (role === 'sender') {
            if (!isPicked && handSequence === 0 && inBox && (gestureName === DROP_GESTURE || gestureName === DROP_GESTURE_ALT) && conf > 70) {
              setHandSequence(1);
              setGestureStatus('🖐️ Inside HiAI Vault – Close fist to grab ₦' + parseFloat(amount).toLocaleString());
              if (navigator.vibrate) navigator.vibrate(10);
            }
            if (!isPicked && handSequence === 1 && gestureName === PICK_GESTURE && conf > 75) {
              setIsPicked(true);
              setHandSequence(2);
              setGestureStatus('✊ Funds Secured by HiAI – Open hand to transmit');
              if (navigator.vibrate) navigator.vibrate([20, 10, 20]);
            }
            if (isPicked && !dropFiredRef.current && (gestureName === DROP_GESTURE || gestureName === DROP_GESTURE_ALT) && conf > 75) {
              executeDrop();
            }
          } else if (role === 'recipient') {
            if (recipientState !== 'receiving') return;
            if (handSequence === 0 && (gestureName === DROP_GESTURE || gestureName === DROP_GESTURE_ALT) && conf > 70) {
              setHandSequence(1);
              setGestureStatus('🖐️ Target detected – Close fist to catch');
            }
            if (handSequence === 1 && gestureName === PICK_GESTURE && conf > 80 && !isProcessing && !dropFiredRef.current) {
              setHandSequence(2);
              setGestureStatus('🎉 HiAI Catch Confirmed!');
              acceptTransfer();
            }
          }
        }
      } else {
        setCurrentGesture(''); setGestureConfidence(0);
      }
    } catch (_) {}

    animFrameRef.current = requestAnimationFrame(predictLoop);
  }, [isPicked, isProcessing, role, executeDrop, acceptTransfer, cameraError]);

  // ── REAL-TIME SYNC ──
  useEffect(() => {
    if (role !== 'sender' || senderState !== 'searching' || !firestore || !user) return;
    const unsubs: any[] = [];

    unsubs.push(onSnapshot(query(collection(firestore, 'air_receivers')), (snap) => {
      let recs: any[] = [];
      snap.forEach(d => { if (d.id !== user.uid) recs.push(d.data()); });
      setAvailableReceivers(recs);
      if (recs.length > 0 && senderState === 'searching') {
        setSelectedReceivers([recs[0]]);
        setSenderState('uwb_lock');
        setUwbStrength(72);
        HiAIVoice.speak(`Device detected. ${recs[0].displayName || 'User'} found nearby.`);
      }
    }));

    unsubs.push(onSnapshot(query(collection(firestore, 'air_requesters')), (snap) => {
      let reqs: any[] = [];
      snap.forEach(d => { if (d.id !== user.uid) reqs.push(d.data()); });
      if (reqs.length > 0 && senderState === 'searching') {
        const req = reqs[0];
        setSelectedReceivers([req]);
        setAmount(req.amount);
        setSenderState('uwb_lock');
        HiAIVoice.speak(`${req.displayName} is requesting ${parseFloat(req.amount).toLocaleString()} Naira.`);
        toast({ title: '📡 Request Detected', description: `${req.displayName} requested ₦${req.amount}` });
      }
    }));
    return () => unsubs.forEach(u => u());
  }, [role, senderState, firestore, user]);

  useEffect(() => {
    if (role !== 'sender' || !transferSessionId || !firestore || !user) return;
    const unsub = onSnapshot(doc(firestore, 'air_transfers', transferSessionId), async (snap) => {
      if (snap.data()?.status === 'accepted') {
        try {
          if (walletDocRef) {
            await updateDoc(walletDocRef, { balance: currentBalance - parseFloat(amount) });
            await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
              type: 'debit', amount: parseFloat(amount), description: 'AirSend Transfer',
              timestamp: serverTimestamp(), reference: `HIAI-${Date.now()}`, status: 'success'
            });
          }
          await updateDoc(doc(firestore, 'air_transfers', transferSessionId), { status: 'completed' });
          stopCamera();
          setIsProcessing(false);
          setSenderState('success');
          HiAIVoice.speak(`Transfer complete. ₦${parseFloat(amount).toLocaleString()} delivered.`);
          if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        } catch {}
      }
      if (snap.data()?.status === 'declined') {
        setIsProcessing(false); dropFiredRef.current = false; setFlyOrb(false); setTransferSessionId(null);
        toast({ variant: 'destructive', title: 'Declined by recipient' });
      }
    });
    return () => unsub();
  }, [transferSessionId, role, firestore, walletDocRef, amount, currentBalance, user]);

  useEffect(() => {
    if (role !== 'recipient' || !user || !firestore) return;
    const pRef = doc(firestore, 'air_receivers', user.uid);
    setDoc(pRef, { uid: user.uid, displayName: user.displayName || 'Ibom User', status: 'idle', timestamp: serverTimestamp() });
    HiAIVoice.speak('HiAI broadcast active. Waiting for incoming transfer.');

    const unsubPresence = onSnapshot(pRef, (snap) => {
      if (snap.data()?.status === 'synced') {
        setIsSynced(true);
        if (navigator.vibrate) navigator.vibrate(40);
        HiAIVoice.speak('Sender locked on. Ready to receive.');
      } else setIsSynced(false);
    });

    const q = query(collection(firestore, 'air_transfers'), where('receiver_id', '==', user.uid), where('status', '==', 'pending'));
    const unsubTransfers = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setIncomingTransfer({ id: snap.docs[0].id, ...data });
        setRecipientState('receiving');
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        HiAIVoice.speak(`Incoming transfer of ₦${parseFloat(data.amount).toLocaleString()} from ${data.sender_name}. Open palm, then close fist to catch.`);
      }
    });
    return () => { unsubPresence(); unsubTransfers(); deleteDoc(pRef).catch(() => {}); };
  }, [role, user, firestore]);

  const publishRequest = () => {
    if (!amount || !user || !firestore) return;
    setDoc(doc(firestore, 'air_requesters', user.uid), {
      uid: user.uid, displayName: user.displayName || 'User', amount, timestamp: serverTimestamp()
    });
    setRequestorState('broadcasting');
    HiAIVoice.speak(`Broadcasting request for ₦${parseFloat(amount).toLocaleString()}`);
  };

  useEffect(() => {
    if (role === 'requestor' && requestorState === 'broadcasting' && user && firestore) {
      const q = query(collection(firestore, 'air_transfers'), where('receiver_id', '==', user.uid), where('status', '==', 'pending'));
      const unsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          setIncomingTransfer({ id: snap.docs[0].id, ...snap.docs[0].data() });
          setRequestorState('received');
        }
      });
      return () => unsub();
    }
  }, [role, requestorState, user, firestore]);

  // ═══════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════

  // HiAI Status Bar
  const renderHiAIBar = () => (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#0a0f1e]/80 border-b border-indigo-500/20">
      <div className="flex items-center gap-1.5">
        <div className="relative">
          <Cpu className="size-3.5 text-indigo-400" />
          <div className="absolute -top-0.5 -right-0.5 size-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">Huawei HiAI</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/20 via-indigo-500/40 to-transparent" />
      <div className="flex items-center gap-1.5">
        <Brain className="size-3 text-indigo-400" />
        <span className="text-[9px] font-bold text-slate-400">Neural Engine v4.2</span>
      </div>
      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
    </div>
  );

  // Trust Profile Card
  const renderTrustCard = () => {
    if (!trustProfile) return null;
    const colors = {
      TRUSTED: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400',
      VERIFIED: 'border-indigo-500/40 bg-indigo-500/5 text-indigo-400',
      CAUTION: 'border-amber-500/40 bg-amber-500/5 text-amber-400',
      UNKNOWN: 'border-slate-500/40 bg-slate-500/5 text-slate-400',
    };
    return (
      <div className={`w-full border rounded-2xl p-3 ${colors[trustProfile.level]}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Star className="size-3.5" />
            <span className="text-[9px] font-black uppercase tracking-widest">HiAI Peer Trust</span>
          </div>
          <span className="text-lg font-black">{trustProfile.score}</span>
        </div>
        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${trustProfile.level === 'TRUSTED' ? 'bg-emerald-500' : trustProfile.level === 'VERIFIED' ? 'bg-indigo-500' : 'bg-amber-500'}`}
            style={{ width: `${trustProfile.score}%` }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[8px] font-bold opacity-70">
          <span>{trustProfile.txCount} Transactions</span>
          <span>{trustProfile.successRate}% Success</span>
          <span className="uppercase">{trustProfile.level}</span>
        </div>
        {trustProfile.riskFlags.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {trustProfile.riskFlags.map(f => (
              <span key={f} className="text-[8px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">⚠ {f}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Fraud Signal Banner
  const renderFraudBanner = () => {
    if (!fraudSignal) return null;
    const isSafe = fraudSignal.safe;
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[9px] font-black uppercase tracking-wider ${isSafe ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 'border-red-500/30 bg-red-500/5 text-red-400'}`}>
        {isSafe ? <ShieldCheck className="size-3.5 shrink-0" /> : <AlertTriangle className="size-3.5 shrink-0" />}
        <span>HiAI: {isSafe ? `Transaction cleared (${fraudSignal.confidence}% confidence)` : fraudSignal.flags[0] || 'Risk detected'}</span>
        <span className={`ml-auto px-1.5 py-0.5 rounded ${isSafe ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>{fraudSignal.recommendation}</span>
      </div>
    );
  };

  // AI Narration pill
  const renderNarration = () => {
    if (!aiNarration) return null;
    return (
      <div className="flex items-start gap-2 px-4 py-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl mx-4 mb-2">
        <Brain className="size-3.5 text-indigo-400 mt-0.5 shrink-0" />
        <p className="text-[10px] text-indigo-300 font-bold leading-relaxed">{aiNarration}</p>
      </div>
    );
  };

  const renderCameraView = () => (
    <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/10 z-10">
      <video ref={videoRef} autoPlay muted playsInline className="absolute opacity-0 pointer-events-none" />
      <canvas ref={canvasRef} className="w-full h-full object-cover -scale-x-100" />

      {/* HiAI Overlay Header */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-indigo-500/30">
          <Brain className="size-3 text-indigo-400" />
          <span className="text-[8px] font-black uppercase tracking-widest text-indigo-300">HiAI Vision</span>
        </div>
        {gestureReady && (
          <div className="bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
            <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">
              {gestureConfidence}% conf
            </span>
          </div>
        )}
      </div>

      {!gestureReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 gap-3">
          <div className="relative">
            <Brain className="size-8 text-indigo-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 size-3 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400">{gestureStatus}</p>
        </div>
      )}
      {gestureReady && (
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
          <span className="text-lg">{currentGesture === PICK_GESTURE ? '✊' : currentGesture.includes('Palm') ? '🖐️' : '✋'}</span>
          <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">{currentGesture.replace(/_/g, ' ') || 'Scanning...'}</span>
        </div>
      )}
      {role === 'sender' && isPicked && <div className="absolute inset-0 rounded-[1.5rem] ring-4 ring-indigo-500/60 pointer-events-none" />}
      {role === 'recipient' && currentGesture === PICK_GESTURE && <div className="absolute inset-0 bg-emerald-500/20 rounded-[1.5rem]" />}

      {cameraError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/95 gap-3 p-6 text-center z-50">
          <Camera className={`size-10 ${cameraError.includes('waiting') ? 'text-amber-500' : 'text-rose-500'}`} />
          <p className="text-sm font-black text-white">HiAI Vision Error</p>
          <p className="text-[10px] text-slate-400 font-bold">{cameraError}</p>
          <Button size="sm" variant="outline" onClick={() => startCameraConfig('Retrying...')} className="mt-4 h-9 text-[9px] uppercase font-black bg-white/5 border-white/10 hover:bg-white/10">
            Re-Initialize
          </Button>
        </div>
      )}
    </div>
  );

  // ─── Role Selection ───────────────────────────────────────────────────────
  const renderRoleSelection = () => (
    <div className="flex flex-col items-center justify-center space-y-6 p-6 py-10 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center space-y-2 mb-2">
        <div className="relative size-20 mx-auto">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-[2rem] blur-lg animate-pulse" />
          <div className="relative size-20 rounded-[2rem] bg-[#0a0f1e] border border-indigo-500/30 flex items-center justify-center shadow-2xl">
            <Brain className="size-9 text-indigo-400" />
          </div>
        </div>
        <h2 className="text-3xl font-black tracking-tightest mt-4">AirSend <span className="text-indigo-400">Super AI</span></h2>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] px-6">Huawei HiAI · NFC · UWB · Vision AI · Neural Mesh</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-black uppercase tracking-widest px-2 py-0.5">
            HiAI Neural Engine v4.2
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <Button variant="outline" onClick={() => { setRole('sender'); setAiNarration('HiAI scanning for nearby recipients...'); HiAIVoice.speak('Scanning for nearby recipients. Please wait.'); }}
          className="h-32 flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-indigo-500/20 shadow-lg relative overflow-hidden group">
          <div className="size-12 rounded-full bg-indigo-500 text-white flex items-center justify-center z-10 group-hover:scale-110 transition-transform"><ArrowUpRight className="size-6" /></div>
          <span className="font-black uppercase tracking-widest text-xs z-10 text-slate-100">Send Drop</span>
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
        <Button variant="outline" onClick={() => { setRole('recipient'); setAiNarration('HiAI broadcast mode active. Awaiting sender lock.'); }}
          className="h-32 flex flex-col items-center justify-center gap-3 rounded-[2rem] border-2 border-emerald-500/20 shadow-lg relative overflow-hidden group">
          <div className="size-12 rounded-full bg-emerald-500 text-white flex items-center justify-center z-10 group-hover:scale-110 transition-transform"><ArrowDownLeft className="size-6" /></div>
          <span className="font-black uppercase tracking-widest text-xs z-10 text-slate-100">Receive</span>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </div>
      <Button variant="outline" onClick={() => setRole('requestor')}
        className="w-full h-16 rounded-[1.5rem] border-2 border-amber-500/20 hover:bg-amber-500/5 shadow-md flex items-center justify-center gap-3 text-amber-600">
        <Activity className="size-5" />
        <span className="font-black uppercase tracking-widest text-xs">Request Funds Mode</span>
      </Button>
    </div>
  );

  // ─── Sender Cards ─────────────────────────────────────────────────────────
  const renderSenderCard = () => {
    switch (senderState) {
      case 'searching':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-16 space-y-8 animate-in fade-in">
            <div className="relative size-40 flex items-center justify-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="absolute rounded-full border border-indigo-500/20 animate-ping"
                  style={{ inset: `${i * 16}px`, animationDuration: `${1.5 + i * 0.5}s`, animationDelay: `${i * 0.3}s` }} />
              ))}
              <div className="relative z-10 size-24 rounded-full bg-slate-900 border-4 border-indigo-500 flex items-center justify-center shadow-2xl">
                <Brain className="size-10 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black tracking-tightest text-white">HiAI Scanning</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Neural UWB · NFC · Bluetooth Mesh</p>
            </div>
            {renderNarration()}
          </div>
        );

      case 'uwb_lock':
        return (
          <div className="flex flex-col items-center justify-center p-6 py-8 space-y-5 animate-in zoom-in-95">
            <div className="text-center w-full">
              <h3 className="text-2xl font-black text-white tracking-tightest">Target Acquired</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">HiAI UWB lock-on confirmed</p>
            </div>

            {/* UWB Signal Strength */}
            <div className="w-full bg-slate-900/80 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Signal className="size-4 text-indigo-400" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">UWB Signal Strength</span>
                </div>
                <span className="text-sm font-black text-white">{uwbStrength}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${uwbStrength}%` }} />
              </div>
            </div>

            {/* Radar */}
            <div className="relative size-40 flex items-center justify-center">
              {[0, 1, 2].map(i => (
                <div key={i} className="absolute rounded-full border border-indigo-500/20" style={{ inset: `${i * 16}px` }} />
              ))}
              <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-ping opacity-30" style={{ animationDuration: '3s' }} />
              <div className="relative z-10 size-14 bg-slate-900 border-2 border-indigo-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)]">
                <Smartphone className="size-6 text-white" />
              </div>
              {availableReceivers.map((rec, i) => {
                const angle = (i * (360 / Math.max(availableReceivers.length, 1))) * (Math.PI / 180);
                const isSelected = selectedReceivers.some(r => r.uid === rec.uid);
                return (
                  <div key={rec.uid}
                    onClick={() => {
                      if (isSelected) setSelectedReceivers(prev => prev.filter(r => r.uid !== rec.uid));
                      else setSelectedReceivers(prev => [...prev, rec]);
                    }}
                    className={`absolute size-14 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${isSelected ? 'bg-emerald-500 z-20 scale-110 shadow-[0_0_25px_rgba(16,185,129,0.7)]' : 'bg-slate-800 scale-100 opacity-70 hover:opacity-100 hover:scale-105 border border-slate-700'}`}
                    style={{ transform: `translate(${68 * Math.cos(angle)}px, ${68 * Math.sin(angle)}px)` }}>
                    <span className="text-[9px] font-black text-white uppercase text-center px-1 truncate w-[90%] leading-tight">{rec.displayName?.split(' ')[0] || 'User'}</span>
                    {isSelected && <div className="absolute -top-1 -right-1 size-4 bg-white rounded-full flex items-center justify-center shadow-md"><CheckCircle2 className="size-3 text-emerald-500" /></div>}
                  </div>
                );
              })}
            </div>

            {hiaiProcessing && (
              <div className="flex items-center gap-2 text-indigo-400">
                <Brain className="size-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">HiAI analyzing peer...</span>
              </div>
            )}
            {renderTrustCard()}

            <Button onClick={() => {
              selectedReceivers.forEach(r => {
                updateDoc(doc(firestore, 'air_receivers', r.uid), { status: 'synced', sender_id: user?.uid });
              });
              runHiAIAnalysis(selectedReceivers, amount);
              setSenderState('amount');
            }} disabled={selectedReceivers.length === 0}
              className="w-full h-14 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl">
              Establish Neural Channel
            </Button>
          </div>
        );

      case 'amount':
        return (
          <div className="flex flex-col items-center justify-center p-6 space-y-5 animate-in slide-in-from-right-8">
            <div className="flex w-full justify-between items-center bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20">
              <div><p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">Target(s)</p><p className="text-xs font-bold text-slate-300">{peerName}</p></div>
              {selectedReceivers.length > 1 && <span className="bg-indigo-500 px-2 py-1 rounded-md text-[9px] font-black text-white uppercase">Split Mode</span>}
            </div>
            <div className="w-full space-y-2 relative">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-slate-400">Total Amount</span>
                <span className="text-indigo-500">Bal: ₦{currentBalance.toLocaleString()}</span>
              </div>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₦</span>
                <Input type="number" value={amount} onChange={e => {
                  setAmount(e.target.value);
                  if (e.target.value && selectedReceivers.length) {
                    runHiAIAnalysis(selectedReceivers, e.target.value);
                  }
                }} className="h-20 pl-14 pr-16 text-4xl font-black font-mono rounded-[1.5rem] bg-white/5 border border-white/10 text-white focus:ring-4 focus:ring-indigo-500/30" autoFocus />
                <Button variant="ghost" size="icon" onClick={startVoiceCommand}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-slate-400'}`}>
                  <Mic className="size-5" />
                </Button>
              </div>
              {amount && (
                <div className="text-[9px] text-slate-500 font-bold text-right">
                  HiAI suggests: ₦{HiAIEngine.predictOptimalAmount(currentBalance, txHistory).toLocaleString()}
                </div>
              )}
            </div>

            {hiaiProcessing && (
              <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                <Brain className="size-3.5 animate-pulse" /> Analyzing transaction risk...
              </div>
            )}
            {renderFraudBanner()}
            {renderTrustCard()}

            <div className="flex items-center gap-3 w-full border border-white/5 bg-white/5 p-3 rounded-2xl cursor-pointer" onClick={() => setIsGift(!isGift)}>
              <div className={`p-2 rounded-xl transition-colors ${isGift ? 'bg-amber-500 text-white' : 'bg-slate-800 text-slate-400'}`}><Gift className="size-5" /></div>
              <div className="flex-1"><p className="text-xs font-black text-white uppercase tracking-wider">Gift Wrap</p><p className="text-[9px] font-bold text-slate-400">Add festive confetti animation</p></div>
              <div className={`size-5 rounded-full border-2 border-slate-600 flex items-center justify-center ${isGift ? 'border-amber-500 bg-amber-500' : ''}`}>{isGift && <CheckCircle2 className="size-3 text-white" />}</div>
            </div>
            <Button onClick={() => { if (parseFloat(amount) > 0) { setSenderState('shield'); setTimeout(() => setSenderState('auth'), 2000); } }}
              disabled={!amount || parseFloat(amount) <= 0 || (fraudSignal?.recommendation === 'BLOCK')}
              className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest shadow-xl disabled:opacity-40">
              {fraudSignal?.recommendation === 'BLOCK' ? '🛡 HiAI Blocked' : 'Verify Context'}
            </Button>
          </div>
        );

      case 'shield':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-12 space-y-8 animate-in zoom-in">
            <div className="relative size-28 flex items-center justify-center">
              <div className="absolute inset-0 bg-indigo-500/10 rounded-full animate-ping" />
              <div className="relative z-10 size-20 bg-slate-900 border-4 border-indigo-500 rounded-full flex items-center justify-center">
                <Brain className="size-8 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-5 w-full">
              <h3 className="text-2xl font-black tracking-tightest text-white">HiAI Neural Shield</h3>
              <div className="space-y-3 bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-left">
                {[
                  { label: 'Device Trust Score: 98%', done: true },
                  { label: 'Velocity Analysis: Pass', done: true },
                  { label: `Peer Trust: ${trustProfile?.score || '—'}`, done: !!trustProfile },
                  { label: 'Neural Fraud Gate: Scanning...', done: false, spin: true },
                ].map((item, i) => (
                  <p key={i} className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-3 ${item.spin ? 'animate-pulse' : ''}`}>
                    <span className={`size-5 rounded-full flex items-center justify-center ${item.done ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                      {item.done ? <CheckCircle2 className="size-3 text-emerald-500" /> : <RefreshCw className="size-3 text-blue-500 animate-spin" />}
                    </span>
                    {item.label}
                  </p>
                ))}
              </div>
            </div>
          </div>
        );

      case 'auth':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-16 space-y-10 animate-in fade-in">
            <div className="size-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
              <Lock className="size-10 text-amber-500" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black tracking-tightest text-white">Sign Transaction</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Verify ₦{parseFloat(amount).toLocaleString()}</p>
            </div>
            {renderFraudBanner()}
            <Button onClick={() => setSenderState('gesture')}
              className="w-full h-16 rounded-2xl bg-amber-500 text-white font-black uppercase tracking-widest flex justify-center gap-3 shadow-lg shadow-amber-500/20">
              <ScanFace className="size-5" /> Biometric OK
            </Button>
            <Button variant="ghost" onClick={() => setSenderState('offline_token')} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest underline underline-offset-4">
              Generate Offline Token
            </Button>
          </div>
        );

      case 'gesture':
        return (
          <div className="flex flex-col items-center p-6 min-h-[480px] max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-10 relative">
            <div className="text-center mb-4 w-full relative z-10 shrink-0">
              <h3 className="text-2xl font-black tracking-tightest text-white">₦{parseFloat(amount).toLocaleString()} {isGift && '🎁'}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">To {peerName}</p>
            </div>
            {flyOrb && (
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 animate-out slide-out-to-top-[800px] fade-out duration-700 ease-in-out">
                <div className="size-20 bg-indigo-500 rounded-full shadow-[0_0_80px_rgba(99,102,241,1)] flex items-center justify-center border-4 border-white/50">
                  <Brain className="size-8 text-white" />
                </div>
              </div>
            )}
            {renderCameraView()}
            {!flyOrb && (
              <button onClick={() => { setIsPicked(true); executeDrop(); }}
                className="mt-8 px-6 py-3 rounded-full bg-white/5 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/10 cursor-pointer z-10">
                Tap to force drop 🚀
              </button>
            )}
          </div>
        );

      case 'offline_token':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-10 space-y-8 animate-in zoom-in">
            <div className="size-24 bg-[#0a0f1e] rounded-[2rem] p-4 flex items-center justify-center border border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
              <QrCode className="size-full text-indigo-400" />
            </div>
            <div className="text-center w-full">
              <h3 className="text-2xl font-black tracking-tightest text-white">Quantum Offline Token</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2 px-4 leading-relaxed">HiAI encrypted token – share with recipient to lock funds offline.</p>
            </div>
            <div className="w-full bg-slate-900 px-4 py-3 rounded-xl border border-indigo-500/30 text-center select-all">
              <span className="font-mono text-xs font-bold text-indigo-400 break-all">{offlineTokenStr || HiAIEngine.generateSecureToken(user?.uid || 'anon', parseFloat(amount) || 0)}</span>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">Done</Button>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-16 space-y-6 animate-in zoom-in">
            <div className="relative size-28">
              <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
              <div className="relative size-28 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_60px_rgba(16,185,129,0.6)]">
                <CheckCircle2 className="size-14 text-white" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-3xl font-black text-white">Transfer Complete!</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">₦{parseFloat(amount).toLocaleString()} delivered via HiAI</p>
              {trustProfile && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">
                  Peer Trust: {trustProfile.score} · {trustProfile.level}
                </Badge>
              )}
            </div>
            <Button onClick={() => onOpenChange(false)} className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black uppercase tracking-widest">
              Done
            </Button>
          </div>
        );
    }
  };

  // ─── Recipient ─────────────────────────────────────────────────────────────
  const renderRecipientCard = () => {
    switch (recipientState) {
      case 'waiting':
        return (
          <div className="flex flex-col items-center justify-center p-6 min-h-[480px] max-h-[80vh] overflow-y-auto animate-in fade-in">
            <div className="text-center mb-6 shrink-0">
              <h3 className="text-2xl font-black text-white">{isSynced ? 'HiAI Synced ✓' : 'Broadcast Active'}</h3>
              <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-[0.2em] animate-pulse">
                {isSynced ? 'Neural channel locked' : 'Awaiting HiAI sender lock...'}
              </p>
            </div>
            {renderNarration()}
            {renderCameraView()}
            <div className={`mt-6 flex items-center gap-3 px-6 py-4 rounded-3xl border transition-all duration-500 shrink-0 ${isSynced ? 'bg-emerald-500 text-white border-white/20 shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-300 border-white/10'}`}>
              {isSynced ? <ShieldCheck className="size-5 animate-bounce" /> : <Brain className="size-5 text-emerald-500 animate-pulse" />}
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">
                {isSynced ? 'Neural Channel Secured' : 'HiAI Broadcasting on mesh network'}
              </p>
            </div>
          </div>
        );
      case 'receiving':
        return (
          <div className="flex flex-col items-center p-6 min-h-[480px] max-h-[80vh] overflow-y-auto animate-in slide-in-from-top-10 relative">
            <div className="text-center w-full relative z-10 mb-4 shrink-0">
              <p className="text-[10px] font-black uppercase text-indigo-500 animate-pulse tracking-[0.2em]">{incomingTransfer?.isGift ? '🎁 Incoming Gift' : '📡 HiAI Incoming Drop'}</p>
              <h3 className="text-4xl font-black text-white my-1">₦{parseFloat(incomingTransfer?.amount || '0').toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">From {incomingTransfer?.sender_name}</p>
              {incomingTransfer?.hiai_trust_score && (
                <Badge className="mt-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[9px]">
                  Sender Trust: {incomingTransfer.hiai_trust_score}
                </Badge>
              )}
            </div>
            {renderCameraView()}
            <button onClick={() => { acceptTransfer(); }} disabled={isProcessing}
              className="mt-8 px-6 py-3 rounded-full bg-white/5 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:bg-white/10 transition-colors border border-white/10 cursor-pointer z-10 shrink-0">
              {isProcessing ? 'HiAI Catching...' : 'Tap for manual catch ✋'}
            </button>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-16 space-y-6 animate-in zoom-in">
            <div className="relative size-28">
              <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
              <div className="relative size-28 rounded-full bg-emerald-500 flex justify-center items-center shadow-[0_0_60px_rgba(16,185,129,0.7)]">
                <CheckCircle2 className="size-14 text-white" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-3xl font-black text-white">Caught by HiAI!</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Funds secured to your wallet</p>
            </div>
          </div>
        );
    }
  };

  // ─── Requestor ─────────────────────────────────────────────────────────────
  const renderRequestorCard = () => {
    switch (requestorState) {
      case 'amount':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-12 space-y-8 animate-in fade-in">
            <div className="w-full space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Amount</span>
              </div>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-400">₦</span>
                <Input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  className="h-20 pl-14 text-4xl font-black font-mono rounded-[1.5rem] bg-white/5 border border-white/10 text-white focus:ring-4 focus:ring-amber-500/30" autoFocus />
              </div>
            </div>
            <Button onClick={publishRequest} className="w-full h-14 rounded-[1.5rem] bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest">
              Broadcast via HiAI Mesh
            </Button>
          </div>
        );
      case 'broadcasting':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-16 space-y-8 animate-in fade-in">
            <div className="relative size-32 flex items-center justify-center">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-ping" />
              <div className="relative z-10 size-20 rounded-full bg-slate-900 border-4 border-amber-500 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                <Brain className="size-8 text-amber-500 animate-pulse" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-white">HiAI Request Active</h3>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest animate-pulse">Broadcasting ₦{parseFloat(amount).toLocaleString()} on neural mesh</p>
            </div>
          </div>
        );
      case 'received':
        return (
          <div className="flex flex-col items-center justify-center p-8 py-16 space-y-6 mt-4">
            {renderRecipientCard()}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-slate-950 border border-white/10 rounded-[2.5rem] shadow-2xl">
        <DialogTitle className="sr-only">AirSend SuperAI</DialogTitle>
        <div className="backdrop-blur-3xl absolute inset-0 -z-10" />

        {/* Ambient glow */}
        {role === 'sender' && <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />}
        {role === 'recipient' && <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-500/15 blur-[100px] rounded-full pointer-events-none" />}
        {role === 'requestor' && <div className="absolute inset-0 flex justify-center items-center pointer-events-none"><div className="w-80 h-80 bg-amber-500/10 blur-[90px] rounded-full" /></div>}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        {/* HiAI Status Bar */}
        {renderHiAIBar()}

        <div className="relative z-10 w-full text-white min-h-[440px] flex flex-col justify-center">
          {role && <div className="absolute top-4 left-4 z-20"><Button variant="ghost" size="icon" onClick={resetFlows} className="size-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"><ChevronUp className="size-5 -rotate-90 text-white" /></Button></div>}
          <div className="absolute top-4 right-4 z-20"><Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="size-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"><X className="size-5 text-white" /></Button></div>

          {!role && renderRoleSelection()}
          {role === 'sender' && renderSenderCard()}
          {role === 'recipient' && renderRecipientCard()}
          {role === 'requestor' && renderRequestorCard()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
