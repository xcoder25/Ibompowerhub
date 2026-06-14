'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle, Phone, Loader2, CheckCircle2, X, Shield, MapPin, Radio } from 'lucide-react';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type SosState = 'idle' | 'confirm' | 'locating' | 'sending' | 'sent';

const EMERGENCY_TYPES = [
  { label: 'Medical', color: 'bg-red-600', emoji: '🏥' },
  { label: 'Fire', color: 'bg-orange-600', emoji: '🔥' },
  { label: 'Crime', color: 'bg-purple-600', emoji: '🚨' },
  { label: 'Accident', color: 'bg-amber-600', emoji: '🚗' },
  { label: 'Flood', color: 'bg-blue-600', emoji: '🌊' },
  { label: 'Other', color: 'bg-slate-600', emoji: '⚠️' },
];

export function EmergencySOS() {
  const [state, setState] = useState<SosState>('idle');
  const [selectedType, setSelectedType] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleSOSPress = () => {
    setDialogOpen(true);
    setState('confirm');
  };

  const handleSend = useCallback(async (type: string) => {
    setSelectedType(type);
    setState('locating');

    let location = { lat: 4.9057, lng: 7.8739 }; // Uyo default

    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 })
      );
      location = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    } catch {
      // fallback to Uyo coordinates
    }

    setCoords(location);
    setState('sending');

    try {
      if (firestore && user) {
        await addDoc(collection(firestore, 'emergencies'), {
          type,
          userId: user.uid,
          userName: user.displayName || user.email || 'Unknown',
          userPhone: user.phoneNumber || '',
          location: {
            lat: location.lat,
            lng: location.lng,
            mapsUrl: `https://maps.google.com/?q=${location.lat},${location.lng}`,
          },
          status: 'active',
          createdAt: serverTimestamp(),
          respondedAt: null,
        });
      }

      setState('sent');
      toast({
        title: '🚨 SOS Sent!',
        description: 'Emergency services and your location have been broadcast. Help is on the way.',
      });
    } catch (err: any) {
      console.error('SOS send failed:', err);
      setState('confirm');
      toast({
        variant: 'destructive',
        title: 'SOS Failed',
        description: 'Could not transmit emergency. Please dial 112 immediately.',
      });
    }
  }, [firestore, user, toast]);

  const handleClose = () => {
    setDialogOpen(false);
    setTimeout(() => setState('idle'), 500);
    setSelectedType('');
    setCoords(null);
  };

  return (
    <>
      {/* SOS Trigger Button */}
      <button
        id="emergency-sos-btn"
        onClick={handleSOSPress}
        className="relative group flex items-center gap-3 w-full p-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-600/30 transition-all active:scale-95 overflow-hidden"
      >
        {/* Pulse ring */}
        <span className="absolute -top-1 -left-1 size-8 rounded-full bg-red-400/40 animate-ping" />

        <div className="relative z-10 size-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <AlertTriangle className="size-6 text-white" />
        </div>
        <div className="relative z-10 text-left flex-1">
          <p className="font-black text-base leading-none">Emergency SOS</p>
          <p className="text-red-100/80 text-xs font-medium mt-0.5">Tap to alert emergency services</p>
        </div>
        <div className="relative z-10 flex items-center gap-1 text-red-100/80 text-xs font-bold">
          <Radio className="size-3 animate-pulse" />
          LIVE
        </div>
      </button>

      {/* SOS Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 overflow-hidden border-0">

          {/* Header */}
          <div className="bg-gradient-to-br from-red-600 to-red-800 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }} />
            <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors">
              <X className="size-4" />
            </button>
            <div className="relative z-10">
              <div className="size-14 rounded-2xl bg-white/20 flex items-center justify-center mb-3 border border-white/30">
                <AlertTriangle className="size-7 animate-pulse" />
              </div>
              <DialogTitle className="text-white text-2xl font-black">Emergency SOS</DialogTitle>
              <DialogDescription className="text-red-100/80 mt-1 font-medium">
                {state === 'confirm' && 'Select your emergency type to alert services.'}
                {state === 'locating' && 'Getting your location...'}
                {state === 'sending' && 'Broadcasting SOS signal...'}
                {state === 'sent' && 'SOS transmitted. Help is on the way!'}
              </DialogDescription>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 bg-white dark:bg-slate-900">

            {state === 'confirm' && (
              <>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-wider">Select Emergency Type</p>
                <div className="grid grid-cols-3 gap-3">
                  {EMERGENCY_TYPES.map(({ label, color, emoji }) => (
                    <button
                      key={label}
                      onClick={() => handleSend(label)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl ${color} text-white font-black text-sm hover:opacity-90 active:scale-95 transition-all shadow-md`}
                    >
                      <span className="text-2xl">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                  <Shield className="size-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-black text-amber-800">For life-threatening emergencies</p>
                    <p className="text-xs text-amber-700 mt-0.5">Also call <strong>112</strong> for immediate dispatch.</p>
                  </div>
                </div>
              </>
            )}

            {(state === 'locating' || state === 'sending') && (
              <div className="flex flex-col items-center gap-4 py-6">
                <div className="size-20 rounded-full bg-red-100 flex items-center justify-center">
                  <Loader2 className="size-10 text-red-600 animate-spin" />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900 text-lg">
                    {state === 'locating' ? 'Acquiring Location...' : 'Sending SOS...'}
                  </p>
                  <p className="text-slate-500 text-sm mt-1">
                    {state === 'locating'
                      ? 'Getting your GPS coordinates'
                      : `Broadcasting ${selectedType} emergency alert`
                    }
                  </p>
                </div>
              </div>
            )}

            {state === 'sent' && (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="size-20 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="size-10 text-emerald-600" />
                </div>
                <div className="text-center space-y-1">
                  <p className="font-black text-slate-900 text-xl">SOS Transmitted!</p>
                  <p className="text-slate-500 text-sm">Emergency services have been alerted.</p>
                </div>
                {coords && (
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <MapPin className="size-4 text-red-500" />
                      Location Shared
                    </div>
                    <p className="text-xs font-mono text-slate-500">
                      {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                    </p>
                    <a
                      href={`https://maps.google.com/?q=${coords.lat},${coords.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-blue-600 underline"
                    >
                      View on Google Maps →
                    </a>
                  </div>
                )}
                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-sm font-black text-red-700 flex items-center gap-2">
                    <Phone className="size-4" /> Also dial 112
                  </p>
                  <p className="text-xs text-red-600 mt-1">For immediate human dispatch, also call emergency services directly.</p>
                </div>
                <Button onClick={handleClose} className="w-full rounded-xl bg-slate-900 hover:bg-slate-700 font-bold h-11">
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
