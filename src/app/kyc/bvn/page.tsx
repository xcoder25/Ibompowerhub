'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';

export default function BvnVerificationPage() {
    const router = useRouter();
    const { user } = useUser();
    const { toast } = useToast();

    const [bvn, setBvn] = useState('');
    const [dob, setDob] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (bvn.length !== 11) {
            toast({ title: 'Invalid BVN', description: 'BVN must be exactly 11 digits.', variant: 'destructive' });
            return;
        }
        if (!dob) {
            toast({ title: 'Date required', description: 'Enter your date of birth.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch('/api/smile-id/verify-id', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.uid, idNumber: bvn, idType: 'BVN', dob }),
            });
            const result = await response.json();

            if (result.ResultCode === '1012' || result.ResultCode === '1010' || result.ResultCode === '0000') {
                toast({ title: 'BVN Verified!' });
                router.replace('/kyc');
            } else {
                toast({
                    title: 'Verification Failed',
                    description: result.ResultText || 'Could not verify your BVN. Please check your details.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('BVN Verify Error:', error);
            toast({ title: 'Failed', description: 'An error occurred. Please try again.', variant: 'destructive' });
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
                <h1 className="text-base font-bold">BVN Verification</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Icon + title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Verify Your BVN</p>
                        <p className="text-xs text-muted-foreground">Enter your 11-digit Bank Verification Number</p>
                    </div>
                </div>

                {/* What is BVN */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30">
                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                        Dial <strong>*565*0#</strong> on your registered bank number to get your BVN.
                    </p>
                </div>

                {/* Form */}
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="bvn" className="text-xs">BVN (11 digits)</Label>
                        <Input
                            id="bvn"
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter your 11-digit BVN"
                            value={bvn}
                            onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
                            maxLength={11}
                            className="h-10 text-base font-mono tracking-widest"
                        />
                        <p className="text-xs text-muted-foreground">{bvn.length}/11 digits</p>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="dob" className="text-xs">Date of Birth</Label>
                        <Input
                            id="dob"
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    <Button
                        onClick={handleVerify}
                        disabled={isLoading || bvn.length !== 11 || !dob}
                        className="w-full h-10 text-sm font-semibold"
                    >
                        {isLoading ? 'Verifying...' : 'Verify BVN'}
                    </Button>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40 border border-border/40">
                    <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Your BVN is securely verified via Smile ID. We never store your full number.
                    </p>
                </div>
            </div>
        </div>
    );
}
