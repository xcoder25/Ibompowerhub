'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const SmileIDModal = dynamic(() => import('@/components/kyc/smile-id-modal'), { ssr: false });

export default function FaceCaptureVerificationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [showSmileID, setShowSmileID] = useState(false);

    const handleSuccess = (result: any) => {
        console.log('Smile ID Success:', result);
        toast({ title: 'Face Captured!', description: 'Your selfie has been submitted for verification.' });
        router.replace('/kyc');
    };

    const handleError = (error: any) => {
        console.error('Smile ID Error:', error);
        toast({ title: 'Verification Failed', description: 'Please try again.', variant: 'destructive' });
        setShowSmileID(false);
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 shrink-0">
                <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-secondary/70 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-base font-bold">Face Capture</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Icon */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                        <Camera className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">SmartSelfie™ Verification</p>
                        <p className="text-xs text-muted-foreground">Secure identity verification via Smile ID</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[
                        { emoji: '😊', text: 'Face the camera directly' },
                        { emoji: '💡', text: 'Ensure good lighting' },
                        { emoji: '🚫', text: 'No glasses or masks' },
                        { emoji: '📸', text: 'Plain background preferred' },
                    ].map(tip => (
                        <div key={tip.text} className="flex items-start gap-2 p-3 rounded-xl border border-border/50 bg-card/60">
                            <span className="text-xl">{tip.emoji}</span>
                            <p className="text-xs text-muted-foreground leading-snug">{tip.text}</p>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={() => setShowSmileID(true)}
                        className="w-full h-14 text-base font-semibold gap-2"
                    >
                        <Camera className="h-5 w-5" />
                        Start SmartSelfie™
                    </Button>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/40">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Powered by Smile ID. Your biometric data is encrypted and used only for identity verification.
                    </p>
                </div>
            </div>

            {showSmileID && (
                <SmileIDModal
                    jobType={6}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onClose={() => setShowSmileID(false)}
                />
            )}
        </div>
    );
}
