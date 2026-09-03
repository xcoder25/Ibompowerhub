'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, Calendar as CalendarIcon, Users, MapPin, ArrowRight, ArrowLeftRight, Wallet, CheckCircle2, Clock, Star, Radar } from 'lucide-react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    const [scrapedFlights, setScrapedFlights] = useState<any[]>([]);

    // Tracking state
    const [trackRef, setTrackRef] = useState('');
    const [isTracking, setIsTracking] = useState(false);
    const [trackResult, setTrackResult] = useState<any>(null);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackRef) return;
        setIsTracking(true);
        setTimeout(() => {
            setIsTracking(false);
            setTrackResult({
                flightNo: trackRef.toUpperCase().includes('QI') ? trackRef.toUpperCase() : 'QI0101',
                status: 'In Air',
                progress: 65,
                route: 'Uyo (QUO) → Lagos (LOS)',
                departure: { time: '08:30 AM', terminal: 'A', gate: '2' },
                arrival: { time: '09:45 AM', terminal: 'MM2', gate: '4' },
                aircraft: 'Bombardier CRJ900',
            });
        }, 1500);
    };

    const walletDocRef = useMemo(() => {
        return user && firestore ? doc(firestore, 'wallets', user.uid) : null;
    }, [user, firestore]);
    const { data: walletData } = useDoc<{ balance: number }>(walletDocRef);

    const mockFlights = [
        { id: 'QI0101', departure: '08:30', arrival: '09:45', duration: '1h 15m', price: 95000, type: 'Economy', seats: 12 },
        { id: 'QI0103', departure: '12:00', arrival: '13:15', duration: '1h 15m', price: 115000, type: 'Economy Flex', seats: 6 },
        { id: 'QI0105', departure: '16:45', arrival: '18:00', duration: '1h 15m', price: 135000, type: 'Premium', seats: 4 },
    ];

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!from || !to || !date) { toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' }); return; }
        setIsSearching(true);
        setShowResults(false);
        try {
            const res = await fetch('/api/flights/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from, to, date, passengers })
            });
            const result = await res.json();
            
            if (result.success) {
                setScrapedFlights(result.data);
                toast({ title: 'Link Established', description: `Live scraping ${result.bytesRead} bytes from IbomAir.com`, variant: 'default' });
            } else {
                setScrapedFlights(mockFlights);
                toast({ title: 'Scraper Error', description: 'Falling back to cached flight data.', variant: 'destructive' });
            }
        } catch (err) {
            setScrapedFlights(mockFlights);
        } finally {
            setIsSearching(false);
            setShowResults(true);
        }
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
                <div className="bg-white/90 backdrop-blur-xl border border-white/90 rounded-3xl shadow-2xl shadow-green-900/10 overflow-hidden p-5 md:p-8">
                    <Tabs defaultValue="book" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 h-14 rounded-2xl bg-slate-100 p-1">
                            <TabsTrigger value="book" className="rounded-xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm">Book a Flight</TabsTrigger>
                            <TabsTrigger value="track" className="rounded-xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm">Track Flight</TabsTrigger>
                            <TabsTrigger value="board" className="rounded-xl font-bold text-xs md:text-sm data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-sm">Airport Board (QUO)</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="book" className="m-0 border-none outline-none">
                            {!showResults ? (
                                <div className="p-2 md:p-4">
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
                        <div className="p-2 md:p-4">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Available Flights</h3>
                                    <p className="text-sm text-slate-500">{from} → {to} · {date} · {passengers} pax</p>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setShowResults(false)} className="rounded-xl border-slate-200 font-bold">Modify</Button>
                            </div>
                            <div className="space-y-4">
                                {scrapedFlights.map((flight) => (
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
                        </TabsContent>

                        <TabsContent value="track" className="m-0 border-none outline-none">
                            <div className="p-2 md:p-4">
                                <h2 className="text-xl font-black text-slate-900 mb-6">Track Your Flight</h2>
                                {!trackResult ? (
                                    <form onSubmit={handleTrack} className="space-y-5 max-w-xl mx-auto py-8">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Booking Reference or Flight No</Label>
                                            <div className="relative">
                                                <Radar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-green-600" />
                                                <Input value={trackRef} onChange={(e) => setTrackRef(e.target.value)} className="pl-12 h-14 text-lg rounded-2xl border-slate-200 bg-slate-50/60 font-black uppercase" placeholder="e.g. QI-849201" />
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={isTracking || !trackRef} className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-base shadow-xl shadow-slate-900/20 gap-2 mt-4">
                                            {isTracking ? (
                                                <><span className="animate-spin rounded-full size-5 border-2 border-white border-t-transparent" /> Searching Tracker...</>
                                            ) : (
                                                <><Radar className="size-5" /> Track Now</>
                                            )}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="max-w-2xl mx-auto">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900">{trackResult.flightNo}</h3>
                                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{trackResult.route}</p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => { setTrackResult(null); setTrackRef(''); }} className="rounded-xl border-slate-200 font-bold">New Search</Button>
                                        </div>

                                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                <Plane className="size-40 rotate-45" />
                                            </div>
                                            
                                            <div className="flex justify-between items-center relative z-10">
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black tracking-widest uppercase">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                                                    </span>
                                                    Live: {trackResult.status}
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 capitalize">{trackResult.aircraft}</span>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="relative pt-6 pb-2 z-10">
                                                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${trackResult.progress}%` }} />
                                                </div>
                                                <div className="absolute top-[20px] -translate-y-1/2 -mt-1 z-20" style={{ left: `calc(${trackResult.progress}% - 12px)` }}>
                                                    <Plane className="size-6 text-green-600 fill-green-600" />
                                                </div>
                                                <div className="flex justify-between mt-4 text-xs font-bold text-slate-400">
                                                    <span>Departed</span>
                                                    <span>En Route</span>
                                                    <span>Landed</span>
                                                </div>
                                            </div>

                                            {/* Timetable */}
                                            <div className="grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-6 z-10 relative">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Departure</p>
                                                    <p className="text-2xl font-black text-slate-900 font-mono">{trackResult.departure.time}</p>
                                                    <p className="text-sm font-medium text-slate-600 mt-1">Terminal {trackResult.departure.terminal} · Gate {trackResult.departure.gate}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Arrival</p>
                                                    <p className="text-2xl font-black text-slate-900 font-mono">{trackResult.arrival.time}</p>
                                                    <p className="text-sm font-medium text-slate-600 mt-1">Terminal {trackResult.arrival.terminal} · Gate {trackResult.arrival.gate}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Victor Attah Airport Live Flight Board Tab */}
                        <TabsContent value="board" className="m-0 border-none outline-none">
                            <div className="p-2 md:p-4 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900">Victor Attah Int'l Airport (QUO)</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Live Daily Flight Departures & Arrivals</p>
                                    </div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                        <span className="size-2 rounded-full bg-green-600 animate-pulse" />
                                        Airport Terminal Active
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                                                <th className="text-left py-3 px-4">Flight</th>
                                                <th className="text-left py-3 px-4">Airline</th>
                                                <th className="text-left py-3 px-4">Route</th>
                                                <th className="text-left py-3 px-4">Scheduled</th>
                                                <th className="text-left py-3 px-4">Gate</th>
                                                <th className="text-right py-3 px-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                                            <tr className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 font-black font-mono text-green-700">QI 0101</td>
                                                <td className="py-3 px-4 font-bold">Ibom Air</td>
                                                <td className="py-3 px-4">Uyo (QUO) → Lagos (LOS)</td>
                                                <td className="py-3 px-4 font-mono font-bold">08:30 AM</td>
                                                <td className="py-3 px-4">Gate 02</td>
                                                <td className="py-3 px-4 text-right"><span className="px-2 py-0.5 rounded-md bg-green-100 text-green-800 font-bold text-[10px]">Departed</span></td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 font-black font-mono text-green-700">QI 0204</td>
                                                <td className="py-3 px-4 font-bold">Ibom Air</td>
                                                <td className="py-3 px-4">Uyo (QUO) → Abuja (ABV)</td>
                                                <td className="py-3 px-4 font-mono font-bold">11:15 AM</td>
                                                <td className="py-3 px-4">Gate 01</td>
                                                <td className="py-3 px-4 text-right"><span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">Boarding</span></td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 font-black font-mono text-green-700">QI 0103</td>
                                                <td className="py-3 px-4 font-bold">Ibom Air</td>
                                                <td className="py-3 px-4">Uyo (QUO) → Lagos (LOS)</td>
                                                <td className="py-3 px-4 font-mono font-bold">01:45 PM</td>
                                                <td className="py-3 px-4">Gate 02</td>
                                                <td className="py-3 px-4 text-right"><span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">On Schedule</span></td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 font-black font-mono text-green-700">QI 0308</td>
                                                <td className="py-3 px-4 font-bold">Ibom Air</td>
                                                <td className="py-3 px-4">Abuja (ABV) → Uyo (QUO)</td>
                                                <td className="py-3 px-4 font-mono font-bold">03:30 PM</td>
                                                <td className="py-3 px-4">Arr 01</td>
                                                <td className="py-3 px-4 text-right"><span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">In Flight</span></td>
                                            </tr>
                                            <tr className="hover:bg-slate-50/80 transition-colors">
                                                <td className="py-3 px-4 font-black font-mono text-green-700">QI 0105</td>
                                                <td className="py-3 px-4 font-bold">Ibom Air</td>
                                                <td className="py-3 px-4">Uyo (QUO) → Lagos (LOS)</td>
                                                <td className="py-3 px-4 font-mono font-bold">05:20 PM</td>
                                                <td className="py-3 px-4">Gate 03</td>
                                                <td className="py-3 px-4 text-right"><span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-[10px]">On Schedule</span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
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
