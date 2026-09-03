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
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-24 overflow-x-hidden">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-amber-500/8 blur-[80px]" />
      </div>

      {/* Sticky Native Mobile Navigation Bar */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-3.5 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href="/market"
            className="size-8 sm:size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-none">
              Seller Registration
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Akwa Ibom AgroConnect Hub</p>
          </div>
        </div>

        <Link href="/seller/application">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-[11px] font-bold h-7 sm:h-8 border-slate-200 dark:border-slate-800 px-2.5 sm:px-3"
          >
            Track Status
          </Button>
        </Link>
      </div>

      <div className="relative z-10 max-w-md sm:max-w-2xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6 space-y-3.5 sm:space-y-5">
        {/* Mobile Quick Banner (clean, compact, doesn't push form down) */}
        <div className="sm:hidden flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border border-emerald-500/20 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sprout className="size-3.5" />
            </div>
            <div>
              <p className="font-black text-xs text-white leading-none">Akwa Ibom Agro Marketplace</p>
              <p className="text-[10px] text-emerald-400 mt-0.5 font-medium">State-wide 31 LGAs Merchant Access</p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-md">
            Verified
          </span>
        </div>

        {/* Desktop Hero Banner (shown on sm+ screens) */}
        <div className="hidden sm:block relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 border border-emerald-500/20 shadow-md">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
              <Sprout className="size-3 text-emerald-400" />
              Akwa Ibom Agro Marketplace
            </div>

            <h1 className="text-2xl font-black tracking-tight leading-snug">
              Register as an{' '}
              <span className="text-emerald-400">Agro Merchant</span>
            </h1>

            <p className="text-slate-300 text-xs leading-relaxed">
              Join verified farmers, fish breeders, poultry producers, and agro dealers across all 31 LGAs.
            </p>

            {/* Value Props — 4-col on desktop */}
            <div className="grid grid-cols-4 gap-2 pt-0.5">
              {[
                { icon: MapPin, label: '31 LGAs Hub', sub: 'Hyperlocal' },
                { icon: ShieldCheck, label: 'Verified Badge', sub: 'Build trust' },
                { icon: TrendingUp, label: 'Zero Fees', sub: 'Keep 100%' },
                { icon: Truck, label: 'Logistics', sub: 'State-wide' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-center">
                  <Icon className="size-3 text-emerald-400 mx-auto mb-0.5" />
                  <p className="font-black text-[11px] text-white leading-tight">{label}</p>
                  <p className="text-[10px] text-white/60 leading-none mt-0.5">{sub}</p>
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
