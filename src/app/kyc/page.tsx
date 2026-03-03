'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ChevronRight, Info, ShieldCheck } from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';

type KycData = {
    emailVerified?: boolean;
    phoneVerified?: boolean;
    bvnVerified?: boolean;
    identityVerified?: boolean;
    addressVerified?: boolean;
    faceVerified?: boolean;
    originVerified?: boolean;
};

const STEPS = [
    { id: 'emailVerified' as keyof KycData, label: 'Email Verification', desc: 'Accepted', hasInfo: false, href: undefined },
    { id: 'phoneVerified' as keyof KycData, label: 'Phone Verification', desc: 'Verify your phone number', hasInfo: false, href: '/kyc/phone' },
    { id: 'bvnVerified' as keyof KycData, label: 'BVN Verification', desc: 'Verify your BVN', hasInfo: true, href: '/kyc/bvn' },
    { id: 'identityVerified' as keyof KycData, label: 'Identity Verification', desc: 'Upload an ID card', hasInfo: true, href: '/kyc/identity' },
    { id: 'addressVerified' as keyof KycData, label: 'Address Verification', desc: 'Verify your residential address', hasInfo: false, href: '/kyc/address' },
    { id: 'faceVerified' as keyof KycData, label: 'Face Capture', desc: 'Submit an image of yourself', hasInfo: false, href: '/kyc/face' },
    { id: 'originVerified' as keyof KycData, label: 'Certificate of Origin', desc: 'Proof of Akwa Ibom State LGA Origin', hasInfo: true, href: '/kyc/origin' },
];

export default function KycPage() {
    const { user } = useUser();
    const router = useRouter();
    const firestore = useFirestore();

    const kycDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'kyc', user.uid) : null),
        [firestore, user]
    );
    const { data: kycData } = useDoc<KycData>(kycDocRef);

    const effectiveKyc: KycData = {
        emailVerified: user?.emailVerified ?? false,
        phoneVerified: kycData?.phoneVerified ?? false,
        bvnVerified: kycData?.bvnVerified ?? false,
        identityVerified: kycData?.identityVerified ?? false,
        addressVerified: kycData?.addressVerified ?? false,
        faceVerified: kycData?.faceVerified ?? false,
        originVerified: kycData?.originVerified ?? false,
    };

    const completed = Object.values(effectiveKyc).filter(Boolean).length;
    const total = STEPS.length;
    const pct = Math.round((completed / total) * 100);

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-background shrink-0">
                <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-secondary/70 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-base font-bold leading-tight">KYC Verification</h1>
                    <p className="text-xs text-muted-foreground">Follow these steps to complete verification</p>
                </div>
            </div>

            {/* Progress strip */}
            <div className="px-4 py-2 border-b border-border/30 bg-secondary/20 shrink-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-semibold">Progress</span>
                    </div>
                    <span className="text-xs font-bold text-primary">{completed}/{total}</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {/* Steps list */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                {STEPS.map((step, idx) => {
                    const isVerified = effectiveKyc[step.id];
                    const isClickable = step.href && !isVerified;

                    const row = (
                        <div className={`flex items-center gap-3 px-4 py-3.5 transition-colors ${isClickable ? 'active:bg-secondary/50' : ''}`}>
                            {/* Status dot / number */}
                            {isVerified ? (
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-sm">
                                    <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                            ) : (
                                <div className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center shrink-0 bg-secondary/30">
                                    <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                                </div>
                            )}

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className={`text-sm font-semibold leading-tight ${isVerified ? 'text-green-700 dark:text-green-400' : 'text-foreground'}`}>
                                        {step.label}
                                    </span>
                                    {step.hasInfo && (
                                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-500 text-white shrink-0">
                                            <Info className="h-2 w-2" />
                                        </span>
                                    )}
                                </div>
                                <p className={`text-xs mt-0.5 ${isVerified ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'}`}>
                                    {isVerified && step.id !== 'emailVerified' ? 'Verified ✓' : step.desc}
                                </p>
                            </div>

                            {/* Chevron */}
                            {isClickable && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                        </div>
                    );

                    return isClickable ? (
                        <Link key={step.id} href={step.href!}>{row}</Link>
                    ) : (
                        <div key={step.id}>{row}</div>
                    );
                })}
            </div>

            {/* Bottom — fully verified CTA */}
            {pct === 100 && (
                <div className="px-4 py-3 border-t border-border/40 bg-green-50 dark:bg-green-900/20 shrink-0 flex items-center gap-3">
                    <ShieldCheck className="h-8 w-8 text-green-500 shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400">Fully Verified!</p>
                        <p className="text-xs text-green-600 dark:text-green-500">All steps complete. Your Wallet DVA is being generated automatically.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
