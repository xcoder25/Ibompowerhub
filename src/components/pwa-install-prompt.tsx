'use client';

import { useState, useEffect } from 'react';
import { Share, PlusSquare, X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PwaInstallPrompt() {
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true); // default true to avoid flash
  const [showIosPrompt, setShowIosPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if app is already installed / running in standalone display mode
    const standalone =
      (window.navigator as any).standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;

    setIsStandalone(standalone);
    if (standalone) return;

    // Check if device is iOS (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/i.test(ua) && !(window as any).MSStream;
    setIsIos(isIosDevice);

    if (isIosDevice) {
      const dismissed = localStorage.getItem('ibom_ios_pwa_dismissed');
      // Show prompt after 3 seconds if not dismissed recently
      if (!dismissed) {
        const timer = setTimeout(() => {
          setShowIosPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      // Android / Chrome / Edge beforeinstallprompt listener
      const handleBeforeInstall = (e: Event) => {
        e.preventDefault();
        setDeferredPrompt(e);
        const dismissed = localStorage.getItem('ibom_pwa_dismissed');
        if (!dismissed) {
          setShowAndroidPrompt(true);
        }
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    }
  }, []);

  const handleDismissIos = () => {
    setShowIosPrompt(false);
    localStorage.setItem('ibom_ios_pwa_dismissed', Date.now().toString());
  };

  const handleDismissAndroid = () => {
    setShowAndroidPrompt(false);
    localStorage.setItem('ibom_pwa_dismissed', Date.now().toString());
  };

  const handleInstallAndroid = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowAndroidPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isStandalone) return null;

  return (
    <>
      {/* iOS iPhone / iPad Install Instructions Sheet */}
      {showIosPrompt && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-6 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent pointer-events-auto animate-in slide-in-from-bottom duration-300">
          <div className="max-w-md mx-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 p-4 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md shadow-emerald-500/30 shrink-0">
                  <img src="/apple-touch-icon.png" alt="Ibom PowerHub" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white leading-tight">Install on your iPhone</h4>
                  <p className="text-[11px] text-emerald-300 font-medium mt-0.5">
                    Fast access, offline mode & native feel
                  </p>
                </div>
              </div>
              <button
                onClick={handleDismissIos}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Step-by-step instructions for iPhone Safari */}
            <div className="space-y-2 py-2 border-y border-white/10 text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                  1
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Tap the <span className="inline-flex items-center gap-1 font-bold text-white bg-white/10 px-1.5 py-0.5 rounded-md"><Share className="size-3.5 text-blue-400" /> Share</span> button in Safari's bottom bar
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                  2
                </span>
                <span className="flex items-center gap-1.5 flex-wrap">
                  Scroll down & select <span className="inline-flex items-center gap-1 font-bold text-white bg-white/10 px-1.5 py-0.5 rounded-md"><PlusSquare className="size-3.5 text-emerald-400" /> Add to Home Screen</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="size-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px] shrink-0">
                  3
                </span>
                <span>
                  Tap <span className="font-bold text-white">Add</span> in the top right to install!
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 mt-3">
              <span className="text-[10px] text-slate-400">Works in Safari browser</span>
              <Button
                size="sm"
                onClick={handleDismissIos}
                className="rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-4"
              >
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Android / Desktop Install Prompt */}
      {showAndroidPrompt && (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-6 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent pointer-events-auto animate-in slide-in-from-bottom duration-300">
          <div className="max-w-md mx-auto rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 p-4 shadow-2xl text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl overflow-hidden border-2 border-emerald-400 shadow-md shrink-0">
                  <img src="/icon-192.png" alt="Ibom PowerHub" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">Install Ibom PowerHub</h4>
                  <p className="text-[11px] text-slate-300">Add to home screen for native experience</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleInstallAndroid}
                  className="rounded-xl font-black text-xs gap-1 bg-emerald-600 hover:bg-emerald-500 text-white h-8 px-3"
                >
                  <Download className="size-3.5" />
                  <span>Install</span>
                </Button>
                <button
                  onClick={handleDismissAndroid}
                  className="p-1.5 rounded-full text-slate-400 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
