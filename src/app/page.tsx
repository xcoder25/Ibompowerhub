'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, MapPin, Wallet, Plane, Zap, Shield,
  ChevronDown, Star, Users, Building2, Wifi, Phone,
  CheckCircle2, Sparkles, Globe, Lock, BadgeCheck, Menu, X,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplashScreen } from '@/components/splash-screen';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

// ─── Onboarding slides data ───────────────────────────────────────────────────
const ONBOARDING_SLIDES = [
  {
    id: 0,
    bg: 'from-[#071a0c] via-[#0a2213] to-[#040d06]',
    accentBg: 'bg-emerald-600/20',
    accent: 'text-emerald-400',
    accentBorder: 'border-emerald-500/40',
    accentBg2: 'bg-emerald-500/15',
    gradFrom: 'from-emerald-400',
    gradTo: 'to-teal-300',
    icon: Sparkles,
    iconBg: 'bg-emerald-500',
    badge: 'ARISE Agenda',
    title: 'Everything Akwa Ibom,',
    titleHighlight: 'In One App.',
    desc: 'Pay bills, verify your identity, explore services, and connect with your community — all powered by the ARISE agenda.',
    imageSrc: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 1,
    bg: 'from-[#060e1a] via-[#091120] to-[#040d06]',
    accentBg: 'bg-blue-600/20',
    accent: 'text-blue-400',
    accentBorder: 'border-blue-500/40',
    accentBg2: 'bg-blue-500/15',
    gradFrom: 'from-blue-400',
    gradTo: 'to-violet-300',
    icon: Wallet,
    iconBg: 'bg-blue-500',
    badge: 'Smart Finance',
    title: 'Send Money,',
    titleHighlight: 'Pay Bills, Grow.',
    desc: 'Top up your Ibom X Wallet and send money to any bank in Nigeria. Pay electricity, fuel, flights and more — instantly.',
    imageSrc: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 2,
    bg: 'from-[#160a06] via-[#1a0c08] to-[#040d06]',
    accentBg: 'bg-amber-600/20',
    accent: 'text-amber-400',
    accentBorder: 'border-amber-500/40',
    accentBg2: 'bg-amber-500/15',
    gradFrom: 'from-amber-400',
    gradTo: 'to-orange-300',
    icon: Shield,
    iconBg: 'bg-amber-500',
    badge: 'Bank-Grade Security',
    title: 'Your Identity,',
    titleHighlight: 'Verified & Safe.',
    desc: 'Complete KYC in minutes using Smile ID biometrics and BVN. Unlock full wallet features with enterprise-level security.',
    imageSrc: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=1200&auto=format&fit=crop',
  },
];

// ─── Desktop feature cards ────────────────────────────────────────────────────
const FEATURES = [
  { icon: Wallet, title: 'Smart Wallet', desc: 'Send, receive and manage money with bank-grade security.', color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
  { icon: MapPin, title: 'Interactive Map', desc: 'Discover services, businesses, and government locations.', color: 'from-blue-500 to-indigo-600', bg: 'bg-blue-500/10', textColor: 'text-blue-400' },
  { icon: Plane, title: 'Flight Booking', desc: 'Search and book domestic flights with real-time availability.', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', textColor: 'text-violet-400' },
  { icon: Zap, title: 'Utility Payments', desc: 'Pay electricity, water, and government fees instantly.', color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/10', textColor: 'text-amber-400' },
  { icon: Shield, title: 'KYC Verification', desc: 'Quick identity verification through Smile ID biometrics.', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-500/10', textColor: 'text-rose-400' },
  { icon: Globe, title: 'Ibibio AI', desc: 'Translate and speak in native Ibibio/Efik language.', color: 'from-cyan-500 to-sky-600', bg: 'bg-cyan-500/10', textColor: 'text-cyan-400' },
];

const STATS = [
  { icon: Users, value: '10K+', label: 'Active Users' },
  { icon: Building2, value: '200+', label: 'Services Listed' },
  { icon: Wifi, value: '99.9%', label: 'Uptime' },
  { icon: Star, value: '4.8★', label: 'App Rating' },
];

const TRUST_POINTS = [
  'Bank-grade 256-bit encryption',
  'Paystack-secured transactions',
  'Smile ID biometric KYC',
  'Real-time Firebase sync',
  'NDPR compliant data handling',
  'Zero hidden charges',
];

// ─── Mobile Onboarding Slide ──────────────────────────────────────────────────
function MobileOnboarding() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const touchStart = useRef(0);
  const touchEnd = useRef(0);

  const goTo = useCallback((idx: number) => {
    if (animating || idx === current) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 220);
  }, [animating, current]);

  const next = () => { if (current < 2) goTo(current + 1); };
  const prev = () => { if (current > 0) goTo(current - 1); };

  const handleTouchStart = (e: React.TouchEvent) => { touchStart.current = e.targetTouches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => { touchEnd.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = () => {
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) > 50) { if (diff > 0) next(); else prev(); }
  };

  const slide = ONBOARDING_SLIDES[current];
  const { icon: SlideIcon } = slide;
  const isLast = current === 2;

  return (
    <div
      className={`relative flex flex-col h-screen w-full bg-gradient-to-b ${slide.bg} overflow-hidden select-none`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={slide.imageSrc}
          alt="background"
          fill
          className={`object-cover transition-opacity duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/90" />
      </div>

      {/* Glowing orb */}
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] ${slide.accentBg} pointer-events-none z-0`} />

      {/* Skip */}
      {!isLast && (
        <div className="relative z-10 flex justify-end px-6 pt-14">
          <Link href="/auth/login">
            <button className="text-white/50 text-sm font-semibold">Skip</button>
          </Link>
        </div>
      )}

      {/* Slide content */}
      <div className={`relative z-10 flex-1 flex flex-col justify-end px-6 pb-10 transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'} ${!isLast ? 'pt-10' : 'pt-14'}`}>
        {/* Icon badge */}
        <div className="mb-5">
          <div className={`inline-flex items-center gap-2 border ${slide.accentBorder} ${slide.accentBg2} rounded-full px-4 py-1.5 mb-5`}>
            <SlideIcon className={`h-3.5 w-3.5 ${slide.accent}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${slide.accent}`}>{slide.badge}</span>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-1">
            {slide.title}
          </h1>
          <h1 className={`text-4xl font-black leading-tight mb-4 bg-gradient-to-r ${slide.gradFrom} ${slide.gradTo} bg-clip-text text-transparent`}>
            {slide.titleHighlight}
          </h1>
          <p className="text-white/60 text-base leading-relaxed">
            {slide.desc}
          </p>
        </div>

        {/* Dots */}
        <div className="flex items-center gap-2 mb-6">
          {ONBOARDING_SLIDES.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className={`transition-all duration-300 rounded-full ${i === current ? `w-8 h-2 ${slide.iconBg}` : 'w-2 h-2 bg-white/25'}`} />
          ))}
        </div>

        {/* Action buttons */}
        {isLast ? (
          <div className="space-y-3">
            <Link href="/auth/signup" className="block">
              <button className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-black text-base flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
                Create Free Account
                <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/auth/login" className="block">
              <button className="w-full h-12 rounded-2xl border border-white/20 text-white/80 font-semibold text-sm flex items-center justify-center gap-2">
                I already have an account
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            {current > 0 ? (
              <button onClick={prev} className="text-white/40 text-sm font-semibold">
                Back
              </button>
            ) : <div />}
            <button
              onClick={next}
              className={`flex items-center gap-2 px-7 py-4 rounded-2xl ${slide.iconBg} text-white font-black text-base shadow-lg`}
            >
              Next
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Logo top-left */}
      <div className="absolute top-14 left-6 z-10">
        <Logo withText className="text-white text-sm" size={26} />
      </div>
    </div>
  );
}

// ─── Full Desktop Landing Page ────────────────────────────────────────────────
function DesktopLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#040d06] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo withText className="text-white text-xl" size={32} />
          <div className="flex items-center gap-8">
            {['Features', 'About', 'Security'].map(item => (
              <button key={item} className="text-sm text-white/70 hover:text-white transition-colors font-medium">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 font-semibold">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl px-5">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2075&auto=format&fit=crop" alt="Akwa Ibom" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-[#040d06]" />
        </div>
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 text-emerald-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            Akwa Ibom State's Super App
          </div>
          <h1 className="text-6xl md:text-7xl font-black leading-[1.05] mb-6">
            <span className="block text-white">Everything</span>
            <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">Akwa Ibom</span>
            <span className="block text-white">In One Place.</span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
            Pay bills, book flights, find services, verify your identity, and connect with your community — all powered by the ARISE agenda.
          </p>
          <div className="flex gap-4 justify-center items-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl px-8 h-14 text-base shadow-[0_0_40px_rgba(34,197,94,0.4)]">
                Start for Free <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold rounded-2xl px-8 h-14 text-base">
                Sign In
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-4 flex flex-col items-center gap-1.5">
                <Icon className="h-5 w-5 text-emerald-400" />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-white/50 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce z-10">
          <p className="text-xs font-medium tracking-widest uppercase">Scroll</p>
          <ChevronDown className="h-4 w-4" />
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 bg-[#040d06]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4 text-white/60 text-xs font-bold uppercase tracking-widest">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> What we offer
            </div>
            <h2 className="text-5xl font-black text-white mb-4">One App, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Infinite Possibilities</span></h2>
            <p className="text-white/50 max-w-xl mx-auto text-base leading-relaxed">From paying utility bills to booking a flight, Ibom PowerHub connects you to every essential service in Akwa Ibom.</p>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, textColor }) => (
              <div key={title} className="group relative bg-white/[0.03] border border-white/8 rounded-3xl p-6 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${textColor}`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="px-6 py-24 bg-[#040d06]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/[0.03] border border-white/8 rounded-[2.5rem] p-14 flex items-center gap-12">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-6 w-6 text-emerald-400" />
                <span className="text-emerald-400 font-black text-lg uppercase tracking-widest">Security First</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4 leading-tight">Your data is safe with us.</h2>
              <p className="text-white/50 text-base leading-relaxed">We built Ibom PowerHub with security as the foundation — not an afterthought. Multiple layers protect every transaction.</p>
            </div>
            <div className="flex-1 space-y-3">
              {TRUST_POINTS.map(point => (
                <div key={point} className="flex items-center gap-3 bg-white/5 border border-white/8 rounded-2xl px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-white/80 text-sm font-medium">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-emerald-600/10 blur-[150px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-6xl font-black text-white mb-6 leading-tight">
            Ready to experience<br />
            <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">Smart Living?</span>
          </h2>
          <p className="text-white/50 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Join thousands of residents already using Ibom PowerHub.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl px-10 h-14 text-base">
                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold rounded-2xl px-10 h-14 text-base">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Logo withText className="text-white/70 text-base" size={28} />
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>© 2025 Ibom PowerHub</span>
            <span>·</span>
            <span>Powered by ARISE Agenda</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Root Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isUserLoading && user) router.push('/dashboard');
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (loading || isUserLoading || user) return <SplashScreen />;

  return isMobile ? <MobileOnboarding /> : <DesktopLanding />;
}
