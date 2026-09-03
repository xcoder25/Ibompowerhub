'use client';

import React from 'react';
import Link from 'next/link';
import { SellerOnboardingWizard } from '@/components/seller-onboarding/onboarding-wizard';
import { Button } from '@/components/ui/button';
import {
  Sprout,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Truck,
  TrendingUp,
} from 'lucide-react';

export default function BecomeSellerPage() {
  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-20 overflow-x-hidden">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500/8 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-3 sm:pt-6 pb-8 space-y-3.5 sm:space-y-5">
        {/* Top Nav Row */}
        <div className="flex items-center justify-between gap-2">
          <Link
            href="/market"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>AgroConnect</span>
          </Link>

          <Link href="/seller/application">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl text-xs font-bold h-7 sm:h-8 border-slate-200 dark:border-slate-800 px-2.5 sm:px-3 text-[11px] sm:text-xs"
            >
              Track Application
            </Button>
          </Link>
        </div>

        {/* Hero Banner — compact mobile padding (p-3.5 on mobile, p-6 on desktop) */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-3.5 sm:p-6 border border-emerald-500/20 shadow-md">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2 sm:space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
              <Sprout className="size-3 text-emerald-400" />
              Akwa Ibom Agro Marketplace
            </div>

            <h1 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
              Register as an{' '}
              <span className="text-emerald-400">Agro Merchant</span>
            </h1>

            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed">
              Join verified farmers, fish breeders, poultry producers, and agro dealers across all 31 LGAs.
            </p>

            {/* Value Props — 2-col on mobile, 4-col on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pt-0.5">
              {[
                { icon: MapPin, label: '31 LGAs Hub', sub: 'Hyperlocal' },
                { icon: ShieldCheck, label: 'Verified Badge', sub: 'Build trust' },
                { icon: TrendingUp, label: 'Zero Fees', sub: 'Keep 100%' },
                { icon: Truck, label: 'Logistics', sub: 'State-wide' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-center">
                  <Icon className="size-3 text-emerald-400 mx-auto mb-0.5" />
                  <p className="font-black text-[10px] sm:text-[11px] text-white leading-tight">{label}</p>
                  <p className="text-[9px] sm:text-[10px] text-white/60 leading-none mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main 7-Step Onboarding Wizard */}
        <SellerOnboardingWizard />
      </div>
    </div>
  );
}
