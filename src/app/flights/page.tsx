'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plane, Calendar as CalendarIcon, Users, MapPin, ArrowRight, ArrowLeftRight, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';
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

    const [selectedFlight, setSelectedFlight] = useState<{ id: string, time: string, price: number } | null>(null);
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    // Fetch wallet for payment
    const walletDocRef = user && firestore ? doc(firestore, 'wallets', user.uid) : null;
    const { data: walletData } = useDoc<{ balance: number }>(walletDocRef);

    const mockFlights = [
        { id: 'QI0101', departure: '08:30', arrival: '09:45', duration: '1h 15m', price: 95000, type: 'Economy' },
        { id: 'QI0103', departure: '12:00', arrival: '13:15', duration: '1h 15m', price: 115000, type: 'Economy Flex' },
        { id: 'QI0105', departure: '16:45', arrival: '18:00', duration: '1h 15m', price: 130000, type: 'Premium' },
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!from || !to || !date) {
            toast({ title: 'Error', description: 'Please fill all fields', variant: 'destructive' });
            return;
        }
        setIsSearching(true);
        setTimeout(() => {
            setIsSearching(false);
            setShowResults(true);
        }, 1500);
    };

    const handleBook = (flight: any) => {
        setSelectedFlight({ id: flight.id, time: `${flight.departure} - ${flight.arrival}`, price: flight.price * passengers });
        setShowPayment(true);
    };

    const handlePayment = async () => {
        if (!user || !firestore || !walletDocRef || !selectedFlight) return;

        if (!walletData || walletData.balance < selectedFlight.price) {
            toast({
                title: 'Insufficient Funds',
                description: `Your wallet balance is ₦${walletData?.balance?.toLocaleString() || 0}. Please top up to complete this booking.`,
                variant: 'destructive',
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Deduct from wallet
            const newBalance = walletData.balance - selectedFlight.price;
            await updateDoc(walletDocRef, { balance: newBalance });

            // Record transaction
            await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
                type: 'debit',
                amount: selectedFlight.price,
                description: `Ibom Air Booking: ${from} to ${to} (${selectedFlight.id})`,
                timestamp: serverTimestamp(),
                reference: `FLIGHT-${Date.now()}`,
                status: 'success'
            });

            setBookingSuccess(true);
        } catch (error) {
            console.error('Payment error', error);
            toast({ title: 'Booking Failed', description: 'Could not process payment.', variant: 'destructive' });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Premium Hero */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-900" />
                <img src="/ibom_air.png" alt="Ibom Air" className="absolute right-0 bottom-0 h-[120%] object-contain opacity-20 transform translate-x-10 translate-y-10 mix-blend-screen" />
                <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 max-w-5xl mx-auto z-10">
                    <Badge className="w-fit mb-3 bg-white/20 text-white border-white/30 backdrop-blur-md">Official Partner</Badge>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Fly Ibom Air</h1>
                    <p className="text-blue-100 mt-2 max-w-xl md:text-lg opacity-90">Experience world-class service with Nigeria&apos;s pride. Book your flights directly from your PowerHub wallet.</p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
                <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden bg-white/90 backdrop-blur-xl">
                    <CardContent className="p-1">
                        {!showResults ? (
                            <div className="p-5 md:p-8">
                                <form onSubmit={handleSearch} className="space-y-6">
                                    <div className="flex flex-col md:flex-row gap-4 relative">
                                        <div className="flex-1 space-y-2 relative">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">From</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                <Input
                                                    value={from}
                                                    onChange={(e) => setFrom(e.target.value)}
                                                    className="pl-12 h-14 bg-slate-100/50 border-slate-200 rounded-2xl text-lg font-medium"
                                                    placeholder="Departure City"
                                                />
                                            </div>
                                        </div>

                                        <div className="hidden md:flex flex-shrink-0 items-center justify-center pt-6 z-10">
                                            <div className="bg-white rounded-full p-2 shadow-sm border border-slate-100">
                                                <ArrowLeftRight className="h-5 w-5 text-indigo-500" />
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-2 relative">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">To</Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                <Input
                                                    value={to}
                                                    onChange={(e) => setTo(e.target.value)}
                                                    className="pl-12 h-14 bg-slate-100/50 border-slate-200 rounded-2xl text-lg font-medium"
                                                    placeholder="Destination City"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Departure Date</Label>
                                            <div className="relative">
                                                <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                <Input
                                                    type="date"
                                                    value={date}
                                                    onChange={(e) => setDate(e.target.value)}
                                                    className="pl-12 h-14 bg-slate-100/50 border-slate-200 rounded-2xl font-medium"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Passengers</Label>
                                            <div className="relative">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                                <select
                                                    className="w-full pl-12 h-14 bg-slate-100/50 border-slate-200 rounded-2xl font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                                    value={passengers}
                                                    onChange={(e) => setPassengers(parseInt(e.target.value))}
                                                >
                                                    <option value={1}>1 Passenger</option>
                                                    <option value={2}>2 Passengers</option>
                                                    <option value={3}>3 Passengers</option>
                                                    <option value={4}>4 Passengers</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-lg shadow-xl shadow-indigo-500/20"
                                        disabled={isSearching}
                                    >
                                        {isSearching ? 'Searching Flights...' : 'Search Flights'}
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="p-5 md:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold">Select Departure Flight</h3>
                                        <p className="text-sm text-slate-500">{from} to {to} &bull; {date}</p>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => setShowResults(false)} className="rounded-xl">Modify</Button>
                                </div>

                                <div className="space-y-4">
                                    {mockFlights.map((flight) => (
                                        <div key={flight.id} className="border border-slate-100 rounded-2xl p-4 md:p-6 bg-white hover:border-indigo-200 hover:shadow-md transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="flex-1 flex items-center justify-between md:justify-start md:gap-8">
                                                <div>
                                                    <p className="text-2xl font-bold font-mono">{flight.departure}</p>
                                                    <p className="text-xs text-slate-500">{from.split(' ')[0]}</p>
                                                </div>

                                                <div className="flex flex-col items-center px-4">
                                                    <p className="text-[10px] text-slate-400 font-bold mb-1">{flight.duration}</p>
                                                    <div className="relative w-24 md:w-32 h-[1px] bg-slate-200 flex items-center justify-center">
                                                        <Plane className="h-4 w-4 text-indigo-400" />
                                                    </div>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">Direct</p>
                                                </div>

                                                <div>
                                                    <p className="text-2xl font-bold font-mono">{flight.arrival}</p>
                                                    <p className="text-xs text-slate-500 text-right md:text-left">{to.split(' ')[0]}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 border-slate-100 pt-4 md:pt-0">
                                                <div className="text-left md:text-right">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">{flight.type}</p>
                                                    <p className="text-xl font-bold text-indigo-600">₦{flight.price.toLocaleString()}</p>
                                                </div>
                                                <Button className="rounded-xl bg-indigo-50 md:bg-indigo-600 text-indigo-600 md:text-white hover:bg-indigo-100 md:hover:bg-indigo-700" onClick={() => handleBook(flight)}>
                                                    Select
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Payment Dialog */}
            <Dialog open={showPayment} onOpenChange={setShowPayment}>
                <DialogContent className="sm:max-w-md rounded-3xl">
                    {bookingSuccess ? (
                        <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <DialogTitle className="text-2xl font-bold">Booking Confirmed!</DialogTitle>
                            <DialogDescription className="text-base max-w-sm">
                                Your flight from {from} to {to} has been successfully booked. Your e-ticket has been sent to your email.
                            </DialogDescription>
                            <div className="bg-slate-50 w-full p-4 rounded-2xl mt-4 border border-slate-100">
                                <p className="text-xs text-slate-500 font-bold uppercase mb-1">Booking Reference</p>
                                <p className="text-2xl font-mono font-bold tracking-widest text-indigo-600">QI-{Math.floor(Math.random() * 900000) + 100000}</p>
                            </div>
                            <Button onClick={() => { setShowPayment(false); setShowResults(false); setBookingSuccess(false); }} className="w-full mt-4 rounded-xl h-12">Done</Button>
                        </div>
                    ) : (
                        <>
                            <DialogHeader>
                                <DialogTitle>Complete Booking</DialogTitle>
                                <DialogDescription>Review your details and pay with your wallet.</DialogDescription>
                            </DialogHeader>

                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50 my-2 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Route</span>
                                    <span className="font-bold">{from} &rarr; {to}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Time</span>
                                    <span className="font-bold">{selectedFlight?.time}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Passengers</span>
                                    <span className="font-bold">{passengers}x</span>
                                </div>
                                <div className="pt-3 border-t border-indigo-100 flex justify-between items-center">
                                    <span className="text-slate-700 font-bold">Total Amount</span>
                                    <span className="text-xl font-bold text-indigo-600">₦{selectedFlight?.price.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-full">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-700">Wallet Balance</p>
                                        <p className="text-xs text-slate-500">Available: ₦{walletData?.balance?.toLocaleString() || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="mt-4">
                                <Button variant="outline" className="rounded-xl w-full" onClick={() => setShowPayment(false)} disabled={isProcessing}>Cancel</Button>
                                <Button className="rounded-xl w-full bg-indigo-600 hover:bg-indigo-700" onClick={handlePayment} disabled={isProcessing}>
                                    {isProcessing ? 'Processing...' : `Pay ₦${selectedFlight?.price.toLocaleString()}`}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
