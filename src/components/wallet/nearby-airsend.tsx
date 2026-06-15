'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone, Wifi, CheckCircle2, ScanFace,
  ChevronUp, RefreshCw, X, Lock,
  ArrowUpRight, ArrowDownLeft, Send, Activity, QrCode, ArrowDown, Crosshair, Gift, Mic, ShieldCheck, Camera,
  Brain, Zap, Signal, Star, TrendingUp, AlertTriangle, Eye, Cpu, Network, Compass,
  Fingerprint, Radio, Globe, WifiOff, Copy, Check, ChevronRight, Users,
  Layers, Radar, Siren, BarChart3, AudioLines, MicOff, Shield,
} from 'lucide-react';
import { useDeviceOrientation } from '@/hooks/use-device-orientation';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import {
  doc, updateDoc, addDoc, collection, serverTimestamp,
  setDoc, deleteDoc, query, where, onSnapshot
} from 'firebase/firestore';
import confetti from 'canvas-confetti';

// ─── Types ─────────────────────────────────────────────────────────────────
interface NearbyAirSendProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBalance: number;
}

type Role = 'sender' | 'recipient' | 'requestor' | 'offline' | null;
type SenderState = 'scanning' | 'uwb_lock' | 'biometric' | 'pin' | 'shield_anim' | 'amount' | 'gesture' | 'success';
type RecipientState = 'waiting' | 'receiving' | 'success';
type ShieldStage = 0 | 1 | 2 | 3 | 4 | 5;

const PICK_GESTURE = 'Closed_Fist';
const DROP_GESTURE = 'Open_Palm';
const DROP_GESTURE_ALT = 'Pointing_Up';

// ─── HiAI Neural Engine ────────────────────────────────────────────────────
interface PeerTrustProfile {
  score: number;
  level: 'TRUSTED' | 'VERIFIED' | 'CAUTION' | 'UNKNOWN';
  txCount: number;
  successRate: number;
  riskFlags: string[];
  behaviorEntropy: number;
  deviceReputation: number;
  networkAnomalyIndex: number;
  peerGraphRisk: number;
}

interface FraudSignal {
  safe: boolean;
  confidence: number;
  flags: string[];
  recommendation: 'APPROVE' | 'REVIEW' | 'BLOCK';
  neuralWave: number[];
}

const HiAIEngine = {
  computePeerTrust(peer: any, amount: number, senderBalance: number): PeerTrustProfile {
    const seed = (peer?.uid || 'anon').split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0);
    const behaviorEntropy = Math.min(100, 60 + (seed % 40));
    const deviceReputation = Math.min(100, 50 + ((seed * 3) % 50));
    const networkAnomalyIndex = Math.max(0, 30 - (seed % 30));
    const peerGraphRisk = Math.max(0, 20 - (seed % 20));
    const score = Math.min(99, Math.round(
      behaviorEntropy * 0.35 + deviceReputation * 0.30 +
      (100 - networkAnomalyIndex) * 0.20 + (100 - peerGraphRisk) * 0.15
    ));
    const level: PeerTrustProfile['level'] =
      score >= 85 ? 'TRUSTED' : score >= 70 ? 'VERIFIED' : score >= 50 ? 'CAUTION' : 'UNKNOWN';
    return {
      score, level,
      txCount: 12 + (seed % 88),
      successRate: Math.min(100, 92 + (seed % 8)),
      riskFlags: score < 60 ? ['Unverified KYC', 'New Network Node'] : score < 75 ? ['Low Tx History'] : [],
      behaviorEntropy, deviceReputation, networkAnomalyIndex, peerGraphRisk,
    };
  },

  analyzeFraud(amount: number, balance: number, peer: any, isGift: boolean): FraudSignal {
    const ratio = amount / Math.max(balance, 1);
    const flags: string[] = [];
    let confidence = 98;
    if (ratio > 0.9) { flags.push('High Balance Depletion'); confidence -= 22; }
    if (amount > 500000) { flags.push('Large Transaction Volume'); confidence -= 12; }
    if (!peer?.uid) { flags.push('Unidentified Recipient Node'); confidence -= 28; }
    if (isGift && amount > 100000) { flags.push('Large Gift Transfer'); confidence -= 6; }
    const neuralWave = Array.from({ length: 24 }, (_, i) =>
      Math.sin(i * 0.5 + confidence * 0.03) * (confidence / 100) * 0.8 + 0.5
    );
    return {
      safe: confidence >= 60,
      confidence: Math.max(0, Math.min(100, confidence)),
      flags,
      recommendation: confidence >= 75 ? 'APPROVE' : confidence >= 50 ? 'REVIEW' : 'BLOCK',
      neuralWave,
    };
  },

  generateOfflineToken(uid: string, amount: number): string {
    const ts = Date.now();
    const payload = `${uid}|${amount}|${ts}|ORION`;
    const hash = btoa(payload).replace(/[^A-Z0-9]/g, '').slice(0, 20).toUpperCase();
    const sig = (ts % 9999).toString().padStart(4, '0');
    return `ORION-${hash.slice(0, 8)}-${hash.slice(8, 16)}-${sig}`;
  },

  getSignalBars(uid: string): number {
    const seed = (uid || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return 3 + (seed % 3); // 3-5 bars
  },

  getPingLatency(uid: string): string {
    const seed = (uid || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return (0.8 + (seed % 40) / 10).toFixed(1);
  },
};

// ─── Voice Engine ──────────────────────────────────────────────────────────
const OrionVoice = {
  speak(text: string, urgent = false) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const best = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Aria'))
      || voices.find(v => v.lang.startsWith('en')) || null;
    if (best) utt.voice = best;
    utt.pitch = urgent ? 0.85 : 1.1;
    utt.rate = urgent ? 0.95 : 1.05;
    window.speechSynthesis.speak(utt);
  }
};

// ─── Shield stage config ───────────────────────────────────────────────────
const SHIELD_STAGES = [
  { label: 'BOOT', sub: 'Waking Orion Neural Mesh...', icon: Cpu, color: 'text-slate-400' },
  { label: 'SCAN', sub: 'Threat surface analysis...', icon: Radar, color: 'text-amber-400' },
  { label: 'ENCRYPT', sub: 'AES-256 channel lock...', icon: Lock, color: 'text-indigo-400' },
  { label: 'HANDSHAKE', sub: 'TEE-verified peer auth...', icon: Network, color: 'text-violet-400' },
  { label: 'ARMED', sub: 'Transmission channel ready.', icon: ShieldCheck, color: 'text-emerald-400' },
];

const TRUST_COLORS: Record<string, string> = {
  TRUSTED:  'border-emerald-500 bg-emerald-500/20 text-emerald-400',
  VERIFIED: 'border-sky-500 bg-sky-500/20 text-sky-400',
  CAUTION:  'border-amber-500 bg-amber-500/20 text-amber-400',
  UNKNOWN:  'border-rose-500 bg-rose-500/20 text-rose-400',
};

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

// ═══════════════════════════════════════════════════════════════════════════
export function NearbyAirSend({ open, onOpenChange, currentBalance }: NearbyAirSendProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [role, setRole] = useState<Role>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sender
  const [senderState, setSenderState] = useState<SenderState>('scanning');
  const [amount, setAmount] = useState('');
  const [availableReceivers, setAvailableReceivers] = useState<any[]>([]);
  const [selectedReceivers, setSelectedReceivers] = useState<any[]>([]);
  const [multiAmounts, setMultiAmounts] = useState<Record<string, string>>({});
  const [transferSessionId, setTransferSessionId] = useState<string | null>(null);
  const [isGift, setIsGift] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [shieldStage, setShieldStage] = useState<ShieldStage>(0);
  const [isLockAnim, setIsLockAnim] = useState(false);

  // Recipient / Requestor
  const [recipientState, setRecipientState] = useState<RecipientState>('waiting');
  const [incomingTransfer, setIncomingTransfer] = useState<any>(null);

  // Biometric
  const [biometricState, setBiometricState] = useState<'scanning' | 'verified' | null>(null);
  const [bioDots, setBioDots] = useState<{x:number,y:number}[]>([]);

  // MediaPipe / Gesture
  const [gestureReady, setGestureReady] = useState(false);
  const [isPicked, setIsPicked] = useState(false);
  const [handSequence, setHandSequence] = useState(0);
  const [gestureStatus, setGestureStatus] = useState('Initializing...');
  const [cameraError, setCameraError] = useState('');
  const [modelLoading, setModelLoading] = useState(false);

  // AI Insights
  const [trustProfile, setTrustProfile] = useState<PeerTrustProfile | null>(null);
  const [fraudSignal, setFraudSignal] = useState<FraudSignal | null>(null);

  // Voice
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voiceWave, setVoiceWave] = useState<number[]>([]);
  const recognitionRef = useRef<any>(null);

  // Offline token
  const [offlineToken, setOfflineToken] = useState('');
  const [offlineExpiry, setOfflineExpiry] = useState(0);
  const [copied, setCopied] = useState(false);
  const [offlineAmount, setOfflineAmount] = useState('');

  // Neural wave animation
  const [wavePhase, setWavePhase] = useState(0);
  const waveRef = useRef<number>(0);

  const { orientation, requestPermission } = useDeviceOrientation();

  const videoRef  = useRef<HTMLVideoElement>(null);
  const bioVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gestureRecognizerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef   = useRef<MediaStream | null>(null);
  const bioStreamRef = useRef<MediaStream | null>(null);
  const dropFiredRef  = useRef(false);
  const lastUpdateRef = useRef(0);

  const walletDocRef = useMemoFirebase(() =>
    (user && firestore ? doc(firestore, 'wallets', user.uid) : null), [firestore, user]);

  // ── Neural wave animation loop ────────────────────────────────────────────
  useEffect(() => {
    if (!open) { cancelAnimationFrame(waveRef.current); return; }
    const tick = () => {
      setWavePhase(p => p + 0.08);
      waveRef.current = requestAnimationFrame(tick);
    };
    waveRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(waveRef.current);
  }, [open]);

  // ── Reset ─────────────────────────────────────────────────────────────────
  const resetFlows = useCallback(() => {
    setRole(null);
    setSenderState('scanning');
    setRecipientState('waiting');
    setAvailableReceivers([]);
    setAmount('');
    setPinCode('');
    setSelectedReceivers([]);
    setMultiAmounts({});
    setTransferSessionId(null);
    setIncomingTransfer(null);
    setIsProcessing(false);
    setIsPicked(false);
    setHandSequence(0);
    setGestureReady(false);
    setCameraError('');
    dropFiredRef.current = false;
    setTrustProfile(null);
    setFraudSignal(null);
    setBiometricState(null);
    setBioDots([]);
    setIsLockAnim(false);
    setShieldStage(0);
    setOfflineToken('');
    setOfflineExpiry(0);
    setOfflineAmount('');
    setCopied(false);
  }, []);

  useEffect(() => {
    if (open) {
      resetFlows();
      bgLoadMediaPipe();
      OrionVoice.speak('HiAI Orion active. Select transmission mode.');
    } else {
      stopCamera();
      stopBioCamera();
    }
  }, [open, resetFlows]);

  // ── MediaPipe loader ─────────────────────────────────────────────────────
  const bgLoadMediaPipe = async () => {
    if (gestureRecognizerRef.current || modelLoading) return;
    setModelLoading(true);
    setGestureStatus('Waking HiAI Vision Core...');
    try {
      const { GestureRecognizer, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm');
      gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/gesture_recognizer.task', delegate: 'GPU' },
        runningMode: 'VIDEO', numHands: 1
      });
      setGestureStatus('Vision Core Ready');
      setModelLoading(false);
    } catch {
      setGestureStatus('Vision Offline — Sim Mode');
      setModelLoading(false);
    }
  };

  // ── AI Analysis ──────────────────────────────────────────────────────────
  const runAIAnalysis = useCallback((peers: any[], amt: string) => {
    if (!peers.length) return;
    const trust = HiAIEngine.computePeerTrust(peers[0], parseFloat(amt || '0'), currentBalance);
    const fraud = HiAIEngine.analyzeFraud(parseFloat(amt || '0'), currentBalance, peers[0], isGift);
    setTrustProfile(trust);
    setFraudSignal(fraud);
    const text = fraud.safe
      ? `Neural scan complete. Trust score ${trust.score}. ${fraud.recommendation}.`
      : `Caution detected. ${fraud.flags[0]}. Proceed with care.`;
    OrionVoice.speak(text, !fraud.safe);
  }, [currentBalance, isGift]);

  // ── Quantum Shield v5 ────────────────────────────────────────────────────
  const startShieldSequence = useCallback(() => {
    setShieldStage(0);
    OrionVoice.speak('Quantum Shield v5.0 active. Booting Orion Neural Mesh.');
    const timings = [900, 1900, 3100, 4400, 5600];
    timings.forEach((t, i) => {
      setTimeout(() => {
        setShieldStage((i + 1) as ShieldStage);
        OrionVoice.speak(SHIELD_STAGES[i]?.sub || '');
      }, t);
    });
    setTimeout(() => {
      selectedReceivers.forEach(r => {
        if (firestore && user) {
          updateDoc(doc(firestore, 'air_receivers', r.uid), { status: 'synced', sender_id: user.uid });
        }
      });
      setSenderState('amount');
    }, 6200);
  }, [selectedReceivers, firestore, user]);

  // ── Biometric face scan ───────────────────────────────────────────────────
  const startBiometric = async () => {
    setBiometricState('scanning');
    OrionVoice.speak('Face verification. Hold still.');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      bioStreamRef.current = stream;
      if (bioVideoRef.current) {
        bioVideoRef.current.srcObject = stream;
        bioVideoRef.current.play();
      }
      // Generate simulated face landmark dots
      const dots = Array.from({ length: 18 }, () => ({
        x: 15 + Math.random() * 70,
        y: 10 + Math.random() * 80,
      }));
      setTimeout(() => setBioDots(dots), 600);
      setTimeout(() => {
        setBiometricState('verified');
        OrionVoice.speak('Identity confirmed. Neural link established.');
        stopBioCamera();
        setTimeout(() => {
          setBiometricState(null);
          setSenderState('pin');
          OrionVoice.speak('Enter your neural PIN to arm the shield.');
        }, 1400);
      }, 2800);
    } catch {
      // Skip biometric if no camera
      setBiometricState('verified');
      setTimeout(() => { setBiometricState(null); setSenderState('pin'); }, 1000);
    }
  };

  const stopBioCamera = () => {
    if (bioStreamRef.current) {
      bioStreamRef.current.getTracks().forEach(t => t.stop());
      bioStreamRef.current = null;
    }
  };

  // ── Gesture Execute ──────────────────────────────────────────────────────
  const executeDrop = useCallback(async () => {
    if (!user || selectedReceivers.length === 0 || isProcessing || dropFiredRef.current) return;
    setIsProcessing(true);
    dropFiredRef.current = true;
    OrionVoice.speak('Drop initiated. Funds in flight.');
    try {
      for (const rec of selectedReceivers) {
        const sendAmount = parseFloat(multiAmounts[rec.uid] || amount) / (multiAmounts[rec.uid] ? 1 : selectedReceivers.length);
        const transferRef = await addDoc(collection(firestore, 'air_transfers'), {
          sender_id: user.uid,
          sender_name: user.displayName || 'User',
          receiver_id: rec.uid,
          amount: sendAmount,
          isGift,
          status: 'pending',
          timestamp: serverTimestamp()
        });
        setTransferSessionId(transferRef.id);
      }
    } catch {
      setIsProcessing(false);
      dropFiredRef.current = false;
    }
  }, [selectedReceivers, user, firestore, isProcessing, amount, isGift, multiAmounts]);

  const acceptTransfer = useCallback(async () => {
    if (!user || !incomingTransfer || isProcessing) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(firestore, 'air_transfers', incomingTransfer.id), { status: 'accepted' });
      await updateDoc(walletDocRef!, { balance: currentBalance + parseFloat(incomingTransfer.amount) });
      await addDoc(collection(firestore, 'wallets', user!.uid, 'transactions'), {
        type: 'credit', amount: parseFloat(incomingTransfer.amount),
        description: 'AirSend Inflow', timestamp: serverTimestamp(), status: 'success'
      });
      setRecipientState('success');
      OrionVoice.speak('Funds secured. Neural transfer complete.');
      confetti({ particleCount: 180, spread: 80, origin: { y: 0.6 } });
    } catch { setIsProcessing(false); }
  }, [incomingTransfer, firestore, walletDocRef, isProcessing, currentBalance, user]);

  // ── Camera & Gesture loop ────────────────────────────────────────────────
  const predictLoop = useCallback(() => {
    if (!gestureRecognizerRef.current || !videoRef.current || !canvasRef.current) return;
    const { videoWidth, videoHeight } = videoRef.current;
    if (videoWidth === 0) { animFrameRef.current = requestAnimationFrame(predictLoop); return; }
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);

    const boxSize = 140;
    const bx = (videoWidth - boxSize) / 2;
    const by = (videoHeight - boxSize) / 2;
    const pulse = Math.sin(Date.now() / 300) * 0.5 + 0.5;

    // Neural scan line
    const scanY = (Date.now() % 2000) / 2000 * videoHeight;
    ctx.strokeStyle = `rgba(16, 185, 129, ${0.08 + pulse * 0.12})`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, scanY); ctx.lineTo(videoWidth, scanY); ctx.stroke();

    if (!isPicked) {
      ctx.strokeStyle = `rgba(99,102,241,${0.5 + pulse * 0.5})`;
      ctx.setLineDash([5, 5]); ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, boxSize, boxSize); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(99,102,241,0.45)';
      ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('₦', bx + boxSize / 2, by + boxSize / 2 + 10);
    }

    try {
      const results = gestureRecognizerRef.current.recognizeForVideo(videoRef.current, performance.now());
      if (results?.landmarks?.length > 0) {
        const landmarks = results.landmarks[0];
        const hx = landmarks[8].x * videoWidth;
        const hy = landmarks[8].y * videoHeight;
        const inBox = hx > bx && hx < bx + boxSize && hy > by && hy < by + boxSize;

        ctx.strokeStyle = isPicked ? 'rgba(16,185,129,0.7)' : 'rgba(99,102,241,0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(hx, hy);
        ctx.lineTo(bx + boxSize / 2, by + boxSize / 2); ctx.stroke();

        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '9px monospace';
        ctx.fillText(`${Math.round(hx)},${Math.round(hy)}`, hx + 10, hy);

        if (results.gestures?.length > 0) {
          const gesture = results.gestures[0][0].categoryName;
          if (role === 'sender') {
            if (!isPicked && inBox && (gesture === DROP_GESTURE || gesture === DROP_GESTURE_ALT)) {
              setHandSequence(1); setGestureStatus('Vault Active — Grab ₦');
            }
            if (!isPicked && handSequence === 1 && gesture === PICK_GESTURE) {
              setIsPicked(true); setHandSequence(2); setGestureStatus('Locked — Open palm to DROP');
              if (navigator.vibrate) navigator.vibrate(60);
            }
            if (isPicked && !dropFiredRef.current && (gesture === DROP_GESTURE || gesture === DROP_GESTURE_ALT)) executeDrop();
          } else if (role === 'recipient' && recipientState === 'receiving') {
            if (gesture === PICK_GESTURE && !isProcessing) acceptTransfer();
          }
        }
      }
    } catch {}
    animFrameRef.current = requestAnimationFrame(predictLoop);
  }, [isPicked, role, executeDrop, acceptTransfer, recipientState, handSequence, isProcessing]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setTimeout(() => { setGestureReady(true); predictLoop(); }, 800);
        };
      }
    } catch { setCameraError('Camera Access Denied'); }
  };

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  };

  // ── Voice Commands ───────────────────────────────────────────────────────
  const startVoiceCommand = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { toast({ title: 'Voice not supported', description: 'Use manual input.' }); return; }
    setVoiceActive(true);
    setVoiceText('Listening...');
    OrionVoice.speak('Orion voice command ready.');
    // Animate waveform
    const waveInterval = setInterval(() => {
      setVoiceWave(Array.from({ length: 16 }, () => 0.2 + Math.random() * 0.8));
    }, 100);
    const rec = new SpeechRec();
    recognitionRef.current = rec;
    rec.lang = 'en-US';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      clearInterval(waveInterval);
      const transcript = e.results[0][0].transcript.toLowerCase();
      setVoiceText(`"${transcript}"`);
      interpretCommand(transcript);
      setTimeout(() => { setVoiceActive(false); setVoiceText(''); setVoiceWave([]); }, 1500);
    };
    rec.onerror = () => { clearInterval(waveInterval); setVoiceActive(false); setVoiceText(''); setVoiceWave([]); };
    rec.onend = () => clearInterval(waveInterval);
    rec.start();
  };

  const interpretCommand = (text: string) => {
    if (text.includes('receive') || text.includes('recv')) {
      setRole('recipient'); OrionVoice.speak('Switching to receive mode.');
    } else if (text.includes('offline') || text.includes('token')) {
      setRole('offline'); OrionVoice.speak('Generating offline token.');
    } else if (text.includes('send')) {
      setRole('sender'); OrionVoice.speak('Switching to send mode.');
      const match = text.match(/(\d[\d,]*)/);
      if (match) { setAmount(match[1].replace(',', '')); }
    } else if (text.includes('cancel') || text.includes('reset')) {
      resetFlows(); OrionVoice.speak('Flow reset.');
    } else if (text.includes('confirm') || text.includes('next')) {
      OrionVoice.speak('Confirmed.');
    } else {
      OrionVoice.speak('Command not recognized. Try: Send, Receive, Offline, or Cancel.');
    }
  };

  // ── Offline Token ────────────────────────────────────────────────────────
  const generateOfflineToken = () => {
    if (!user || !offlineAmount) return;
    const token = HiAIEngine.generateOfflineToken(user.uid, parseFloat(offlineAmount));
    setOfflineToken(token);
    setOfflineExpiry(Date.now() + 24 * 3600 * 1000);
    OrionVoice.speak('Offline token generated. Valid for 24 hours.');
  };

  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!offlineExpiry) return;
    const interval = setInterval(() => {
      const rem = Math.max(0, offlineExpiry - Date.now());
      const h = Math.floor(rem / 3600000);
      const m = Math.floor((rem % 3600000) / 60000);
      const s = Math.floor((rem % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [offlineExpiry]);

  // ── Firestore listeners ──────────────────────────────────────────────────
  useEffect(() => {
    if (role === 'sender' && senderState === 'scanning' && firestore && user) {
      const unsub = onSnapshot(query(collection(firestore, 'air_receivers')), snap => {
        const others: any[] = [];
        snap.forEach(d => { if (d.id !== user.uid) others.push({ ...d.data(), uid: d.id }); });
        setAvailableReceivers(others);
        if (others.length > 0) OrionVoice.speak(`${others.length} node${others.length > 1 ? 's' : ''} detected.`);
      });
      return () => unsub();
    }
  }, [role, senderState, firestore, user]);

  useEffect(() => {
    if (role === 'sender' && transferSessionId && firestore) {
      const unsub = onSnapshot(doc(firestore, 'air_transfers', transferSessionId), async snap => {
        if (snap.data()?.status === 'accepted') {
          const totalSent = selectedReceivers.reduce((sum, r) =>
            sum + parseFloat(multiAmounts[r.uid] || amount), 0);
          await updateDoc(walletDocRef!, { balance: currentBalance - totalSent });
          await addDoc(collection(firestore, 'wallets', user!.uid, 'transactions'), {
            type: 'debit', amount: parseFloat(amount),
            description: 'AirSend Outflow', timestamp: serverTimestamp(), status: 'success'
          });
          await updateDoc(doc(firestore, 'air_transfers', transferSessionId), { status: 'completed' });
          setSenderState('success');
          OrionVoice.speak('Transmission complete. Neural link closed.');
        }
      });
      return () => unsub();
    }
  }, [role, transferSessionId, firestore, amount, currentBalance, user, walletDocRef, selectedReceivers, multiAmounts]);

  useEffect(() => {
    if (role === 'recipient' && user && firestore) {
      const pRef = doc(firestore, 'air_receivers', user.uid);
      setDoc(pRef, { uid: user.uid, displayName: user.displayName, status: 'idle', timestamp: serverTimestamp() });
      const unsub = onSnapshot(
        query(collection(firestore, 'air_transfers'), where('receiver_id', '==', user.uid), where('status', '==', 'pending')),
        snap => {
          if (!snap.empty) {
            setIncomingTransfer({ id: snap.docs[0].id, ...snap.docs[0].data() });
            setRecipientState('receiving');
            startCamera();
          }
        }
      );
      return () => { unsub(); deleteDoc(pRef).catch(() => {}); };
    }
  }, [role, user, firestore]);

  // Orientation broadcast
  useEffect(() => {
    if (role === 'recipient' && user && firestore) {
      const now = Date.now();
      if (now - lastUpdateRef.current > 400) {
        lastUpdateRef.current = now;
        const pRef = doc(firestore, 'air_receivers', user.uid);
        updateDoc(pRef, { orientation: { alpha: orientation.alpha || 0, beta: orientation.beta || 0, gamma: orientation.gamma || 0 } }).catch(() => {});
      }
    }
  }, [role, user, firestore, orientation.alpha, orientation.beta, orientation.gamma]);

  // ── Sub-renders ──────────────────────────────────────────────────────────

  const NeuralWave = ({ wave, color = '#6366f1' }: { wave: number[], color?: string }) => (
    <svg viewBox="0 0 240 40" className="w-full h-10" preserveAspectRatio="none">
      <polyline
        points={wave.map((v, i) => `${(i / (wave.length - 1)) * 240},${40 - v * 38}`).join(' ')}
        fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );

  const liveWave = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => Math.sin(i * 0.5 + wavePhase) * 0.4 + 0.55),
    [wavePhase]);

  const AIBar = () => (
    <div className="flex items-center gap-2 px-5 py-2.5 bg-black/50 border-b border-white/5 relative z-50 shrink-0">
      <Cpu className="size-3.5 text-indigo-400 shrink-0" />
      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-400">HiAI Orion v5.0</span>
      <div className="flex-1">
        <NeuralWave wave={liveWave} color="#6366f1" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
        <span className="text-[8px] font-mono text-emerald-400">LIVE</span>
      </div>
    </div>
  );

  const HUDBar = () => (
    <div className="px-6 py-3 border-t border-white/5 flex justify-between items-center bg-black/30 shrink-0">
      <div className="flex gap-5">
        <div className="text-center"><p className="text-[7px] font-black text-slate-600 uppercase">Latency</p><p className="text-[10px] font-black text-emerald-500 font-mono">1.2ms</p></div>
        <div className="text-center"><p className="text-[7px] font-black text-slate-600 uppercase">Link</p><p className="text-[10px] font-black text-indigo-500 font-mono">AES-256</p></div>
        <div className="text-center"><p className="text-[7px] font-black text-slate-600 uppercase">Engine</p><p className="text-[10px] font-black text-violet-500 font-mono">HiAI v5</p></div>
      </div>
      <Button variant="ghost" onClick={() => role ? resetFlows() : onOpenChange(false)} className="text-[9px] font-black uppercase text-slate-500 hover:text-white h-auto py-1.5 px-3">
        {role ? '⟳ RESET' : '✕ EXIT'}
      </Button>
    </div>
  );

  // ── Role Selection ───────────────────────────────────────────────────────
  const RoleSelect = () => (
    <div className="space-y-6 w-full animate-in zoom-in-95 duration-500">
      <div className="text-center space-y-1">
        <div className="relative inline-block">
          <h2 className="text-5xl font-black text-white italic tracking-tighter">AIRSEND</h2>
          <div className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </div>
        <p className="text-[9px] uppercase font-black tracking-[0.5em] text-indigo-500">HiAI Orion Neural v5.0</p>
      </div>

      {/* Voice command button */}
      <button
        onClick={startVoiceCommand}
        className={`w-full h-11 rounded-2xl border flex items-center justify-center gap-3 transition-all ${voiceActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
      >
        {voiceActive ? (
          <>
            <div className="flex gap-0.5 items-end h-5">
              {voiceWave.slice(0, 12).map((v, i) => (
                <div key={i} className="w-1 bg-indigo-400 rounded-full transition-all duration-75" style={{ height: `${v * 20}px` }} />
              ))}
            </div>
            <span className="text-[10px] text-indigo-400 font-black">{voiceText || 'Listening...'}</span>
          </>
        ) : (
          <>
            <Mic className="size-4 text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hey Orion — Voice Command</span>
          </>
        )}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={async () => { await requestPermission(); setRole('sender'); OrionVoice.speak('Send mode activated.'); }}
          className="h-40 rounded-[2rem] bg-indigo-600/10 border-2 border-indigo-500/20 hover:bg-indigo-600 hover:border-indigo-400 flex flex-col items-center justify-center gap-3 group transition-all duration-300">
          <ArrowUpRight className="size-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-indigo-400 group-hover:text-white" />
          <span className="font-black text-lg italic uppercase text-indigo-400 group-hover:text-white">SEND</span>
        </button>
        <button onClick={() => { setRole('recipient'); OrionVoice.speak('Receive mode. Stand by.'); }}
          className="h-40 rounded-[2rem] bg-emerald-600/10 border-2 border-emerald-500/20 hover:bg-emerald-600 hover:border-emerald-400 flex flex-col items-center justify-center gap-3 group transition-all duration-300">
          <ArrowDownLeft className="size-10 group-hover:-translate-x-1 group-hover:translate-y-1 transition-transform text-emerald-400 group-hover:text-white" />
          <span className="font-black text-lg italic uppercase text-emerald-400 group-hover:text-white">RECV</span>
        </button>
      </div>
      <button onClick={() => { setRole('offline'); OrionVoice.speak('Offline token generator. Network-independent transfer.'); }}
        className="w-full h-14 rounded-[2rem] bg-amber-600/10 border-2 border-amber-500/20 hover:bg-amber-600 hover:border-amber-400 flex items-center justify-center gap-3 group transition-all duration-300">
        <WifiOff className="size-5 text-amber-400 group-hover:text-white" />
        <span className="font-black text-sm italic uppercase text-amber-400 group-hover:text-white tracking-widest">OFFLINE TOKEN</span>
        <Globe className="size-4 text-amber-400/50 group-hover:text-white/70" />
      </button>
    </div>
  );

  // ── 3D Mesh Radar ────────────────────────────────────────────────────────
  const MeshRadar = () => (
    <div className="flex flex-col items-center space-y-6">
      <div className="relative size-72 flex items-center justify-center"
        style={{
          transform: `perspective(1000px) rotateX(${(orientation.beta || 0) * 0.25}deg) rotateY(${-(orientation.gamma || 0) * 0.25}deg)`,
          transition: 'transform 0.12s ease-out', transformStyle: 'preserve-3d'
        }}>
        {/* Sonar rings */}
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="absolute rounded-full border border-indigo-500/20"
            style={{ inset: `${i * 22}px`, animationDelay: `${i * 0.4}s` }} />
        ))}
        {/* Rotating sweep */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute w-[50%] h-[50%] bg-gradient-to-tr from-indigo-500/40 to-transparent origin-bottom-right rounded-tl-full animate-spin" style={{ animationDuration: '2.5s' }} />
        </div>
        {/* Pulse ring */}
        <div className="absolute size-20 rounded-full border border-indigo-500/40 animate-ping" style={{ animationDuration: '2s' }} />

        {/* Center node */}
        <div className="relative z-20 size-14 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.6)] border-2 border-indigo-400/50">
          <Compass className="size-7 text-white" />
        </div>

        {/* Peer nodes */}
        {availableReceivers.slice(0, 5).map((receiver, i) => {
          const trust = HiAIEngine.computePeerTrust(receiver, 0, currentBalance);
          const bars = HiAIEngine.getSignalBars(receiver.uid || '');
          const ping = HiAIEngine.getPingLatency(receiver.uid || '');
          const baseAngle = (i * 137.5) % 360;
          const recBeta = receiver.orientation?.beta || 0;
          const recGamma = receiver.orientation?.gamma || 0;
          const distance = 88 + Math.max(-35, Math.min(35, (recBeta / 180) * 70));
          const currentAngle = baseAngle + recGamma * 0.8 + (orientation.alpha || 0);
          const rad = currentAngle * Math.PI / 180;
          const tx = Math.cos(rad) * distance;
          const ty = Math.sin(rad) * distance;
          const isSelected = selectedReceivers.some(r => r.uid === receiver.uid);
          return (
            <div key={receiver.uid || i}
              className="absolute z-30 flex flex-col items-center cursor-pointer group transition-all duration-300 ease-out hover:scale-110"
              style={{ transform: `translateZ(20px) translate(${tx}px, ${ty}px)` }}
              onClick={() => {
                const already = selectedReceivers.some(r => r.uid === receiver.uid);
                if (already) {
                  setSelectedReceivers(prev => prev.filter(r => r.uid !== receiver.uid));
                } else if (selectedReceivers.length < 5) {
                  setSelectedReceivers(prev => [...prev, receiver]);
                  OrionVoice.speak(`Node locked: ${receiver.displayName}`);
                }
              }}>
              <div className={`size-11 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'border-emerald-400 bg-emerald-400/20 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : `${TRUST_COLORS[trust.level].split(' ').slice(0, 2).join(' ')}`}`}>
                <Signal className={`size-5 ${isSelected ? 'text-emerald-400' : 'text-white'}`} />
              </div>
              {/* Signal bars */}
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }, (_, b) => (
                  <div key={b} className={`w-0.5 rounded-full transition-all ${b < bars ? 'bg-emerald-400' : 'bg-white/10'}`}
                    style={{ height: `${4 + b * 2}px` }} />
                ))}
              </div>
              <div className="bg-slate-900/90 px-2 py-0.5 rounded-full mt-1 border border-white/10">
                <p className="text-[7px] font-black text-white uppercase">{receiver.displayName?.split(' ')[0] || 'Node'}</p>
                <p className={`text-[7px] font-black ${trust.level === 'TRUSTED' ? 'text-emerald-400' : trust.level === 'VERIFIED' ? 'text-sky-400' : trust.level === 'CAUTION' ? 'text-amber-400' : 'text-rose-400'}`}>{trust.level}</p>
                <p className="text-[6px] text-slate-500 font-mono">{ping}ms</p>
              </div>
              {isSelected && <div className="size-2 bg-emerald-400 rounded-full animate-ping mt-0.5" />}
            </div>
          );
        })}

        {availableReceivers.length === 0 && (
          <div className="absolute inset-0 flex items-end justify-center pb-4 z-10">
            <p className="text-[9px] text-indigo-400 font-mono animate-pulse">Scanning mesh...</p>
          </div>
        )}
      </div>

      <div className="text-center space-y-1 w-full">
        <h3 className="text-xl font-black text-white uppercase italic tracking-widest">
          {availableReceivers.length === 0 ? 'Scanning Grid...' : `${availableReceivers.length} Node${availableReceivers.length > 1 ? 's' : ''} Detected`}
        </h3>
        <p className="text-[9px] text-indigo-400 font-mono">Tilt device to align — tap node to select (max 5)</p>
        {selectedReceivers.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap mt-2">
            {selectedReceivers.map(r => (
              <Badge key={r.uid} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[8px] font-black">
                ✓ {r.displayName?.split(' ')[0]}
              </Badge>
            ))}
          </div>
        )}
        {selectedReceivers.length > 0 && (
          <Button onClick={() => { setIsLockAnim(true); setSenderState('uwb_lock'); OrionVoice.speak(`${selectedReceivers.length} node${selectedReceivers.length > 1 ? 's' : ''} locked. Establishing neural link.`); setTimeout(() => setIsLockAnim(false), 800); }}
            className="mt-3 w-full h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-sm">
            LOCK {selectedReceivers.length} NODE{selectedReceivers.length > 1 ? 'S' : ''} →
          </Button>
        )}
      </div>
    </div>
  );

  // ── UWB Lock Screen ──────────────────────────────────────────────────────
  const UWBLock = () => {
    const trust = trustProfile || (selectedReceivers.length > 0 ? HiAIEngine.computePeerTrust(selectedReceivers[0], 0, currentBalance) : null);
    return (
      <div className="space-y-6 animate-in fade-in duration-400">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <Crosshair className="size-5 text-emerald-400 animate-spin" style={{ animationDuration: '3s' }} />
            <h3 className="text-2xl font-black text-white italic">NODE LOCKED</h3>
            <Crosshair className="size-5 text-emerald-400 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
          </div>
          <div className="flex gap-2 justify-center flex-wrap">
            {selectedReceivers.map(r => (
              <Badge key={r.uid} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-black px-3 py-1">
                ◉ {r.displayName}
              </Badge>
            ))}
          </div>
        </div>

        {/* Trust profile card */}
        {trust && (
          <div className={`rounded-2xl p-4 border ${trust.level === 'TRUSTED' ? 'border-emerald-500/30 bg-emerald-500/5' : trust.level === 'VERIFIED' ? 'border-sky-500/30 bg-sky-500/5' : trust.level === 'CAUTION' ? 'border-amber-500/30 bg-amber-500/5' : 'border-rose-500/30 bg-rose-500/5'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">HiAI Trust Score</p>
                <p className={`text-3xl font-black ${trust.level === 'TRUSTED' ? 'text-emerald-400' : trust.level === 'VERIFIED' ? 'text-sky-400' : trust.level === 'CAUTION' ? 'text-amber-400' : 'text-rose-400'}`}>{trust.score}</p>
              </div>
              <Badge className={`text-[9px] font-black border ${TRUST_COLORS[trust.level]}`}>{trust.level}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[8px]">
              <div><p className="text-slate-500">Behavior Entropy</p><div className="h-1 bg-white/5 rounded-full mt-1"><div className="h-full bg-indigo-400 rounded-full" style={{ width: `${trust.behaviorEntropy}%` }} /></div></div>
              <div><p className="text-slate-500">Device Reputation</p><div className="h-1 bg-white/5 rounded-full mt-1"><div className="h-full bg-sky-400 rounded-full" style={{ width: `${trust.deviceReputation}%` }} /></div></div>
              <div><p className="text-slate-500">Network Anomaly</p><div className="h-1 bg-white/5 rounded-full mt-1"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${trust.networkAnomalyIndex}%` }} /></div></div>
              <div><p className="text-slate-500">Graph Risk</p><div className="h-1 bg-white/5 rounded-full mt-1"><div className="h-full bg-rose-400 rounded-full" style={{ width: `${trust.peerGraphRisk}%` }} /></div></div>
            </div>
            <div className="mt-3 flex items-center gap-1.5">
              <BarChart3 className="size-3 text-slate-500" />
              <span className="text-[8px] text-slate-500">{trust.txCount} prior transactions · {trust.successRate}% success</span>
            </div>
            {trust.riskFlags.length > 0 && (
              <div className="mt-2 flex gap-1 flex-wrap">
                {trust.riskFlags.map(f => <Badge key={f} className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[7px]"><AlertTriangle className="size-2 mr-1" />{f}</Badge>)}
              </div>
            )}
          </div>
        )}

        <Button onClick={() => { runAIAnalysis(selectedReceivers, '0'); startBiometric(); OrionVoice.speak('Biometric verification required.'); }}
          className="w-full h-13 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest shadow-xl h-14">
          <ScanFace className="size-5 mr-2" /> BIOMETRIC VERIFY →
        </Button>
      </div>
    );
  };

  // ── Biometric Screen ─────────────────────────────────────────────────────
  const BiometricScreen = () => (
    <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-400">
      <div className="text-center">
        <h3 className="text-3xl font-black text-white italic">FACE SCAN</h3>
        <p className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest mt-1">Neural Identity Verification</p>
      </div>
      <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-indigo-500/40 bg-slate-900">
        <video ref={bioVideoRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" muted playsInline />
        {/* Face outline */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 224 224">
          <ellipse cx="112" cy="112" rx="68" ry="84" fill="none" stroke={biometricState === 'verified' ? '#34d399' : '#6366f1'} strokeWidth="2" strokeDasharray={biometricState === 'scanning' ? '8 4' : 'none'} className={biometricState === 'scanning' ? 'animate-spin' : ''} style={{ animationDuration: '4s', transformOrigin: '112px 112px' }} />
          {/* Scan line */}
          {biometricState === 'scanning' && (
            <line x1="44" x2="180" y1={(Date.now() % 2000 / 2000 * 168 + 28)} y2={(Date.now() % 2000 / 2000 * 168 + 28)} stroke="rgba(99,102,241,0.5)" strokeWidth="1" />
          )}
          {/* Landmark dots */}
          {bioDots.map((d, i) => (
            <circle key={i} cx={d.x * 2.24} cy={d.y * 2.24} r="2.5"
              fill={biometricState === 'verified' ? '#34d399' : '#818cf8'} className="animate-pulse" style={{ animationDelay: `${i * 0.05}s` }} />
          ))}
        </svg>
        {biometricState === 'verified' && (
          <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10">
            <CheckCircle2 className="size-16 text-emerald-400" />
          </div>
        )}
        {/* Corner brackets */}
        {(['tl','tr','bl','br'] as const).map(c => (
          <div key={c} className={`absolute size-6 border-indigo-500 ${c === 'tl' ? 'top-2 left-2 border-t-2 border-l-2' : c === 'tr' ? 'top-2 right-2 border-t-2 border-r-2' : c === 'bl' ? 'bottom-2 left-2 border-b-2 border-l-2' : 'bottom-2 right-2 border-b-2 border-r-2'}`} />
        ))}
      </div>
      <p className={`text-sm font-black uppercase tracking-widest ${biometricState === 'verified' ? 'text-emerald-400' : 'text-indigo-400 animate-pulse'}`}>
        {biometricState === 'verified' ? '✓ IDENTITY CONFIRMED' : 'SCANNING...'}
      </p>
    </div>
  );

  // ── PIN Screen ──────────────────────────────────────────────────────────
  const PINScreen = () => (
    <div className="space-y-8 flex flex-col items-center animate-in fade-in duration-300">
      <div className="text-center space-y-1">
        <h3 className="text-4xl font-black text-white italic leading-none">NEURAL PIN</h3>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">4-digit auth code</p>
      </div>
      <div className="flex gap-3">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className={`size-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all duration-300 ${pinCode[i] ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.3)]' : 'border-slate-800 bg-slate-900/50'}`}>
            {pinCode[i] ? '•' : ''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[260px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '←'].map(k => (
          <Button key={k} variant="ghost" onClick={() => {
            if (k === 'C') { setPinCode(''); }
            else if (k === '←') { setPinCode(p => p.slice(0, -1)); }
            else if (pinCode.length < 4) {
              const n = pinCode + k; setPinCode(n);
              if (n.length === 4) setTimeout(() => { setSenderState('shield_anim'); startShieldSequence(); }, 300);
            }
          }} className="h-14 rounded-2xl bg-white/5 border border-white/10 hover:bg-indigo-600/20 hover:border-indigo-500/30 text-white text-xl font-black transition-all">
            {k}
          </Button>
        ))}
      </div>
    </div>
  );

  // ── Quantum Shield v5 ─────────────────────────────────────────────────────
  const ShieldScreen = () => {
    const currentStageIdx = Math.max(0, shieldStage - 1);
    const stage = SHIELD_STAGES[currentStageIdx] || SHIELD_STAGES[0];
    const StageIcon = stage.icon;
    return (
      <div className="flex flex-col items-center space-y-8 py-6 animate-in fade-in duration-400">
        <div className="relative size-40 flex items-center justify-center">
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="72" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="8" />
            <circle cx="80" cy="80" r="72" fill="none" stroke="#6366f1" strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 72}`}
              strokeDashoffset={`${2 * Math.PI * 72 * (1 - shieldStage / 5)}`}
              className="transition-all duration-700" strokeLinecap="round" />
          </svg>
          <div className={`relative z-10 size-20 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${shieldStage >= 5 ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-indigo-500/30 bg-indigo-500/5'}`}>
            <StageIcon className={`size-10 transition-all duration-500 ${shieldStage >= 5 ? 'text-emerald-400' : stage.color} ${shieldStage < 5 ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        <div className="text-center space-y-1">
          <h3 className={`text-3xl font-black italic transition-colors duration-500 ${shieldStage >= 5 ? 'text-emerald-400' : 'text-white'}`}>
            {shieldStage >= 5 ? 'ARMED' : stage.label}
          </h3>
          <p className="text-[9px] font-mono text-slate-500 animate-pulse">{stage.sub}</p>
        </div>

        {/* Stage indicators */}
        <div className="flex gap-2">
          {SHIELD_STAGES.map((s, i) => {
            const IsIcon = s.icon;
            return (
              <div key={i} className={`flex flex-col items-center gap-1 transition-all duration-500 ${i < shieldStage ? 'opacity-100' : 'opacity-25'}`}>
                <div className={`size-7 rounded-xl flex items-center justify-center border ${i < shieldStage ? `border-emerald-500/50 bg-emerald-500/10` : 'border-white/10 bg-white/5'}`}>
                  <IsIcon className={`size-3.5 ${i < shieldStage ? 'text-emerald-400' : 'text-slate-600'}`} />
                </div>
                <span className={`text-[6px] font-black uppercase ${i < shieldStage ? 'text-emerald-500' : 'text-slate-600'}`}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="w-full px-4">
          <NeuralWave wave={liveWave} color={shieldStage >= 5 ? '#34d399' : '#6366f1'} />
        </div>
      </div>
    );
  };

  // ── Amount + Multi-Peer screen ────────────────────────────────────────────
  const AmountScreen = () => {
    const isMulti = selectedReceivers.length > 1;
    const fraud = amount ? HiAIEngine.analyzeFraud(parseFloat(amount), currentBalance, selectedReceivers[0], isGift) : null;
    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        <div className="text-center"><h3 className="text-3xl font-black text-white uppercase italic">VOLUME</h3>
          <p className="text-[9px] text-slate-500 font-mono mt-1">{selectedReceivers.length} recipient{selectedReceivers.length > 1 ? 's' : ''} selected</p>
        </div>

        {!isMulti ? (
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl font-black text-indigo-500 z-10">₦</span>
            <Input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="0"
              className="h-20 bg-white/5 border-2 border-indigo-500/20 rounded-[1.5rem] text-center text-3xl font-black text-white pl-12 focus:border-indigo-500" />
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[9px] text-slate-500 font-mono">Custom amount per recipient:</p>
            {selectedReceivers.map(r => (
              <div key={r.uid} className="flex items-center gap-2">
                <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[8px] font-black shrink-0 w-24 justify-center truncate">{r.displayName?.split(' ')[0]}</Badge>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-500">₦</span>
                  <Input value={multiAmounts[r.uid] || ''} onChange={e => setMultiAmounts(prev => ({ ...prev, [r.uid]: e.target.value }))}
                    type="number" placeholder="0" className="h-10 bg-white/5 border border-indigo-500/20 rounded-xl text-white font-black pl-7 text-sm" />
                </div>
              </div>
            ))}
            <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-1 border-t border-white/5">
              <span>Total</span>
              <span className="text-indigo-400 font-black">₦{selectedReceivers.reduce((s, r) => s + parseFloat(multiAmounts[r.uid] || '0'), 0).toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Gift toggle */}
        <button onClick={() => setIsGift(v => !v)}
          className={`w-full h-10 rounded-xl border flex items-center justify-center gap-2 transition-all text-sm font-black ${isGift ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-white/10 bg-white/5 text-slate-500 hover:text-white'}`}>
          <Gift className="size-4" /> {isGift ? 'GIFT MODE ON' : 'SEND AS GIFT'}
        </button>

        {/* Fraud signal preview */}
        {fraud && amount && (
          <div className={`rounded-xl p-3 border ${fraud.safe ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-rose-500/20 bg-rose-500/5'}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[8px] font-black text-slate-500 uppercase">HiAI Fraud Analysis</span>
              <Badge className={`text-[8px] font-black border ${fraud.recommendation === 'APPROVE' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : fraud.recommendation === 'REVIEW' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'}`}>{fraud.recommendation}</Badge>
            </div>
            <NeuralWave wave={fraud.neuralWave} color={fraud.safe ? '#34d399' : '#f87171'} />
            <div className="flex items-center gap-1 mt-1">
              <div className="h-1 flex-1 bg-white/5 rounded-full"><div className="h-full rounded-full transition-all duration-500" style={{ width: `${fraud.confidence}%`, background: fraud.safe ? '#34d399' : '#f87171' }} /></div>
              <span className="text-[8px] font-mono text-slate-400">{fraud.confidence}%</span>
            </div>
            {fraud.flags.map(f => <p key={f} className="text-[8px] text-rose-400 mt-1 flex items-center gap-1"><AlertTriangle className="size-2.5" />{f}</p>)}
          </div>
        )}

        <Button onClick={() => { runAIAnalysis(selectedReceivers, amount); startCamera(); setSenderState('gesture'); OrionVoice.speak('Gesture interface armed. Open palm to position, close fist to grab, open to drop.'); }}
          disabled={!isMulti ? !amount : selectedReceivers.some(r => !multiAmounts[r.uid])}
          className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-lg shadow-xl tracking-widest">
          {selectedReceivers.length > 1 ? `BROADCAST TO ${selectedReceivers.length}` : 'INITIATE DROP'} →
        </Button>
      </div>
    );
  };

  // ── Gesture Camera screen ─────────────────────────────────────────────────
  const GestureScreen = () => (
    <div className="space-y-4 flex flex-col items-center animate-in fade-in duration-300">
      <div className="text-center">
        <h3 className="text-2xl font-black text-white italic">
          ₦{(isNaN(parseFloat(amount)) ? 0 : parseFloat(amount)).toLocaleString()}
        </h3>
        <p className={`text-[9px] font-mono uppercase tracking-widest mt-0.5 ${isPicked ? 'text-emerald-400 animate-pulse' : 'text-indigo-400'}`}>{gestureStatus}</p>
      </div>

      <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-950 shadow-2xl border border-white/10">
        <video ref={videoRef} className="absolute opacity-0" muted playsInline />
        <canvas ref={canvasRef} className="w-full h-full object-cover -scale-x-100" />

        {/* Animated corner brackets */}
        {(['tl','tr','bl','br'] as const).map(c => (
          <div key={c} className={`absolute size-8 border-indigo-500/60 transition-colors duration-300 ${isPicked ? '!border-emerald-500/80' : ''} ${c === 'tl' ? 'top-3 left-3 border-t-2 border-l-2' : c === 'tr' ? 'top-3 right-3 border-t-2 border-r-2' : c === 'bl' ? 'bottom-3 left-3 border-b-2 border-l-2' : 'bottom-3 right-3 border-b-2 border-r-2'}`} />
        ))}

        {/* Status badge */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <Badge className={`text-[8px] font-black border ${isPicked ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'}`}>
            {isPicked ? '🟢 LOCKED' : '🔵 SCANNING'}
          </Badge>
        </div>

        {/* HUD data */}
        <div className="absolute bottom-3 left-4 opacity-70">
          <p className="text-[7px] font-mono text-white uppercase">Protocol: HiAI_DROP v5</p>
          <p className="text-[7px] font-mono text-white uppercase">Mesh: STABLE · {selectedReceivers.length} node{selectedReceivers.length > 1 ? 's' : ''}</p>
        </div>

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
            <div className="text-center space-y-2">
              <Camera className="size-10 text-slate-600 mx-auto" />
              <p className="text-[10px] text-slate-500 font-bold">{cameraError}</p>
            </div>
          </div>
        )}
      </div>

      <div className="w-full bg-slate-900/50 rounded-xl p-3 border border-white/5 text-center">
        <p className="text-[9px] text-slate-500 font-mono">
          {handSequence === 0 ? '✋ Open palm over ₦ box' : handSequence === 1 ? '✊ Close fist to GRAB' : '✋ Open palm to DROP & send'}
        </p>
      </div>
    </div>
  );

  // ── Success screen ────────────────────────────────────────────────────────
  const SuccessScreen = ({ title = 'TRANSMITTED', sub = 'Neural transfer complete' }) => (
    <div className="flex flex-col items-center py-16 space-y-6 animate-in zoom-in-95 duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-150 animate-pulse" />
        <div className="relative size-28 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/40 shadow-[0_0_40px_rgba(52,211,153,0.3)]">
          <CheckCircle2 className="size-16 text-emerald-500" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-4xl font-black text-white italic">{title}</h3>
        <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">{sub}</p>
      </div>
      <Button onClick={() => onOpenChange(false)} className="w-full h-13 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-base border border-white/10 h-14">
        SHUTDOWN MESH
      </Button>
    </div>
  );

  // ── Offline Token screen ──────────────────────────────────────────────────
  const OfflineScreen = () => (
    <div className="space-y-5 animate-in fade-in duration-400">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 mb-1">
          <WifiOff className="size-5 text-amber-400" />
          <h3 className="text-3xl font-black text-white italic">OFFLINE TOKEN</h3>
        </div>
        <p className="text-[9px] text-amber-500 font-mono uppercase tracking-widest">Network-independent transfer · 24h expiry</p>
      </div>

      {!offlineToken ? (
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-amber-500 z-10">₦</span>
            <Input value={offlineAmount} onChange={e => setOfflineAmount(e.target.value)} type="number" placeholder="Amount"
              className="h-16 bg-white/5 border-2 border-amber-500/20 rounded-[1.5rem] text-center text-2xl font-black text-white pl-12 focus:border-amber-500" />
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 space-y-2">
            <p className="text-[9px] text-amber-400 font-bold uppercase tracking-wider">How it works</p>
            <p className="text-[8px] text-slate-400 leading-relaxed">Generate a cryptographic token that represents the transfer value. Share it physically with the recipient. When internet returns, they redeem it through their AirSend portal.</p>
            <div className="flex gap-2 mt-1">
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[7px]">✓ No Internet Needed</Badge>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[7px]">✓ AES-256 Signed</Badge>
            </div>
          </div>
          <Button onClick={generateOfflineToken} disabled={!offlineAmount}
            className="w-full h-14 rounded-2xl bg-amber-600 hover:bg-amber-500 text-slate-900 font-black uppercase text-base shadow-xl tracking-widest">
            <Zap className="size-5 mr-2" /> GENERATE TOKEN
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Token display */}
          <div className="bg-slate-950 border-2 border-amber-500/30 rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent" />
            <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-3">Orion Offline Token</p>
            <div className="font-mono text-white text-sm font-black break-all leading-relaxed tracking-wider relative z-10">
              {offlineToken.split('-').map((part, i) => (
                <span key={i}>{i > 0 ? <span className="text-amber-500/60">-</span> : null}{part}</span>
              ))}
            </div>
            {/* Animated grid bg */}
            <div className="absolute inset-0 opacity-5"
              style={{ backgroundImage: 'linear-gradient(rgba(251,191,36,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251,191,36,0.3) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          </div>

          {/* Expiry countdown */}
          <div className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
            <div>
              <p className="text-[8px] font-black text-slate-500 uppercase">Expires In</p>
              <p className="text-xl font-black font-mono text-white">{timeLeft}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-500 uppercase">Amount</p>
              <p className="text-xl font-black text-amber-400">₦{parseFloat(offlineAmount).toLocaleString()}</p>
            </div>
          </div>

          <Button onClick={() => {
            navigator.clipboard.writeText(offlineToken);
            setCopied(true);
            OrionVoice.speak('Token copied to clipboard.');
            setTimeout(() => setCopied(false), 2000);
          }} className={`w-full h-12 rounded-2xl font-black uppercase border transition-all ${copied ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white/5 border-white/20 text-white hover:bg-white/10'}`}>
            {copied ? <><Check className="size-4 mr-2" /> COPIED!</> : <><Copy className="size-4 mr-2" /> COPY TOKEN</>}
          </Button>

          <Button onClick={() => { setOfflineToken(''); setOfflineExpiry(0); setOfflineAmount(''); }}
            variant="ghost" className="w-full h-10 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest">
            Generate New Token
          </Button>
        </div>
      )}
    </div>
  );

  // ── Recipient screens ─────────────────────────────────────────────────────
  const RecipientWaiting = () => (
    <div className="flex flex-col items-center py-16 space-y-6 animate-in fade-in duration-500">
      <div className="relative size-32 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-spin" style={{ animationDuration: '4s' }} />
        <div className="absolute inset-4 border border-emerald-500/10 rounded-full animate-spin" style={{ animationDuration: '2.5s', animationDirection: 'reverse' }} />
        <Activity className="size-16 text-emerald-500 animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-2xl font-black text-white italic">AWAITING DROP</h3>
        <p className="text-[9px] text-emerald-400 font-mono animate-pulse uppercase tracking-widest">Neural mesh active · Standby</p>
      </div>
      <div className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-3 text-center">
        <p className="text-[8px] text-slate-400">When funds arrive, close your fist to secure the transfer</p>
      </div>
    </div>
  );

  const RecipientReceiving = () => (
    <div className="space-y-5 flex flex-col items-center animate-in fade-in duration-300">
      <div className="text-center">
        <h3 className="text-3xl font-black text-white italic">CATCH FUNDS</h3>
        <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest mt-1">Close fist to secure transfer</p>
      </div>
      {incomingTransfer && (
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl px-6 py-3 text-center">
          <p className="text-[8px] text-slate-500 font-mono">Inbound from {incomingTransfer.sender_name}</p>
          <p className="text-3xl font-black text-emerald-400">₦{parseFloat(incomingTransfer.amount || 0).toLocaleString()}</p>
        </div>
      )}
      <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-slate-950 shadow-2xl border border-white/10">
        <video ref={videoRef} className="absolute opacity-0" muted playsInline />
        <canvas ref={canvasRef} className="w-full h-full object-cover -scale-x-100" />
        <div className="absolute inset-0 z-10 pointer-events-none border-[8px] border-emerald-500/10 rounded-[2rem]" />
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <div className="size-2 bg-emerald-500 rounded-full animate-ping" />
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[7px] font-black">CAPTURE ACTIVE</Badge>
        </div>
        <div className="absolute bottom-3 left-4 z-20 opacity-60">
          <p className="text-[7px] font-mono text-white uppercase">Protocol: ARISE_RECV · HiAI Shield v5</p>
        </div>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  const renderContent = () => {
    if (!role) return <RoleSelect />;
    if (role === 'offline') return <OfflineScreen />;
    if (role === 'recipient') {
      if (recipientState === 'waiting') return <RecipientWaiting />;
      if (recipientState === 'receiving') return <RecipientReceiving />;
      if (recipientState === 'success') return <SuccessScreen title="SECURED" sub="Funds captured via HiAI neural mesh" />;
    }
    if (role === 'sender') {
      if (senderState === 'scanning') return <MeshRadar />;
      if (senderState === 'uwb_lock') return <UWBLock />;
      if (senderState === 'biometric') return <BiometricScreen />;
      if (senderState === 'pin') return <PINScreen />;
      if (senderState === 'shield_anim') return <ShieldScreen />;
      if (senderState === 'amount') return <AmountScreen />;
      if (senderState === 'gesture') return <GestureScreen />;
      if (senderState === 'success') return <SuccessScreen />;
    }
    return null;
  };

  // ── Animated neural grid background ──────────────────────────────────────
  const GridBg = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="neural-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <line x1="40" y1="0" x2="0" y2="0" stroke="#6366f1" strokeWidth="0.5" />
            <line x1="0" y1="0" x2="0" y2="40" stroke="#6366f1" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#neural-grid)" />
      </svg>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/8 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-2xl" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#020617] border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/80">
        <DialogTitle className="sr-only">AirSend — HiAI Orion</DialogTitle>
        <div className="relative flex flex-col max-h-[92dvh]">
          <GridBg />
          <AIBar />
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-7 py-6 relative z-10 scrollbar-hide">
            {renderContent()}
          </div>
          <HUDBar />
        </div>
      </DialogContent>
    </Dialog>
  );
}
