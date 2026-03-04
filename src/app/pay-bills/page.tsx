'use client';

import {
    Smartphone, Wifi, Tv, Droplets, Lightbulb, Search, ArrowRight,
    ShieldCheck, Activity, ChevronRight, Award, Star, Globe, TrendingUp, Info,
    Zap, CreditCard, Sparkles, Map, Landmark, Clock, Filter, History, Smartphone as Airtime,
    Zap as Bolt, Heart, Share2, Wallet, RefreshCw, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React from 'react';
import { fetchBillCategories, validateBill, payBill, purchaseAirtime } from '@/lib/flutterwave';

type WalletData = {
    balance: number;
};

export default function PayBillsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="size-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        }>
            <PayBillsContent />
        </Suspense>
    );
}

function PayBillsContent() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const walletDocRef = useMemoFirebase(
        () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
        [firestore, user]
    );
    const { data: walletData } = useDoc<WalletData>(walletDocRef);

    const [activeCategory, setActiveCategory] = useState<'AIRTIME' | 'DATA' | 'CABLE' | 'POWER' | 'WATER'>('AIRTIME');
    const [amount, setAmount] = useState('');
    const [customer, setCustomer] = useState('');
    const [operator, setOperator] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [customerDetails, setCustomerDetails] = useState<any>(null);

    const searchParams = useSearchParams();
    const catParam = searchParams.get('cat');

    useEffect(() => {
        if (catParam && ['AIRTIME', 'DATA', 'CABLE', 'POWER', 'WATER'].includes(catParam)) {
            setActiveCategory(catParam as any);
        }
    }, [catParam]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetchBillCategories(activeCategory);
                if (res.status === 'success') {
                    setCategories(res.data);
                    setOperator(null);
                    setIsValidated(false);
                    setCustomerDetails(null);
                }
            } catch (err) {
                toast({ title: "Sync Failed", description: "Could not fetch bill categories node matrix.", variant: "destructive" });
            }
        };
        loadCategories();
    }, [activeCategory]);

    const handleValidate = async () => {
        if (!customer || !operator) return;
        setIsLoading(true);
        try {
            const res = await validateBill({
                item_code: operator.item_code,
                code: operator.biller_code || '101',
                customer: customer
            });
            if (res.status === 'success') {
                setIsValidated(true);
                setCustomerDetails(res.data);
                toast({ title: "Node Validated", description: "Service node identity verified hub sync." });
            } else {
                throw new Error(res.message);
            }
        } catch (err: any) {
            toast({ title: "Validation Error", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        if (!amount || Number(amount) <= 0) return;
        if (Number(amount) > (walletData?.balance || 0)) {
            toast({ title: "Insufficient Balance", description: "Registry hub balance low. Top-up wallet matrix.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const reference = `FLW-${activeCategory}-${Date.now()}`;
            let res;
            if (activeCategory === 'AIRTIME') {
                res = await purchaseAirtime({
                    country: 'NG',
                    customer,
                    amount: Number(amount),
                    type: operator?.item_code || 'AIRTIME',
                    reference
                });
            } else {
                res = await payBill({
                    country: 'NG',
                    customer,
                    amount: Number(amount),
                    type: operator?.item_code || activeCategory,
                    reference
                });
            }

            if (res.status === 'success' && firestore && user) {
                // Debit wallet
                await updateDoc(walletDocRef!, {
                    balance: (walletData?.balance || 0) - Number(amount)
                });

                // Log transaction
                await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
                    type: 'debit',
                    amount: Number(amount),
                    description: `${activeCategory} Protocol: ${operator?.name || 'Service'}`,
                    timestamp: serverTimestamp(),
                    reference
                });

                toast({ title: "Protocol Success", description: "Transaction confirmed across registry nodes frequency." });
                setAmount('');
                setCustomer('');
                setIsValidated(false);
            } else {
                throw new Error(res.message);
            }
        } catch (err: any) {
            toast({ title: "Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-sans overflow-x-hidden">
            {/* Refined Bill Payment Hero */}
            <section className="relative overflow-hidden bg-slate-900 text-white pt-20 pb-32 px-6">
                {/* Ambient Glows */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-600/10 to-transparent pointer-events-none transition-opacity" />
                <div className="absolute top-[-10%] right-[-10%] size-[500px] bg-emerald-600/10 blur-[120px] rounded-full animate-pulse opacity-40" />
                <div className="absolute bottom-[-10%] left-[-10%] size-[500px] bg-orange-600/5 blur-[120px] rounded-full opacity-40" />

                <div className="max-w-4xl mx-auto relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-left">
                    <div className="space-y-4">
                        <Badge className="bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-[0.4em] shadow-2xl backdrop-blur-md italic">
                            Utility Hub · Flutterwave Matrix Node
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white uppercase italic leading-none pt-2">
                            State <br /> <span className="text-emerald-500 font-medium tracking-normal italic uppercase">Settlement.</span>
                        </h1>
                        <p className="text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed font-bold uppercase tracking-widest opacity-80 italic text-left">
                            Seamless utility settlement protocol frequency registry. Manage power, water, and connectivity terminal nodes across the unified state hub matrix.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-6 pt-4">
                        <div className="flex items-center gap-3 text-emerald-400 font-bold text-[9px] uppercase tracking-[0.3em] bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md italic">
                            <ShieldCheck className="size-4" /> Secured Frequency Link
                        </div>
                        <div className="flex items-center gap-3 text-orange-400 font-bold text-[9px] uppercase tracking-[0.3em] bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md italic">
                            <Activity className="size-4" /> Live Hub Sync
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-40">
                <Card className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border-none p-8 md:p-10 overflow-hidden group">
                    <div className="absolute top-0 right-0 w-48 h-full bg-emerald-500/5 -skew-x-[15deg] translate-x-16 pointer-events-none" />

                    <div className="flex flex-wrap items-center gap-3 border-b border-slate-50 dark:border-slate-800 pb-8 mb-10 overflow-x-auto no-scrollbar">
                        {[
                            { id: 'AIRTIME', label: 'Airtime Hub', icon: Smartphone, clr: 'bg-emerald-50 text-emerald-600' },
                            { id: 'DATA', label: 'Connectivity Sync', icon: Wifi, clr: 'bg-blue-50 text-blue-600' },
                            { id: 'CABLE', label: 'Media Protocol', icon: Tv, clr: 'bg-purple-50 text-purple-600' },
                            { id: 'POWER', label: 'Energy Node', icon: Bolt, clr: 'bg-orange-50 text-orange-600' },
                            { id: 'WATER', label: 'Supply Matrix', icon: Droplets, clr: 'bg-sky-50 text-sky-600' },
                        ].map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id as any)}
                                className={cn(
                                    "flex items-center gap-3.5 px-6 py-3.5 rounded-2xl font-bold text-[9px] uppercase tracking-[0.3em] italic transition-all duration-500",
                                    activeCategory === cat.id
                                        ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xl scale-105'
                                        : 'bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                                )}
                            >
                                <cat.icon className="size-4" /> {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-2 gap-16 text-left">
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none pt-1">Node Input Configuration</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-60 italic">Define Settlement Parameters Terminal Frequency</p>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] italic leading-none">Select Provider Node Matrix</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {categories.length > 0 ? (
                                            categories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setOperator(cat)}
                                                    className={cn(
                                                        "flex flex-col items-center justify-center p-6 rounded-2xl border-none shadow-inner transition-all duration-500 group/node text-center text-left",
                                                        operator?.id === cat.id
                                                            ? 'bg-emerald-600 text-white shadow-emerald-900/10'
                                                            : 'bg-slate-50 dark:bg-slate-950 text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                                                    )}
                                                >
                                                    <p className="text-xs font-black uppercase italic tracking-widest">{cat.name}</p>
                                                    <p className="text-[7px] font-bold uppercase tracking-[0.3em] opacity-40 mt-1">{cat.item_code}</p>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="col-span-2 py-6 text-center text-slate-300 font-bold uppercase tracking-widest italic opacity-40 text-[10px]">Syncing Node Operators Hub...</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] italic leading-none">Customer Terminal Identity (Node ID)</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="Terminal ID / SmartCard..."
                                                className="w-full h-14 pl-6 pr-32 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl font-bold text-sm focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-300 italic shadow-inner uppercase tracking-widest"
                                                value={customer}
                                                onChange={(e) => setCustomer(e.target.value)}
                                            />
                                            <Button
                                                onClick={handleValidate}
                                                disabled={isLoading || !customer || !operator}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-xl font-bold text-[9px] uppercase tracking-[0.3em] border-none shadow-sm transition-all"
                                            >
                                                {isLoading ? <RefreshCw className="size-4 animate-spin" /> : "Verify Node"}
                                            </Button>
                                        </div>
                                    </div>

                                    {isValidated && (
                                        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-none space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xl">
                                                    <CheckCircle2 className="size-5" />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-700">Protocol Validated</p>
                                                    <p className="text-base font-bold text-slate-900 dark:text-white uppercase italic">{customerDetails?.name || "Verified Citizen Node"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <label className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] italic leading-none">Settlement Amount Hub Frequency (₦)</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="0.00 Units"
                                                className="w-full h-16 pl-14 pr-6 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl font-bold text-2xl focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-200 italic shadow-inner"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 italic">₦</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handlePayment}
                                disabled={isLoading || !amount || !customer || (activeCategory !== 'AIRTIME' && !isValidated)}
                                className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg uppercase italic tracking-widest shadow-xl active:scale-95 transition-all border-none relative overflow-hidden group/btn"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-4">
                                        <div className="size-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span className="text-sm">Processing Protocol...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-3 text-sm">
                                        Establish Settlement <ArrowRight className="size-5 group-hover/btn:scale-125 transition-transform" />
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 w-24 h-full bg-white/10 -skew-x-[20deg] translate-x-32 group-hover/btn:translate-x-[-400%] transition-transform duration-[1.5s] ease-out pointer-events-none" />
                            </Button>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold tracking-tighter text-slate-900 dark:text-white uppercase italic leading-none pt-1 text-left">Settlement Summary</h3>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] opacity-60 italic text-left">Hub Wallet Transaction Integration Protocol</p>
                            </div>

                            <div className="space-y-6 text-left">
                                <Card className="bg-slate-900 border-none rounded-3xl p-8 text-white relative overflow-hidden group shadow-xl">
                                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-600/10 to-transparent pointer-events-none" />
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5 text-left">
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.4em] italic leading-none">Source Protocol Balance</p>
                                                <p className="text-2xl font-bold tracking-tighter italic">₦{(walletData?.balance ?? 0).toLocaleString()} <span className="text-emerald-500 text-sm tracking-normal">UNITS</span></p>
                                            </div>
                                            <div className="size-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-2xl group-hover:rotate-6 transition-transform">
                                                <Wallet className="size-6 text-emerald-400" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-white/5 text-left">
                                            <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest italic opacity-60">
                                                <span>Processing Fee Node</span>
                                                <span>₦0.00 FREE</span>
                                            </div>
                                            <div className="flex justify-between items-end pt-2">
                                                <div className="space-y-0.5 text-left">
                                                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-[0.5em] italic leading-none">Final Node Deduction</p>
                                                    <p className="text-xl font-black text-white italic tracking-tighter uppercase leading-none pt-1">₦{amount ? Number(amount).toLocaleString() : "0.00"}</p>
                                                </div>
                                                <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 px-4 py-1.5 rounded-full font-bold text-[7px] uppercase tracking-[0.3em] italic">Instant Frequency Node</Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="bg-white dark:bg-slate-800/50 border-none rounded-3xl p-8 space-y-6 shadow-inner overflow-hidden relative group text-left">
                                    <div className="absolute top-0 right-0 w-24 h-full bg-slate-500/5 -skew-x-[15deg] translate-x-12 pointer-events-none transition-transform group-hover:translate-x-10" />
                                    <div className="flex items-center gap-4">
                                        <div className="size-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 shadow-sm transition-transform group-hover:scale-110">
                                            <Clock className="size-6" />
                                        </div>
                                        <div className="space-y-1 text-left">
                                            <h4 className="text-xl font-bold text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none pt-1">Recent Settlements</h4>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em] italic opacity-60 leading-none">Registry Node Sync History</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2 text-left">
                                        {[
                                            { type: 'POWER Node', amount: '₦12,000', node: 'PHED Hub', status: 'SYNCHRONIZED' },
                                            { type: 'DATA Protocol', amount: '₦5,000', node: 'MTN Hub', status: 'STABLE' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors group cursor-default">
                                                <div className="space-y-0.5 text-left">
                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{item.type} · <span className="text-slate-400 font-bold opacity-60">{item.node}</span></p>
                                                    <p className="text-[7px] font-bold text-emerald-600 uppercase tracking-[0.3em]">{item.status} VERIFIED</p>
                                                </div>
                                                <p className="text-base font-bold text-slate-900 dark:text-white italic tracking-tighter uppercase leading-none">{item.amount}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="ghost" className="w-full h-12 rounded-xl font-bold text-[8px] uppercase tracking-[0.4em] text-slate-400 hover:text-emerald-600 hover:bg-transparent border-none italic opacity-60 hover:opacity-100 transition-all">
                                        Establish Full Registry Link <ArrowRight className="ml-2 size-3" />
                                    </Button>
                                </Card>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Info Node Row */}
            <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-8 text-left">
                {[
                    { title: 'Secured Terminal', icon: ShieldCheck, desc: 'Transaction node encryption protocol verified across global state registry links frequency.', clr: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
                    { title: 'Infinite Uptime', icon: Zap, desc: 'Real-time settlement frequency 99.9% uptime monitoring across every ministry hub matrix node.', clr: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40' },
                    { title: 'Citizen Rewards', icon: Sparkles, desc: 'Earn Ibom units on every settlement verified across the ARISE agenda hub frequency matrix node registry.', clr: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
                ].map((item, i) => (
                    <Card key={i} className="bg-white dark:bg-slate-900 border-none rounded-3xl p-8 space-y-6 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 shadow-xl relative overflow-hidden text-left">
                        <div className="absolute top-0 right-0 w-24 h-full bg-slate-500/5 -skew-x-[20deg] translate-x-12 pointer-events-none transition-transform group-hover:translate-x-8" />
                        <div className={cn("size-14 rounded-2xl flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-700 relative z-10", item.bg, item.clr)}>
                            <item.icon className="size-6" />
                        </div>
                        <div className="space-y-4 relative z-10 pt-1 text-left">
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white uppercase italic leading-none group-hover:text-emerald-600 transition-colors tracking-tighter">{item.title}</h4>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed italic opacity-80">{item.desc}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
