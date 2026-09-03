'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Wallet,
  Plus,
  Send,
  History,
  Wifi,
  Eye,
  EyeOff,
  Copy,
  Check,
  CreditCard,
  PiggyBank,
  Zap,
  Building2,
  Plane,
  QrCode,
  ShieldCheck,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  Store,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { WalletLock } from '@/components/wallet/wallet-lock';
import { NearbyAirSend } from '@/components/wallet/nearby-airsend';
import {
  WalletData,
  Transaction,
  generateDVA,
  formatNaira,
} from '@/lib/wallet-utils';

export default function WalletDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [airsendOpen, setAirsendOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Load wallet document
  const walletDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
    [firestore, user]
  );
  const { data: walletData } = useDoc<WalletData>(walletDocRef);

  const balance = walletData?.balance || 0;
  const userName = user?.displayName || 'Ibom Citizen';
  const userPhone = user?.phoneNumber || '';
  const dva = walletData?.dva || generateDVA(userName, userPhone);

  // Fetch only the latest 3 transactions for the mobile snippet
  useEffect(() => {
    if (!user || !firestore) {
      // Demo fallback transactions
      setRecentTxns([
        {
          id: 't1',
          type: 'credit',
          amount: 25000,
          description: 'Direct Bank Deposit via Wema DVA',
          category: 'deposit',
          timestamp: new Date(),
        },
        {
          id: 't2',
          type: 'debit',
          amount: 6000,
          description: 'Transfer to Anietie Udoh (OPay)',
          category: 'transfer',
          timestamp: new Date(Date.now() - 3600000 * 3),
        },
        {
          id: 't3',
          type: 'debit',
          amount: 3500,
          description: 'IBEDC Electricity Bill Token',
          category: 'bill',
          timestamp: new Date(Date.now() - 86400000),
        },
      ]);
      return;
    }

    const txnsRef = collection(firestore, 'wallets', user.uid, 'transactions');
    const q = query(txnsRef, orderBy('timestamp', 'desc'), limit(3));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Transaction[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            ...data,
            timestamp: data.timestamp?.toDate?.() || new Date(),
          } as Transaction);
        });
        setRecentTxns(list);
      },
      (err) => console.error('Error fetching recent transactions:', err)
    );

    return () => unsubscribe();
  }, [user, firestore]);

  const handleCopyDVA = () => {
    navigator.clipboard.writeText(dva.account_number);
    setCopied(true);
    toast({
      title: 'Account Number Copied!',
      description: `${dva.account_number} (${dva.bank_name}) copied to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  if (isLocked) {
    return <WalletLock onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-24 selection:bg-emerald-500/20">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 right-0 w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-4 sm:pt-6 space-y-5">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-black text-base flex items-center justify-center shadow-md shadow-emerald-500/20 border border-white/20 flex-shrink-0">
              {userName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-black text-slate-900 dark:text-white leading-none">
                  Hi, {userName.split(' ')[0]}
                </h1>
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[9px] font-black uppercase px-1.5 py-0 border-none">
                  Tier 2
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Akwa Ibom State Citizen Wallet</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLocked(true)}
              className="size-9 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-xs transition-colors"
              title="Lock Wallet"
            >
              <Lock className="size-4" />
            </button>
          </div>
        </div>

        {/* Hero Balance Card (OPay / Moniepoint Inspired Luxury Obsidian & Emerald) */}
        <div className="relative rounded-[2rem] bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-5 sm:p-6 shadow-2xl border border-emerald-500/25 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            {/* Balance Label & Eye */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300 font-medium tracking-wide">
                  Available Wallet Balance
                </span>
                <button
                  type="button"
                  onClick={() => setShowBalance(!showBalance)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {showBalance ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>

              <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="size-3" /> BVN Protected
              </span>
            </div>

            {/* Naira Amount */}
            <div className="flex items-baseline gap-1">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-headline">
                {showBalance ? formatNaira(balance) : '₦ ••••••••'}
              </h2>
            </div>

            {/* Dedicated Account Strip (DVA) with 1-click Copy */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] font-bold flex-shrink-0">
                  DVA
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/50 uppercase font-bold tracking-wider leading-none">
                    Wema Bank
                  </p>
                  <p className="text-xs font-mono font-bold text-emerald-300 truncate mt-0.5">
                    {dva.account_number}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyDVA}
                className="flex items-center gap-1 text-[11px] font-bold bg-white/10 hover:bg-white/20 active:scale-95 text-white px-2.5 py-1 rounded-xl transition-all"
              >
                {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* The Big 4 Primary Action Buttons (Thumb-Friendly Fintech Grid) */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* 1. Add Money / Deposit */}
          <Link href="/wallet/deposit" className="group">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1.5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all active:scale-95">
              <div className="size-11 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Plus className="size-6 stroke-[2.5]" />
              </div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Add Money
              </span>
            </div>
          </Link>

          {/* 2. Send Money / Transfer */}
          <Link href="/wallet/transfer" className="group">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1.5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all active:scale-95">
              <div className="size-11 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <Send className="size-5" />
              </div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                Transfer
              </span>
            </div>
          </Link>

          {/* 3. Transaction History */}
          <Link href="/wallet/transactions" className="group">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-1.5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all active:scale-95">
              <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <History className="size-5" />
              </div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                History
              </span>
            </div>
          </Link>

          {/* 4. AirSend (Nearby P2P) */}
          <button
            type="button"
            onClick={() => setAirsendOpen(true)}
            className="group text-center w-full"
          >
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all active:scale-95">
              <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-sm group-hover:scale-105 transition-transform">
                <Wifi className="size-5" />
              </div>
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                AirSend
              </span>
            </div>
          </button>
        </div>

        {/* Service Hub Grid (Clean 4-column Nigerian Fintech Grid) */}
        <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Services & Utilities
              </h3>
              <span className="text-[10px] text-emerald-600 font-bold">ARISE Ecosystem</span>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-1">
              {/* Pay Bills */}
              <Link href="/pay-bills" className="text-center group">
                <div className="size-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Zap className="size-5" />
                </div>
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1.5 truncate">
                  Pay Bills
                </span>
              </Link>

              {/* Virtual Cards */}
              <Link href="/wallet/cards" className="text-center group">
                <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <CreditCard className="size-5" />
                </div>
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1.5 truncate">
                  Cards
                </span>
              </Link>

              {/* Savings Vault */}
              <Link href="/wallet/vault" className="text-center group">
                <div className="size-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <PiggyBank className="size-5" />
                </div>
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1.5 truncate">
                  Vault (12%)
                </span>
              </Link>

              {/* Agro Market */}
              <Link href="/market" className="text-center group">
                <div className="size-12 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Store className="size-5" />
                </div>
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1.5 truncate">
                  Agro Pay
                </span>
              </Link>

              {/* Ibom Air Flights */}
              <Link href="/flights" className="text-center group">
                <div className="size-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Plane className="size-5" />
                </div>
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1.5 truncate">
                  Ibom Air
                </span>
              </Link>

              {/* State Taxes / Levies */}
              <Link href="/government" className="text-center group">
                <div className="size-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <Building2 className="size-5" />
                </div>
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1.5 truncate">
                  State Taxes
                </span>
              </Link>

              {/* QR Receive */}
              <Link href="/wallet/deposit" className="text-center group">
                <div className="size-12 rounded-2xl bg-cyan-500/10 text-cyan-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <QrCode className="size-5" />
                </div>
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1.5 truncate">
                  QR Cash-In
                </span>
              </Link>

              {/* Civic Reports */}
              <Link href="/report" className="text-center group">
                <div className="size-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                  <FileText className="size-5" />
                </div>
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-200 mt-1.5 truncate">
                  Civil Report
                </span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions Mobile Snippet (Strictly Top 3) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Recent Transactions
            </h3>
            <Link
              href="/wallet/transactions"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              See All <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {recentTxns.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-bold">
                  No recent transactions yet
                </div>
              ) : (
                recentTxns.map((txn) => (
                  <div key={txn.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`size-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                          txn.type === 'credit'
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {txn.type === 'credit' ? (
                          <ArrowDownLeft className="size-4" />
                        ) : (
                          <ArrowUpRight className="size-4" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {txn.description}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {txn.timestamp
                            ? new Date(txn.timestamp).toLocaleDateString('en-NG', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Recent'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 ml-3">
                      <p
                        className={`font-black text-xs ${
                          txn.type === 'credit'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {txn.type === 'credit' ? '+' : '-'}
                        {formatNaira(txn.amount)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Dedicated Full History CTA Button */}
          <Link href="/wallet/transactions" className="block pt-1">
            <Button
              variant="outline"
              className="w-full rounded-2xl h-11 text-xs font-bold border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5"
            >
              <span>View Full Transaction History</span>
              <ArrowRight className="size-3.5 text-slate-400" />
            </Button>
          </Link>
        </div>
      </div>

      {/* AirSend Component */}
      <NearbyAirSend
        open={airsendOpen}
        onOpenChange={setAirsendOpen}
        currentBalance={balance}
      />
    </div>
  );
}
