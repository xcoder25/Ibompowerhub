'use client';

import { useState, useRef, useEffect } from 'react';
import { powerSchedule } from '@/lib/data';
import { 
  Power, Zap, ZapOff, AlertTriangle, CheckCircle2, Clock, 
  MapPin, ChevronRight, BatteryFull, Activity, 
  Cpu, LayoutGrid, ShieldCheck, ArrowRight, CreditCard, 
  TrendingUp, Lightbulb, Loader2, Copy, Check, Receipt, Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, query, where, orderBy, limit, onSnapshot, serverTimestamp } from 'firebase/firestore';

// ── Interactive Grid Canvas ──
function GridCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let points: { x: number, y: number, r: number, vx: number, vy: number, age: number }[] = [];
    
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      init();
    };

    const init = () => {
      points = Array.from({ length: 40 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        age: Math.random() * 100
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      points.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.age += 0.2;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(245, 158, 11, ${Math.abs(Math.sin(p.age * 0.05)) * 0.5})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < points.length; j++) {
          const p2 = points[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 80) {
            ctx.strokeStyle = `rgba(245, 158, 11, ${(1 - dist / 80) * 0.15})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-40 dark:opacity-20" />;
}

interface VendedTokenReceipt {
  token: string;
  receiptNo: string;
  meterNumber: string;
  meterType: string;
  disco: string;
  band: string;
  customerName: string;
  address: string;
  amountPaid: number;
  netEnergyCost: number;
  vatAmount: number;
  tariffPerKwh: number;
  unitsKwh: number;
  timestamp: string;
  status: string;
  feederStation: string;
}

export default function PowerPage() {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const [meterNo, setMeterNo] = useState('');
  const [amount, setAmount] = useState('');
  const [band, setBand] = useState('Band A (20+ hrs)');
  const [isBuying, setIsBuying] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<VendedTokenReceipt | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [recentTokens, setRecentTokens] = useState<VendedTokenReceipt[]>([]);

  // Real-time Firestore tokens listener
  useEffect(() => {
    if (!firestore) return;

    // Listen to user's power tokens if authenticated, or general local state
    const userId = user?.uid || 'guest-session';
    const tokensRef = collection(firestore, 'power_tokens');
    const q = query(
      tokensRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tokens: VendedTokenReceipt[] = [];
        snapshot.forEach((doc) => {
          tokens.push(doc.data() as VendedTokenReceipt);
        });
        if (tokens.length > 0) {
          setRecentTokens(tokens);
        }
      },
      (error) => {
        // Fallback to local storage for guests
        try {
          const localStored = localStorage.getItem('ibom_recent_power_tokens');
          if (localStored) setRecentTokens(JSON.parse(localStored));
        } catch {}
      }
    );

    return () => unsubscribe();
  }, [firestore, user]);

  const handleCopy = (tokenStr: string) => {
    navigator.clipboard.writeText(tokenStr);
    setCopied(true);
    toast({ title: "Copied!", description: "Token copied to clipboard." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePurchase = async () => {
    if (!meterNo || !amount) return;
    setIsBuying(true);

    try {
      const res = await fetch('/api/power/vend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meterNumber: meterNo,
          amount: parseFloat(amount),
          band,
          userId: user?.uid || 'guest-session',
          customerName: user?.displayName || 'Akwa Ibom Grid Subscriber'
        })
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to vend token');
      }

      const receiptData: VendedTokenReceipt = result.data;
      setLatestReceipt(receiptData);
      setShowReceiptDialog(true);

      // Persist to Firestore
      if (firestore) {
        try {
          await addDoc(collection(firestore, 'power_tokens'), {
            ...receiptData,
            userId: user?.uid || 'guest-session',
            createdAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn('[POWER] Firestore save fallback:', dbErr);
        }
      }

      // Update local storage history
      try {
        const updated = [receiptData, ...recentTokens].slice(0, 8);
        setRecentTokens(updated);
        localStorage.setItem('ibom_recent_power_tokens', JSON.stringify(updated));
      } catch {}

      toast({
        title: "⚡ Token Vended Successfully",
        description: `${receiptData.unitsKwh} kWh credited to Meter ${receiptData.meterNumber}`,
      });

      setMeterNo('');
      setAmount('');
    } catch (err: any) {
      toast({
        title: "Vending Failed",
        description: err.message || "Could not process token request.",
        variant: "destructive"
      });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950 pb-32 relative overflow-hidden">
      <GridCanvas />
      
      {/* Premium background effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-amber-500/[0.05] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/[0.05] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-8 py-8 md:py-16 space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* ── Dynamic Header ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-5 max-w-3xl">
            <div className="flex items-center gap-3">
               <div className="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Cpu className="size-5 text-amber-500" />
               </div>
               <Badge className="bg-amber-500/10 text-amber-500 border-none px-4 py-1.5 rounded-xl font-black uppercase text-[10px] tracking-widest">
                 Sector Link Active
               </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tightest text-slate-950 dark:text-white leading-none">
              GRID<span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent italic">MASTER</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-xl">
              Precision energy telemetry for the Akwa Ibom Smart Power Grid. Real-time distribution monitoring & instant STS token provisioning.
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-inner">
             <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-md">
                <Activity className="size-6 text-emerald-500 animate-pulse" />
             </div>
             <div className="pr-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Load</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">82.4 <span className="text-sm font-bold text-slate-400">MW</span></p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* ── Main Monitor ── */}
          <div className="xl:col-span-2 space-y-8">
            {/* Live Visualizer Card */}
            <Card className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 border-none shadow-2xl min-h-[400px] group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-indigo-500/5" />
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
              
              <div className="relative z-10 p-8 md:p-12 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400">Live Telemetry</p>
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tightest leading-none">SECTOR-IV <br/><span className="text-amber-500">OPTIMAL</span></h2>
                  </div>
                  <div className="size-20 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center backdrop-blur-3xl group-hover:rotate-12 transition-transform duration-700">
                    <Zap className="size-10 text-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12">
                   {[
                     { label: 'Voltage', value: '232V', icon: TrendingUp, color: 'text-amber-500' },
                     { label: 'Stability', value: '98.2%', icon: ShieldCheck, color: 'text-emerald-400' },
                     { label: 'Frequency', value: '50.1Hz', icon: Activity, color: 'text-indigo-400' },
                     { label: 'Capacity', value: '1.2GW', icon: BatteryFull, color: 'text-sky-400' },
                   ].map((stat) => (
                     <div key={stat.label} className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                        <div className="flex items-center gap-2">
                           <stat.icon className={`size-4 ${stat.color}`} />
                           <p className="text-xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                     </div>
                   ))}
                </div>
              </div>

              {/* Animated HUD Elements */}
              <div className="absolute bottom-[-10%] right-[-5%] size-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute top-[20%] left-[40%] size-48 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
            </Card>

            {/* Grid Schedule Table */}
            <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-8 space-y-8 shadow-inner overflow-hidden">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                         <LayoutGrid className="size-6 text-slate-600 dark:text-slate-300" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">Distribution Matrix</h3>
                   </div>
                   <Badge variant="outline" className="border-slate-300 dark:border-slate-700 text-slate-500 font-bold uppercase text-[9px] tracking-widest h-8 px-4">Daily Cycle</Badge>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                         <tr className="text-left border-b border-slate-200 dark:border-slate-800">
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Topology</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Channel</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-emerald-500">Inbound</th>
                            <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-red-500">Shedding</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {powerSchedule.map((item, idx) => (
                           <tr key={idx} className="group hover:bg-white dark:hover:bg-slate-800/50 transition-all duration-300">
                              <td className="py-6 font-black text-slate-900 dark:text-white flex items-center gap-3">
                                 <div className="size-6 rounded bg-slate-100 dark:bg-slate-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                    <MapPin className="size-3" />
                                 </div>
                                 {item.area}
                              </td>
                              <td className="py-6"><Badge className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none font-bold">Node {item.group}</Badge></td>
                              <td className="py-6 text-emerald-500 font-black"><Clock className="size-3.5 inline mr-1 opacity-50" /> {item.in}</td>
                              <td className="py-6 text-red-500 font-black"><Clock className="size-3.5 inline mr-1 opacity-50" /> {item.out}</td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
            </div>

            {/* ── Recent Tokens & Receipts ── */}
            {recentTokens.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-200 dark:border-white/5 p-6 sm:p-8 space-y-6 shadow-inner">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Receipt className="size-5 text-amber-500" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Vended Tokens</h3>
                  </div>
                  <Badge className="bg-amber-500/10 text-amber-500 border-none font-mono text-xs font-bold">
                    {recentTokens.length} Records
                  </Badge>
                </div>

                <div className="space-y-3">
                  {recentTokens.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-mono text-base sm:text-lg font-black tracking-widest text-slate-900 dark:text-amber-400">
                            {item.token}
                          </p>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleCopy(item.token)}>
                            <Copy className="size-3.5 text-slate-400 hover:text-amber-500" />
                          </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                          Meter {item.meterNumber} • {item.unitsKwh} kWh • ₦{item.amountPaid?.toLocaleString()} • {item.receiptNo}
                        </p>
                      </div>
                      <Badge className="w-fit bg-emerald-500/10 text-emerald-500 border-none font-bold uppercase text-[10px] tracking-wider">
                        {item.status || 'Delivered'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Action Panel ── */}
          <div className="space-y-8">
             {/* Instant Buy Card */}
             <Card className="bg-white dark:bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden group">
                <div className="bg-slate-950 p-8 text-white relative overflow-hidden">
                   <div className="relative z-10 space-y-4">
                      <div className="flex justify-between items-center">
                         <Badge className="bg-amber-500/20 text-amber-400 border-none font-black px-4 py-1 rounded-xl uppercase text-[9px] tracking-[0.2em]">Token Node</Badge>
                         <CreditCard className="size-6 text-slate-500" />
                      </div>
                      <h3 className="text-3xl font-black tracking-tightest leading-none">SMART<br/><span className="text-amber-500">TOP-UP</span></h3>
                   </div>
                   <div className="absolute top-0 right-0 p-16 bg-amber-500/10 blur-[60px] rounded-full pointer-events-none" />
                </div>
                <CardContent className="p-8 space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-2">Meter Identification (11 Digits)</label>
                         <Input 
                            placeholder="e.g. 14285910381" 
                            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-mono text-lg shadow-inner focus:ring-2 ring-amber-500/20"
                            value={meterNo}
                            onChange={(e) => setMeterNo(e.target.value)}
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 pl-2">Liquidity Amount (₦)</label>
                         <Input 
                            type="number"
                            placeholder="0.00" 
                            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-black text-xl shadow-inner focus:ring-2 ring-amber-500/20"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                         />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {['2000', '5000', '10000'].map(v => (
                          <Button key={v} variant="outline" size="sm" onClick={() => setAmount(v)} className="rounded-xl font-bold border-slate-100 dark:border-slate-800 text-[10px] h-10 hover:bg-amber-500 hover:text-white transition-all">₦{parseInt(v).toLocaleString()}</Button>
                        ))}
                      </div>
                   </div>

                   <Button 
                    onClick={handlePurchase}
                    disabled={isBuying || !meterNo || !amount}
                    className="w-full h-16 rounded-2xl bg-slate-950 text-white hover:bg-amber-600 transition-all font-black uppercase text-xs tracking-widest shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] shadow-amber-500/20 group py-6"
                   >
                      {isBuying ? <Loader2 className="size-5 animate-spin mr-2" /> : <Zap className="size-5 mr-2 group-hover:scale-125 transition-transform" />}
                      {isBuying ? 'CONNECTING PHED SWITCH...' : 'GENERATE LIVE TOKEN'}
                   </Button>
                </CardContent>
             </Card>

             {/* Orion Energy Insight */}
             <Card className="bg-indigo-600 text-white border-none shadow-2xl rounded-[2.5rem] p-8 relative overflow-hidden group">
                <div className="relative z-10 space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl">
                         <Lightbulb className="size-6 text-amber-300" />
                      </div>
                      <Badge className="bg-white/10 text-white border-white/20 font-black px-4 py-1 rounded-xl uppercase text-[9px] tracking-widest">Orion AI</Badge>
                   </div>
                   
                   <p className="text-lg font-black leading-tight italic">
                     "Boss, I noticed your Sector IV will go into cycle in 4 hours. Better top up now to ensure your Neural Link stays active."
                   </p>

                   <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Confidence: 94%</p>
                      <Button variant="ghost" className="h-8 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/10">Full Forecast <ArrowRight className="size-3 ml-1.5" /></Button>
                   </div>
                </div>

                <div className="absolute top-[-20%] right-[-10%] size-64 bg-indigo-400/20 blur-[100px] rounded-full pointer-events-none" />
             </Card>

             {/* Safety Check */}
             <div className="bg-slate-100 dark:bg-slate-900 rounded-[2rem] p-7 flex items-center gap-5 border border-slate-200 dark:border-white/5">
                <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                   <ShieldCheck className="size-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Protection Protocol</p>
                   <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">ARISE Secure-Pay Active</p>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* ── Token Receipt Modal ── */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8 bg-white dark:bg-slate-900 border-none shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Zap className="size-6" />
            </div>
            <DialogTitle className="text-2xl font-black text-center text-slate-950 dark:text-white uppercase tracking-tight">
              Recharge Token Slip
            </DialogTitle>
            <p className="text-xs text-center text-slate-500">
              Akwa Ibom State Electricity Distribution — PHED Gateway
            </p>
          </DialogHeader>

          {latestReceipt && (
            <div className="space-y-6 pt-4">
              {/* Token Display Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                  STS 20-Digit Token
                </p>
                <p className="text-2xl font-mono font-black tracking-widest text-slate-950 dark:text-white select-all">
                  {latestReceipt.token}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(latestReceipt.token)}
                  className="rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white text-xs font-bold gap-2"
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? 'Copied to Clipboard' : 'Copy Token Code'}
                </Button>
              </div>

              {/* Receipt Details Breakdown */}
              <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                  <span>Meter Number</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{latestReceipt.meterNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                  <span>Energy Purchased</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{latestReceipt.unitsKwh} kWh</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                  <span>Tariff Band</span>
                  <span className="font-bold text-slate-900 dark:text-white">{latestReceipt.band}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                  <span>Amount Paid</span>
                  <span className="font-bold text-slate-900 dark:text-white">₦{latestReceipt.amountPaid?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                  <span>VAT (7.5%)</span>
                  <span className="text-slate-900 dark:text-white">₦{latestReceipt.vatAmount}</span>
                </div>
                <div className="flex justify-between py-1.5 text-slate-600 dark:text-slate-400">
                  <span>Receipt No</span>
                  <span className="font-mono text-slate-900 dark:text-white">{latestReceipt.receiptNo}</span>
                </div>
              </div>

              <Button
                onClick={() => setShowReceiptDialog(false)}
                className="w-full h-12 rounded-xl bg-slate-950 dark:bg-amber-500 dark:text-slate-950 text-white font-bold uppercase text-xs tracking-wider"
              >
                Close Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
