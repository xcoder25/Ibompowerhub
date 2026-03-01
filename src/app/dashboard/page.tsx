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
} from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/firebase';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
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
  { id: 'government', title: 'Government', icon: Building2, href: '/government', color: 'from-green-500/20 to-green-600/10', iconColor: 'text-green-700', borderColor: 'border-green-200/60' },
  { id: 'health', title: 'Health', icon: HeartPulse, href: '/health', color: 'from-rose-500/20 to-rose-600/10', iconColor: 'text-rose-600', borderColor: 'border-rose-200/60' },
  { id: 'education', title: 'Education', icon: GraduationCap, href: '/education', color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200/60' },
  { id: 'flights', title: 'Flights', icon: Plane, href: '/flights', color: 'from-indigo-500/20 to-indigo-600/10', iconColor: 'text-indigo-600', borderColor: 'border-indigo-200/60' },
  { id: 'market', title: 'Market', icon: ShoppingBag, href: '/market', color: 'from-teal-500/20 to-teal-600/10', iconColor: 'text-teal-600', borderColor: 'border-teal-200/60' },
  { id: 'safety', title: 'Safety', icon: Shield, href: '/safety', color: 'from-slate-500/20 to-slate-600/10', iconColor: 'text-slate-600', borderColor: 'border-slate-200/60' },
];

const stats = [
  { label: 'Active Services', value: 12, icon: Zap, color: 'text-green-700', bg: 'bg-green-500/15', progress: 80 },
  { label: 'Notifications', value: 5, icon: Bell, color: 'text-amber-600', bg: 'bg-amber-500/15', progress: 25 },
  { label: 'Completed Tasks', value: 28, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-500/15', progress: 70 },
  { label: 'Community Score', value: '92%', icon: TrendingUp, color: 'text-teal-600', bg: 'bg-teal-500/15', progress: 92 },
];

const activities = [
  { title: 'Business License Renewed', timestamp: '2 hours ago', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
  { title: 'Health Certificate Submitted', timestamp: '5 hours ago', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-500/15' },
  { title: 'Community Task Completed', timestamp: '1 day ago', icon: Users, color: 'text-green-700', bg: 'bg-green-500/15' },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');
  const { weather, loading: weatherLoading } = useWeather();
  const [heroSlide, setHeroSlide] = useState(0);

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
    <div className="min-h-screen mesh-gradient bg-slate-50/80 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-green-300/25 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-emerald-300/20 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-20 right-1/3 w-48 h-48 rounded-full bg-amber-300/20 blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <div className="relative flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">

        {/* Header: greeting + search + profile */}
        <header className="mb-8 md:mb-10 space-y-4">
          {/* Row 1: Greeting + Weather */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-0.5">{greeting}</p>
              <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                {firstName}! <span className="text-gradient">👋</span>
              </h1>
              {!kycLoading && !isFullyVerified && (
                <Link href="/kyc" className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-[11px] font-bold text-amber-700 hover:bg-amber-100 transition-colors">
                  <ShieldCheck className="size-3" />
                  Complete KYC ({kycCompletedCount}/6)
                </Link>
              )}
              <p className="text-slate-500 text-sm mt-1 hidden sm:block">Your gateway to Akwa Ibom State&apos;s digital services</p>
            </div>

            {/* Weather Widget — right-aligned on same line as name */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card border border-white/50 bg-white/40 shadow-sm transition-all hover:bg-white/60 flex-shrink-0">
              {weatherLoading ? (
                <>
                  <div className="h-6 w-6 rounded-full bg-slate-200 animate-pulse" />
                  <div className="flex flex-col gap-1">
                    <div className="h-4 w-16 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
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
                    <WeatherIcon className={`h-6 w-6 ${iconColor}`} />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900 leading-tight">{weather.temperature}° {weather.city}</span>
                      <div className="flex gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                        <span className="flex items-center gap-0.5"><Droplets className="h-3 w-3 text-blue-500" /> {weather.humidity}%</span>
                        <span className="flex items-center gap-0.5"><Wind className="h-3 w-3 text-slate-400" /> {weather.windSpeed} km/h</span>
                      </div>
                    </div>
                  </>
                );
              })() : (
                <>
                  <Cloud className="h-6 w-6 text-slate-400" />
                  <span className="text-sm text-slate-500">Weather unavailable</span>
                </>
              )}
            </div>
          </div>

          {/* Row 2: Search + Profile */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-green-600 transition-colors" />
              <input
                type="search"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-card border border-white/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all"
              />
            </div>
            <Link href="/profile" className="flex-shrink-0">
              <div className="p-2.5 rounded-xl glass-card border border-white/50 hover:border-white/80 glass-card-hover cursor-pointer flex items-center justify-center">
                <User className="h-5 w-5 text-green-700" />
              </div>
            </Link>
          </div>
        </header>

        {/* Hero Section with Governor & Scrolling Text */}
        <Card className="border-0 overflow-hidden mb-8 shadow-xl rounded-2xl">
          <CardContent className="p-0">
            <div
              className="relative text-white overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(145, 63%, 18%) 0%, hsl(145, 55%, 25%) 50%, hsl(42, 45%, 40%) 100%)',
              }}
            >
              {/* Subtle overlay */}
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

              <div className="relative z-10 flex flex-col md:flex-row">
                {/* Left: Scrolling Text Content */}
                <div className="flex-1 p-6 md:p-10 flex flex-col justify-between">
                  <div>
                    {/* Animated text container */}
                    <div className="relative h-[140px] md:h-[160px] overflow-hidden mb-6">
                      {heroSlides.map((slide, idx) => (
                        <div
                          key={idx}
                          className="absolute inset-0 flex flex-col justify-center space-y-3 transition-all duration-700 ease-in-out"
                          style={{
                            opacity: heroSlide === idx ? 1 : 0,
                            transform: heroSlide === idx ? 'translateY(0)' : (heroSlide > idx ? 'translateY(-30px)' : 'translateY(30px)'),
                          }}
                        >
                          <Badge className="w-fit mb-1 bg-white/20 text-white border-white/30 text-xs">
                            {slide.badge}
                          </Badge>
                          <h2 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
                            {slide.title}
                          </h2>
                          <p className="text-white/85 text-sm md:text-base max-w-lg leading-relaxed">
                            {slide.description}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Slide indicators */}
                    <div className="flex items-center gap-2 mb-6">
                      {heroSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setHeroSlide(idx)}
                          className={`h-1.5 rounded-full transition-all duration-500 ${heroSlide === idx ? 'w-8 bg-white' : 'w-4 bg-white/30 hover:bg-white/50'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    asChild
                    size="lg"
                    className="w-fit bg-white text-green-700 hover:bg-green-50 rounded-xl shadow-lg font-semibold"
                  >
                    <Link href="/services">
                      Explore Services <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                {/* Right: Slide Image (transitions with text) */}
                <div className="flex-shrink-0 relative w-full md:w-72 lg:w-80">
                  <div className="h-48 md:h-full md:min-h-[320px] relative overflow-hidden">
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
              <div className="relative z-10 px-6 md:px-10 pb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: Map, label: 'Live Map', desc: 'Real-time alerts across AKS', href: '/map' },
                    { icon: Store, label: 'Marketplace', desc: 'Shop from local sellers', href: '/market' },
                    { icon: AlertCircle, label: 'Report Issues', desc: 'Flooding, power, waste & more', href: '/report' },
                    { icon: Shield, label: 'Government', desc: 'Official AKS state services', href: '/government' },
                  ].map((feature, idx) => (
                    <Link key={feature.label} href={feature.href} className="group">
                      <div
                        className="p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all cursor-pointer h-full flex flex-col justify-between"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div>
                          <feature.icon className="h-5 w-5 mb-1.5" />
                          <p className="font-semibold text-sm">{feature.label}</p>
                          <p className="text-xs text-white/60 mt-0.5 hidden sm:block">{feature.desc}</p>
                        </div>
                        <div className="mt-2 flex items-center text-[11px] text-white/70 opacity-80 group-hover:opacity-100 transition-opacity">
                          <span>Open</span>
                          <ArrowRight className="ml-1 h-3 w-3" />
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
          <Card className="glass-card border-0 mb-8">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-200/50">
                  <Bell className="h-4 w-4 text-rose-600" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">Active Alerts</CardTitle>
                <Badge className="ml-auto bg-rose-100 text-rose-800 border-0">{alertsList.length} new</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {alertsList.slice(0, 3).map((alert) => (
                  <Card key={alert.id} className="glass-card glass-card-hover border-l-4 border-l-rose-400 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-200/50 flex-shrink-0">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 text-sm">{alert.type}</p>
                              <Badge variant="outline" className="text-xs border-slate-200">{alert.status}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Recent
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10">
                          View <ChevronRight className="h-4 w-4 ml-0.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Access Services - 3D glass tiles - wrapped in card */}
        <Card className="glass-card border-0 mb-8">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-green-700" />
              Quick Access Services
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {services.map((service) => (
                <Link key={service.id} href={service.href}>
                  <Card className="glass-card glass-card-hover card-3d h-full overflow-hidden border-0 group cursor-pointer">
                    <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color} border ${service.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className={`h-5 w-5 ${service.iconColor}`} />
                      </div>
                      <CardTitle className="font-headline text-xs font-semibold text-slate-900 truncate w-full">
                        {service.title}
                      </CardTitle>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activity Container - Full Width */}
        <Card className="glass-card border-0 mb-8">
          <CardHeader className="border-b border-slate-200/60 pb-4 px-6 pt-6">
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-700" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-200/60">
              {activities.map((activity, idx) => (
                <div key={idx} className="p-4 px-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${activity.bg} border border-white/50 flex-shrink-0`}>
                      <activity.icon className={`h-5 w-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>



        {/* AI Assistant - gradient glass CTA */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 text-white relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <CardContent className="relative p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                <Bot className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  AI-Powered Assistant <Sparkles className="h-4 w-4 text-amber-300 animate-glow" />
                </h3>
                <p className="text-white/90 text-sm mt-0.5">Get instant help with any AKS government service</p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-white text-green-700 hover:bg-green-50 rounded-xl shadow-lg"
              onClick={() => alert('AI Assistant coming soon!')}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat Now
            </Button>
          </CardContent>
        </Card>

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
