'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Calendar, MapPin, ChevronRight, Clock, Ticket, Users, Star, PartyPopper,
  QrCode, Search, ScanLine, RefreshCw, CreditCard, Sparkles, Loader2,
  CheckCircle2, AlertTriangle, ShieldCheck, X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFirestore, useUser } from '@/firebase';
import {
  collection, query, orderBy, onSnapshot, doc, getDoc, setDoc,
  addDoc, updateDoc, where, serverTimestamp, writeBatch
} from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';

type Event = {
  id: string;
  title: string;
  description: string;
  date: any;
  location: string;
  price: number;
  category: string;
  imageId: string;
  capacity?: number;
  ticketsSold?: number;
};

type UserTicket = {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: any;
  eventLocation: string;
  price: number;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'valid' | 'used';
  createdAt: any;
  checkedInAt?: any;
};

const categoryBadges: Record<string, string> = {
  Cultural: 'bg-orange-500/10 text-orange-500 border-none',
  Technology: 'bg-blue-500/10 text-blue-500 border-none',
  Sports: 'bg-emerald-500/10 text-emerald-500 border-none',
  'Food & Art': 'bg-pink-500/10 text-pink-500 border-none',
  Government: 'bg-purple-500/10 text-purple-500 border-none',
};

export default function EventsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState<'discover' | 'tickets' | 'scanner'>('discover');
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Booking process
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // My tickets list
  const [myTickets, setMyTickets] = useState<UserTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [activeTicket, setActiveTicket] = useState<UserTicket | null>(null);

  // Scanner status
  const [scannerActive, setScannerActive] = useState(false);
  const [manualTicketId, setManualTicketId] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    ticket?: UserTicket;
  } | null>(null);
  const [isValidatingScan, setIsValidatingScan] = useState(false);

  // Load events
  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'events'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList: Event[] = [];
      snapshot.forEach((doc) => {
        eventList.push({ id: doc.id, ...doc.data() } as Event);
      });
      setEvents(eventList);
      setIsLoadingEvents(false);
    });
    return () => unsubscribe();
  }, [firestore]);

  // Load user tickets
  useEffect(() => {
    if (!firestore || !user) {
      setIsLoadingTickets(false);
      return;
    }
    const q = query(
      collection(firestore, 'tickets'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UserTicket[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as UserTicket);
      });
      setMyTickets(list);
      setIsLoadingTickets(false);
    });
    return () => unsubscribe();
  }, [firestore, user]);

  // Load wallet balance when booking
  useEffect(() => {
    if (!firestore || !user || !selectedEvent) return;
    const walletRef = doc(firestore, 'wallets', user.uid);
    const unsub = onSnapshot(walletRef, (snap) => {
      if (snap.exists()) {
        setWalletBalance(snap.data().balance || 0);
      } else {
        setWalletBalance(0);
      }
    });
    return () => unsub();
  }, [firestore, user, selectedEvent]);

  const formatDate = (date: any) => {
    if (!date) return 'TBD';
    if (date?.toDate) {
      return date.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
    }
    return new Date(date).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Seed demo events in Firestore
  const handleSeedDemoEvents = async () => {
    if (!firestore) return;
    setIsLoadingEvents(true);
    const demoEvents = [
      {
        title: 'Ibom Christmas Carols Festival',
        description: 'Join us for the record-breaking annual celebration of choral praise and worship, featuring international and local gospel ministers.',
        date: new Date('2026-12-20'),
        location: 'Uyo Township Stadium, AKS',
        price: 0,
        category: 'Cultural',
        imageId: 'event-carnival',
        capacity: 30000,
        ticketsSold: 12480,
      },
      {
        title: 'Akwa Ibom Tech Week 2026',
        description: 'The premier conference for developers, product builders, startup founders, and tech visionaries across the South-South region.',
        date: new Date('2026-10-12'),
        location: 'Ibom Icon Hotel & Golf Resort, Uyo',
        price: 2000,
        category: 'Technology',
        imageId: 'job-tech',
        capacity: 1500,
        ticketsSold: 450,
      },
      {
        title: "AKS Governor's Cup Finals",
        description: 'Watch the ultimate showdown of local football stars representing the 31 LGAs in this state-wide athletic competition.',
        date: new Date('2026-08-05'),
        location: 'Nest of Champions Stadium, Uyo',
        price: 500,
        category: 'Sports',
        imageId: 'tourism-carnival',
        capacity: 40000,
        ticketsSold: 18900,
      },
      {
        title: 'Ibom Food & Cultural Fair',
        description: 'Experience local culinary excellence with standard Ibibio, Annang, and Oron traditional dishes, arts exhibits, and folk dance.',
        date: new Date('2026-07-22'),
        location: 'Playground, Eket LGA',
        price: 1000,
        category: 'Food & Art',
        imageId: 'event-market',
        capacity: 5000,
        ticketsSold: 850,
      },
      {
        title: 'Citizen Townhall: Digital Governance',
        description: 'Engage directly with key cabinet members and policymakers on state administration, infrastructure updates, and civic integration plans.',
        date: new Date('2026-06-29'),
        location: 'State Secretariat Multi-purpose Hall, Uyo',
        price: 0,
        category: 'Government',
        imageId: 'forum-townhall',
        capacity: 1000,
        ticketsSold: 920,
      }
    ];

    try {
      const batch = writeBatch(firestore);
      demoEvents.forEach((ev) => {
        const ref = doc(collection(firestore, 'events'));
        batch.set(ref, ev);
      });
      await batch.commit();
      toast({ title: '🎉 Success!', description: 'Demo events successfully loaded into the database.' });
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Error Seeding Events', description: err.message });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Booking Handler
  const handleBookTicket = async () => {
    if (!firestore || !user || !selectedEvent) return;
    if (walletBalance === null) return;

    if (selectedEvent.price > walletBalance) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Funds',
        description: `Your Ibom X wallet balance (₦${walletBalance.toLocaleString()}) is insufficient to purchase this ticket (₦${selectedEvent.price.toLocaleString()}). Please fund your wallet.`,
      });
      return;
    }

    setIsBooking(true);
    const ticketId = `AKS-EVT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    try {
      const batch = writeBatch(firestore);

      // 1. Create Ticket Doc
      const ticketRef = doc(firestore, 'tickets', ticketId);
      batch.set(ticketRef, {
        id: ticketId,
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        eventDate: selectedEvent.date,
        eventLocation: selectedEvent.location,
        price: selectedEvent.price,
        userId: user.uid,
        userName: user.displayName || user.email || 'Anonymous Citizen',
        userEmail: user.email || '',
        status: 'valid',
        createdAt: serverTimestamp(),
      });

      // 2. Mutate Wallet & add transaction
      if (selectedEvent.price > 0) {
        const walletRef = doc(firestore, 'wallets', user.uid);
        batch.update(walletRef, {
          balance: walletBalance - selectedEvent.price,
        });

        const txRef = doc(collection(firestore, 'wallets', user.uid, 'transactions'));
        batch.set(txRef, {
          type: 'debit',
          amount: selectedEvent.price,
          description: `AKS Event Ticket: ${selectedEvent.title}`,
          timestamp: serverTimestamp(),
          reference: `TKT-${Date.now()}`,
        });
      }

      // 3. Update event metrics
      const eventRef = doc(firestore, 'events', selectedEvent.id);
      batch.update(eventRef, {
        ticketsSold: (selectedEvent.ticketsSold || 0) + 1,
      });

      await batch.commit();

      toast({
        title: '🎟️ Booking Successful!',
        description: `Ticket Reference: ${ticketId}. View it in the "My Tickets" tab.`,
      });
      setSelectedEvent(null);
      setActiveTab('tickets');
    } catch (err: any) {
      console.error('Ticket booking failed:', err);
      toast({ variant: 'destructive', title: 'Booking Failed', description: err.message });
    } finally {
      setIsBooking(false);
    }
  };

  // Ticket Validation Scanner Handler
  const handleValidateTicket = async (id: string) => {
    if (!firestore || !id.trim() || isValidatingScan) return;
    setIsValidatingScan(true);
    setScanResult(null);

    try {
      const ticketRef = doc(firestore, 'tickets', id.trim());
      const snap = await getDoc(ticketRef);

      if (!snap.exists()) {
        setScanResult({
          success: false,
          message: '❌ Invalid Ticket: Ticket reference does not exist in the state database.',
        });
        return;
      }

      const ticket = snap.data() as UserTicket;

      if (ticket.status === 'used') {
        setScanResult({
          success: false,
          message: `⚠️ Ticket Already Used: This ticket was scanned and checked in on ${formatDate(ticket.checkedInAt || Date.now())}.`,
          ticket,
        });
        return;
      }

      // Valid ticket, mark as used (check-in)
      await updateDoc(ticketRef, {
        status: 'used',
        checkedInAt: serverTimestamp(),
      });

      setScanResult({
        success: true,
        message: `✅ Access Approved: Welcome to ${ticket.eventTitle}! Ticket verified for ${ticket.userName}.`,
        ticket: { ...ticket, status: 'used', checkedInAt: new Date() },
      });
      toast({ title: '✅ Citizen Checked In', description: ticket.userName });
    } catch (err: any) {
      console.error(err);
      setScanResult({
        success: false,
        message: `❌ System Error: ${err.message}`,
      });
    } finally {
      setIsValidatingScan(false);
    }
  };

  const getImage = (event: Event) => {
    const placeholder = PlaceHolderImages.find((img) => img.id === event.imageId);
    return placeholder?.imageUrl || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-orange-50/25 relative overflow-hidden pb-24">
      {/* Background graphics */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-orange-200/20 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-green-200/15 blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 md:space-y-12">

        {/* Dynamic Premium Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-green-900 to-slate-950 text-white p-6 sm:p-8 md:p-10 shadow-xl border border-white/10">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }} />
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-full px-3 py-1 font-bold uppercase text-[10px] tracking-widest">
                <PartyPopper className="h-3.5 w-3.5 text-orange-400 inline mr-1" />
                State Event Portal
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">
                EVENTS & <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">TICKETING</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base font-medium max-w-xl">
                Get passes for state festivals, sports tournaments, training programs, and local town halls. Secure ticketing backed by the Ibom X Wallet.
              </p>
            </div>

            {/* Admin Seeder */}
            {events.length === 0 && !isLoadingEvents && (
              <Button
                onClick={handleSeedDemoEvents}
                className="bg-orange-500 hover:bg-orange-600 font-bold uppercase tracking-wider text-xs px-6 py-5 rounded-2xl shadow-lg shadow-orange-500/20 gap-2 flex items-center transition-all animate-pulse"
              >
                <Sparkles className="size-4 text-white" />
                Initialize State Events
              </Button>
            )}
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/70 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-sm">
            <TabsList className="bg-slate-100/60 p-1 rounded-xl w-full sm:w-auto">
              <TabsTrigger value="discover" className="rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider gap-2 px-5 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                <Ticket className="size-4" /> Discover Events
              </TabsTrigger>
              <TabsTrigger value="tickets" className="rounded-lg font-bold text-xs sm:text-sm uppercase tracking-wider gap-2 px-5 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <QrCode className="size-4" /> My Passes
                {myTickets.length > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {myTickets.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              onClick={() => {
                setActiveTab('scanner');
                setScanResult(null);
                setManualTicketId('');
              }}
              className={cn(
                "w-full sm:w-auto font-black uppercase text-xs tracking-wider rounded-xl gap-2 h-10 border border-slate-200",
                activeTab === 'scanner' ? 'bg-slate-900 text-white border-transparent' : 'text-slate-700 bg-white hover:bg-slate-50'
              )}
            >
              <ScanLine className="size-4" />
              Gatekeeper Scan
            </Button>
          </div>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            {isLoadingEvents ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/70 rounded-2xl overflow-hidden border border-white/40 shadow-sm p-4 space-y-4">
                    <Skeleton className="w-full h-44 rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-24 bg-white/40 border border-white/50 rounded-3xl backdrop-blur-md max-w-xl mx-auto p-8">
                <PartyPopper className="size-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-700 font-black text-xl mb-1">No Active State Events</p>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  Events list is currently empty. Tap below to populate the portal catalog with government-hosted gatherings.
                </p>
                <Button
                  onClick={handleSeedDemoEvents}
                  className="bg-green-600 hover:bg-green-700 font-bold uppercase tracking-wider text-xs px-6 rounded-xl"
                >
                  Load Demo Catalog
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="group bg-white/80 dark:bg-slate-900/60 backdrop-blur-md border border-white/85 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1.5 flex flex-col p-2"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl shadow-sm">
                      <Image
                        src={getImage(event)}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <Badge className={`${categoryBadges[event.category] || 'bg-slate-500/10 text-slate-500 border-none'} font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 backdrop-blur-md`}>
                          {event.category}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 text-white">
                        <span className="text-[10px] uppercase font-bold tracking-widest bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                          {formatDate(event.date)}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-black text-slate-900 dark:text-white text-lg leading-tight group-hover:text-green-600 transition-colors mb-1.5 line-clamp-1">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                          <MapPin className="size-3.5 text-orange-500 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium leading-relaxed line-clamp-2">
                          {event.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admission</p>
                          <p className="text-base font-black text-slate-950 dark:text-white mt-1">
                            {event.price === 0 ? (
                              <span className="text-emerald-600">FREE</span>
                            ) : (
                              `₦${event.price.toLocaleString()}`
                            )}
                          </p>
                        </div>

                        <Button
                          onClick={() => {
                            if (!user) {
                              toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to claim tickets.' });
                              return;
                            }
                            setSelectedEvent(event);
                          }}
                          className="h-10 rounded-xl bg-slate-950 hover:bg-green-600 text-white font-bold uppercase tracking-wider text-[10px] px-4 shadow-sm gap-2"
                        >
                          <Ticket className="size-3.5" />
                          Get Pass
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {isLoadingTickets ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl" />
                ))}
              </div>
            ) : myTickets.length === 0 ? (
              <div className="text-center py-20 bg-white/40 border border-white/50 rounded-3xl backdrop-blur-md max-w-xl mx-auto p-8">
                <QrCode className="size-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-700 font-black text-xl mb-1">No Active Passes Found</p>
                <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  You haven&apos;t booked passes to any upcoming state events yet. Discover events and get tickets.
                </p>
                <Button
                  onClick={() => setActiveTab('discover')}
                  className="bg-slate-900 hover:bg-slate-800 font-bold uppercase tracking-wider text-xs px-6 rounded-xl"
                >
                  Discover Events
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {myTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    onClick={() => setActiveTicket(ticket)}
                    className="group bg-white dark:bg-slate-900 border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex p-4 justify-between items-center relative gap-4"
                  >
                    {/* Visual left colored strip */}
                    <div className={cn(
                      "absolute top-0 left-0 w-2 h-full",
                      ticket.status === 'valid' ? 'bg-green-500' : 'bg-slate-400'
                    )} />

                    <div className="space-y-1.5 flex-1 min-w-0 pl-2">
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "border-none text-[8px] font-black uppercase tracking-widest px-2 py-0.5",
                          ticket.status === 'valid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        )}>
                          {ticket.status === 'valid' ? 'Active Pass' : 'Checked In'}
                        </Badge>
                        <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Ref: {ticket.id.slice(-6).toUpperCase()}</span>
                      </div>

                      <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight truncate">
                        {ticket.eventTitle}
                      </h3>

                      <div className="space-y-0.5 text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="size-3 text-slate-400" />
                          <span>{formatDate(ticket.eventDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="size-3 text-slate-400" />
                          <span className="truncate">{ticket.eventLocation}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center shrink-0 size-20 rounded-xl bg-slate-50 dark:bg-slate-800 p-2 shadow-inner border border-slate-100">
                      <QrCode className="size-10 text-slate-700 dark:text-slate-300" />
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Tap to View</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Gatekeeper Scanner Tab */}
          <TabsContent value="scanner" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="bg-white/80 backdrop-blur-md border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-orange-100">
                    <ScanLine className="size-4 animate-pulse" />
                    Gatekeeper Mode
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2">Gate Ticket Verification</h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">
                    Verify citizen tickets at the entrance. Use your mobile camera to scan the ticket QR code, or manually type the reference ID below.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Manual verification */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Manual Entry</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type ticket reference (e.g. AKS-EVT-...)"
                        value={manualTicketId}
                        onChange={(e) => setManualTicketId(e.target.value)}
                        className="h-11 rounded-xl font-mono text-xs uppercase"
                      />
                      <Button
                        onClick={() => handleValidateTicket(manualTicketId)}
                        disabled={isValidatingScan || !manualTicketId.trim()}
                        className="bg-slate-900 hover:bg-slate-800 font-bold uppercase tracking-wider text-xs px-6 rounded-xl shrink-0"
                      >
                        {isValidatingScan ? <Loader2 className="size-4 animate-spin" /> : 'Verify'}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setScannerActive(!scannerActive)}
                      className={cn(
                        "w-full h-12 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md gap-2",
                        scannerActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      {scannerActive ? 'Deactivate Camera' : 'Activate Camera Scanner'}
                    </Button>
                    {scanResult && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setScanResult(null);
                          setManualTicketId('');
                        }}
                        className="h-12 w-12 rounded-xl"
                      >
                        <RefreshCw className="size-4 text-slate-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Camera / Status panel */}
              <div className="bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl relative min-h-[300px] border border-white/10 flex flex-col items-center justify-center p-4">
                {scannerActive ? (
                  <div className="w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden border-2 border-green-500 relative bg-black">
                    <Scanner
                      onScan={(detectedCodes) => {
                        if (detectedCodes && detectedCodes.length > 0) {
                          const code = detectedCodes[0].rawValue;
                          if (code) {
                            setScannerActive(false);
                            handleValidateTicket(code);
                          }
                        }
                      }}
                      onError={(err) => {
                        console.error('Camera scanner error:', err);
                        toast({ variant: 'destructive', title: 'Scanner Error', description: 'Could not access device camera.' });
                        setScannerActive(false);
                      }}
                    />
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
                  </div>
                ) : scanResult ? (
                  <div className="w-full max-w-[400px] p-6 space-y-5 text-center">
                    <div className="size-16 rounded-full mx-auto flex items-center justify-center bg-white/10">
                      {scanResult.success ? (
                        <CheckCircle2 className="size-10 text-green-500" />
                      ) : (
                        <AlertTriangle className="size-10 text-orange-500" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className={cn(
                        "text-xl font-black tracking-tight",
                        scanResult.success ? 'text-green-400' : 'text-orange-400'
                      )}>
                        {scanResult.success ? 'Access Granted' : 'Access Denied'}
                      </h4>
                      <p className="text-sm text-slate-300 font-medium leading-relaxed">
                        {scanResult.message}
                      </p>
                    </div>

                    {scanResult.ticket && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left space-y-1.5 text-xs">
                        <div className="flex justify-between font-mono text-[10px] text-slate-400">
                          <span>REF: {scanResult.ticket.id.slice(-8).toUpperCase()}</span>
                          <span>{scanResult.ticket.status.toUpperCase()}</span>
                        </div>
                        <p className="font-black text-sm text-white leading-tight">{scanResult.ticket.eventTitle}</p>
                        <p className="text-slate-300 font-semibold">Attendee: {scanResult.ticket.userName}</p>
                        <p className="text-[10px] text-slate-400 font-medium">Checked in at: {formatDate(scanResult.ticket.checkedInAt || Date.now())}</p>
                      </div>
                    )}

                    <Button
                      onClick={() => {
                        setScanResult(null);
                        setScannerActive(true);
                      }}
                      className="bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-wider text-xs px-6 py-2 rounded-xl"
                    >
                      Scan Next
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-3 p-8">
                    <QrCode className="size-16 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-slate-400 font-bold text-sm">Scanner Inactive</p>
                    <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                      Tap the button on the left to initialize scanner. Make sure camera permission is granted.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Book Ticket Dialog Confirmation */}
      <Dialog open={!!selectedEvent} onOpenChange={(o) => { if (!o) setSelectedEvent(null); }}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          {selectedEvent && (
            <>
              {/* Event Cover Photo header */}
              <div className="relative aspect-video w-full">
                <Image
                  src={getImage(selectedEvent)}
                  alt={selectedEvent.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-4 right-4">
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="bg-black/50 text-white hover:bg-black/70 p-2 rounded-full transition-all backdrop-blur-md"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <Badge className={`${categoryBadges[selectedEvent.category] || 'bg-slate-500/10 text-slate-500 border-none'} font-bold uppercase text-[9px] tracking-widest px-2.5 py-1 mb-2`}>
                    {selectedEvent.category}
                  </Badge>
                  <DialogTitle className="text-white text-xl md:text-2xl font-black leading-tight tracking-tight">
                    {selectedEvent.title}
                  </DialogTitle>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 bg-white dark:bg-slate-900">
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                  {selectedEvent.description}
                </DialogDescription>

                <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4 text-green-600 shrink-0" />
                    <span>{formatDate(selectedEvent.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-orange-500 shrink-0" />
                    <span className="truncate">{selectedEvent.location}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admission Fee</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white mt-1">
                      {selectedEvent.price === 0 ? <span className="text-emerald-600">FREE</span> : `₦${selectedEvent.price.toLocaleString()}`}
                    </p>
                  </div>

                  {selectedEvent.price > 0 && walletBalance !== null && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Your Balance</p>
                      <p className={cn(
                        "text-xs font-black mt-1",
                        walletBalance >= selectedEvent.price ? 'text-emerald-600' : 'text-red-500'
                      )}>
                        ₦{walletBalance.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {selectedEvent.price > 0 && walletBalance !== null && walletBalance < selectedEvent.price && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3 text-xs">
                    <AlertTriangle className="size-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-red-800">Insufficient Wallet Balance</p>
                      <p className="text-red-700 mt-0.5">Please top up your Ibom X balance in your Wallet page before claiming tickets.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <DialogFooter className="p-6 pt-0 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-xl w-full sm:w-auto font-bold"
                >
                  Cancel
                </Button>

                {selectedEvent.price > 0 && walletBalance !== null && walletBalance < selectedEvent.price ? (
                  <Button
                    onClick={() => {
                      setSelectedEvent(null);
                      window.location.href = '/wallet';
                    }}
                    className="rounded-xl bg-orange-500 hover:bg-orange-600 font-bold uppercase tracking-wider text-xs px-6 w-full flex items-center justify-center gap-2 h-11"
                  >
                    <CreditCard className="size-4" /> Go to Wallet
                  </Button>
                ) : (
                  <Button
                    onClick={handleBookTicket}
                    disabled={isBooking}
                    className="rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold uppercase tracking-wider text-xs px-6 w-full flex items-center justify-center gap-2 h-11"
                  >
                    {isBooking ? (
                      <><Loader2 className="size-4 animate-spin" /> Booking...</>
                    ) : (
                      <>
                        <Ticket className="size-4" />
                        {selectedEvent.price === 0 ? 'Claim Free Pass' : `Buy Ticket — ₦${selectedEvent.price.toLocaleString()}`}
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Ticket Pass Viewer QR Dialog */}
      <Dialog open={!!activeTicket} onOpenChange={(o) => { if (!o) setActiveTicket(null); }}>
        <DialogContent className="sm:max-w-[420px] rounded-3xl p-0 overflow-hidden border-0 shadow-2xl">
          {activeTicket && (
            <div className="bg-slate-900 text-white p-6 relative flex flex-col items-center">
              <button
                onClick={() => setActiveTicket(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-full transition-all"
              >
                <X className="size-4" />
              </button>

              <div className="text-center space-y-1 mb-6">
                <p className="text-[9px] font-bold text-green-400 uppercase tracking-[0.3em]">Official Entry Pass</p>
                <h3 className="text-xl font-black leading-tight tracking-tight">{activeTicket.eventTitle}</h3>
              </div>

              {/* QR Code Container */}
              <div className="bg-white p-5 rounded-3xl shadow-inner flex flex-col items-center justify-center border border-white/20 mb-6">
                <QRCodeSVG
                  value={activeTicket.id}
                  size={200}
                  bgColor="#FFFFFF"
                  fgColor="#0f172a"
                  level="Q"
                  includeMargin
                />
                <span className="text-[10px] font-mono font-bold text-slate-500 mt-2 uppercase">{activeTicket.id}</span>
              </div>

              {/* Ticket Details with tear slip decoration */}
              <div className="w-full relative border-t-2 border-dashed border-white/20 pt-6 space-y-4">
                {/* Visual left/right punch holes */}
                <div className="absolute -top-3 -left-9 size-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100" />
                <div className="absolute -top-3 -right-9 size-6 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100" />

                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Attendee</p>
                    <p className="text-white mt-0.5 truncate">{activeTicket.userName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Pass Price</p>
                    <p className="text-white mt-0.5">
                      {activeTicket.price === 0 ? 'FREE' : `₦${activeTicket.price.toLocaleString()}`}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Date & Time</p>
                    <p className="text-white mt-0.5">{formatDate(activeTicket.eventDate)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Venue</p>
                    <p className="text-white mt-0.5 truncate">{activeTicket.eventLocation}</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                  <ShieldCheck className={cn(
                    "size-6 shrink-0",
                    activeTicket.status === 'valid' ? 'text-green-500' : 'text-slate-400'
                  )} />
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wider">
                      {activeTicket.status === 'valid' ? 'Valid Admission Pass' : 'Ticket Used / Checked In'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {activeTicket.status === 'valid'
                        ? 'Present this QR code at the event entrance to check in.'
                        : `Checked in on ${formatDate(activeTicket.checkedInAt || Date.now())}.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
