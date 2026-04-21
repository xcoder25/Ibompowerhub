'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Fingerprint, Scan, Camera, 
  Lock, Unlock, ChevronRight, Activity, 
  Brain, Cpu, MapPin, BadgeCheck, AlertCircle,
  Loader2, Wifi, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function AccessPage() {
  const { toast } = useToast();
  const [step, setStep] = useState<'idle' | 'scanning' | 'verifying' | 'granted' | 'denied'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startScan = async () => {
    setStep('scanning');
    setScanProgress(0);
    
    // Request camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsFaceDetected(true);
      }
    } catch (e) {
      console.log('Camera blocked or not available');
    }

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStep('verifying');
          verify();
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const verify = () => {
    setTimeout(() => {
      setStep('granted');
      toast({
        title: "Access Granted",
        description: "Gate Sector IV (Shelter Afrique) unlocked.",
      });
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }, 2000);
  };

  const reset = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setStep('idle');
    setScanProgress(0);
    setIsFaceDetected(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background Neural Grid */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Ambient Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 py-12 md:py-24 max-w-5xl relative z-10 flex flex-col items-center">
        
        {/* ── Header ── */}
        <div className="text-center space-y-4 mb-16 animate-in fade-in slide-in-from-top-10 duration-1000">
           <div className="flex justify-center mb-4">
              <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30 px-6 py-2 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-lg">
                Neural Identity Link V4
              </Badge>
           </div>
           <h1 className="text-5xl md:text-8xl font-black tracking-tightest leading-none">
             GATE<span className="text-blue-500 italic">ACCESS</span>
           </h1>
           <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">
             Secure biometric ingress for ARISE-Hedged communities. Verified by the Akwa Ibom State Smart Grid.
           </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 w-full items-start">
           
           {/* ── Scanning Interface ── */}
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[3rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <Card className="relative bg-slate-900 border-none rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl flex flex-col">
                 
                 {/* Scanner Viewport */}
                 <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                    {step === 'idle' ? (
                      <div className="flex flex-col items-center gap-6 animate-pulse p-12 text-center">
                         <div className="size-24 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <Scan className="size-10 text-blue-500" />
                         </div>
                         <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Awaiting Biometric Detection</p>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale scale-x-[-1]" />
                        
                        {/* Overlay Hud */}
                        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
                           <div className="flex justify-between">
                              <div className="size-12 border-t-2 border-l-2 border-blue-500 rounded-tl-3xl opacity-50" />
                              <div className="size-12 border-t-2 border-r-2 border-blue-500 rounded-tr-3xl opacity-50" />
                           </div>

                           {/* Center Scanner Area */}
                           <div className="flex-1 flex flex-col items-center justify-center relative">
                              {step === 'scanning' && (
                                <div className="absolute inset-x-4 h-0.5 bg-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-scan-y top-0" />
                              )}
                              
                              {step === 'granted' && (
                                <div className="size-32 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500 animate-in zoom-in duration-500">
                                   <Unlock className="size-12 text-emerald-500" />
                                </div>
                              )}

                              {isFaceDetected && step === 'scanning' && (
                                <div className="border border-blue-500/40 rounded-full size-64 absolute flex items-center justify-center">
                                   <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin duration-[3000ms]" />
                                   <div className="space-y-1 text-center">
                                      <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest">Face Locked</p>
                                      <p className="text-2xl font-black">{scanProgress}%</p>
                                   </div>
                                </div>
                              )}
                           </div>

                           <div className="flex justify-between">
                              <div className="size-12 border-b-2 border-l-2 border-blue-500 rounded-bl-3xl opacity-50" />
                              <div className="size-12 border-b-2 border-r-2 border-blue-500 rounded-br-3xl opacity-50" />
                           </div>
                        </div>
                      </>
                    )}
                 </div>

                 <CardContent className="p-8 bg-slate-900 border-t border-white/5 space-y-6">
                    {step === 'idle' ? (
                       <Button onClick={startScan} className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20 active:scale-95 transition-all">
                          <Fingerprint className="mr-2 size-5" /> Initialize Biometric Ingress
                       </Button>
                    ) : step === 'verifying' ? (
                       <div className="flex items-center justify-center gap-4 py-4">
                          <Loader2 className="size-6 text-blue-500 animate-spin" />
                          <p className="font-bold uppercase tracking-widest text-xs text-blue-400">Authenticating Neural Signature...</p>
                       </div>
                    ) : step === 'granted' ? (
                       <div className="space-y-4">
                          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                             <ShieldCheck className="size-6 text-emerald-500" />
                             <div>
                                <p className="text-[10px] font-bold text-emerald-500 uppercase">ACCESS GRANTED</p>
                                <p className="text-sm font-black text-white">ID: ARISE-AKS-9024</p>
                             </div>
                          </div>
                          <Button onClick={reset} variant="secondary" className="w-full h-14 rounded-2xl bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:bg-white/10">
                             Terminate Session
                          </Button>
                       </div>
                    ) : (
                      <Progress progress={scanProgress} />
                    )}
                 </CardContent>
              </Card>
           </div>

           {/* ── Security Intelligence ── */}
           <div className="space-y-8">
              <h2 className="text-2xl font-black uppercase tracking-tightest flex items-center gap-4">
                 <Activity className="size-6 text-blue-500" /> Node Status
              </h2>

              <div className="grid gap-6">
                 {[
                   { label: 'Network', value: 'IMPERVIOUS', icon: Wifi, color: 'text-emerald-500' },
                   { label: 'Grid Feed', value: 'STABLE', icon: Zap, color: 'text-amber-500' },
                   { label: 'Last Access', value: '2M AGO', icon: MapPin, color: 'text-blue-500' },
                 ].map(stat => (
                   <div key={stat.label} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="size-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <stat.icon className={cn("size-6", stat.color)} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                            <p className="text-lg font-black text-white">{stat.value}</p>
                         </div>
                      </div>
                      <ChevronRight className="size-5 text-slate-700" />
                   </div>
                 ))}
              </div>

              {/* Orion Logic Brief */}
              <Card className="bg-gradient-to-br from-blue-900 to-indigo-950 border-none rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                 <div className="relative z-10 space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="size-14 rounded-[1.5rem] bg-white/10 flex items-center justify-center backdrop-blur-xl group-hover:scale-110 transition-transform">
                          <Brain className="size-7 text-blue-300" />
                       </div>
                       <Badge className="bg-white/10 text-white border-white/20 font-black px-4 py-1.5 rounded-xl uppercase text-[10px] tracking-widest shadow-sm">Orion Guardian</Badge>
                    </div>
                    
                    <p className="text-xl font-bold leading-tight italic text-blue-50">
                       "Gate's clear, boss. I've pre-synced your home automation in Sector IV. 100% molecular matches on your face scan. We're good."
                    </p>

                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Neural Sync Active</p>
                       </div>
                       <p className="text-[10px] font-black uppercase text-white/40">V. 4022</p>
                    </div>
                 </div>
                 
                 {/* Abstract visual background */}
                 <div className="absolute -bottom-20 -right-20 size-80 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
              </Card>

              <div className="bg-slate-900 rounded-[2.5rem] p-8 flex items-center gap-6 border border-white/5 text-slate-500">
                 <BadgeCheck className="size-12 opacity-20" />
                 <p className="text-xs font-medium leading-relaxed italic">
                   This system uses state-sanctioned SMILE ID technology integrated with the Arise Ledger for immutable identity verification.
                 </p>
              </div>
           </div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes scan-y {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
        .animate-scan-y {
          animation: scan-y 3s infinite ease-in-out;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </main>
  );
}

function Progress({ progress }: { progress: number }) {
  return (
    <div className="w-full space-y-3">
       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-blue-400">
          <span>Neural Mapping</span>
          <span>{progress}%</span>
       </div>
       <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/10">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
            style={{ width: `${progress}%` }} 
          />
       </div>
    </div>
  );
}
