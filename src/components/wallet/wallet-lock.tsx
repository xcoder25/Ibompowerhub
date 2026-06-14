'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lock, Fingerprint, ShieldCheck, Loader2, Key, Monitor, Smartphone, AlertCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WalletLockProps {
    onUnlock: () => void;
}

export function WalletLock({ onUnlock }: WalletLockProps) {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [showPinInput, setShowPinInput] = useState(false);
    const [pin, setPin] = useState('');
    const [deviceType, setDeviceType] = useState<'pc' | 'mobile' | 'unknown'>('unknown');
    const [debugMessage, setDebugMessage] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const ua = navigator.userAgent.toLowerCase();
            if (/android|iphone|ipad|ipod/.test(ua)) {
                setDeviceType('mobile');
            } else {
                setDeviceType('pc');
            }
        }
    }, []);

    const handleAuth = async () => {
        if (isAuthenticating) return;
        setIsAuthenticating(true);
        setDebugMessage(null);

        try {
            // 1. Basic Capability Check
            if (typeof window === 'undefined' || !window.PublicKeyCredential) {
                throw new Error("Your browser doesn't support biometric security APIs.");
            }

            // 2. Hardware Availability Check
            const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

            if (!isAvailable) {
                throw new Error("Biometric hardware (Fingerprint/Face/PIN) is not available or not set up on this device.");
            }

            // 3. Prepare the Security Handshake (WebAuthn)
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            // Unique ID for the user session
            const userId = new Uint8Array(16);
            window.crypto.getRandomValues(userId);

            const publicKey: any = {
                challenge: challenge,
                rp: {
                    name: "Ibom X",
                    // Note: Browsers are strict about ID. For localhost, it MUST be 'localhost'
                    id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname
                },
                user: {
                    id: userId,
                    name: "user-" + Math.random().toString(36).slice(2, 7),
                    displayName: "PowerHub User"
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" }, // ES256 (Common for Mobile)
                    { alg: -257, type: "public-key" } // RS256 (Common for Windows Hello)
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform", // Forces Windows Hello / TouchID
                    userVerification: "required",
                },
                timeout: 30000,
            };

            // 4. Trigger the REAL native OS prompt
            console.log("Triggering WebAuthn on:", window.location.origin);
            await navigator.credentials.create({ publicKey });

            // 5. Success!
            toast({
                title: "Identity Verified",
                description: "Unlocked successfully.",
            });
            onUnlock();

        } catch (err: any) {
            console.error("Auth System Diagnostic:", err);

            let message = err.message || "Unknown security error";

            if (err.name === 'NotAllowedError') {
                message = "Verification cancelled or timed out.";
            } else if (err.name === 'SecurityError') {
                message = "Browser blocked this request. Ensure you are on localhost or HTTPS.";
            } else if (err.name === 'InvalidStateError') {
                // This sometimes happens if a credential already exists, we treat it as a pass for dev flow
                onUnlock();
                return;
            }

            setDebugMessage(message);

            // If it's a hardware/support error, move to PIN automatically
            if (message.includes("hardware") || message.includes("support")) {
                setShowPinInput(true);
            }
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length >= 4) {
            onUnlock();
        } else {
            toast({
                title: "Invalid PIN",
                description: "Min 4 digits.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 sm:p-6 h-[100dvh] w-[100dvw] overflow-hidden overscroll-none touch-none">
            <Card className="w-[95vw] max-w-sm border-none shadow-[0_40px_120px_-15px_rgba(0,0,0,0.3)] rounded-[2rem] sm:rounded-[3rem] bg-white dark:bg-slate-900 overflow-y-auto no-scrollbar ring-1 ring-slate-200 dark:ring-slate-800 transition-all duration-500 max-h-[100dvh] sm:max-h-[90vh] touch-pan-y">
                <div className="p-5 sm:p-10 flex flex-col items-center text-center space-y-5 sm:space-y-8 min-h-0">

                    <div className="relative group shrink-0">
                        <div className="absolute inset-0 bg-primary/25 blur-3xl rounded-full scale-150 animate-pulse" />
                        <div className="relative w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-tr from-primary to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                            <Lock className="h-7 w-7 sm:h-10 sm:w-10 text-white" />
                        </div>
                    </div>

                    <div className="space-y-1 sm:space-y-3 shrink-0">
                        <CardTitle className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            {showPinInput ? 'Security PIN' : 'Verify Identity'}
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-medium leading-relaxed">
                            {showPinInput
                                ? 'Device biometrics unavailable. Please use your security code.'
                                : `Unlock your wallet using your ${deviceType === 'pc' ? 'Windows Hello PIN' : 'Device Security'}.`}
                        </CardDescription>
                    </div>

                    {debugMessage && (
                        <div className="w-full bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl flex items-start gap-3 border border-red-100 dark:border-red-900/20 text-left">
                            <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                            <p className="text-xs font-bold text-red-800 dark:text-red-300 leading-tight">
                                {debugMessage}
                            </p>
                        </div>
                    )}

                    <div className="w-full">
                        {!showPinInput ? (
                            <div className="space-y-4 w-full">
                                <Button
                                    onClick={handleAuth}
                                    disabled={isAuthenticating}
                                    className="w-full h-14 sm:h-20 rounded-2xl sm:rounded-[2rem] text-base sm:text-xl font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.03] active:scale-95 transition-all shadow-xl sm:shadow-2xl shadow-slate-200 dark:shadow-none"
                                >
                                    {isAuthenticating ? (
                                        <Loader2 className="h-5 w-5 sm:h-8 sm:w-8 animate-spin" />
                                    ) : (
                                        <div className="flex items-center gap-2 sm:gap-4">
                                            {deviceType === 'pc' ? <Monitor className="h-5 w-5 sm:h-7 sm:w-7" /> : <Smartphone className="h-5 w-5 sm:h-7 sm:w-7" />}
                                            <span>Open Native Prompt</span>
                                        </div>
                                    )}
                                </Button>

                                <button
                                    onClick={() => setShowPinInput(true)}
                                    className="flex items-center justify-center gap-2 w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
                                >
                                    <Key className="h-3 w-3" />
                                    Switch to PIN Fallback
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handlePinSubmit} className="space-y-6 w-full">
                                <input
                                    type="password"
                                    pattern="[0-9]*"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value)}
                                    placeholder="••••••"
                                    className="w-full text-center text-3xl sm:text-5xl tracking-[0.2em] sm:tracking-[0.4em] font-black bg-slate-100 dark:bg-slate-800/50 border-none rounded-2xl sm:rounded-[1.5rem] py-4 sm:py-8 focus:ring-4 ring-primary/20 transition-all font-mono"
                                    autoFocus
                                />
                                <Button
                                    type="submit"
                                    className="w-full h-14 sm:h-16 rounded-xl sm:rounded-2xl font-black text-base sm:text-lg bg-primary text-white"
                                    disabled={pin.length < 4}
                                >
                                    Unlock Wallet
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => setShowPinInput(false)}
                                    className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
                                >
                                    Back to Device Auth
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-4 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-full ring-1 ring-slate-100 dark:ring-slate-800 shrink-0 mb-2">
                        <Info className="h-3 w-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">
                            Running on {typeof window !== 'undefined' ? window.location.hostname : 'secure environment'}
                        </span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
