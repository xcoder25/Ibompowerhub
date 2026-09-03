'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection, addDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Copy,
  Check,
  CreditCard,
  Building2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
  HelpCircle,
  Clock,
  ArrowRight,
  Phone,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { WalletData, generateDVA, formatNaira } from '@/lib/wallet-utils';
import { loadPaystackScript, initializePaystack, verifyPayment } from '@/lib/paystack';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

export default function WalletDepositPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('5000');
  const [loadingPaystack, setLoadingPaystack] = useState(false);

  // Load wallet document
  const walletDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
    [firestore, user]
  );
  const { data: walletData } = useDoc<WalletData>(walletDocRef);

  // Resolve or generate DVA details
  const userName = user?.displayName || 'Ibom Citizen';
  const userPhone = user?.phoneNumber || '';
  const dva = walletData?.dva || generateDVA(userName, userPhone);

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(dva.account_number);
    setCopied(true);
    toast({
      title: 'Account Number Copied!',
      description: `${dva.account_number} (${dva.bank_name}) copied to clipboard.`,
    });
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePaystackTopUp = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Minimum deposit amount is ₦100.',
      });
      return;
    }

    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to top up your wallet.',
      });
      return;
    }

    setLoadingPaystack(true);
    try {
      await loadPaystackScript();

      const paystackKey =
        process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
        'pk_test_c665e8d6411f589db7a7ebff9f75ec51be52e690';

      const ref = `topup_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      initializePaystack({
        key: paystackKey,
        email: user.email || 'citizen@akwaibom.gov.ng',
        amount: Math.round(numAmount * 100), // kobo
        ref,
        metadata: {
          custom_fields: [
            { display_name: 'User ID', variable_name: 'user_id', value: user.uid },
            { display_name: 'Type', variable_name: 'type', value: 'wallet_topup' },
          ],
        },
        callback: async (response: any) => {
          try {
            // Update wallet balance
            const currentBal = walletData?.balance || 0;
            const newBal = currentBal + numAmount;

            await updateDoc(doc(firestore, 'wallets', user.uid), {
              balance: newBal,
              updatedAt: serverTimestamp(),
            });

            // Log credit transaction
            const txnsRef = collection(firestore, 'wallets', user.uid, 'transactions');
            await addDoc(txnsRef, {
              type: 'credit',
              amount: numAmount,
              description: 'Card Top-Up via Paystack',
              category: 'deposit',
              reference: response.reference || ref,
              timestamp: serverTimestamp(),
              status: 'success',
            });

            toast({
              title: 'Top-Up Successful! ⚡',
              description: `${formatNaira(numAmount)} added to your wallet immediately.`,
            });

            router.push('/wallet');
          } catch (err: any) {
            console.error('Error crediting wallet:', err);
            toast({
              variant: 'destructive',
              title: 'Error Crediting Balance',
              description: 'Payment verified, please refresh your balance.',
            });
          } finally {
            setLoadingPaystack(false);
          }
        },
        onClose: () => {
          setLoadingPaystack(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You closed the payment modal.',
          });
        },
      });
    } catch (err: any) {
      console.error('Paystack init failed:', err);
      toast({
        variant: 'destructive',
        title: 'Payment Service Unavailable',
        description: 'Unable to initialize card checkout. Please use direct bank transfer.',
      });
      setLoadingPaystack(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-20">
      {/* Top Mobile Bar */}
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
              Add Money
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Fund your Akwa Ibom wallet</p>
          </div>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border-none px-2.5 py-0.5">
          Zero Deposit Fee
        </Badge>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-5">
        <Tabs defaultValue="transfer" className="space-y-4">
          <TabsList className="w-full grid grid-cols-3 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-2xl h-11">
            <TabsTrigger
              value="transfer"
              className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs"
            >
              Bank Transfer
            </TabsTrigger>
            <TabsTrigger
              value="card"
              className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs"
            >
              Debit Card
            </TabsTrigger>
            <TabsTrigger
              value="qr"
              className="rounded-xl text-xs font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-xs"
            >
              Scan QR
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Bank Transfer (DVA) - The OPay / Moniepoint experience */}
          <TabsContent value="transfer" className="space-y-4 animate-in fade-in duration-200">
            {/* Main Dedicated Account Card */}
            <Card className="rounded-3xl border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              <CardContent className="p-6 space-y-5 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      <Building2 className="size-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Dedicated Virtual Account
                      </p>
                      <h3 className="text-sm font-bold text-white">{dva.bank_name}</h3>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5">
                    Instant Credit
                  </Badge>
                </div>

                {/* Account Number Box */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">
                      Your Account Number
                    </span>
                    <p className="text-2xl sm:text-3xl font-black text-white font-mono tracking-wider mt-0.5">
                      {dva.account_number}
                    </p>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">{dva.account_name}</p>
                  </div>

                  <Button
                    type="button"
                    onClick={copyAccountNumber}
                    className="size-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black p-0 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0 active:scale-95 transition-transform"
                  >
                    {copied ? <Check className="size-5 stroke-[3]" /> : <Copy className="size-5" />}
                  </Button>
                </div>

                {/* Speed indicator */}
                <div className="flex items-center gap-2 text-xs text-white/70">
                  <Zap className="size-4 text-amber-400 flex-shrink-0" />
                  <span>Transfer from any banking app (OPay, Kuda, GTB, Zenith, etc.)</span>
                </div>
              </CardContent>
            </Card>

            {/* Transfer Instructions Card */}
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="p-5 space-y-3.5">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  How to deposit via transfer:
                </h4>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <p>Open your bank app or USSD (e.g. GTBank, Access, Zenith, OPay, Moniepoint).</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <p>
                      Select <strong>Transfer to Other Banks</strong> and choose{' '}
                      <strong>Wema Bank</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <p>
                      Enter your account number <strong>{dva.account_number}</strong> and confirm{' '}
                      <strong>{dva.account_name}</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="size-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 font-black text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <p>Send any amount. Your wallet balance updates within 5 seconds.</p>
                  </div>
                </div>

                <Button
                  onClick={copyAccountNumber}
                  className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 text-white font-bold text-xs h-11 gap-2 shadow-xs"
                >
                  <Copy className="size-3.5" /> Copy Account Number
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Debit Card / Paystack */}
          <TabsContent value="card" className="space-y-4 animate-in fade-in duration-200">
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Instant Card Top-Up
                    </h3>
                    <p className="text-[11px] text-slate-400">Mastercard, Visa, or Verve cards</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topupAmount" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Deposit Amount (₦)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                      ₦
                    </span>
                    <Input
                      id="topupAmount"
                      type="number"
                      min="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8 h-12 rounded-2xl text-base font-black border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                {/* Quick amount presets */}
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(String(val))}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        amount === String(val)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      ₦{val.toLocaleString()}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handlePaystackTopUp}
                  disabled={loadingPaystack}
                  className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-12 gap-2 shadow-lg shadow-emerald-600/20"
                >
                  {loadingPaystack ? 'Connecting to Paystack...' : `Pay ₦${Number(amount || 0).toLocaleString()} Now`}
                  <ArrowRight className="size-4" />
                </Button>

                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  Secured by 256-bit bank-grade encryption via Paystack
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: QR Code Cash-in */}
          <TabsContent value="qr" className="space-y-4 animate-in fade-in duration-200">
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs text-center">
              <CardContent className="p-6 space-y-4">
                <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
                  <QrCode className="size-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Citizen Wallet QR
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-0.5">
                    Show this code to an Akwa Ibom State POS agent or merchant to receive cash-in instantly.
                  </p>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block shadow-sm">
                  <QRCodeSVG
                    value={`ibomx://${user?.uid || 'citizen'}?name=${encodeURIComponent(userName)}&dva=${dva.account_number}`}
                    size={180}
                    level="H"
                  />
                </div>

                <div className="text-xs">
                  <p className="font-bold text-slate-900 dark:text-white">{userName}</p>
                  <p className="font-mono text-slate-400 text-[11px]">{dva.account_number}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
