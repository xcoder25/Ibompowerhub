'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function AddressVerificationPage() {
    const router = useRouter();
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [form, setForm] = useState({
        street: '',
        city: '',
        state: 'Akwa Ibom',
        lga: '',
        landmark: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const kycDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'kyc', user.uid) : null),
        [firestore, user]
    );

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.street || !form.city || !form.lga) {
            toast({ title: 'Incomplete Address', description: 'Please fill in all required fields.', variant: 'destructive' });
            return;
        }
        setIsLoading(true);
        try {
            if (kycDocRef) {
                await setDoc(kycDocRef, { addressVerified: true, address: form }, { merge: true });
            }
            toast({ title: 'Address Submitted!', description: 'Your address is under review.' });
            router.replace('/kyc');
        } catch {
            toast({ title: 'Submission Failed', description: 'Please try again.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const isComplete = form.street && form.city && form.lga;

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 shrink-0">
                <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-secondary/70 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-base font-bold">Address Verification</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                {/* Icon */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">Verify Your Address</p>
                        <p className="text-xs text-muted-foreground">Provide your current residential address</p>
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="street">Street Address <span className="text-destructive">*</span></Label>
                        <Textarea
                            id="street"
                            placeholder="e.g., 12 Udo Abasi Street"
                            value={form.street}
                            onChange={(e) => handleChange('street', e.target.value)}
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                            <Input
                                id="city"
                                placeholder="e.g., Uyo"
                                value={form.city}
                                onChange={(e) => handleChange('city', e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lga">LGA <span className="text-destructive">*</span></Label>
                            <Input
                                id="lga"
                                placeholder="e.g., Uyo LGA"
                                value={form.lga}
                                onChange={(e) => handleChange('lga', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                            id="state"
                            value={form.state}
                            readOnly
                            className="bg-secondary/30 text-muted-foreground"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="landmark">Nearest Landmark <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Input
                            id="landmark"
                            placeholder="e.g., Behind Etim Inyang Stadium"
                            value={form.landmark}
                            onChange={(e) => handleChange('landmark', e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading || !isComplete}
                        className="w-full h-12 text-base font-semibold"
                    >
                        {isLoading ? 'Submitting...' : 'Verify Address'}
                    </Button>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30 border border-border/40">
                    <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Address information is used for service delivery and identity verification only. It will not be shared publicly.
                    </p>
                </div>
            </div>
        </div>
    );
}
