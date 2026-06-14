'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const AKS_FACTS = [
  'Land of Promise 🌿',
  'Uyo — The Glory of the Land',
  'Ibom Tropicana Resort',
  '31 Local Government Areas',
  'Godswill Akpabio Stadium',
  'Home of Ibom Air ✈️',
];

export function SplashScreen() {
  const [progress, setProgress] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [factVisible, setFactVisible] = useState(true);

  useEffect(() => {
    // Progress bar
    const duration = 1400;
    const interval = 30;
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + step;
        if (next >= 100) { clearInterval(timer); return 100; }
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Rotating facts
    const id = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => {
        setFactIndex(i => (i + 1) % AKS_FACTS.length);
        setFactVisible(true);
      }, 350);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden min-h-[100dvh]"
      style={{ background: 'linear-gradient(160deg, #030f05 0%, #071a0c 40%, #0c2410 70%, #040d06 100%)' }}>

      {/* Tribal pattern background */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: "url('/aks_pattern_bg.png')", backgroundSize: '600px', backgroundRepeat: 'repeat' }} />

      {/* Deep ambient glows — AKS colors */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="splash-orb-1 absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(13,92,46,0.45) 0%, transparent 70%)' }} />
        <div className="splash-orb-2 absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.35) 0%, transparent 70%)' }} />
        <div className="splash-orb-3 absolute top-[40%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* Floating particles (palm-leaf silhouettes / cultural motifs) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-0"
            style={{
              width: `${4 + (i % 5) * 3}px`,
              height: `${4 + (i % 5) * 3}px`,
              left: `${8 + (i * 7.3) % 84}%`,
              top: `${10 + (i * 9.1) % 80}%`,
              background: i % 2 === 0
                ? `rgba(22,163,74,${0.3 + (i % 3) * 0.1})`
                : `rgba(234,88,12,${0.25 + (i % 3) * 0.1})`,
              animation: `particle-float ${3 + (i % 4)}s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Geometric tribal ring decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[420px] h-[420px] rounded-full border border-emerald-800/20 absolute" style={{ animation: 'spin-slow 20s linear infinite' }}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-500/40" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-orange-500/40" />
        </div>
        <div className="w-[520px] h-[520px] rounded-full border border-orange-900/10 absolute" style={{ animation: 'spin-slow 30s linear infinite reverse' }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-6 w-full max-w-sm" style={{ animation: 'splash-enter 0.7s ease-out both' }}>

        {/* Logo with layered glow rings */}
        <div className="relative flex items-center justify-center">
          {/* Pulsing glow rings */}
          <div className="absolute w-40 h-40 rounded-full animate-ping opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #0d5c2e 0%, transparent 70%)' }} />
          <div className="absolute w-32 h-32 rounded-full animate-ping opacity-[0.18]"
            style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)', animationDelay: '0.5s', animationDuration: '2.5s' }} />

          {/* Logo card with glassmorphism */}
          <div className="relative z-10 rounded-3xl p-4 shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 0 60px rgba(13,92,46,0.4), 0 0 30px rgba(234,88,12,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>
            <Image
              src="/aks.png"
              alt="Government of Akwa Ibom State Seal"
              width={110}
              height={110}
              priority
              className="drop-shadow-lg"
              style={{ animation: 'logo-breathe 3s ease-in-out infinite' }}
            />
          </div>

          {/* Shimmer line */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute inset-0 shimmer-sweep" />
          </div>
        </div>

        {/* Brand text */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-[0.25em] mb-1"
            style={{ background: 'rgba(13,92,46,0.3)', border: '1px solid rgba(13,92,46,0.4)', color: 'rgba(134,239,172,0.9)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Arise AKS Super App
          </span>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white tracking-tight drop-shadow-lg" style={{ fontFamily: 'system-ui, sans-serif' }}>
              Arise
            </span>
            <span className="text-5xl font-black tracking-tight drop-shadow-lg"
              style={{
                background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 50%, #ea580c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'aks-text-gradient 3s ease-in-out infinite',
                backgroundSize: '200% 100%',
              }}>
              AKS
            </span>
          </div>

          <p className="text-sm font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.08em' }}>
            "The Land of Promise"
          </p>
        </div>

        {/* Rotating AKS fact */}
        <div className="h-7 flex items-center justify-center">
          <span
            className="text-xs font-medium text-center px-3 py-1 rounded-full"
            style={{
              color: 'rgba(255,255,255,0.65)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              opacity: factVisible ? 1 : 0,
              transform: factVisible ? 'translateY(0)' : 'translateY(4px)',
              transition: 'all 0.35s ease',
            }}>
            {AKS_FACTS[factIndex]}
          </span>
        </div>

        {/* Loading section */}
        <div className="flex flex-col items-center gap-3 w-full">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Preparing your experience…
          </p>

          {/* Segmented progress bar — AKS styled */}
          <div className="relative w-48 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #0d5c2e 0%, #16a34a 35%, #ea580c 70%, #f97316 100%)',
                backgroundSize: '200% 100%',
                animation: 'aks-gradient-shift 2s ease-in-out infinite',
                boxShadow: '0 0 12px rgba(22,163,74,0.6), 0 0 6px rgba(234,88,12,0.4)',
              }}
            />
            {/* Shimmer on bar */}
            <div className="absolute inset-0 rounded-full progress-shimmer" />
          </div>

          {/* Bouncing dots */}
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(i => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: i === 0 ? '#16a34a' : i === 1 ? '#ea580c' : '#fbbf24',
                  animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom tagline */}
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1 z-10" style={{ animation: 'splash-enter 1s ease-out 0.4s both' }}>
        <div className="flex items-center gap-2">
          <div className="h-px w-12" style={{ background: 'rgba(22,163,74,0.4)' }} />
          <span className="text-[9px] uppercase tracking-[0.35em] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Powered by ARISE Agenda
          </span>
          <div className="h-px w-12" style={{ background: 'rgba(234,88,12,0.4)' }} />
        </div>
        <span className="text-[9px] uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Uyo, Akwa Ibom State · Nigeria
        </span>
      </div>

      <style jsx>{`
        @keyframes splash-enter {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes particle-float {
          0%, 100% { opacity: 0; transform: translateY(0) scale(1); }
          20% { opacity: 1; }
          50% { transform: translateY(-20px) scale(1.2); }
          80% { opacity: 0.6; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(13,92,46,0.5)); }
          50% { transform: scale(1.03); filter: drop-shadow(0 0 16px rgba(234,88,12,0.5)); }
        }
        @keyframes aks-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes aks-text-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .splash-orb-1 { animation: orb1-float 8s ease-in-out infinite; }
        .splash-orb-2 { animation: orb2-float 10s ease-in-out infinite; }
        .splash-orb-3 { animation: orb3-float 6s ease-in-out infinite; }
        @keyframes orb1-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, 20px) scale(1.08); }
        }
        @keyframes orb2-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-20px, -30px) scale(1.06); }
        }
        @keyframes orb3-float {
          0%, 100% { opacity: 0.08; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.15; transform: translateX(-50%) scale(1.1); }
        }
        .shimmer-sweep {
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
        .progress-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
