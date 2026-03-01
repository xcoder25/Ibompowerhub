'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { Loader2, X } from 'lucide-react';

interface SmileIDModalProps {
    jobType: number; // 6 for Selfie, 11 for Document Verification
    onSuccess: (result: any) => void;
    onError: (error: any) => void;
    onClose: () => void;
}

export default function SmileIDModal({ jobType, onSuccess, onError, onClose }: SmileIDModalProps) {
    const { user } = useUser();
    const [sessionData, setSessionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function initSession() {
            try {
                const response = await fetch('/api/smile-id/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user?.uid, jobType }),
                });
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setSessionData(data);
            } catch (err: any) {
                console.error('Failed to init Smile ID session:', err);
                onError(err);
            } finally {
                setLoading(false);
            }
        }

        if (user) initSession();
    }, [user, jobType, onError]);

    useEffect(() => {
        // Import Web Components dynamically on the client
        import('@smileid/web-components/selfie-capture');
        import('@smileid/web-components/document-capture');
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-medium animate-pulse">Initializing Smile ID...</p>
                </div>
            </div>
        );
    }

    if (!sessionData) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-background">
            <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
                <h2 className="text-sm font-bold">Identity Verification</h2>
                <button onClick={onClose} className="p-1 rounded-full hover:bg-secondary/80">
                    <X className="h-5 w-5" />
                </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
                {jobType === 6 ? (
                    // @ts-ignore
                    <smile-id-selfie-capture
                        partner-id={process.env.NEXT_PUBLIC_SMILE_ID_PARTNER_ID}
                        token={sessionData.token}
                        user-id={user?.uid}
                        onSuccess={onSuccess}
                        onError={onError}
                    />
                ) : (
                    // @ts-ignore
                    <smile-id-document-capture
                        partner-id={process.env.NEXT_PUBLIC_SMILE_ID_PARTNER_ID}
                        token={sessionData.token}
                        user-id={user?.uid}
                        onSuccess={onSuccess}
                        onError={onError}
                    />
                )}
            </div>
        </div>
    );
}
