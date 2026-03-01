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
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/40">
                <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-4">
                    <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-secondary/60 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold font-headline">Face Capture</h1>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
                {/* Icon */}
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <Camera className="h-9 w-9 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-bold font-headline">SmartSelfie™ Verification</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        We use Smile ID SmartSelfie™ to securely verify your identity.
                    </p>
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
