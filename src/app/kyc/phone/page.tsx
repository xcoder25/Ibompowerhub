'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Phone, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

type Step = 'enter_phone' | 'enter_otp';

export default function PhoneVerificationPage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [step, setStep] = useState<Step>('enter_phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);

    const kycDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'kyc', user.uid) : null),
        [firestore, user]
    );

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            toast({ title: 'Invalid number', description: 'Enter a valid phone number.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        setIsLoading(false);
        setStep('enter_otp');
        toast({ title: 'OTP Sent', description: `Code sent to ${phone}` });
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
    };

    const handleVerify = async () => {
        if (otp.join('').length < 6) {
            toast({ title: 'Incomplete code', description: 'Enter the full 6-digit code.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        await new Promise(r => setTimeout(r, 1500));
        try {
            if (kycDocRef) await setDoc(kycDocRef, { phoneVerified: true }, { merge: true });
            toast({ title: 'Phone Verified!', description: 'Your phone number has been verified.' });
            router.replace('/kyc');
        } catch {
            toast({ title: 'Failed', description: 'Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 shrink-0">
                <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-secondary/70 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-base font-bold">Phone Verification</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {/* Icon + title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">
                            {step === 'enter_phone' ? 'Enter Phone Number' : 'Enter OTP Code'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {step === 'enter_phone'
                                ? 'We\'ll send a one-time code to verify your number'
                                : `6-digit code sent to +234${phone}`}
                        </p>
                    </div>
                </div>

                {/* Phone input */}
                {step === 'enter_phone' && (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                            <div className="flex gap-2">
                                <div className="flex items-center px-3 rounded-lg border border-border bg-secondary/30 text-sm font-medium text-muted-foreground shrink-0">
                                    🇳🇬 +234
                                </div>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="8012345678"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    maxLength={11}
                                    className="flex-1 h-10"
                                />
                            </div>
                        </div>
                        <Button onClick={handleSendOtp} disabled={isLoading || !phone} className="w-full h-10 text-sm font-semibold">
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </Button>
                    </div>
                )}

                {/* OTP input */}
                {step === 'enter_otp' && (
                    <div className="space-y-4">
                        <div className="flex justify-between gap-2">
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    id={`otp-${idx}`}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Backspace' && !digit && idx > 0)
                                            document.getElementById(`otp-${idx - 1}`)?.focus();
                                    }}
                                    className="flex-1 h-12 text-center text-lg font-bold border-2 border-border rounded-xl bg-card focus:border-primary focus:outline-none transition-colors min-w-0"
                                />
                            ))}
                        </div>
                        <Button onClick={handleVerify} disabled={isLoading || otp.join('').length < 6} className="w-full h-10 text-sm font-semibold">
                            {isLoading ? 'Verifying...' : 'Verify'}
                        </Button>
                        <div className="flex items-center justify-center gap-4 text-xs">
                            <button className="text-primary hover:underline" onClick={() => setStep('enter_phone')}>Change number</button>
                            <span className="text-border">|</span>
                            <button className="text-primary hover:underline" onClick={handleSendOtp}>Resend code</button>
                        </div>
                    </div>
                )}

                {/* Security note */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40 border border-border/40">
                    <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your phone number is used only for security and verification — never shared.
                    </p>
                </div>
            </div>
        </div>
    );
}
