'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, MapPin, Wallet, Plane, Zap, Shield,
  ChevronDown, Star, Users, Building2, Wifi, Phone,
  CheckCircle2, Sparkles, Globe, Lock, BadgeCheck, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplashScreen } from '@/components/splash-screen';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

const FEATURES = [
  {
    icon: Wallet,
    title: 'Smart Wallet',
    desc: 'Send, receive and manage money with bank-grade security. Fund via card, bank transfer or DVA.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
  },
  {
    icon: MapPin,
    title: 'Interactive Map',
    desc: 'Discover services, businesses, and government locations around Akwa Ibom State.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10',
    textColor: 'text-blue-600',
  },
  {
    icon: Plane,
    title: 'Flight Booking',
    desc: 'Search and book flights across Nigeria right from your phone with real-time availability.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/10',
    textColor: 'text-violet-600',
  },
  {
    icon: Zap,
    title: 'Utility Payments',
    desc: 'Pay electricity, water, and government fees instantly. No queues, no stress.',
    color: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/10',
    textColor: 'text-amber-600',
  },
  {
    icon: Shield,
    title: 'KYC Verification',
    desc: 'Quick identity verification through Smile ID biometrics, BVN and document checks.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-500/10',
    textColor: 'text-rose-600',
  },
  {
    icon: Globe,
    title: 'Ibibio AI',
    desc: 'Translate text to the native Ibibio/Efik language with AI-powered voice synthesis.',
    color: 'from-cyan-500 to-sky-600',
    bg: 'bg-cyan-500/10',
    textColor: 'text-cyan-600',
  },
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

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
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
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading || isUserLoading || user) return <SplashScreen />;

  return (
    <div className="min-h-screen bg-[#040d06] text-white overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/60 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo withText className="text-white text-xl" size={32} />

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'About', 'Security'].map(item => (
              <button key={item} className="text-sm text-white/70 hover:text-white transition-colors font-medium">
                {item}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl px-5">
                Get Started
              </Button>
            </Link>
          </div>

          <button className="md:hidden p-2 text-white/80" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 px-4 py-4 space-y-3">
            {['Features', 'About', 'Security'].map(item => (
              <button key={item} className="block w-full text-left text-sm text-white/70 hover:text-white py-2 font-medium">
                {item}
              </button>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link href="/auth/login">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16 overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2075&auto=format&fit=crop"
            alt="Akwa Ibom landscape"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#040d06]" />
        </div>

        {/* Animated orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/10 blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 text-emerald-300 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" />
            Akwa Ibom State's Super App
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.05] mb-6">
            <span className="block text-white">Everything</span>
            <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Akwa Ibom
            </span>
            <span className="block text-white">In One Place.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
            Pay bills, book flights, find services, verify your identity, and connect with your community — all powered by the ARISE agenda.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl px-8 h-14 text-base shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] transition-all">
                Start for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold rounded-2xl px-8 h-14 text-base backdrop-blur-sm">
                I have an account
              </Button>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-4 flex flex-col items-center gap-1.5">
                <Icon className="h-5 w-5 text-emerald-400" />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs text-white/50 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40 animate-bounce z-10">
          <p className="text-xs font-medium tracking-widest uppercase">Scroll</p>
          <ChevronDown className="h-4 w-4" />
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative bg-[#040d06] px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-4 text-white/60 text-xs font-bold uppercase tracking-widest">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              What we offer
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-4">
              One App,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                Infinite Possibilities
              </span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto text-base leading-relaxed">
              From paying utility bills to booking a flight, Ibom PowerHub connects you to every essential service in Akwa Ibom.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, textColor }) => (
              <div
                key={title}
                className="group relative bg-white/[0.03] border border-white/8 rounded-3xl p-6 hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {/* gradient glow on hover */}
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

      {/* ─── App Preview / CTA Banner ─── */}
      <section className="relative px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-teal-900/20 to-[#040d06]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[160px]" />
        </div>

        <div className="relative max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6 text-emerald-300 text-xs font-bold uppercase tracking-widest">
              <BadgeCheck className="h-3.5 w-3.5" />
              ARISE Agenda Powered
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 leading-tight">
              Built for the People of{' '}
              <span className="text-emerald-400">Akwa Ibom</span>
            </h2>
            <p className="text-white/60 text-base leading-relaxed mb-8 max-w-lg">
              Ibom PowerHub is aligned with Governor Umo Eno's ARISE agenda — digitising access to government services, empowering communities, and driving economic growth across the 31 LGAs of Akwa Ibom State.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl px-8 h-14 text-base">
                Join the Platform
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Visual card stack */}
          <div className="flex-1 relative flex items-center justify-center min-h-[320px] w-full">
            {/* Card 1 — Wallet */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 w-72 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-6 shadow-2xl rotate-[-4deg] z-10">
              <p className="text-emerald-100/60 text-xs font-bold uppercase tracking-widest mb-1">Ibom X Wallet</p>
              <p className="text-white text-3xl font-black mb-4">₦ 24,500</p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="h-4 w-4 text-white" />
                </div>
                <p className="text-emerald-100 text-xs font-semibold">Available Balance</p>
              </div>
            </div>

            {/* Card 2 — Map */}
            <div className="absolute bottom-0 right-1/2 translate-x-1/2 lg:right-0 lg:translate-x-0 w-64 bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl rotate-[3deg] z-20 mt-16">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-2">Nearby Service</p>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Uyo General Hospital</p>
                  <p className="text-white/40 text-xs">1.2km away</p>
                </div>
              </div>
              <div className="h-1 w-full bg-white/10 rounded-full">
                <div className="h-1 w-1/3 bg-blue-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust / Security ─── */}
      <section className="px-4 py-24 bg-[#040d06]">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/[0.03] border border-white/8 rounded-[2.5rem] p-8 md:p-14 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <Lock className="h-6 w-6 text-emerald-400" />
                <span className="text-emerald-400 font-black text-lg uppercase tracking-widest">Security First</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                Your data is safe with us.
              </h2>
              <p className="text-white/50 text-base leading-relaxed">
                We built Ibom PowerHub with security as the foundation — not an afterthought. Multiple layers protect every transaction and piece of personal data.
              </p>
            </div>

            <div className="flex-1 w-full space-y-3">
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

      {/* ─── Final CTA ─── */}
      <section className="relative px-4 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-[#040d06] via-emerald-950/20 to-[#040d06]" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-emerald-600/10 blur-[150px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Ready to experience<br />
            <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
              Smart Living?
            </span>
          </h2>
          <p className="text-white/50 text-base md:text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Join thousands of residents already using Ibom PowerHub to simplify their daily lives. Sign up free in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-2xl px-10 h-14 text-base shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-bold rounded-2xl px-10 h-14 text-base">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="px-4 py-8 border-t border-white/8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo withText className="text-white/70 text-base" size={28} />
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>© 2025 Ibom PowerHub</span>
            <span>·</span>
            <span>Powered by ARISE Agenda</span>
            <span>·</span>
            <Link href="/auth/login" className="hover:text-white/60 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
