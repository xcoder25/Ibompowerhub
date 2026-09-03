'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, MapPin, Wallet, Plane, Zap, Shield,
  ChevronDown, Star, Users, Building2, Wifi, Phone,
  CheckCircle2, Sparkles, Globe, Lock, BadgeCheck, Menu, X,
  ChevronRight, Landmark, Leaf, Fish, Droplets, Waves
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SplashScreen } from '@/components/splash-screen';
import { Logo } from '@/components/logo';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

// ─── Onboarding slides (AKS: green, gradient orange, white) ────────────────────
const ONBOARDING_SLIDES = [
  {
    id: 0,
    bg: 'from-[#071a0c] via-[#0a2e14] to-[#040d06]',
    accentBg: 'bg-aks-green/30',
    accent: 'text-emerald-400',
    accentBorder: 'border-aks-green/50',
    accentBg2: 'bg-aks-green/20',
    gradFrom: 'from-emerald-400',
    gradTo: 'to-orange-400',
    icon: Sparkles,
    iconBg: 'bg-aks-green',
    badge: 'ARISE Agenda',
    title: 'Everything Akwa Ibom,',
    titleHighlight: 'In One App.',
    desc: 'Pay bills, verify your identity, monitor flood levels, and connect with all 31 LGAs — all powered by the ARISE agenda.',
    imageSrc: '/akwa_ibom_hero.png',
  },
  {
    id: 1,
    bg: 'from-[#071a0c] via-[#0d1f0f] to-[#040d06]',
    accentBg: 'bg-aks-orange/20',
    accent: 'text-orange-300',
    accentBorder: 'border-aks-orange/40',
    accentBg2: 'bg-aks-orange/15',
    gradFrom: 'from-aks-green-light',
    gradTo: 'to-aks-orange',
    icon: Wallet,
    iconBg: 'bg-aks-orange',
    badge: 'Smart Finance',
    title: 'Send Money,',
    titleHighlight: 'Pay Bills, Grow.',
    desc: 'Top up your Ibom X Wallet and send money to any bank in Nigeria. Pay electricity, fuel, flights and more — instantly.',
    imageSrc: '/mon.png',
  },
  {
    id: 2,
    bg: 'from-[#0a1a0c] via-[#0f1f0a] to-[#040d06]',
    accentBg: 'bg-aks-orange/25',
    accent: 'text-orange-300',
    accentBorder: 'border-aks-orange/50',
    accentBg2: 'bg-aks-orange/20',
    gradFrom: 'from-orange-400',
    gradTo: 'to-amber-300',
    icon: Shield,
    iconBg: 'aks-gradient-motion',
    badge: 'Bank-Grade Security',
    title: 'Your Identity,',
    titleHighlight: 'Verified & Safe.',
    desc: 'Complete KYC in minutes using Smile ID biometrics and BVN. Unlock full wallet features with enterprise-level security.',
    imageSrc: '/governor.png',
    imageClass: 'object-contain object-top scale-[0.85] translate-y-[10%]',
  },
];

// ─── Desktop feature cards (AKS branded) ─────────────────────────────────────
const FEATURES = [
  { icon: Waves, title: 'FloodSense AKS', desc: 'Real-time flood radar, water telemetry & drainage response.', color: 'from-blue-600 to-teal-500', bg: 'bg-blue-600/10', textColor: 'text-blue-600' },
  { icon: Landmark, title: '31 LGAs Explorer', desc: 'Comprehensive guide to councils, resources & governance.', color: 'from-aks-green to-aks-green-light', bg: 'bg-aks-green/10', textColor: 'text-aks-green' },
  { icon: Wallet, title: 'Smart Wallet', desc: 'Send, receive and manage money with bank-grade security.', color: 'from-aks-green to-aks-green-light', bg: 'bg-aks-green/10', textColor: 'text-aks-green' },
  { icon: Plane, title: 'Ibom Air & Marine', desc: 'Flight booking from Victor Attah Airport & coastal ferries.', color: 'from-aks-orange-dark to-aks-orange', bg: 'bg-aks-orange/10', textColor: 'text-aks-orange-dark' },
  { icon: Zap, title: 'Utility Payments', desc: 'Pay electricity, water, and government fees instantly.', color: 'from-aks-orange to-amber-400', bg: 'bg-aks-orange/10', textColor: 'text-aks-orange' },
  { icon: Globe, title: 'Tri-Dialect AI', desc: 'Translate and speak in native Ibibio, Annang & Oro languages.', color: 'from-aks-green-light to-aks-orange', bg: 'bg-aks-orange/10', textColor: 'text-aks-orange' },
];

const STATS = [
  { icon: Users, value: '10K+', label: 'Active Users' },
  { icon: Building2, value: '200+', label: 'Services Listed' },
  { icon: Wifi, value: '99.9%', label: 'Uptime' },
  { icon: Star, value: '4.8★', label: 'App Rating' },
];

const TRUST_POINTS = [
  'Bank-grade 256-bit encryption',
  'Securely processed payments',
  'Smile ID biometric KYC',
  'Real-time Firebase sync',
  'NDPR compliant data handling',
  'Zero hidden charges',
];

// AKS cultural highlights
const AKS_HIGHLIGHTS = [
  { icon: Landmark, label: 'Godswill Akpabio Stadium', desc: 'World-class sports venue', color: 'from-emerald-500/20 to-emerald-800/10', border: 'border-emerald-700/30' },
  { icon: Plane, label: 'Ibom Air', desc: "Nigeria's pride airline", color: 'from-orange-500/20 to-orange-800/10', border: 'border-orange-700/30' },
  { icon: Leaf, label: 'Ibom Tropicana', desc: 'Luxury resort & leisure', color: 'from-emerald-500/20 to-teal-800/10', border: 'border-teal-700/30' },
  { icon: Fish, label: 'Atlantic Seafront', desc: 'Eket & coastal splendour', color: 'from-blue-500/20 to-blue-800/10', border: 'border-blue-700/30' },
  { icon: Droplets, label: "God's Well Resort", desc: 'Premier relaxation', color: 'from-cyan-500/20 to-cyan-800/10', border: 'border-cyan-700/30' },
  { icon: Building2, label: 'Uyo City — Glory Land', desc: 'Vibrant state capital', color: 'from-amber-500/20 to-amber-800/10', border: 'border-amber-700/30' },
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
          className={`${(slide as any).imageClass || 'object-cover'} transition-opacity duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}
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
            <button key={i} onClick={() => goTo(i)} className={`transition-all duration-300 rounded-full ${i === current ? `w-8 h-2 ${slide.iconBg === 'aks-gradient-motion' ? 'aks-gradient-motion' : slide.iconBg}` : 'w-2 h-2 bg-white/25'}`} />
          ))}
        </div>

        {/* Action buttons */}
        {isLast ? (
          <div className="space-y-3">
            <Link href="/auth/signup" className="block">
              <button className="w-full h-14 rounded-2xl aks-gradient-motion text-white font-black text-base flex items-center justify-center gap-2 shadow-lg border-0 hover:opacity-95">
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
  const [activeHighlight, setActiveHighlight] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden"
      style={{ background: 'linear-gradient(160deg, #030f05 0%, #071a0c 30%, #040d06 100%)' }}>

      {/* Tribal pattern overlay — very subtle */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
        style={{ backgroundImage: "url('/aks_pattern_bg.png')", backgroundSize: '800px', backgroundRepeat: 'repeat' }} />

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-white/10' : ''}`}
        style={scrolled ? { background: 'rgba(4,13,6,0.85)', backdropFilter: 'blur(24px)' } : {}}>
        <div className="max-w-7xl mx-auto px-8 h-18 flex items-center justify-between py-3">
          <Logo withText className="text-white text-xl" size={36} />
          <div className="flex items-center gap-8">
            {['Features', 'About', 'Security'].map(item => (
              <button key={item} className="text-sm text-white/60 hover:text-white transition-colors font-medium">{item}</button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 font-semibold">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: 'linear-gradient(90deg, #0d5c2e, #16a34a, #ea580c)', backgroundSize: '200% 100%', animation: 'aks-gradient-shift 3s ease-in-out infinite', boxShadow: '0 0 20px rgba(22,163,74,0.4)' }}>
                Get Started <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-8 pt-20 overflow-hidden">
        {/* AI-generated AKS hero background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/akwa_ibom_hero.png"
            alt="Akwa Ibom State — The Land of Promise"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Multi-layer gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(3,15,5,0.6) 0%, rgba(7,26,12,0.4) 30%, rgba(4,13,6,0.7) 75%, rgba(4,13,6,1) 100%)' }} />
          {/* Side vignettes */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(90deg, rgba(3,15,5,0.5) 0%, transparent 20%, transparent 80%, rgba(3,15,5,0.5) 100%)' }} />
        </div>

        {/* Ambient glow orbs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(13,92,46,0.25) 0%, transparent 70%)', animation: 'orb-pulse 6s ease-in-out infinite' }} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px]"
            style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.2) 0%, transparent 70%)', animation: 'orb-pulse 8s ease-in-out 2s infinite' }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Top badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-5 py-2 mb-8 text-xs font-bold uppercase tracking-widest"
            style={{
              background: 'rgba(13,92,46,0.25)',
              border: '1px solid rgba(22,163,74,0.4)',
              color: 'rgba(134,239,172,0.95)',
              backdropFilter: 'blur(12px)',
              animation: 'fade-in-up 0.6s ease-out both',
            }}>
            <Image src="/aks.png" alt="AKS Seal" width={18} height={18} />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Akwa Ibom State's Official Super App
          </div>

          {/* Headline */}
          <h1 className="font-black leading-[1.05] mb-6" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', animation: 'fade-in-up 0.7s ease-out 0.1s both' }}>
            <span className="block text-white">Everything</span>
            <span className="block"
              style={{
                background: 'linear-gradient(135deg, #4ade80 0%, #16a34a 30%, #ea580c 70%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                backgroundSize: '200% 200%',
                animation: 'text-gradient-motion 5s ease-in-out infinite',
              }}>
              Akwa Ibom
            </span>
            <span className="block text-white">In One Place.</span>
          </h1>

          {/* Sub text */}
          <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-10"
            style={{ color: 'rgba(255,255,255,0.65)', animation: 'fade-in-up 0.7s ease-out 0.2s both' }}>
            Pay bills, book flights, find services, verify your identity, and connect with your community —
            all powered by the <span style={{ color: 'rgba(134,239,172,0.85)', fontWeight: 700 }}>ARISE Agenda</span>.
          </p>

          {/* CTA buttons */}
          <div className="flex gap-4 justify-center items-center mb-16" style={{ animation: 'fade-in-up 0.7s ease-out 0.3s both' }}>
            <Link href="/auth/signup">
              <button className="flex items-center gap-2 px-9 h-14 rounded-2xl text-white font-black text-base shadow-xl transition-transform hover:scale-[1.03]"
                style={{
                  background: 'linear-gradient(90deg, #0d5c2e 0%, #16a34a 35%, #ea580c 70%, #f97316 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'aks-gradient-shift 3s ease-in-out infinite',
                  boxShadow: '0 0 30px rgba(22,163,74,0.4), 0 8px 25px rgba(0,0,0,0.3)',
                }}>
                Start for Free <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="flex items-center gap-2 px-9 h-14 rounded-2xl font-bold text-base transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
                Sign In
              </button>
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 max-w-3xl mx-auto" style={{ animation: 'fade-in-up 0.7s ease-out 0.4s both' }}>
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-2xl px-4 py-5 transition-transform hover:-translate-y-0.5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(16px)',
                }}>
                <Icon className="h-5 w-5 text-emerald-400" />
                <p className="text-2xl font-black text-white">{value}</p>
                <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10 animate-bounce"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          <p className="text-[10px] font-bold tracking-widest uppercase">Discover</p>
          <ChevronDown className="h-4 w-4" />
        </div>
      </section>

      {/* ── AKS HIGHLIGHTS STRIP ─────────────────────────────────────────────── */}
      <section className="relative px-8 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(22,163,74,0.3), rgba(234,88,12,0.3), transparent)' }} />
          <div className="absolute bottom-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(234,88,12,0.2), rgba(22,163,74,0.2), transparent)' }} />
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] font-bold mb-1" style={{ color: 'rgba(134,239,172,0.7)' }}>
                The Land of Promise
              </p>
              <h2 className="text-2xl font-black text-white">Iconic Akwa Ibom Landmarks</h2>
            </div>
            <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              <div className="h-px w-16" style={{ background: 'rgba(22,163,74,0.4)' }} />
              <Image src="/aks.png" alt="AKS" width={24} height={24} className="opacity-60" />
              <div className="h-px w-16" style={{ background: 'rgba(234,88,12,0.4)' }} />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {AKS_HIGHLIGHTS.map(({ icon: Icon, label, desc, color, border }, i) => (
              <div
                key={label}
                className="group relative rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: `linear-gradient(135deg, ${color.replace('from-', '').replace(' to-', ', ')})`,
                  border: `1px solid ${border.replace('border-', '').replace('/', ' / ')}`,
                  boxShadow: activeHighlight === i ? '0 8px 30px rgba(0,0,0,0.4)' : 'none',
                }}
                onMouseEnter={() => setActiveHighlight(i)}
                onMouseLeave={() => setActiveHighlight(null)}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <Icon className="h-5 w-5 text-white/80" />
                </div>
                <p className="text-white font-bold text-sm leading-tight mb-1">{label}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────────── */}
      <section className="px-8 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}>
              <Zap className="h-3.5 w-3.5 text-orange-400" /> What we offer
            </div>
            <h2 className="text-5xl font-black text-white mb-4">
              One App, <span style={{ background: 'linear-gradient(135deg, #4ade80, #16a34a, #ea580c, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', backgroundSize: '200% 200%', animation: 'text-gradient-motion 5s ease-in-out infinite', display: 'inline-block' }}>Infinite Possibilities</span>
            </h2>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
              From paying utility bills to booking a flight, Ibom PowerHub connects you to every essential service in Akwa Ibom.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg, textColor }) => (
              <div key={title} className="group relative rounded-3xl p-7 transition-all duration-400 hover:-translate-y-2 cursor-default overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}>
                {/* Hover glow */}
                <div className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-15 blur-2xl transition-all duration-500`} />
                {/* Top shimmer line */}
                <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

                <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5`}
                  style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                  <Icon className={`h-6 w-6 ${textColor}`} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOVERNOR / ARISE SPOTLIGHT ───────────────────────────────────────── */}
      <section className="relative px-8 py-24 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 left-0 w-[700px] h-[700px] rounded-full blur-[160px]"
            style={{ background: 'radial-gradient(circle, rgba(13,92,46,0.2) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px]"
            style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.12) 0%, transparent 70%)' }} />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-10">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
              style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid rgba(22,163,74,0.3)', color: 'rgba(134,239,172,0.85)' }}>
              <Image src="/arise2.png" alt="ARISE" width={14} height={14} className="rounded-sm" />
              ARISE Agenda
            </div>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <div className="flex flex-col lg:flex-row items-stretch gap-0 rounded-[2.5rem] overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}>

            {/* Governor image panel */}
            <div className="relative w-full lg:w-[440px] shrink-0 h-[440px] lg:h-auto lg:self-stretch">
              <Image
                src="/governor.png"
                alt="Governor Umo Eno — Akwa Ibom State"
                fill
                className="object-cover object-top"
                priority
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 hidden lg:block"
                style={{ background: 'linear-gradient(to right, transparent 60%, rgba(4,13,6,0.9) 100%)' }} />
              <div className="absolute inset-0 lg:hidden"
                style={{ background: 'linear-gradient(to top, rgba(4,13,6,0.85) 0%, transparent 60%)' }} />

              {/* Name badge */}
              <div className="absolute bottom-5 left-5 rounded-2xl px-4 py-2.5"
                style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-white font-black text-sm">H.E. Umo Eno</p>
                <p className="text-xs font-semibold" style={{ color: 'rgba(134,239,172,0.9)' }}>Governor, Akwa Ibom State</p>
              </div>

              {/* AKS seal watermark */}
              <div className="absolute top-5 right-5 opacity-20">
                <Image src="/aks.png" alt="AKS Seal" width={48} height={48} />
              </div>
            </div>

            {/* Text panel */}
            <div className="flex-1 p-10 lg:p-16 flex flex-col justify-center">
              <blockquote className="text-3xl lg:text-4xl font-black text-white leading-snug mb-7">
                "Digitising access to government services, empowering our people, and driving inclusive economic growth across every LGA."
              </blockquote>

              <p className="text-base leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Ibom PowerHub is the digital backbone of the ARISE Agenda — connecting all 31 Local Government Areas of Akwa Ibom State to smarter governance, financial inclusion, and modern public services.
              </p>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: '31', label: 'LGAs Connected' },
                  { value: '4M+', label: 'Citizens Served' },
                  { value: '2025', label: 'ARISE Roadmap' },
                ].map(({ value, label }) => (
                  <div key={label} className="rounded-2xl p-5 text-center transition-transform hover:-translate-y-0.5"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-3xl font-black mb-1 text-emerald-400">{value}</p>
                    <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IBOM AIR SPOTLIGHT ───────────────────────────────────────────────── */}
      <section className="px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,80,160,0.2) 0%, rgba(255,120,30,0.15) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
            <div className="absolute inset-0">
              <Image src="/ibom_air.png" alt="Ibom Air" fill className="object-cover object-center opacity-20" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(4,13,6,0.85) 40%, rgba(4,13,6,0.4) 100%)' }} />
            </div>
            <div className="relative z-10 flex items-center gap-8 p-10">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest"
                  style={{ background: 'rgba(234,88,12,0.2)', border: '1px solid rgba(234,88,12,0.4)', color: 'rgba(253,186,116,0.9)' }}>
                  <Plane className="h-3.5 w-3.5" /> Ibom Air
                </div>
                <h3 className="text-3xl font-black text-white mb-2">Fly Akwa Ibom to the World</h3>
                <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Book Ibom Air flights directly from Ibom PowerHub. Nigeria's pride airline, connecting Uyo to Lagos, Abuja and beyond.
                </p>
              </div>
              <Link href="/flights">
                <button className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-white transition-transform hover:scale-105"
                  style={{ background: 'linear-gradient(90deg, #ea580c, #f97316)', boxShadow: '0 0 20px rgba(234,88,12,0.4)' }}>
                  Book Flight <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECURITY SECTION ─────────────────────────────────────────────────── */}
      <section className="px-8 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-[2.5rem] p-14 flex items-center gap-14"
            style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-6 w-6 text-emerald-400" />
                <span className="font-black text-lg uppercase tracking-widest text-emerald-400">Security First</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4 leading-tight">Your data is safe with us.</h2>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                We built Ibom PowerHub with security as the foundation — not an afterthought. Multiple layers protect every transaction.
              </p>
            </div>
            <div className="flex-1 space-y-3">
              {TRUST_POINTS.map(point => (
                <div key={point} className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all hover:bg-white/[0.04]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="relative px-8 py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full blur-[200px]"
            style={{ background: 'radial-gradient(ellipse, rgba(13,92,46,0.2) 0%, rgba(234,88,12,0.1) 50%, transparent 100%)' }} />
        </div>

        <div className="relative max-w-3xl mx-auto text-center">
          {/* AKS Seal */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-2xl" style={{ background: 'rgba(13,92,46,0.4)' }} />
              <Image src="/aks.png" alt="AKS" width={80} height={80} className="relative z-10 opacity-80" style={{ animation: 'logo-breathe 4s ease-in-out infinite' }} />
            </div>
          </div>

          <h2 className="text-6xl font-black text-white mb-6 leading-tight">
            Ready to experience<br />
            <span style={{
              background: 'linear-gradient(135deg, #4ade80, #16a34a, #ea580c, #fbbf24)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 200%',
              animation: 'text-gradient-motion 5s ease-in-out infinite',
              display: 'inline-block',
            }}>Smart Living?</span>
          </h2>
          <p className="text-lg mb-10 leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Join thousands of Akwa Ibom residents already using Ibom PowerHub — The Land of Promise, digitised.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/signup">
              <button className="flex items-center gap-2 px-10 h-14 rounded-2xl text-white font-black text-base transition-transform hover:scale-[1.03]"
                style={{
                  background: 'linear-gradient(90deg, #0d5c2e 0%, #16a34a 35%, #ea580c 70%, #f97316 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'aks-gradient-shift 3s ease-in-out infinite',
                  boxShadow: '0 0 40px rgba(22,163,74,0.35)',
                }}>
                Create Free Account <ArrowRight className="h-5 w-5" />
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="flex items-center gap-2 px-10 h-14 rounded-2xl font-bold text-base transition-all hover:bg-white/10"
                style={{ border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.8)' }}>
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer className="px-8 py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo withText className="text-white/60 text-base" size={30} />
          <div className="flex items-center gap-2">
            <div className="h-px w-8" style={{ background: 'rgba(22,163,74,0.3)' }} />
            <Image src="/aks.png" alt="AKS" width={20} height={20} className="opacity-30" />
            <div className="h-px w-8" style={{ background: 'rgba(234,88,12,0.3)' }} />
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            <span>© 2025 Ibom PowerHub</span>
            <span>·</span>
            <span>Powered by ARISE Agenda</span>
            <span>·</span>
            <span>Uyo, Akwa Ibom State</span>
          </div>
        </div>
      </footer>

      {/* Global animation styles */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orb-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes aks-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes text-gradient-motion {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
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
    const timer = setTimeout(() => setLoading(false), 1800);
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
