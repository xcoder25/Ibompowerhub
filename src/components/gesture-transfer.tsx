'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle2, Loader2, Sparkles, RefreshCw, X, Hand, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type GestureType = 'NONE' | 'ONE_FINGER' | 'TWO_FINGERS' | 'THUMBS_UP' | 'OPEN_PALM' | 'FIST' | 'PINCH';

interface GestureConfig {
    name: string;
    emoji: string;
    description: string;
}

const GESTURE_MAP: Record<GestureType, GestureConfig> = {
    NONE: { name: 'Scanning...', emoji: '🔍', description: 'Show your hand to the camera' },
    ONE_FINGER: { name: 'One Finger', emoji: '☝️', description: 'Confirm / Select item' },
    TWO_FINGERS: { name: 'Two Fingers', emoji: '✌️', description: 'Double amount (₦20,000)' },
    THUMBS_UP: { name: 'Thumbs Up', emoji: '👍', description: 'Approve & Confirm Pay (Hold 1.5s)' },
    OPEN_PALM: { name: 'Open Palm', emoji: '✋', description: 'Cancel Transaction' },
    FIST: { name: 'Fist', emoji: '👊', description: 'Lock / Pause' },
    PINCH: { name: 'Pinch', emoji: '🤏', description: 'Execute / Send Transfer' }
};

export function GestureTransfer() {
    const [state, setState] = useState<'IDLE' | 'LOADING' | 'TRACKING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [amount, setAmount] = useState<number>(10000);
    const [recipient] = useState<string>('Emem Bassey');
    const [detectedGesture, setDetectedGesture] = useState<GestureType>('NONE');
    const [holdProgress, setHoldProgress] = useState<number>(0);
    const [message, setMessage] = useState<string>('Press Start Camera to begin Gesture transfer');
    const [mpLoaded, setMpLoaded] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const activeGestureRef = useRef<GestureType>('NONE');
    const gestureStartTimeRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const handsInstanceRef = useRef<any>(null);
    const cameraInstanceRef = useRef<any>(null);

    // ── CDN Script Loader ───────────────────────────────────────────────────
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const loadMediaPipe = async () => {
            try {
                if ((window as any).Hands) {
                    setMpLoaded(true);
                    return;
                }
                // Load hands.js
                await new Promise((res, rej) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
                    script.crossOrigin = 'anonymous';
                    script.onload = res;
                    script.onerror = rej;
                    document.head.appendChild(script);
                });
                // Load camera_utils.js
                await new Promise((res, rej) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
                    script.crossOrigin = 'anonymous';
                    script.onload = res;
                    script.onerror = rej;
                    document.head.appendChild(script);
                });
                setMpLoaded(true);
            } catch (err) {
                console.error("Failed to load MediaPipe Hands:", err);
                setMessage("Could not load tracking libraries from CDN. Standard pay fallback enabled.");
            }
        };

        loadMediaPipe();
    }, []);

    // ── Math: Detect hand gestures ──────────────────────────────────────────
    const classifyGesture = (landmarks: any[]): GestureType => {
        if (!landmarks || landmarks.length < 21) return 'NONE';

        // Helper to check if a finger is extended (tip y < pip y)
        const isExtended = (tipIdx: number, pipIdx: number) => {
            return landmarks[tipIdx].y < landmarks[pipIdx].y;
        };

        const thumbExtended = landmarks[4].x < landmarks[3].x; // Left/Right independent simplified thumb logic
        const indexExtended = isExtended(8, 6);
        const middleExtended = isExtended(12, 10);
        const ringExtended = isExtended(16, 14);
        const pinkyExtended = isExtended(20, 18);

        // Distance between thumb tip and index tip
        const dx = landmarks[4].x - landmarks[8].x;
        const dy = landmarks[4].y - landmarks[8].y;
        const thumbIndexDist = Math.sqrt(dx * dx + dy * dy);

        // Pinch check (close proximity)
        if (thumbIndexDist < 0.05 && !middleExtended && !ringExtended && !pinkyExtended) {
            return 'PINCH';
        }

        // Thumbs Up check: Thumb up, other fingers folded
        // Thumb tip is above wrist and MCPs, others are below MCPs
        if (landmarks[4].y < landmarks[2].y && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return 'THUMBS_UP';
        }

        // Open Palm
        if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
            return 'OPEN_PALM';
        }

        // Fist
        if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended && landmarks[4].y > landmarks[3].y) {
            return 'FIST';
        }

        // Two Fingers up
        if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
            return 'TWO_FINGERS';
        }

        // One Finger up (Index)
        if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
            return 'ONE_FINGER';
        }

        return 'NONE';
    };

    // ── Draw landmarks & skeleton on canvas ─────────────────────────────────
    const drawHand = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;

        ctx.strokeStyle = '#10B981'; // emerald-500
        ctx.lineWidth = 4;
        ctx.fillStyle = '#F59E0B'; // amber-500

        // Connections mapping
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // index
            [0, 9], [9, 10], [10, 11], [11, 12], // middle
            [0, 13], [13, 14], [14, 15], [15, 16], // ring
            [0, 17], [17, 18], [18, 19], [19, 20], // pinky
            [5, 9], [9, 13], [13, 17] // knuckles
        ];

        // Draw connections
        connections.forEach(([s, e]) => {
            ctx.beginPath();
            ctx.moveTo(landmarks[s].x * width, landmarks[s].y * height);
            ctx.lineTo(landmarks[e].x * width, landmarks[e].y * height);
            ctx.stroke();
        });

        // Draw dots
        landmarks.forEach(lm => {
            ctx.beginPath();
            ctx.arc(lm.x * width, lm.y * height, 6, 0, 2 * Math.PI);
            ctx.fill();
        });
    };

    // ── On Results: process every frame ──────────────────────────────────────
    const onResults = (results: any) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Mirror support
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            drawHand(ctx, landmarks);

            const gesture = classifyGesture(landmarks);
            setDetectedGesture(gesture);
            handleGestureTransition(gesture);
        } else {
            setDetectedGesture('NONE');
            handleGestureTransition('NONE');
        }
        ctx.restore();
    };

    // ── Gesture State transition & Hold counter ─────────────────────────────
    const handleGestureTransition = (gesture: GestureType) => {
        if (gesture === 'NONE') {
            activeGestureRef.current = 'NONE';
            gestureStartTimeRef.current = null;
            setHoldProgress(0);
            return;
        }

        if (activeGestureRef.current !== gesture) {
            activeGestureRef.current = gesture;
            gestureStartTimeRef.current = Date.now();
            setHoldProgress(0);
        } else {
            if (gestureStartTimeRef.current) {
                const elapsed = Date.now() - gestureStartTimeRef.current;
                const progress = Math.min((elapsed / 1500) * 100, 100);
                setHoldProgress(progress);

                if (progress >= 100) {
                    triggerGestureAction(gesture);
                }
            }
        }
    };

    // ── Core: Trigger actions based on held gesture ─────────────────────────
    const triggerGestureAction = (gesture: GestureType) => {
        gestureStartTimeRef.current = null; // Reset hold
        setHoldProgress(0);

        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate([100, 50, 100]);
        }

        switch (gesture) {
            case 'TWO_FINGERS':
                setAmount(20000);
                setMessage('Double amount selected: ₦20,000');
                break;
            case 'ONE_FINGER':
                setAmount(10000);
                setMessage('Standard amount selected: ₦10,000');
                break;
            case 'THUMBS_UP':
                setState('SUCCESS');
                setMessage('Payment Approved via Thumbs Up!');
                stopCamera();
                break;
            case 'OPEN_PALM':
                cancelTransaction();
                break;
            case 'PINCH':
                setState('SUCCESS');
                setMessage('Transfer executed successfully via Pinch gesture!');
                stopCamera();
                break;
            default:
                break;
        }
    };

    const cancelTransaction = () => {
        stopCamera();
        setAmount(10000);
        setHoldProgress(0);
        setDetectedGesture('NONE');
        setState('IDLE');
        setMessage('Transaction canceled by user.');
    };

    // ── Start Camera engine ─────────────────────────────────────────────────
    const startCamera = async () => {
        if (!mpLoaded) return;
        setState('LOADING');
        setMessage('Starting camera feed and initializing trackers...');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' }
            });
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const mpHands = (window as any).Hands;
            const mpCamera = (window as any).Camera;

            const hands = new mpHands({
                locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.6
            });

            hands.onResults(onResults);
            handsInstanceRef.current = hands;

            if (videoRef.current) {
                const camera = new mpCamera(videoRef.current, {
                    onFrame: async () => {
                        if (videoRef.current) {
                            await hands.send({ image: videoRef.current });
                        }
                    },
                    width: 640,
                    height: 480
                });
                camera.start();
                cameraInstanceRef.current = camera;
            }

            setState('TRACKING');
            setMessage('Hand tracking live. Use gestures to interact.');
        } catch (err) {
            console.error("Camera access failed:", err);
            setState('ERROR');
            setMessage('Could not access camera. Please verify permission settings.');
        }
    };

    // ── Stop Camera ─────────────────────────────────────────────────────────
    const stopCamera = () => {
        if (cameraInstanceRef.current) {
            cameraInstanceRef.current.stop();
            cameraInstanceRef.current = null;
        }
        if (handsInstanceRef.current) {
            handsInstanceRef.current.close();
            handsInstanceRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (state === 'TRACKING') {
            setState('IDLE');
        }
    };

    // ── Simulation Engine (Developer Demo Fallback) ──────────────────────────
    const simulateGesture = (gesture: GestureType) => {
        setDetectedGesture(gesture);
        handleGestureTransition(gesture);
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    return (
        <Card className="relative overflow-hidden border-0 shadow-2xl bg-[#090D1A] rounded-[2rem] w-full group">
            {/* Visual ambient light */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-amber-600/10 via-teal-600/10 to-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            </div>

            <CardContent className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row items-center gap-8">
                
                {/* Details side */}
                <div className="flex-1 text-center md:text-left w-full">
                    <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors mb-4 px-3 py-1 font-bold tracking-widest uppercase text-[10px]">
                        <Sparkles className="h-3 w-3 mr-1.5 animate-pulse" /> 3D Vision Engine
                    </Badge>

                    <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">
                        Hand Gesture <br />
                        <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Touchless Pay</span>
                    </h2>

                    <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium max-w-sm mx-auto md:mx-0">
                        Transfer money without touching your screen. Approve with 👍, cancel with ✋, double with ✌️. Fully secured by MediaPipe 3D Hand Landmarks.
                    </p>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Recipient:</span>
                            <span className="text-white font-semibold">{recipient}</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Wallet Source:</span>
                            <span className="text-white font-semibold">OWealth balance</span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 border-t border-white/5 pt-2 mt-2">
                            <span className="font-bold">Transfer Amount:</span>
                            <span className="text-amber-400 font-black text-sm">₦{amount.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Developer Mock Controller */}
                    <div className="p-3 bg-slate-900/50 border border-white/5 rounded-xl text-left">
                        <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-2">Simulate Gesture (Demo Mode)</p>
                        <div className="flex flex-wrap gap-1.5">
                            <Button size="xs" variant="outline" className="text-[10px] py-1 px-2.5 bg-white/5 h-auto text-white" onClick={() => simulateGesture('ONE_FINGER')}>☝️ standard</Button>
                            <Button size="xs" variant="outline" className="text-[10px] py-1 px-2.5 bg-white/5 h-auto text-white" onClick={() => simulateGesture('TWO_FINGERS')}>✌️ double</Button>
                            <Button size="xs" variant="outline" className="text-[10px] py-1 px-2.5 bg-white/5 h-auto text-white" onClick={() => simulateGesture('THUMBS_UP')}>👍 approve</Button>
                            <Button size="xs" variant="outline" className="text-[10px] py-1 px-2.5 bg-white/5 h-auto text-white" onClick={() => simulateGesture('OPEN_PALM')}>✋ cancel</Button>
                        </div>
                    </div>
                </div>

                {/* Tracker side */}
                <div className="flex-1 w-full max-w-sm flex flex-col items-center justify-center min-h-[340px] bg-slate-950/60 border border-white/5 rounded-3xl p-5 relative">
                    
                    {/* Gesture recognition indicators */}
                    {state === 'TRACKING' && (
                        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                Tracking Active
                            </Badge>
                        </div>
                    )}

                    <div className="relative w-full h-[220px] rounded-2xl overflow-hidden bg-slate-900 border border-white/5 flex items-center justify-center">
                        <video
                            ref={videoRef}
                            style={{ display: 'none' }}
                            width="640"
                            height="480"
                            playsInline
                            muted
                        />

                        {state === 'TRACKING' ? (
                            <>
                                {/* Canvas skeleton draws over the preview */}
                                <canvas
                                    ref={canvasRef}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    width="320"
                                    height="220"
                                />
                                
                                {/* Scanning scanline animation */}
                                <div className="absolute inset-x-0 h-0.5 bg-amber-500/50 animate-[scan_3s_linear_infinite] pointer-events-none" />
                            </>
                        ) : state === 'LOADING' ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                                <p className="text-xs text-slate-400">Loading MediaPipe Models...</p>
                            </div>
                        ) : state === 'SUCCESS' ? (
                            <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-300 p-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-50 rounded-full animate-pulse" />
                                    <div className="bg-emerald-500 p-3 rounded-full relative z-10 border border-emerald-300">
                                        <CheckCircle2 className="h-10 w-10 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-white font-bold text-lg">Transfer Approved!</h3>
                                <p className="text-emerald-400 text-xs font-semibold">₦{amount.toLocaleString()} sent to {recipient}</p>
                                <Button
                                    onClick={() => {
                                        setState('IDLE');
                                        setMessage('Ready for new transfer');
                                    }}
                                    className="mt-2 bg-slate-800 text-white text-xs py-1.5 px-4 h-auto rounded-xl"
                                >
                                    Done
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center p-6 flex flex-col items-center">
                                <Hand className="h-10 w-10 text-slate-600 mb-2" />
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Camera Inactive</p>
                                <p className="text-[11px] text-slate-600 mt-2 max-w-[200px]">
                                    Click Start Camera, and position your hand 1-2 feet in front of the lens.
                                </p>
                            </div>
                        )}

                        {/* Hold-to-confirm progress overlay */}
                        {holdProgress > 0 && (
                            <div className="absolute bottom-0 inset-x-0 h-2 bg-slate-800 pointer-events-none">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-400 transition-all duration-75"
                                    style={{ width: `${holdProgress}%` }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Bottom Status text */}
                    <div className="w-full text-center mt-4 min-h-[40px] flex items-center justify-center px-2">
                        {detectedGesture !== 'NONE' ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl w-full justify-center">
                                <span className="text-lg">{GESTURE_MAP[detectedGesture].emoji}</span>
                                <div className="text-left">
                                    <p className="text-white font-black text-xs leading-none">{GESTURE_MAP[detectedGesture].name}</p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{GESTURE_MAP[detectedGesture].description}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-xs font-medium italic">{message}</p>
                        )}
                    </div>

                    {/* Camera Control Action buttons */}
                    <div className="mt-4 w-full">
                        {state === 'TRACKING' ? (
                            <Button
                                onClick={stopCamera}
                                variant="destructive"
                                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl h-11"
                            >
                                Stop Camera
                            </Button>
                        ) : state !== 'SUCCESS' ? (
                            <Button
                                onClick={startCamera}
                                disabled={state === 'LOADING'}
                                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-2xl h-11 shadow-lg shadow-amber-500/20"
                            >
                                {state === 'LOADING' ? 'Starting...' : 'Start Camera Pay'}
                            </Button>
                        ) : null}
                    </div>

                </div>

            </CardContent>
        </Card>
    );
}
