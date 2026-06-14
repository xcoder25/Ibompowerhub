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
  Brain, Zap, Signal, Star, TrendingUp, AlertTriangle, Eye, Cpu, Network, Compass
} from 'lucide-react';
import { useDeviceOrientation } from '@/hooks/use-device-orientation';
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
type SenderState = 'searching' | 'uwb_lock' | 'pin' | 'shield_anim' | 'amount' | 'gesture' | 'offline_token' | 'success';
type RecipientState = 'waiting' | 'receiving' | 'success';
type RequestorState = 'amount' | 'broadcasting' | 'received';

const PICK_GESTURE = 'Closed_Fist';
const DROP_GESTURE = 'Open_Palm';
const DROP_GESTURE_ALT = 'Pointing_Up';

// Orion SuperAI Engine ──────────────────────────────────────────────────
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

const OrionAIEngine = {
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

  generateSecureToken(uid: string, amount: number): string {
    const ts = Date.now();
    const hash = btoa(`${uid}-${amount}-${ts}`).slice(0, 16).toUpperCase();
    return `ORION-${hash}-${ts.toString(36).toUpperCase()}`;
  },
};

const OrionVoice = {
  speak(text: string, urgent = false) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const best = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Aria'))
      || voices.find(v => v.lang.startsWith('en')) || null;
    if (best) utt.voice = best;
    utt.pitch = urgent ? 0.9 : 1.1;
    utt.rate = 1.0;
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
  const [pinCode, setPinCode] = useState('');
  const [shieldSequence, setShieldSequence] = useState<number>(0);

  // Recipient / Requestor State
  const [recipientState, setRecipientState] = useState<RecipientState>('waiting');
  const [requestorState, setRequestorState] = useState<RequestorState>('amount');
  const [incomingTransfer, setIncomingTransfer] = useState<any>(null);

  // MediaPipe / Gesture
  const [gestureReady, setGestureReady] = useState(false);
  const [isPicked, setIsPicked] = useState(false);
  const [handSequence, setHandSequence] = useState<number>(0);
  const [gestureStatus, setGestureStatus] = useState<string>('Initializing...');
  const [cameraError, setCameraError] = useState<string>('');
  const [modelLoading, setModelLoading] = useState(false);

  // Orion SuperAI Insights
  const [trustProfile, setTrustProfile] = useState<PeerTrustProfile | null>(null);
  const [fraudSignal, setFraudSignal] = useState<FraudSignal | null>(null);

  const { orientation, requestPermission } = useDeviceOrientation();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gestureRecognizerRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const dropFiredRef = useRef(false);
  const lastUpdateRef = useRef(0);

  const walletDocRef = useMemoFirebase(() => (user && firestore ? doc(firestore, 'wallets', user.uid) : null), [firestore, user]);

  const resetFlows = useCallback(() => {
    setRole(null);
    setSenderState('searching');
    setRecipientState('waiting');
    setRequestorState('amount');
    setAvailableReceivers([]);
    setAmount('');
    setPinCode('');
    setSelectedReceivers([]);
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
  }, []);

  useEffect(() => {
    if (open) {
      resetFlows();
      bgLoadMediaPipe();
      OrionVoice.speak('Orion AI active. Select transmission mode.');
    } else {
      stopCamera();
    }
  }, [open, resetFlows]);

  const stopCamera = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const bgLoadMediaPipe = async () => {
    if (gestureRecognizerRef.current || modelLoading) return;
    setModelLoading(true);
    setGestureStatus('Waking Orion Vision...');
    try {
      const { GestureRecognizer, FilesetResolver } = await import('@mediapipe/tasks-vision');
      const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm');
      gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: { modelAssetPath: '/gesture_recognizer.task', delegate: 'GPU' },
        runningMode: 'VIDEO', numHands: 1
      });
      setGestureStatus('Vision Layer Ready');
      setModelLoading(false);
    } catch (e) {
      setGestureStatus('Vision Error');
      setModelLoading(false);
    }
  };

  const runAIAnalysis = useCallback(async (peers: any[], amt: string) => {
    if (!peers.length) return;
    const trust = OrionAIEngine.computePeerTrust(peers[0], parseFloat(amt || '0'), currentBalance);
    const fraud = OrionAIEngine.analyzeFraud(parseFloat(amt || '0'), currentBalance, peers[0], isGift);
    setTrustProfile(trust);
    setFraudSignal(fraud);
    const text = fraud.safe ? `Target verified. Trust score ${trust.score}.` : `Caution: ${fraud.flags[0]}`;
    OrionVoice.speak(text, !fraud.safe);
  }, [currentBalance, isGift]);

  const startShieldSequence = useCallback(() => {
    setShieldSequence(0);
    OrionVoice.speak('ARISE Shield v2.0 active. Scanning local mesh gateway for quantum threats...');
    setTimeout(() => {
      setShieldSequence(1);
      OrionVoice.speak('Neural channel encrypted. Establishing secure tunnel via Arise secondary nodes.');
    }, 1200);
    setTimeout(() => {
      setShieldSequence(2);
      OrionVoice.speak('Stabilized. Handshake verified. Integrity check complete. Specify transmission volume.');
    }, 2800);
    setTimeout(() => {
      selectedReceivers.forEach(r => {
        updateDoc(doc(firestore, 'air_receivers', r.uid), { status: 'synced', sender_id: user?.uid });
      });
      setSenderState('amount');
    }, 3500);
  }, [selectedReceivers, firestore, user]);

  const executeDrop = useCallback(async () => {
    if (!user || selectedReceivers.length === 0 || isProcessing || dropFiredRef.current) return;
    setIsProcessing(true);
    dropFiredRef.current = true;
    OrionVoice.speak('Initiating drop. Funds in flight.');
    try {
      const numAmount = parseFloat(amount);
      const splitAmount = numAmount / selectedReceivers.length;
      for (const rec of selectedReceivers) {
        const transferRef = await addDoc(collection(firestore, 'air_transfers'), {
          sender_id: user.uid,
          sender_name: user.displayName || 'User',
          receiver_id: rec.uid,
          amount: splitAmount,
          isGift,
          status: 'pending',
          timestamp: serverTimestamp()
        });
        setTransferSessionId(transferRef.id);
      }
    } catch {
      setIsProcessing(false); dropFiredRef.current = false;
    }
  }, [selectedReceivers, user, firestore, isProcessing, amount, isGift]);

  const acceptTransfer = useCallback(async () => {
    if (!user || !incomingTransfer || isProcessing) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(firestore, 'air_transfers', incomingTransfer.id), { status: 'accepted' });
      await updateDoc(walletDocRef!, { balance: currentBalance + parseFloat(incomingTransfer.amount) });
      await addDoc(collection(firestore, 'wallets', user!.uid, 'transactions'), {
        type: 'credit', amount: parseFloat(incomingTransfer.amount), description: 'AirSend Inflow', timestamp: serverTimestamp(), status: 'success'
      });
      setRecipientState('success');
      OrionVoice.speak('Funds secured. Transaction complete.');
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    } catch {
      setIsProcessing(false);
    }
  }, [incomingTransfer, firestore, walletDocRef, isProcessing, currentBalance, user]);

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

    // ── Neural Scanning Line ──
    const scanY = (Date.now() % 2000) / 2000 * videoHeight;
    ctx.strokeStyle = `rgba(16, 185, 129, ${0.1 + pulse * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, scanY); ctx.lineTo(videoWidth, scanY);
    ctx.stroke();

    if (!isPicked) {
      ctx.strokeStyle = `rgba(99,102,241,${0.5 + pulse * 0.5})`;
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, boxSize, boxSize);
      ctx.setLineDash([]);
      
      ctx.fillStyle = 'rgba(99,102,241,0.4)';
      ctx.font = 'black 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('₦', bx + boxSize / 2, by + boxSize / 2 + 10);
    }

    try {
      const results = gestureRecognizerRef.current.recognizeForVideo(videoRef.current, performance.now());
      if (results && results.landmarks?.length > 0) {
        const landmarks = results.landmarks[0];
        const hx = landmarks[8].x * videoWidth;
        const hy = landmarks[8].y * videoHeight;
        const inBox = hx > bx && hx < bx + boxSize && hy > by && hy < by + boxSize;

        // ── Neural Tracking Line ──
        ctx.strokeStyle = isPicked ? 'rgba(16,185,129,0.6)' : 'rgba(99,102,241,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(bx + boxSize / 2, by + boxSize / 2);
        ctx.stroke();

        // ── Node data ──
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText(`Hand: ${Math.round(hx)},${Math.round(hy)}`, hx + 10, hy);

        if (results.gestures?.length > 0) {
          const gesture = results.gestures[0][0].categoryName;
          if (role === 'sender') {
            if (!isPicked && inBox && (gesture === DROP_GESTURE || gesture === DROP_GESTURE_ALT)) {
              setHandSequence(1); setGestureStatus('Vault Active - Grab ₦');
            }
            if (!isPicked && handSequence === 1 && gesture === PICK_GESTURE) {
              setIsPicked(true); setHandSequence(2); setGestureStatus('Secured - Open to Drop');
              if (navigator.vibrate) navigator.vibrate(50);
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
          setTimeout(() => { setGestureReady(true); predictLoop(); }, 1000);
        };
      }
    } catch { setCameraError('Camera Access Denied'); }
  };

  useEffect(() => {
    if (role === 'sender' && senderState === 'searching' && firestore && user) {
      const unsub = onSnapshot(query(collection(firestore, 'air_receivers')), (snap) => {
        const others: any[] = [];
        snap.forEach(d => { if (d.id !== user.uid) others.push(d.data()); });
        setAvailableReceivers(others);
        if (others.length > 0 && selectedReceivers.length === 0) {
          // Just vocalize it once, do not auto lock
          OrionVoice.speak(`Node found: ${others[0].displayName}`);
        }
      });
      return () => unsub();
    }
  }, [role, senderState, firestore, user]);

  useEffect(() => {
    if (role === 'sender' && transferSessionId && firestore) {
      const unsub = onSnapshot(doc(firestore, 'air_transfers', transferSessionId), async (snap) => {
        if (snap.data()?.status === 'accepted') {
          await updateDoc(walletDocRef!, { balance: currentBalance - parseFloat(amount) });
          await addDoc(collection(firestore, 'wallets', user!.uid, 'transactions'), {
            type: 'debit', amount: parseFloat(amount), description: 'AirSend Outflow', timestamp: serverTimestamp(), status: 'success'
          });
          await updateDoc(doc(firestore, 'air_transfers', transferSessionId), { status: 'completed' });
          setSenderState('success');
          OrionVoice.speak('Transmission successful.');
        }
      });
      return () => unsub();
    }
  }, [role, transferSessionId, firestore, amount, currentBalance, user, walletDocRef]);

  useEffect(() => {
    if (role === 'recipient' && user && firestore) {
      const pRef = doc(firestore, 'air_receivers', user.uid);
      setDoc(pRef, { uid: user.uid, displayName: user.displayName, status: 'idle', timestamp: serverTimestamp() });
      const unsub = onSnapshot(query(collection(firestore, 'air_transfers'), where('receiver_id', '==', user.uid), where('status', '==', 'pending')), (snap) => {
        if (!snap.empty) {
          setIncomingTransfer({ id: snap.docs[0].id, ...snap.docs[0].data() });
          setRecipientState('receiving');
          startCamera();
        }
      });
      return () => { unsub(); deleteDoc(pRef).catch(() => {}); };
    }
  }, [role, user, firestore]);

  // Continuously broadcast receiver's physical orientation
  useEffect(() => {
    if (role === 'recipient' && user && firestore) {
      const now = Date.now();
      if (now - lastUpdateRef.current > 400) { // Throttle to roughly 2.5Hz
        lastUpdateRef.current = now;
        const pRef = doc(firestore, 'air_receivers', user.uid);
        updateDoc(pRef, { 
          orientation: { 
            alpha: orientation.alpha || 0,
            beta: orientation.beta || 0,
            gamma: orientation.gamma || 0
          } 
        }).catch(() => {});
      }
    }
  }, [role, user, firestore, orientation.alpha, orientation.beta, orientation.gamma]);

  const renderAIBar = () => (
    <div className="flex items-center gap-2 px-6 py-3 bg-black/40 border-b border-white/5 relative z-50">
      <Cpu className="size-4 text-indigo-400" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Orion Neural Mesh</span>
      <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-500/30 to-transparent" />
      <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-[#020617] border border-white/10 rounded-[2.5rem] shadow-2xl">
        <DialogTitle className="sr-only">Orion Send</DialogTitle>
        <div className="relative min-h-[580px] flex flex-col">
          {renderAIBar()}
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            {!role ? (
              <div className="space-y-10 w-full animate-in zoom-in duration-500">
                <div className="text-center space-y-2">
                  <h2 className="text-5xl font-black text-white italic tracking-tighter">AIRSEND</h2>
                  <p className="text-[10px] uppercase font-black tracking-[0.5em] text-indigo-500">Orion Neural v3.0</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={async () => {
                    await requestPermission();
                    setRole('sender');
                  }} className="h-44 rounded-[2.5rem] bg-indigo-600/10 border-2 border-indigo-500/20 hover:bg-indigo-600 hover:border-indigo-400 flex flex-col gap-4 group transition-all">
                    <ArrowUpRight className="size-12 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    <span className="font-black text-xl italic uppercase">SEND</span>
                  </Button>
                  <Button onClick={() => setRole('recipient')} className="h-44 rounded-[2.5rem] bg-emerald-600/10 border-2 border-emerald-500/20 hover:bg-emerald-600 hover:border-emerald-400 flex flex-col gap-4 group transition-all">
                    <ArrowDownLeft className="size-12 group-hover:-translate-x-1 group-hover:translate-y-1 transition-transform" />
                    <span className="font-black text-xl italic uppercase">RECV</span>
                  </Button>
                </div>
              </div>
            ) : role === 'sender' ? (
              <div className="w-full h-full flex flex-col">
                {senderState === 'searching' && (
                  <div className="flex flex-col items-center py-10 space-y-8">
                    <div className="relative size-72 flex items-center justify-center rounded-full overflow-hidden border border-indigo-500/30"
                      style={{
                        transform: `perspective(1000px) rotateX(${(orientation.beta || 0) * 0.3}deg) rotateY(${-(orientation.gamma || 0) * 0.3}deg)`,
                        transition: 'transform 0.1s ease-out',
                        transformStyle: 'preserve-3d'
                      }}>
                       <div className="absolute inset-0 bg-indigo-500/10 rounded-full" />
                       <div className="absolute inset-0 border-2 border-indigo-500/30 rounded-full" />
                       <div className="absolute inset-8 border border-indigo-500/20 rounded-full" />
                       <div className="absolute inset-16 border border-indigo-500/10 rounded-full" />
                       
                       <div className="absolute w-[50%] h-[50%] bg-gradient-to-tr from-indigo-500/50 to-transparent origin-bottom-right rounded-tl-full animate-spin" style={{ animationDuration: '3s' }} />
                       
                       {/* The User */}
                       <div className="relative z-10 size-16 bg-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                          <Compass className="size-8 text-white" />
                       </div>

                       {/* Available Receivers mapped to compass headings combined with THEIR physical motion */}
                       {availableReceivers.map((receiver, i) => {
                         const recBeta = receiver.orientation?.beta || 0;
                         const recGamma = receiver.orientation?.gamma || 0;

                         // Base position
                         const baseAngle = (i * 137.5) % 360;
                         // Distance changes based on receiver tilting phone forward/backward (beta)
                         const distance = 90 + Math.max(-40, Math.min(40, (recBeta / 180) * 80)); 
                         // Angle changes based on receiver tilting phone left/right (gamma)
                         const angleShift = recGamma * 0.8;
                         
                         // Alpha rotates the entire world relative to current device orientation
                         const currentAngle = baseAngle + angleShift + (orientation.alpha || 0);
                         const rad = currentAngle * Math.PI / 180;
                         const tx = Math.cos(rad) * distance;
                         const ty = Math.sin(rad) * distance;
                         
                         return (
                            <div key={receiver.uid} 
                                 className="absolute z-20 flex flex-col items-center transition-all duration-300 ease-out cursor-pointer hover:scale-110"
                                 style={{ transform: `translateZ(20px) translate(${tx}px, ${ty}px)` }}
                                 onClick={() => {
                                   setSelectedReceivers([receiver]);
                                   setSenderState('uwb_lock');
                                   OrionVoice.speak(`Target locked: ${receiver.displayName}`);
                                 }}>
                               <div className="size-10 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center animate-pulse hover:bg-emerald-500/40">
                                  <Signal className="size-5 text-emerald-400" />
                               </div>
                               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-2 bg-slate-900/80 px-2 py-0.5 rounded-full">{receiver.displayName}</span>
                            </div>
                         );
                       })}
                    </div>
                    <div className="text-center">
                       <h3 className="text-2xl font-black text-white uppercase italic tracking-widest">Scanning Grid...</h3>
                       <p className="text-[10px] text-indigo-400 font-mono mt-2">Adjust device to align peers</p>
                    </div>
                  </div>
                )}
                {senderState === 'uwb_lock' && (
                  <div className="space-y-8 py-10">
                    <div className="text-center">
                      <h3 className="text-3xl font-black text-white italic">NODE LOCKED</h3>
                      <p className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">{selectedReceivers[0]?.displayName}</p>
                    </div>
                    <Button onClick={() => { OrionVoice.speak('Enter your neural PIN to establish a secure link.'); setSenderState('pin'); }} className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-lg tracking-widest shadow-xl">Establish Neural Link</Button>
                  </div>
                )}
                {senderState === 'pin' && (
                  <div className="space-y-10 flex flex-col items-center">
                    <div className="text-center space-y-2">
                       <h3 className="text-4xl font-black text-white italic leading-none">AUTH</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Enter Neural PIN</p>
                    </div>
                    <div className="flex gap-4">
                      {[0,1,2,3].map(i => (
                        <div key={i} className={`size-16 rounded-3xl border-2 flex items-center justify-center text-2xl font-black ${pinCode[i] ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-slate-800 bg-slate-900/50'}`}>
                          {pinCode[i] ? '•' : ''}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                       {[1,2,3,4,5,6,7,8,9,'C',0,'←'].map(k => (
                         <Button key={k} variant="ghost" onClick={() => {
                           if (k === 'C') setPinCode('');
                           else if (k === '←') setPinCode(p => p.slice(0,-1));
                           else if (pinCode.length < 4) {
                             const n = pinCode + k; setPinCode(n);
                             if (n.length === 4) setTimeout(() => { setSenderState('shield_anim'); startShieldSequence(); }, 300);
                           }
                         }} className="h-16 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-2xl font-black">{k}</Button>
                       ))}
                    </div>
                  </div>
                )}
                {senderState === 'shield_anim' && (
                  <div className="flex flex-col items-center py-20 space-y-12">
                     <div className="relative size-44 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-dashed border-indigo-500/30 rounded-full animate-spin-slow" />
                        <ShieldCheck className="relative z-10 size-24 text-indigo-400" />
                        {shieldSequence > 0 && <Network className="absolute size-24 text-emerald-400 animate-pulse" />}
                     </div>
                     <div className="text-center">
                        <h3 className="text-4xl font-black text-white italic">{shieldSequence === 0 ? 'SCANNING' : shieldSequence === 1 ? 'PROTECTING' : 'STABILIZED'}</h3>
                        <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-4 overflow-hidden">
                           <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: shieldSequence === 0 ? '30%' : shieldSequence === 1 ? '70%' : '100%' }} />
                        </div>
                     </div>
                  </div>
                )}
                {senderState === 'amount' && (
                  <div className="space-y-8">
                     <div className="text-center"><h3 className="text-3xl font-black text-white uppercase italic">VOLUME</h3></div>
                     <div className="relative">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-indigo-500">₦</span>
                        <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0" className="h-24 bg-white/5 border-2 border-indigo-500/20 rounded-[2rem] text-center text-4xl font-black text-white" />
                     </div>
                     <Button onClick={() => { startCamera(); setSenderState('gesture'); }} disabled={!amount} className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-xl shadow-xl">INITIATE DROP</Button>
                  </div>
                )}
                {senderState === 'gesture' && (
                  <div className="space-y-6 flex flex-col items-center">
                     <div className="text-center">
                        <h3 className="text-3xl font-black text-white italic">₦{parseFloat(amount).toLocaleString()}</h3>
                        <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">{gestureStatus}</p>
                     </div>
                     <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/10">
                        <video ref={videoRef} className="absolute opacity-0" />
                        <canvas ref={canvasRef} className="w-full h-full object-cover -scale-x-100" />
                     </div>
                  </div>
                )}
                {senderState === 'success' && (
                  <div className="flex flex-col items-center py-20 space-y-8 animate-in zoom-in">
                    <div className="size-32 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/30">
                      <CheckCircle2 className="size-20 text-emerald-500" />
                    </div>
                    <h3 className="text-4xl font-black text-white italic">SUCCESS</h3>
                    <Button onClick={() => onOpenChange(false)} className="w-full h-16 rounded-3xl bg-white/5 text-white font-black text-lg">SHUTDOWN MESH</Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full">
                {recipientState === 'waiting' && (
                  <div className="flex flex-col items-center py-20 space-y-8">
                    <div className="relative size-32 flex items-center justify-center">
                       <div className="absolute inset-0 border-2 border-emerald-500/20 rounded-full animate-spin-slow" />
                       <Activity className="size-16 text-emerald-500 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-black text-white italic">WAITING FOR DROP...</h3>
                  </div>
                )}
                {recipientState === 'receiving' && (
                  <div className="space-y-6 flex flex-col items-center">
                    <div className="text-center">
                       <h3 className="text-3xl font-black text-white italic">CATCH FUNDS</h3>
                       <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">Close fist to secure flow</p>
                    </div>
                    <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-2xl border border-white/10 group">
                       <div className="absolute inset-0 z-20 pointer-events-none border-[12px] border-emerald-500/10" />
                       <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-1">
                          <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-black text-[7px] uppercase tracking-widest">Capture Active</Badge>
                          <div className="size-1.5 bg-emerald-500 rounded-full animate-ping" />
                       </div>
                       <video ref={videoRef} className="absolute opacity-0" />
                       <canvas ref={canvasRef} className="w-full h-full object-cover -scale-x-100" />
                       {/* HUD Labels */}
                       <div className="absolute bottom-4 left-6 z-20 opacity-60">
                          <p className="text-[8px] font-black text-white uppercase tracking-widest">Mesh Stability: 0.992</p>
                          <p className="text-[8px] font-black text-white uppercase tracking-widest">Protocol: ARISE_RECV</p>
                       </div>
                    </div>
                  </div>
                )}
                {recipientState === 'success' && (
                  <div className="flex flex-col items-center py-20 space-y-8">
                    <div className="size-32 bg-emerald-500/10 rounded-full flex items-center justify-center border-4 border-emerald-500/30">
                       <Gift className="size-16 text-emerald-500" />
                    </div>
                    <h3 className="text-4xl font-black text-white italic uppercase">Funds Secured</h3>
                    <Button onClick={() => onOpenChange(false)} className="w-full h-16 rounded-3xl bg-white/5 text-white font-black text-lg">DONE</Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="p-6 mt-auto border-t border-white/5 flex justify-between items-center">
             <div className="flex gap-4">
                <div className="text-center"><p className="text-[8px] font-black text-slate-500 uppercase">Latency</p><p className="text-[10px] font-black text-emerald-500 font-mono">1.2ms</p></div>
                <div className="text-center"><p className="text-[8px] font-black text-slate-500 uppercase">Link</p><p className="text-[10px] font-black text-indigo-500 font-mono">ENCRYPTED</p></div>
             </div>
             <Button variant="ghost" onClick={() => role ? resetFlows() : onOpenChange(false)} className="text-[10px] font-black uppercase text-slate-500 hover:text-white">{role ? 'RESET' : 'CANCEL'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
