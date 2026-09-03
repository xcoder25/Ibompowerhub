'use client';

import React from 'react';
import Link from 'next/link';
import { SellerOnboardingWizard } from '@/components/seller-onboarding/onboarding-wizard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sprout,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Truck,
  TrendingUp,
  Sparkles,
  Store,
} from 'lucide-react';

export default function BecomeSellerPage() {
  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-20 relative overflow-hidden">
      {/* Background Ambience & Gradient Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 right-10 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-[450px] h-[450px] rounded-full bg-amber-500/10 blur-[130px]" />
        <div className="absolute bottom-10 right-1/3 w-[350px] h-[350px] rounded-full bg-teal-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            href="/market"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span>Back to AgroConnect Marketplace</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/seller/application">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs font-bold h-9 border-slate-200 dark:border-slate-800"
              >
                Track Existing Application
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 border border-emerald-500/20 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black uppercase tracking-widest">
              <Sprout className="size-3.5 text-emerald-400" />
              Akwa Ibom Agro Marketplace
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Register as an <span className="text-emerald-400">Agro Merchant</span> in Akwa Ibom State
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl font-medium">
              Join thousands of farmers, fish breeders, poultry producers, processors, and agro-input dealers across all 31 Local Government Areas. Connect directly with households, restaurants, and wholesale buyers.
            </p>

            {/* Value Props Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <MapPin className="size-4 text-emerald-400 mx-auto mb-1" />
                <p className="font-black text-xs text-white">31 LGAs Hub</p>
                <p className="text-[10px] text-white/60">Hyperlocal search</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <ShieldCheck className="size-4 text-emerald-400 mx-auto mb-1" />
                <p className="font-black text-xs text-white">Verified Badge</p>
                <p className="text-[10px] text-white/60">Build buyer trust</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <TrendingUp className="size-4 text-emerald-400 mx-auto mb-1" />
                <p className="font-black text-xs text-white">Zero Broker Fee</p>
                <p className="text-[10px] text-white/60">Keep 100% of profit</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-center">
                <Truck className="size-4 text-emerald-400 mx-auto mb-1" />
                <p className="font-black text-xs text-white">Dispatch Logistics</p>
                <p className="text-[10px] text-white/60">State-wide delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main 7-Step Onboarding Wizard */}
        <SellerOnboardingWizard />
      </div>
    </div>
  );
}
