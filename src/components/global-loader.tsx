'use client';

import Image from 'next/image';

export function GlobalLoader() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: 'rgba(4,13,6,0.92)', backdropFilter: 'blur(20px)' }}>
      
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(13,92,46,0.3) 0%, transparent 70%)', animation: 'glow-pulse 3s ease-in-out infinite' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.2) 0%, transparent 70%)', animation: 'glow-pulse 3s ease-in-out infinite', animationDelay: '1.5s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-5">
        {/* Spinning ring + logo */}
        <div className="relative flex items-center justify-center">
          {/* Spinning gradient ring */}
          <div className="absolute w-24 h-24 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #0d5c2e, #16a34a, #ea580c, #f97316, #0d5c2e)',
              animation: 'spin 1.5s linear infinite',
              padding: '2px',
            }}>
            <div className="w-full h-full rounded-full" style={{ background: '#040d06' }} />
          </div>
          
          {/* Logo */}
          <div className="relative z-10"
            style={{ animation: 'logo-breathe 2s ease-in-out infinite' }}>
            <Image src="/aks.png" alt="Arise AKS" width={60} height={60} />
          </div>
        </div>

        {/* Brand name */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-white">Arise</span>
          <span className="text-xl font-black"
            style={{
              background: 'linear-gradient(90deg, #fbbf24, #f97316, #ea580c)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>AKS</span>
        </div>

        {/* Animated bar */}
        <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #0d5c2e, #16a34a, #ea580c, #f97316)',
              backgroundSize: '200% 100%',
              animation: 'aks-gradient-shift 2s ease-in-out infinite, progress-wave 1.5s ease-in-out infinite',
              boxShadow: '0 0 10px rgba(22,163,74,0.5)',
            }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes logo-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
        }
        @keyframes aks-gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes progress-wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
