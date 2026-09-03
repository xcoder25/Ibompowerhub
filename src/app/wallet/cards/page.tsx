'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft,
  CreditCard,
  Eye,
  EyeOff,
  Snowflake,
  ShieldCheck,
  Zap,
  Lock,
  Plus,
} from 'lucide-react';
import { useUser } from '@/firebase';

export default function WalletCardsPage() {
  const { user } = useUser();
  const [showDetails, setShowDetails] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);

  const cardHolder = (user?.displayName || 'IBOM CITIZEN').toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-20">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/wallet"
            className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-base font-black text-slate-900 dark:text-white leading-none">
              Virtual Cards
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Online payments & subscriptions</p>
          </div>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border-none px-2.5 py-0.5">
          {isFrozen ? 'Card Frozen' : 'Active Card'}
        </Badge>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-6">
        {/* 3D Virtual Card */}
        <div
          className={`relative h-56 rounded-[2rem] p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 ${
            isFrozen
              ? 'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 opacity-80'
              : 'bg-gradient-to-br from-emerald-900 via-slate-900 to-teal-950 border border-emerald-500/30'
          }`}
        >
          <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top of card */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center font-black text-xs">
                IX
              </div>
              <span className="text-xs font-black tracking-widest text-emerald-300">
                IBOM X VIRTUAL
              </span>
            </div>
            <span className="font-black text-sm italic tracking-wider">Mastercard</span>
          </div>

          {/* Card Number */}
          <div className="relative z-10 py-2">
            <p className="font-mono text-xl sm:text-2xl font-bold tracking-widest">
              {showDetails ? '5399 4120 8831 9042' : '•••• •••• •••• 9042'}
            </p>
          </div>

          {/* Bottom of card */}
          <div className="flex items-end justify-between relative z-10 text-xs">
            <div>
              <span className="text-[9px] text-white/50 uppercase font-bold tracking-wider">
                Cardholder
              </span>
              <p className="font-bold tracking-wide truncate max-w-[180px]">{cardHolder}</p>
            </div>

            <div className="flex gap-4 text-right">
              <div>
                <span className="text-[9px] text-white/50 uppercase font-bold">Expires</span>
                <p className="font-mono font-bold">{showDetails ? '09/29' : '••/••'}</p>
              </div>
              <div>
                <span className="text-[9px] text-white/50 uppercase font-bold">CVV</span>
                <p className="font-mono font-bold">{showDetails ? '482' : '•••'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card Controls */}
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-5 space-y-4 text-xs">
            {/* Reveal toggle */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {showDetails ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Show Card Details</p>
                  <p className="text-[11px] text-slate-400">Reveal full card number & CVV</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="rounded-xl h-8 text-xs font-bold"
              >
                {showDetails ? 'Hide' : 'Reveal'}
              </Button>
            </div>

            {/* Freeze toggle */}
            <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                  <Snowflake className="size-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Freeze Card</p>
                  <p className="text-[11px] text-slate-400">Instantly block all card transactions</p>
                </div>
              </div>
              <Switch checked={isFrozen} onCheckedChange={setIsFrozen} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
