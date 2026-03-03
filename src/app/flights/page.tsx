'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, Calendar as CalendarIcon, Users, MapPin, ArrowRight, ArrowLeftRight, Wallet, CheckCircle2, Clock, Star } from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function FlightBookingPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [from, setFrom] = useState('Uyo (QUO)');
    const [to, setTo] = useState('Lagos (LOS)');
    const [date, setDate] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedFlight, setSelectedFlight] = useState<{ id: string; time: string; price: number } | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [bookingRef] = useState(`QI-${Math.floor(Math.random() * 900000) + 100000}`);

    const walletDocRef = user && firestore ? doc(firestore, 'wallets', user.uid) : null;
    const { data: walletData } = useDoc<{ balance: number }>(walletDocRef);

    const mockFlights = [
        { id: 'QI0101', departure: '08:30', arrival: '09:45', duration: '1h 15m', price: 95000, type: 'Economy', seats: 12 },
        { id: 'QI0103', departure: '12:00', arrival: '13:15', duration: '1h 15m', price: 115000, type: 'Economy Flex', seats: 6 },
        { id: 'QI0105', departure: '16:45', arrival: '18:00', duration: '1h 15m', price: 135000, type: 'Premium', seats: 4 },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!from || !to || !date) { toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' }); return; }
        setIsSearching(true);
        setTimeout(() => { setIsSearching(false); setShowResults(true); }, 1500);
    };

    const handleBook = (flight: any) => {
        setSelectedFlight({ id: flight.id, time: `${flight.departure} → ${flight.arrival}`, price: flight.price * passengers });
        setShowPayment(true);
    };

    const handlePayment = async () => {
        if (!user || !firestore || !walletDocRef || !selectedFlight) return;
        if (!walletData || walletData.balance < selectedFlight.price) {
            toast({ title: 'Insufficient Funds', description: `You need ₦${selectedFlight.price.toLocaleString()}. Please top up your wallet.`, variant: 'destructive' });
            return;
        }
        setIsProcessing(true);
        try {
            await updateDoc(walletDocRef, { balance: walletData.balance - selectedFlight.price });
            await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
                type: 'debit', amount: selectedFlight.price,
                description: `Ibom Air: ${from} → ${to} (${selectedFlight.id})`,
                timestamp: serverTimestamp(), reference: `FLIGHT-${Date.now()}`, status: 'success'
            });
            setBookingSuccess(true);
        } catch {
            toast({ title: 'Booking Failed', description: 'Could not process payment.', variant: 'destructive' });
        } finally { setIsProcessing(false); }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-orange-50/20 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[700px] h-[700px] rounded-full bg-green-300/20 blur-[140px]" />
                <div className="absolute bottom-0 -left-40 w-[600px] h-[600px] rounded-full bg-orange-300/15 blur-[140px]" />
            </div>

            {/* Hero */}
            <div className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
                <div className="absolute right-0 bottom-0 w-96 h-80 opacity-20">
                    <img src="/ibom_air.png" alt="Ibom Air" className="object-contain w-full h-full" />
                </div>
                <div className="relative z-10 max-w-5xl mx-auto px-6 py-14 md:py-20">
                    <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5 text-xs font-bold uppercase tracking-widest">
                        <Plane className="h-3.5 w-3.5 text-orange-300" />
                        Official — Ibom Air Partner
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-3 leading-tight">
                        Fly <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">Ibom Air</span>
                    </h1>
                    <p className="text-white/75 text-lg max-w-xl">
                        Nigeria&apos;s pride — book direct flights from Uyo to Lagos, Abuja, and beyond. Pay seamlessly from your IbomPay wallet.
                    </p>
                </div>
            </div>

            {/* Search Card */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-20 pb-16">
                <div className="bg-white/90 backdrop-blur-xl border border-white/90 rounded-3xl shadow-2xl shadow-green-900/10 overflow-hidden">
                    {!showResults ? (
                        <div className="p-7 md:p-10">
                            <h2 className="text-xl font-black text-slate-900 mb-6">Search Flights</h2>
                            <form onSubmit={handleSearch} className="space-y-5">
                                {/* From / To */}
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="flex-1 space-y-1.5 w-full">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">From</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-green-600" />
                                            <Input value={from} onChange={(e) => setFrom(e.target.value)} className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/60 font-medium" placeholder="Departure City" />
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => { const tmp = from; setFrom(to); setTo(tmp); }} className="flex-shrink-0 size-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center hover:bg-green-100 transition-colors mt-5 hidden md:flex">
                                        <ArrowLeftRight className="size-4 text-green-700" />
                                    </button>
                                    <div className="flex-1 space-y-1.5 w-full">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">To</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-orange-500" />
                                            <Input value={to} onChange={(e) => setTo(e.target.value)} className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/60 font-medium" placeholder="Destination City" />
                                        </div>
                                    </div>
                                </div>

                                {/* Date + Passengers */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Departure Date</Label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/60 font-medium" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Passengers</Label>
                                        <div className="relative">
                                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                            <select className="w-full pl-11 h-12 rounded-xl border border-slate-200 bg-slate-50/60 font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-green-400/50" value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value))}>
                                                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" disabled={isSearching} className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-black text-base shadow-xl shadow-green-500/25 gap-2">
                                    {isSearching ? (
                                        <><span className="animate-spin rounded-full size-5 border-2 border-white border-t-transparent" /> Searching Flights...</>
                                    ) : (
                                        <><Plane className="size-5" /> Search Flights</>
                                    )}
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="p-7 md:p-10">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Available Flights</h3>
                                    <p className="text-sm text-slate-500">{from} → {to} · {date} · {passengers} pax</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setShowResults(false)} className="rounded-xl border-slate-200 font-bold">Modify</Button>
                            </div>
                            <div className="space-y-4">
                                {mockFlights.map((flight) => (
                                    <div key={flight.id} className="group border border-slate-100 rounded-2xl p-5 hover:border-green-200 hover:shadow-lg hover:shadow-green-500/5 transition-all bg-white flex flex-col md:flex-row md:items-center gap-5">
                                        <div className="flex-1 flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-2xl font-black font-mono text-slate-900">{flight.departure}</p>
                                                <p className="text-xs text-slate-400 font-medium">{from.split(' ')[0]}</p>
                                            </div>
                                            <div className="flex-1 flex flex-col items-center">
                                                <p className="text-[10px] text-slate-400 font-bold">{flight.duration}</p>
                                                <div className="w-full flex items-center gap-1 my-1">
                                                    <div className="flex-1 h-px bg-slate-200" />
                                                    <Plane className="size-4 text-green-600" />
                                                    <div className="flex-1 h-px bg-slate-200" />
                                                </div>
                                                <p className="text-[10px] text-green-600 font-bold">Non-stop</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-black font-mono text-slate-900">{flight.arrival}</p>
                                                <p className="text-xs text-slate-400 font-medium">{to.split(' ')[0]}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:flex-col md:items-end gap-3 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase mb-0.5">{flight.type}</p>
                                                <p className="text-xl font-black text-green-700">₦{(flight.price * passengers).toLocaleString()}</p>
                                                <p className="text-xs text-orange-500 font-medium">{flight.seats} seats left</p>
                                            </div>
                                            <Button onClick={() => handleBook(flight)} className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-md shadow-green-500/20">
                                                Select →
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Dialog */}
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent className="sm:max-w-md rounded-3xl border-0 p-0 overflow-hidden">
                    {bookingSuccess ? (
                        <div className="p-8 flex flex-col items-center text-center space-y-4">
                            <div className="size-20 rounded-3xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-xl shadow-green-500/25">
                                <CheckCircle2 className="size-10 text-white" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900">Booking Confirmed! ✈️</DialogTitle>
                                <DialogDescription className="text-base mt-2">
                                    Your flight from {from} to {to} is booked. E-ticket sent to your email.
                                </DialogDescription>
                            </div>
                            <div className="bg-green-50 border border-green-200 w-full p-4 rounded-2xl">
                                <p className="text-xs text-green-700 font-bold uppercase mb-1">Booking Reference</p>
                                <p className="text-2xl font-mono font-black tracking-widest text-green-800">{bookingRef}</p>
                            </div>
                            <Button onClick={() => { setShowPayment(false); setShowResults(false); setBookingSuccess(false); }} className="w-full rounded-2xl h-12 bg-gradient-to-r from-green-600 to-green-700 text-white font-black">Done</Button>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gradient-to-br from-green-800 to-green-900 p-6 text-white">
                                <DialogTitle className="text-white text-xl font-black">Complete Booking</DialogTitle>
                                <DialogDescription className="text-white/70 text-sm mt-1">Pay securely from your IbomPay wallet</DialogDescription>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100">
                                    {[['Route', `${from} → ${to}`], ['Time', selectedFlight?.time], ['Passengers', `${passengers}x`]].map(([l, v]) => (
                                        <div key={l} className="flex justify-between text-sm">
                                            <span className="text-slate-500 font-medium">{l}</span>
                                            <span className="font-bold text-slate-900">{v}</span>
                                        </div>
                                    ))}
                                    <div className="pt-3 border-t border-slate-200 flex justify-between">
                                        <span className="font-black text-slate-900">Total</span>
                                        <span className="text-xl font-black text-green-700">₦{selectedFlight?.price.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-2xl border border-green-200">
                                    <div className="size-10 rounded-xl bg-green-600 flex items-center justify-center">
                                        <Wallet className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-green-900">IbomPay Wallet</p>
                                        <p className="text-xs text-green-700">Available: ₦{walletData?.balance?.toLocaleString() || '0'}</p>
                                    </div>
                                </div>
                                <DialogFooter className="gap-3">
                                    <Button variant="outline" className="rounded-xl flex-1 border-slate-200 font-bold" onClick={() => setShowPayment(false)} disabled={isProcessing}>Cancel</Button>
                                    <Button onClick={handlePayment} disabled={isProcessing} className="rounded-xl flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white font-black shadow-lg shadow-green-500/25">
                                        {isProcessing ? <><span className="animate-spin rounded-full size-4 border-2 border-white border-t-transparent mr-2" />Processing...</> : `Pay ₦${selectedFlight?.price.toLocaleString()}`}
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
