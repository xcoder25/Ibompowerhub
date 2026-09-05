'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useWeather, getWeatherDescription } from '@/hooks/use-weather';
import {
  Bell,
  Building2,
  HeartPulse,
  GraduationCap,
  Briefcase,
  ShoppingBag,
  Shield,
  Search,
  Bot,
  MessageSquare,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudFog,
  TrendingUp,
  Calendar,
  Clock,
  User,
  MapPin,
  Plane,
  ChevronRight,
  Zap,
  Award,
  Users,
  Sun,
  Droplets,
  Wind,
  Sparkles,
  LayoutDashboard,
  Map,
  AlertCircle,
  Store,
  ArrowRight,
  ShieldCheck,
  Home,
  ArrowUpRight,
  ArrowDownLeft,
  Wifi,
  RefreshCw,
  Brain,
  Vote,
  Waves,
  Landmark,
  Mic,
} from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/firebase';
import { FloodSensorWidget } from '@/components/floodsense/flood-sensor-widget';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, onSnapshot } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useDoc } from '@/firebase';

type KycData = {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  bvnVerified?: boolean;
  identityVerified?: boolean;
  addressVerified?: boolean;
  faceVerified?: boolean;
};

type Alert = {
  id: string;
  type: string;
  category: string;
  location: string;
  time: any;
  description: string;
  upvotes: number;
  commentsCount: number;
  userId: string;
  status: string;
  user: {
    name: string;
    avatarUrl: string;
  };
};

function getAlertIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'emergency':
      return <Bell className="size-4 text-red-500" />;
    case 'weather':
      return <Cloud className="size-4 text-sky-500" />;
    case 'health':
      return <HeartPulse className="size-4 text-emerald-500" />;
    case 'security':
      return <Shield className="size-4 text-amber-500" />;
    default:
      return <Bell className="size-4 text-slate-400" />;
  }
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const services = [
  { id: 'floodsense', title: 'FloodSense AKS', icon: Waves, href: '/floodsense', color: 'from-blue-600/20 to-blue-700/10', iconColor: 'text-blue-600', borderColor: 'border-blue-200/60' },
  { id: 'lgas', title: '31 LGAs Hub', icon: Landmark, href: '/lgas', color: 'from-emerald-600/20 to-emerald-700/10', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200/60' },
  { id: 'arise', title: 'ARISE Monitor', icon: Sparkles, href: '/arise', color: 'from-purple-600/20 to-purple-700/10', iconColor: 'text-purple-600', borderColor: 'border-purple-200/60' },
  { id: 'calendar', title: 'Market Calendar', icon: Store, href: '/market/calendar', color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-600', borderColor: 'border-amber-200/60' },
  { id: 'government', title: 'Government', icon: Building2, href: '/government', color: 'from-blue-600/20 to-blue-700/10', iconColor: 'text-blue-700', borderColor: 'border-blue-200/60' },
  { id: 'health', title: 'Healthcare', icon: HeartPulse, href: '/health', color: 'from-rose-500/20 to-rose-600/10', iconColor: 'text-rose-600', borderColor: 'border-rose-200/60' },
  { id: 'education', title: 'Schools & Education', icon: GraduationCap, href: '/education', color: 'from-orange-500/20 to-orange-600/10', iconColor: 'text-orange-600', borderColor: 'border-orange-200/60' },
  { id: 'power', title: 'Electricity & Power', icon: Zap, href: '/power', color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-600', borderColor: 'border-amber-200/60' },
  { id: 'flights', title: 'Ibom Air', icon: Plane, href: '/flights', color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200/60' },
  { id: 'voting', title: 'Civic Polls', icon: Vote, href: '/voting', color: 'from-purple-500/20 to-purple-600/10', iconColor: 'text-purple-600', borderColor: 'border-purple-200/60' },
  { id: 'property', title: 'Housing & Land', icon: Home, href: '/property', color: 'from-teal-500/20 to-teal-600/10', iconColor: 'text-teal-600', borderColor: 'border-teal-200/60' },
  { id: 'forums', title: 'Community Forum', icon: MessageSquare, href: '/forums', color: 'from-slate-500/20 to-slate-600/10', iconColor: 'text-slate-600', borderColor: 'border-slate-200/60' },
];

const stats = [
  { label: 'Power Grid Frequency', value: '49.8 Hz (Normal)', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-500/15', progress: 98 },
  { label: 'State Security Level', value: 'Peaceful & Secure', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-500/15', progress: 100 },
  { label: 'Citizen Satisfaction', value: '94%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-500/15', progress: 94 },
  { label: 'State Digital Hub', value: 'Online', icon: Brain, color: 'text-blue-600', bg: 'bg-blue-500/15', progress: 100 },
];

type LiveTransaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  status: string;
  timestamp: any;
  reference?: string;
};

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const { weather, loading: weatherLoading } = useWeather();
  const [heroSlide, setHeroSlide] = useState(0);

  // 🔴 REAL-TIME: Live transaction feed from Firestore
  const [liveTransactions, setLiveTransactions] = useState<LiveTransaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    if (!user || !firestore) return;
    setTxLoading(true);

    // Listen to the user's wallet sub-collection for real-time transactions
    const txRef = collection(firestore, 'wallets', user.uid, 'transactions');
    const txQuery = query(txRef, orderBy('timestamp', 'desc'), limit(8));
    const unsubTx = onSnapshot(txQuery, (snap) => {
      const txs: LiveTransaction[] = snap.docs.map(d => ({
        id: d.id,
        ...d.data() as Omit<LiveTransaction, 'id'>,
      }));
      setLiveTransactions(txs);
      setTxLoading(false);
    });

    return () => {
      unsubTx();
    };
  }, [user, firestore]);

  const heroSlides = [
    {
      badge: 'Akwa Ibom State',
      title: 'Your Digital Gateway to Akwa Ibom',
      description: 'Access government services, connect with local businesses, report issues, and stay informed — for a greater Akwa Ibom.',
      image: '/governor.png',
      imageAlt: 'His Excellency, the Executive Governor of Akwa Ibom State',
      imageFit: 'object-cover object-top',
    },
    {
      badge: 'Welcome',
      title: 'Welcome to Akwa Ibom State',
      description: 'Building a prosperous, inclusive, and sustainable future for all citizens of Akwa Ibom.',
      image: '/governor.png',
      imageAlt: 'His Excellency, the Executive Governor of Akwa Ibom State',
      imageFit: 'object-cover object-top',
    },
    {
      badge: 'Ibom Air',
      title: 'Fly Ibom Air — Pride of Akwa Ibom',
      description: 'Nigeria\'s first state-owned airline connecting you to domestic and international destinations with world-class service.',
      image: '/ibom_air.png',
      imageAlt: 'Ibom Air — Pride of Akwa Ibom State',
      imageFit: 'object-contain object-center',
    },
    {
      badge: 'Our Vision',
      title: 'A State of Innovation & Growth',
      description: 'Empowering communities through digital transformation, quality healthcare, education, and sustainable development.',
      image: '/ibom_air.png',
      imageAlt: 'Ibom Air — Connecting Akwa Ibom to the World',
      imageFit: 'object-contain object-center',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const alertsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'reports'), orderBy('time', 'desc'), limit(5))
        : null,
    [firestore]
  );
  const { data: alerts = [], error: alertsError } = useCollection<Alert>(alertsQuery);
  const alertsList = Array.isArray(alerts) ? alerts : [];

  const kycDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'kyc', user.uid) : null),
    [firestore, user]
  );
  const { data: kycData, isLoading: kycLoading } = useDoc<KycData>(kycDocRef);

  const effectiveKyc = {
    emailVerified: user?.emailVerified ?? false,
    phoneVerified: kycData?.phoneVerified ?? false,
    bvnVerified: kycData?.bvnVerified ?? false,
    identityVerified: kycData?.identityVerified ?? false,
    addressVerified: kycData?.addressVerified ?? false,
    faceVerified: kycData?.faceVerified ?? false,
  };

  const kycCompletedCount = Object.values(effectiveKyc).filter(Boolean).length;
  const isFullyVerified = kycCompletedCount === 6;
  const [showKycPrompt, setShowKycPrompt] = useState(false);

  useEffect(() => {
    // Show prompt if user is loaded, KYC data is loaded, and they aren't fully verified
    if (user && !kycLoading && !isFullyVerified) {
      const timer = setTimeout(() => setShowKycPrompt(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [user, kycLoading, isFullyVerified]);

  if (alertsError) console.error('Error loading alerts:', alertsError);

  if (!firestore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-green-600 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading Arise AKS...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.displayName?.split(' ')[0] || 'User';
  const greeting = getTimeGreeting();

  return (
    <div className="min-h-screen mesh-gradient bg-background text-foreground relative w-full max-w-full overflow-x-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-500/15 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-20 right-1/3 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <div className="relative flex-1 w-full max-w-full min-w-0 px-3.5 sm:px-6 md:px-8 py-3.5 sm:py-6 max-w-7xl mx-auto overflow-x-hidden">

        {/* Header: greeting + search + profile */}
        <header className="mb-4 sm:mb-8 md:mb-10 space-y-3 sm:space-y-4 w-full min-w-0">
          {/* Row 1: Greeting + Weather */}
          <div className="flex items-center justify-between gap-2 w-full min-w-0">
            <div className="min-w-0 flex-1">
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-0.5">{greeting}</p>
              <h1 className="font-headline text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {firstName}! <span className="text-gradient">👋</span>
              </h1>
              {!kycLoading && !isFullyVerified && (
                <Link href="/kyc" className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-[10px] sm:text-[11px] font-bold text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition-colors">
                  <ShieldCheck className="size-3 shrink-0" />
                  <span className="truncate">Complete KYC ({kycCompletedCount}/6)</span>
                </Link>
              )}
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1 hidden sm:block">Your gateway to Akwa Ibom State&apos;s digital services</p>
            </div>

            {/* Weather Widget — right-aligned on same line as name */}
            <div className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-xl glass-card border border-white/40 dark:border-white/10 bg-white/40 dark:bg-white/5 shadow-xs transition-all hover:bg-white/60 dark:hover:bg-white/10 shrink-0 max-w-[130px] sm:max-w-none min-w-0">
              {weatherLoading ? (
                <>
                  <div className="h-4 w-4 sm:h-6 sm:w-6 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="h-3 w-10 sm:w-16 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                    <div className="h-2 w-12 sm:w-24 rounded bg-slate-100 dark:bg-slate-800 animate-pulse hidden sm:block" />
                  </div>
                </>
              ) : weather ? (() => {
                const desc = getWeatherDescription(weather.weatherCode);
                const WeatherIcon = desc.icon === 'sun' ? Sun
                  : desc.icon === 'rain' ? CloudRain
                    : desc.icon === 'storm' ? CloudLightning
                      : desc.icon === 'fog' ? CloudFog
                        : Cloud;
                const iconColor = desc.icon === 'sun' ? 'text-amber-500'
                  : desc.icon === 'rain' ? 'text-blue-500'
                    : desc.icon === 'storm' ? 'text-purple-500'
                      : desc.icon === 'fog' ? 'text-slate-400'
                        : 'text-sky-500';
                return (
                  <>
                    <WeatherIcon className={`h-4 w-4 sm:h-6 sm:w-6 shrink-0 ${iconColor}`} />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">{weather.temperature}° {weather.city}</span>
                      <div className="flex gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        <span className="flex items-center gap-0.5 shrink-0"><Droplets className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-500 shrink-0" /> {weather.humidity}%</span>
                        <span className="hidden sm:flex items-center gap-0.5 shrink-0"><Wind className="h-3 w-3 text-slate-400 shrink-0" /> {weather.windSpeed} km/h</span>
                      </div>
                    </div>
                  </>
                );
              })() : (
                <>
                  <Cloud className="h-4 w-4 sm:h-6 sm:w-6 text-slate-400 shrink-0" />
                  <span className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 truncate">Weather N/A</span>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Search Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full min-w-0">
            <div className="flex-1 w-full min-w-0 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="search"
                placeholder="Search services, alerts, LGAs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-2.5 rounded-xl glass-card border border-white/40 dark:border-white/10 bg-white/70 dark:bg-white/5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            <Link href="/profile" className="hidden md:flex flex-shrink-0">
              <div className="p-2 sm:p-2.5 rounded-xl glass-card border border-white/50 dark:border-white/10 hover:border-white/80 glass-card-hover cursor-pointer items-center justify-center">
                <User className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </Link>
          </div>
        </header>



        {/* Hero Section with Governor & Scrolling Text */}
        <Card className="border-0 overflow-hidden mb-5 md:mb-8 shadow-xl rounded-2xl w-full min-w-0">
          <CardContent className="p-0 w-full min-w-0">
            <div
              className="relative text-white overflow-hidden w-full min-w-0"
              style={{
                background: 'linear-gradient(135deg, hsl(145, 63%, 18%) 0%, hsl(145, 55%, 25%) 50%, hsl(42, 45%, 40%) 100%)',
              }}
            >
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row w-full min-w-0">
                {/* Left: Scrolling Text Content */}
                <div className="flex-1 p-3.5 sm:p-6 md:p-10 flex flex-col justify-between min-w-0 w-full">
                  <div className="min-w-0 w-full">
                    {/* Animated text container */}
                    <div className="relative h-[110px] sm:h-[135px] md:h-[150px] overflow-hidden mb-3 sm:mb-6 w-full min-w-0">
                      {heroSlides.map((slide, idx) => (
                        <div
                          key={idx}
                          className="absolute inset-0 flex flex-col justify-center space-y-1 sm:space-y-3 transition-all duration-700 ease-in-out min-w-0 w-full"
                          style={{
                            opacity: heroSlide === idx ? 1 : 0,
                            transform: heroSlide === idx ? 'translateY(0)' : (heroSlide > idx ? 'translateY(-30px)' : 'translateY(30px)'),
                          }}
                        >
                          <Badge className="w-fit mb-0.5 bg-white/20 text-white border-white/30 text-[9px] sm:text-xs">
                            {slide.badge}
                          </Badge>
                          <h2 className="text-lg sm:text-2xl md:text-3xl font-extrabold leading-tight tracking-tight truncate w-full">
                            {slide.title}
                          </h2>
                          <p className="text-white/85 text-[11px] sm:text-sm md:text-base max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
                            {slide.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Slide indicators */}
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-6">
                      {heroSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setHeroSlide(idx)}
                          className={`h-1.5 rounded-full transition-all duration-500 ${heroSlide === idx ? 'w-5 sm:w-8 bg-white' : 'w-2.5 sm:w-4 bg-white/30 hover:bg-white/50'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    asChild
                    size="sm"
                    className="w-fit bg-white text-green-700 hover:bg-green-50 rounded-xl shadow-lg font-semibold text-xs sm:text-sm h-7 sm:h-10 px-3 sm:px-4"
                  >
                    <Link href="/services">
                      Explore Services <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>

                {/* Right: Slide Image (Responsive: compact preview on mobile, full side banner on desktop) */}
                <div className="hidden md:block flex-shrink-0 relative w-full md:w-72 lg:w-80">
                  <div className="h-36 sm:h-48 md:h-full md:min-h-[320px] relative overflow-hidden">
                    {heroSlides.map((slide, idx) => (
                      <img
                        key={idx}
                        src={slide.image}
                        alt={slide.imageAlt}
                        className={`absolute bottom-0 right-0 h-full w-full ${slide.imageFit} transition-opacity duration-700 ease-in-out`}
                        style={{ opacity: heroSlide === idx ? 1 : 0 }}
                      />
                    ))}
                    {/* Gradient blend into the card background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[hsl(145,55%,25%)] via-transparent to-transparent md:bg-gradient-to-r md:from-[hsl(145,55%,25%)] md:via-[hsl(145,55%,25%)]/30 md:to-transparent" />
                  </div>
                </div>
              </div>

              {/* Feature Quick Links Row */}
              <div className="relative z-10 px-2.5 sm:px-6 md:px-10 pb-3 sm:pb-6 w-full min-w-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 w-full min-w-0">
                  {[
                    { icon: Map, label: 'Live Map', desc: 'Real-time alerts across AKS', href: '/map' },
                    { icon: Store, label: 'Marketplace', desc: 'Shop from local sellers', href: '/market' },
                    { icon: AlertCircle, label: 'Report Issues', desc: 'Flooding, power, waste & more', href: '/report' },
                    { icon: Shield, label: 'Government', desc: 'Official AKS state services', href: '/government' },
                  ].map((feature, idx) => (
                    <Link key={feature.label} href={feature.href} className="group min-w-0 w-full">
                      <div
                        className="p-2 sm:p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer h-full flex flex-col justify-between min-w-0 w-full overflow-hidden"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div className="min-w-0 w-full">
                          <feature.icon className="h-4 sm:h-5 w-4 sm:w-5 mb-1 shrink-0" />
                          <p className="font-semibold text-xs sm:text-sm truncate w-full">{feature.label}</p>
                          <p className="text-[10px] sm:text-[11px] text-white/60 mt-0.5 hidden sm:block truncate">{feature.desc}</p>
                        </div>
                        <div className="mt-1 flex items-center text-[10px] sm:text-[11px] text-white/70 opacity-80 group-hover:opacity-100 transition-opacity">
                          <span>Open</span>
                          <ArrowRight className="ml-1 h-3 w-3 shrink-0" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts - wrapped in card */}
        {alertsList.length > 0 && (
          <Card className="glass-card border-0 mb-6 sm:mb-8 dark:bg-slate-900/60 dark:border dark:border-white/10 w-full min-w-0">
            <CardHeader className="border-b border-slate-200/60 dark:border-white/10 pb-3 sm:pb-4 px-4 sm:px-6 pt-4 sm:pt-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-200/50 dark:border-rose-500/30">
                  <Bell className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Active Alerts</CardTitle>
                <Badge className="ml-auto bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-0">{alertsList.length} new</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-3">
                {alertsList.slice(0, 3).map((alert) => (
                  <Card key={alert.id} className="glass-card glass-card-hover border-l-4 border-l-rose-400 dark:border-l-rose-500 border-0 dark:bg-slate-800/40">
                    <CardContent className="p-3.5 sm:p-4">
                      <div className="flex items-start justify-between gap-2.5 sm:gap-3">
                        <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                          <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-200/50 dark:border-rose-500/30 shrink-0">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate">{alert.type}</p>
                              <Badge variant="outline" className="text-[10px] sm:text-xs border-slate-200 dark:border-white/10">{alert.status}</Badge>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{alert.description}</p>
                            <div className="flex items-center gap-3 mt-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="h-3 w-3 shrink-0" />
                                <span className="truncate">{alert.location}</span>
                              </span>
                              <span className="flex items-center gap-1 shrink-0">
                                <Clock className="h-3 w-3" />
                                Recent
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:bg-indigo-500/10 shrink-0 text-xs h-8 px-2 sm:px-3">
                          View <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FloodSense AKS Real-Time Telemetry */}
        {/* Mobile: Ultra-compact live telemetry indicator badge leading to /floodsense */}
        <div className="md:hidden mb-5 w-full min-w-0">
          <Link href="/floodsense" className="block group w-full min-w-0">
            <div className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-950 border border-blue-500/25 shadow-md text-white hover:border-blue-400/40 transition-colors w-full min-w-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="size-8.5 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0 p-1.5">
                  <Waves className="size-4 animate-pulse" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white tracking-tight truncate">FloodSense AKS</p>
                    <span className="flex h-1.5 w-1.5 relative shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-500"></span>
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">6 Live IoT Nodes • Normal (Safe)</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-blue-400 shrink-0 pl-2">
                <span>View Radar</span>
                <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop: Full IoT telemetry widget */}
        <div className="hidden md:block mb-5 w-full min-w-0">
          <FloodSensorWidget />
        </div>

        {/* Dara AI Assistant — dialect-aware voice prompt, lives under FloodSense */}
        <Link href="/dara" className="block w-full mb-5 md:mb-8 group">
          <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-violet-600/10 via-indigo-600/5 to-transparent border border-violet-500/25 hover:border-violet-500/50 shadow-xs hover:shadow-sm transition-all w-full min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="size-11 rounded-xl overflow-hidden shrink-0 border border-violet-400/30 group-hover:scale-105 transition-transform shadow-xs">
                <img src="/dara.png" alt="Dara AI" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700 dark:text-violet-300 leading-none">Dara AI Assistant</p>
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mt-1 leading-tight">
                  Speak in <span className="text-violet-600 dark:text-violet-300">Ibibio</span>, Pidgin, or English
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block">Dialect-aware · Civic queries · Wallet voice commands</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden sm:flex size-9 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-300 items-center justify-center border border-violet-200/60 dark:border-violet-500/30 group-hover:scale-105 transition-transform">
                <Mic className="size-4" />
              </div>
              <ChevronRight className="size-4 text-violet-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        {/* Quick Access Services */}
        {/* Desktop: Full 12-tile spread */}
        <div className="hidden md:block mb-8 w-full min-w-0">
          <Card className="glass-card border-0 dark:bg-slate-900/60 dark:border dark:border-white/10">
            <CardHeader className="border-b border-slate-200/60 dark:border-white/10 pb-4">
              <CardTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-green-700 dark:text-emerald-400" />
                Quick Access Services
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {services.map((service) => (
                  <Link key={service.id} href={service.href}>
                    <Card className="glass-card glass-card-hover card-3d h-full overflow-hidden border-0 group cursor-pointer dark:bg-slate-800/40">
                      <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color} border ${service.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                          <service.icon className={`h-5 w-5 ${service.iconColor}`} />
                        </div>
                        <CardTitle className="font-headline text-xs font-semibold text-slate-900 dark:text-slate-100 truncate w-full">
                          {service.title}
                        </CardTitle>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile: Compact essential shortcuts header with 'All Services' link */}
        <div className="md:hidden mb-5 w-full min-w-0">
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5 text-green-700 dark:text-emerald-400" />
              Quick Shortcuts
            </h2>
            <Link href="/services" className="text-xs font-bold text-green-700 dark:text-emerald-400 hover:text-green-800 flex items-center gap-0.5">
              All Services ({services.length}) <ChevronRight className="size-3" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-2 w-full min-w-0">
            {services.slice(0, 4).map((service) => (
              <Link key={service.id} href={service.href} className="group min-w-0">
                <div className="p-2 sm:p-2.5 rounded-2xl glass-card border border-white/60 dark:border-white/10 bg-white/70 dark:bg-white/5 shadow-xs flex flex-col items-center gap-1.5 text-center group-active:scale-95 transition-transform min-w-0 overflow-hidden">
                  <div className={`p-2 rounded-xl bg-gradient-to-br ${service.color} border ${service.borderColor} shrink-0`}>
                    <service.icon className={`h-4 w-4 ${service.iconColor}`} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 truncate w-full">
                    {service.title.split(' ')[0]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 🔴 REAL-TIME Activity Feed */}
        <Card className="glass-card border-0 mb-6 md:mb-8 dark:bg-slate-900/60 dark:border dark:border-white/10 w-full min-w-0">
          <CardHeader className="border-b border-slate-200/60 dark:border-white/10 pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-green-700 dark:text-emerald-400" />
                Live Transactions
              </CardTitle>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Real-time</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 w-full min-w-0">
            {txLoading ? (
              <div className="p-4 flex items-center gap-3">
                <div className="size-9 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse shrink-0" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-2 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse shrink-0" />
              </div>
            ) : liveTransactions.length === 0 ? (
              <div className="text-center py-8 px-4">
                <div className="size-11 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-2">
                  <Wifi className="size-5 text-slate-400" />
                </div>
                <p className="font-semibold text-slate-600 dark:text-slate-300 text-xs sm:text-sm">No transactions yet</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Your live transaction activity will appear here</p>
              </div>
            ) : (
              <>
                {/* Mobile: Strictly only ONE recent transaction */}
                <div className="md:hidden divide-y divide-slate-200/60 dark:divide-white/10 w-full min-w-0">
                  {liveTransactions.slice(0, 1).map((tx) => {
                    const isCredit = tx.type === 'credit';
                    const isAirSend = tx.description?.toLowerCase().includes('airsend') || tx.reference?.includes('HIAI') || tx.reference?.includes('AIR');
                    return (
                      <div key={tx.id} className="p-3.5 px-4 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors w-full min-w-0">
                        <div className="flex items-center gap-3 w-full min-w-0">
                          <div className={`p-2 rounded-xl border shrink-0 ${
                            isAirSend
                              ? 'bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/30'
                              : isCredit
                                ? 'bg-emerald-500/15 border-emerald-200/50 dark:border-emerald-500/30'
                                : 'bg-rose-500/10 border-rose-200/50 dark:border-rose-500/30'
                          }`}>
                            {isAirSend
                              ? <Brain className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                              : isCredit
                                ? <ArrowDownLeft className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                : <ArrowUpRight className="h-4 w-4 text-rose-500 dark:text-rose-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">{tx.description || (isCredit ? 'Credit' : 'Debit')}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isAirSend && (
                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200/50 dark:border-indigo-500/30 px-1 py-0.2 rounded-full">HiAI AirSend</span>
                              )}
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{tx.status}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-bold text-xs sm:text-sm ${
                              isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                            }`}>{isCredit ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : 'Recent'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop: Up to 5 transactions */}
                <div className="hidden md:block divide-y divide-slate-200/60 dark:divide-white/10">
                  {liveTransactions.slice(0, 5).map((tx) => {
                    const isCredit = tx.type === 'credit';
                    const isAirSend = tx.description?.toLowerCase().includes('airsend') || tx.reference?.includes('HIAI') || tx.reference?.includes('AIR');
                    return (
                      <div key={tx.id} className="p-4 px-6 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-xl border shrink-0 ${
                            isAirSend
                              ? 'bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/30'
                              : isCredit
                                ? 'bg-emerald-500/15 border-emerald-200/50 dark:border-emerald-500/30'
                                : 'bg-rose-500/10 border-rose-200/50 dark:border-rose-500/30'
                          }`}>
                            {isAirSend
                              ? <Brain className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                              : isCredit
                                ? <ArrowDownLeft className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                : <ArrowUpRight className="h-5 w-5 text-rose-500 dark:text-rose-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{tx.description || (isCredit ? 'Credit' : 'Debit')}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isAirSend && (
                                <span className="text-[8px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/20 border border-indigo-200/50 dark:border-indigo-500/30 px-1.5 py-0.5 rounded-full">HiAI AirSend</span>
                              )}
                              <p className="text-xs text-slate-500 dark:text-slate-400">{tx.status}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`font-bold text-sm ${
                              isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'
                            }`}>{isCredit ? '+' : '-'}₦{Number(tx.amount).toLocaleString()}</p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                              {tx.timestamp?.toDate ? tx.timestamp.toDate().toLocaleDateString('en-NG', { month: 'short', day: 'numeric' }) : 'Recent'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer link to view full history */}
                <div className="p-2.5 sm:p-3 bg-slate-50/60 dark:bg-white/5 border-t border-slate-200/60 dark:border-white/10 text-center">
                  <Link href="/transactions" className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-green-700 dark:text-emerald-400 hover:text-green-800 transition-colors w-full py-1">
                    <span>View Full Transaction History</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Status Matrix ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 md:mb-8 w-full min-w-0">
           {/* Resident State Briefing */}
           <Card className="bg-indigo-950 border-none rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl relative group h-full w-full min-w-0">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
              <div className="p-4 sm:p-7 md:p-8 relative z-10 space-y-4 sm:space-y-6 flex flex-col h-full min-w-0 w-full">
                 <div className="flex items-center justify-between">
                    <div className="size-11 sm:size-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform shrink-0">
                       <Brain className="size-5 sm:size-7 text-blue-400" />
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none font-black uppercase text-[9px] tracking-widest px-2.5 sm:px-3 py-0.5 sm:py-1">Services Online</Badge>
                 </div>
                 <div className="space-y-2 sm:space-y-4 min-w-0">
                    <h3 className="text-white font-bold text-base sm:text-xl tracking-tight leading-snug">"Emedi! Welcome to your daily Akwa Ibom update."</h3>
                    <p className="text-white/70 text-xs sm:text-sm font-medium leading-relaxed">
                       State power supply is steady, markets are open, and road transit across Uyo, Eket, and Ikot Ekpene is moving smoothly.
                    </p>
                 </div>
                 <div className="mt-auto pt-3 sm:pt-6 border-t border-white/10 flex items-center justify-between">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">Daily Resident Summary</p>
                     <Button variant="ghost" size="sm" className="h-7 sm:h-8 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-white/10 shrink-0">Explore More</Button>
                 </div>
              </div>
              <div className="absolute top-[-20%] right-[-10%] size-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
           </Card>

           {/* Secure Access Snapshot */}
           <Card className="bg-white dark:bg-slate-900 border-none shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden p-0 relative h-full w-full min-w-0">
              <div className="p-4 sm:p-7 md:p-8 space-y-4 sm:space-y-6 bg-slate-50/50 dark:bg-slate-950/50 h-full flex flex-col justify-between min-w-0 w-full">
                 <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                       <ShieldCheck className="size-4 sm:size-5 text-indigo-500 shrink-0" />
                       <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter text-base sm:text-xl truncate">SECURE ACCESS</h4>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                       <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-2.5 sm:gap-3">
                             <div className="size-7 sm:size-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Shield className="size-3.5 sm:size-4" /></div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID Sync</p>
                          </div>
                          <p className="font-black text-xs text-indigo-500 uppercase tracking-widest">Pre-Verified</p>
                       </div>
                    </div>
                 </div>
                 <div className="mt-auto pt-3 sm:pt-6">
                    <Link href="/access" className="block w-full">
                       <Button className="w-full h-10 sm:h-12 rounded-xl bg-slate-950 text-white hover:bg-indigo-600 transition-all font-black uppercase text-[10px] tracking-[0.15em] sm:tracking-[0.2em] shadow-xl shadow-indigo-500/20 truncate">Initialize Gate Sync</Button>
                    </Link>
                 </div>
              </div>
           </Card>
        </div>

      </div>

      {/* KYC Completion Reminder Popout */}
      <Dialog open={showKycPrompt} onOpenChange={setShowKycPrompt}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-green-700 to-emerald-900 p-8 text-center text-white relative">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Shield className="size-32" />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm border border-white/30 mb-2">
                <ShieldCheck className="size-8 text-white" />
              </div>
              <DialogTitle className="text-white text-2xl font-bold">Complete Your KYC</DialogTitle>
              <DialogDescription className="text-white/80 text-sm leading-relaxed">
                Unlock your permanent wallet account, higher transaction limits, and premium government services by completing your identity verification.
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 bg-white space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>Verification Progress</span>
                <span>{kycCompletedCount}/6 Steps</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(kycCompletedCount / 6) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Email', done: effectiveKyc.emailVerified },
                { name: 'Phone', done: effectiveKyc.phoneVerified },
                { name: 'BVN', done: effectiveKyc.bvnVerified },
                { name: 'Identity', done: effectiveKyc.identityVerified },
                { name: 'Address', done: effectiveKyc.addressVerified },
                { name: 'Face', done: effectiveKyc.faceVerified },
              ].map((step) => (
                <div key={step.name} className="flex items-center gap-2 text-sm text-slate-600">
                  <div className={`size-4 rounded-full flex items-center justify-center ${step.done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-300'}`}>
                    {step.done ? <Award className="size-2.5" /> : <div className="size-1.5 rounded-full bg-current" />}
                  </div>
                  <span className={step.done ? 'font-medium text-slate-900' : ''}>{step.name}</span>
                </div>
              ))}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-11 border-slate-200"
                onClick={() => setShowKycPrompt(false)}
              >
                Later
              </Button>
              <Button
                className="flex-1 rounded-xl h-11 bg-green-700 hover:bg-green-800 shadow-lg shadow-green-900/20"
                asChild
              >
                <Link href="/kyc">Complete Now</Link>
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
