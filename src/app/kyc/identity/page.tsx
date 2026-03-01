'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Shield, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';

const SmileIDModal = dynamic(() => import('@/components/kyc/smile-id-modal'), { ssr: false });

export default function IdentityVerificationPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [showSmileID, setShowSmileID] = useState(false);

    const handleSuccess = (result: any) => {
        console.log('Smile ID Document Success:', result);
        toast({ title: 'ID Submitted!', description: 'Your identity documents are under review.' });
        router.replace('/kyc');
    };

    const handleError = (error: any) => {
        console.error('Smile ID Document Error:', error);
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
                <h1 className="text-base font-bold">Identity Verification</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Icon + title */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Upload Your ID</p>
                        <p className="text-xs text-muted-foreground">Verify your identity using a government-issued ID</p>
                    </div>
                </div>

                {/* Guidelines */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-800/30">
                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Use your National ID, Driver's License, or Passport</li>
                        <li>• Ensure good lighting and clear camera focus</li>
                        <li>• Do not crop or edit the document photo</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={() => setShowSmileID(true)}
                        className="w-full h-14 text-base font-semibold gap-2"
                    >
                        <FileText className="h-5 w-5" />
                        Start Document Capture
                    </Button>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-2 p-3 rounded-xl bg-secondary/40 border border-border/40">
                    <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Powered by Smile ID. Your documents are encrypted and handled securely.
                    </p>
                </div>
            </div>

            {showSmileID && (
                <SmileIDModal
                    jobType={11}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onClose={() => setShowSmileID(false)}
                />
            )}
        </div>
    );
}
