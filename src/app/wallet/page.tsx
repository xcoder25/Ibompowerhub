'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { processVoiceBankingIntent } from '@/ai/flows/voice-banking-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  CreditCard,
  Smartphone,
  Banknote,
  History,
  TrendingUp,
  DollarSign,
  Send,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Fingerprint,
  Share2,
  Download,
  Filter,
  Loader2,
  Plane,
  RefreshCw,
  ScanLine,
  QrCode,
  Wifi,
  PiggyBank,
  Snowflake,
  Zap,
  AlertTriangle,
  Terminal,
  Clock,
  Shield,
  Activity,
  BarChart2,
  Brain,
  Mic
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { loadPaystackScript, initializePaystack, verifyPayment, resolveBankAccount, createDedicatedAccount } from '@/lib/paystack';
import { Copy, Check, Info } from 'lucide-react';
import { WalletLock } from '@/components/wallet/wallet-lock';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeSVG } from 'qrcode.react';
import { NearbyAirSend } from '@/components/wallet/nearby-airsend';

const NIGERIAN_BANKS = [
  { code: '044', name: 'Access Bank' },
  { code: '050', name: 'Ecobank Nigeria' },
  { code: '070', name: 'Fidelity Bank' },
  { code: '011', name: 'First Bank of Nigeria' },
  { code: '214', name: 'First City Monument Bank' },
  { code: '058', name: 'Guaranty Trust Bank' },
  { code: 'ibomx', name: 'Ibom X Wallet' },
  { code: '082', name: 'Keystone Bank' },
  { code: '100004', name: 'Opay' },
  { code: '100033', name: 'Palmpay' },
  { code: '076', name: 'Polaris Bank' },
  { code: '221', name: 'Stanbic IBTC Bank' },
  { code: '232', name: 'Sterling Bank' },
  { code: '032', name: 'Union Bank of Nigeria' },
  { code: '033', name: 'United Bank for Africa' },
  { code: '215', name: 'Unity Bank' },
  { code: '035', name: 'Wema Bank' },
  { code: '057', name: 'Zenith Bank' },
];

type WalletData = {
  balance: number;
  currency: string;
  dva?: {
    account_number: string;
    account_name: string;
    bank_name: string;
  };
  isCardFrozen?: boolean;
};

type Vault = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  createdAt: Date;
};

type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  reference?: string;
  isSimulated?: boolean;
};

type KycData = {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  bvnVerified?: boolean;
  identityVerified?: boolean;
  addressVerified?: boolean;
  faceVerified?: boolean;
};

// Orion SuperAI Engine (Wallet Edition) ───────────────────────────────────
const OrionAIEngine = {
  getFinancialHealth(balance: number, txns: any[]) {
    const savingsRate = Math.min(100, (balance / 500000) * 100);
    const riskIndex = txns.length > 10 ? 12 : 5;
    return {
      score: Math.round(75 + (balance / 100000)),
      savingsRate: Math.round(savingsRate),
      riskIndex,
      status: balance > 50000 ? 'EXCELLENT' : 'STABLE'
    };
  }
};

const OrionVoice = {
  speak(text: string, urgent = false, onDone?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const best = voices.find(v => v.name.toLowerCase().includes('female') || v.name.includes('Aria'))
      || voices.find(v => v.lang.startsWith('en')) || null;
    if (best) utt.voice = best;
    utt.pitch = urgent ? 0.9 : 1.1;
    utt.rate = 1.0;
    utt.onend = () => { if (onDone) onDone(); };
    window.speechSynthesis.speak(utt);
  },
  isSpeaking() {
    return typeof window !== 'undefined' && window.speechSynthesis.speaking;
  }
};

export default function WalletPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('wallet_unlocked') === 'true';
    }
    return false;
  });

  const handleUnlock = () => {
    setIsUnlocked(true);
    sessionStorage.setItem('wallet_unlocked', 'true');
  };

  // Transfer states
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [securityPin, setSecurityPin] = useState('');
  const [isPinSetup, setIsPinSetup] = useState(false);

  // Simulator for Starter/Test mode
  const [showSimulatePrompt, setShowSimulatePrompt] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [isCreatingDva, setIsCreatingDva] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isIbomAskModalOpen, setIsIbomAskModalOpen] = useState(false);
  const [scanTab, setScanTab] = useState<'scan' | 'my-qr'>('scan');
  const [isAirSendOpen, setIsAirSendOpen] = useState(false);

  // Rate limit scanner errors so it doesn't flood the UI
  const lastScanErrorTime = useRef(0);

  // Vault/Card states
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isCreateVaultOpen, setIsCreateVaultOpen] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTarget, setNewVaultTarget] = useState('');
  const [isCreatingVault, setIsCreatingVault] = useState(false);
  const [orionListening, setOrionListening] = useState(false);
  const [orionThinking, setOrionThinking] = useState(false);
  const [orionMessage, setOrionMessage] = useState('');
  const [orionContext, setOrionContext] = useState<{ task: string; data: any } | null>(null);
  const [voiceFocus, setVoiceFocus] = useState<'amount' | 'account' | 'bank' | null>(null);

  const recognitionInstance = useRef<any>(null);


  const [topUpVaultId, setTopUpVaultId] = useState<string | null>(null);
  const [vaultTopUpAmount, setVaultTopUpAmount] = useState('');
  const [isToppingUp, setIsToppingUp] = useState(false);

  const walletDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
    [firestore, user]
  );

  const { data: walletData, isLoading } = useDoc<WalletData>(walletDocRef);

  const kycDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'kyc', user.uid) : null),
    [firestore, user]
  );
  const { data: kycData, isLoading: isKycLoading } = useDoc<KycData>(kycDocRef);

  const isKycComplete = kycData &&
    (user?.emailVerified || kycData.emailVerified) &&
    kycData.phoneVerified &&
    kycData.bvnVerified &&
    kycData.identityVerified &&
    kycData.addressVerified &&
    kycData.faceVerified;

  // ── Proactive AI Briefing ──
  useEffect(() => {
    if (isUnlocked && !isLoading && walletData) {
      const timer = setTimeout(() => {
        const health = OrionAIEngine.getFinancialHealth(walletData.balance, transactions);
        const greeting = `Welcome back. ARISE Shield v2.0 is at peak efficiency. Your financial health score is ${health.score}. I have optimized your saving protocols for today.`;
        OrionVoice.speak(greeting);
        setOrionMessage(greeting);
        setTimeout(() => setOrionMessage(''), 10000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isUnlocked, isLoading, !!walletData]);

  // Load Paystack script
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_public_key_placeholder';

    // Always attempt to load Paystack script for testing
    loadPaystackScript(publicKey)
      .then(() => {
        setPaystackLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load Paystack:', error);
      });
  }, [toast]);

  // Initialize wallet if it doesn't exist
  useEffect(() => {
    if (user && firestore && !walletData && !isLoading) {
      const initWallet = async () => {
        try {
          const walletRef = doc(firestore, 'wallets', user.uid);
          const walletSnap = await getDoc(walletRef);

          if (!walletSnap.exists()) {
            console.log('Creating new wallet for user...');
            await setDoc(walletRef, {
              balance: 0, // Start at 0 for production
              currency: 'NGN',
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error('Error checking/initializing wallet:', error);
        }
      };
      initWallet();
    }
  }, [user, firestore, walletData, isLoading]);

  // Auto-generate DVA if KYC is complete and DVA is missing
  useEffect(() => {
    if (isKycComplete && !walletData?.dva && !isCreatingDva && !isLoading) {
      console.log('KYC Complete but DVA missing. Auto-triggering generation...');
      handleCreateDva();
    }
  }, [isKycComplete, walletData?.dva, isCreatingDva, isLoading]);
  useEffect(() => {
    if (!user || !firestore) return;

    const transactionsRef = collection(firestore, 'wallets', user.uid, 'transactions');
    const q = query(transactionsRef, orderBy('timestamp', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txns: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        txns.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date()
        } as Transaction);
      });
      setTransactions(txns);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  // Fetch Vaults
  useEffect(() => {
    if (!user || !firestore) return;

    const vaultsRef = collection(firestore, 'wallets', user.uid, 'vaults');
    const q = query(vaultsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const v: Vault[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        v.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as Vault);
      });
      setVaults(v);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
    toast({ title: 'Copy Confirmed', description: 'Account number copied safely.' });
  };

  const handleCreateDva = async () => {
    if (!user || !firestore || !walletDocRef) return;

    setIsCreatingDva(true);
    try {
      const names = user.displayName?.split(' ') || ['PowerHub', 'User'];
      const result = await createDedicatedAccount(window.location.origin, {
        email: user.email || `${user.uid}@powerhub.com`,
        firstName: names[0],
        lastName: names.slice(1).join(' ') || 'User',
      });

      if (result.status) {
        const dvaInfo = result.data.bank;
        const dvaData = {
          account_number: result.data.account_number,
          account_name: result.data.account_name,
          bank_name: dvaInfo.name,
        };

        await updateDoc(walletDocRef, { dva: dvaData });
        toast({ title: 'Ibom X Account Active', description: 'Your direct top-up account is now ready.' });
      }
    } catch (error: any) {
      console.error('DVA Creation failed:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setIsCreatingDva(false);
    }
  };

  const handleResolveAccount = async () => {
    if (!recipientAccount || !recipientBank) return;

    setIsResolving(true);
    try {
      const result = await resolveBankAccount(window.location.origin, recipientAccount, recipientBank);
      if (result.status) {
        setRecipientName(result.data.account_name);
        toast({ title: 'Account Verified', description: `Recipient: ${result.data.account_name}` });
      }
    } catch (error: any) {
      console.error('Resolution failed:', error);
      setRecipientName('');
      toast({ variant: 'destructive', title: 'Resolution Failed', description: 'Could not verify account details.' });
    } finally {
      setIsResolving(false);
    }
  };

  // Debounced realtime verification
  useEffect(() => {
    if (recipientAccount.length >= 10 && recipientBank.length >= 3) {
      if (recipientBank.toLowerCase().includes('ibom')) {
        setRecipientName('Ibom X User');
        return;
      }

      const timeoutId = setTimeout(() => {
        handleResolveAccount();
      }, 700);

      return () => clearTimeout(timeoutId);
    } else {
      setRecipientName('');
    }
  }, [recipientAccount, recipientBank]);

  const handleAddDemoFunds = async (demoAmount: number) => {
    if (!user || !firestore || !walletDocRef) return;

    setIsAddingFunds(true);
    try {
      const currentBalance = walletData?.balance || 0;
      await setDoc(walletDocRef, { balance: currentBalance + demoAmount }, { merge: true });

      await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
        type: 'credit',
        amount: demoAmount,
        description: 'Demo Credit Top-up',
        timestamp: serverTimestamp(),
        reference: `DEMO-${Date.now()}`
      });

      setIsAddingFunds(false);
    } catch (error) {
      console.error('Demo top-up failed:', error);
      setIsAddingFunds(false);
    }
  };

  const addFunds = async () => {
    if (!amount || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Missing required information.'
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.'
      });
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    const userEmail = user.email || 'user@powerhub.com';

    console.log('--- Paystack Initialization Check ---');
    console.log('Public Key found:', !!publicKey);
    console.log('User Email:', userEmail);
    console.log('Amount (kobo):', numAmount * 100);

    if (!publicKey) {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'The payment gateway key is not loaded. Please try again later or contact support.'
      });
      return;
    }

    setIsAddingFunds(true);

    // Ensure Paystack is loaded and active
    if (typeof window !== 'undefined' && !window.PaystackPop) {
      console.log('PaystackPop not found on window, attempting to load script...');
      try {
        await loadPaystackScript(publicKey);
        setPaystackLoaded(true);
        console.log('Paystack script loaded successfully.');
      } catch (error) {
        console.error('Payment script load error:', error);
        setIsAddingFunds(false);
        toast({
          variant: 'destructive',
          title: 'Script Error',
          description: 'Could not load the payment window. Check your connection or try again.'
        });
        return;
      }
    }

    const reference = `PH${Date.now()}${user.uid.slice(0, 5)}`;

    try {
      console.log('Calling initializePaystack with reference:', reference);

      // Set a timeout to notify user if popup fails to render assets (common with AdBlock/403s)
      const popupTimeout = setTimeout(() => {
        if (isAddingFunds) {
          setIsAddingFunds(false);
          toast({
            variant: 'destructive',
            title: 'Payment Window Error',
            description: 'The payment window failed to load properly. This usually happens if you use a Live Key on localhost or if an ad-blocker is active.'
          });
        }
      }, 8000);

      initializePaystack({
        key: publicKey,
        email: userEmail,
        amount: Math.round(numAmount * 100), // Ensure it's an integer
        ref: reference,
        metadata: {
          userId: user.uid,
          userName: user.displayName || '',
          description: `Wallet top-up: ₦${numAmount}`
        },
        onClose: () => {
          clearTimeout(popupTimeout);
          setIsAddingFunds(false);
          console.log('Paystack popup closed');
        },
        callback: async (response: any) => {
          clearTimeout(popupTimeout);
          try {
            // Verify payment with backend
            const baseUrl = window.location.origin;
            const verifyResult = await verifyPayment(baseUrl, response.reference);

            if (verifyResult.status && verifyResult.data.status === 'success') {
              const verifiedAmount = verifyResult.data.amount / 100; // Convert from kobo

              // Update wallet balance
              const currentBalance = walletData?.balance || 0;
              const newBalance = currentBalance + verifiedAmount;
              await updateDoc(walletDocRef!, { balance: newBalance });

              // Add transaction
              await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
                type: 'credit',
                amount: verifiedAmount,
                description: 'Wallet top-up',
                timestamp: new Date(),
                reference: response.reference
              });

              setAmount('');
              setIsAddingFunds(false);
              toast({
                title: 'Deposit Successful',
                description: `₦${verifiedAmount.toLocaleString()} is now active in your Ibom X balance.`
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            setIsAddingFunds(false);
            toast({
              variant: 'destructive',
              title: 'Verification Error',
              description: 'Payment received but verification failed. Please contact support with reference: ' + response.reference
            });
          }
        },
        // This onClose is duplicated, keeping the first one.
        // onClose: () => {
        //   setIsProcessing(false);
        //   toast({
        //     title: 'Payment Cancelled',
        //     description: 'You cancelled the payment process.'
        //   });
        // }
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
      setIsAddingFunds(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.'
      });
    }
  };

  const withdrawFunds = async () => {
    const isIbomX = recipientBank.toLowerCase().includes('ibom');

    // Intercept Ibom X flow
    if (isIbomX && !recipientAccount) {
      setIsIbomAskModalOpen(true);
      return;
    }

    if (!transferAmount || !user || !firestore || !walletData || !walletDocRef) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all transfer details.'
      });
      return;
    }

    const numAmount = parseFloat(transferAmount);
    if (numAmount <= 0 || numAmount > walletData.balance) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Amount must be greater than 0 and not exceed your balance.'
      });
      return;
    }

    if (!recipientAccount || !recipientBank) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide recipient account number and bank code.'
      });
      return;
    }

    if (isIbomX) {
      // Simulate Ibom X direct transfer logic
      setIsTransferring(true);
      try {
        const newBalance = walletData.balance - numAmount;
        await updateDoc(walletDocRef, { balance: newBalance });

        // 1. Log debit for sender
        await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
          type: 'debit',
          amount: numAmount,
          description: `Internal Transfer to ${recipientAccount}`,
          timestamp: serverTimestamp(),
          reference: `IX-${Date.now()}`,
          status: 'success'
        });

        // 2. Resolve recipient and log credit
        const walletsRef = collection(firestore, 'wallets');
        const qRecipient = query(walletsRef, where('dva.account_number', '==', recipientAccount), limit(1));
        const recipientDocs = await getDocs(qRecipient);

        if (!recipientDocs.empty) {
          const recipientId = recipientDocs.docs[0].id;
          const recipientDataRaw = recipientDocs.docs[0].data();
          const recipientRef = doc(firestore, 'wallets', recipientId);

          // Credit recipient
          await updateDoc(recipientRef, { balance: (recipientDataRaw.balance || 0) + numAmount });

          // Add transaction for recipient
          await addDoc(collection(firestore, 'wallets', recipientId, 'transactions'), {
            type: 'credit',
            amount: numAmount,
            description: `Internal Transfer from ${user.displayName || 'Ibom X User'}`,
            timestamp: serverTimestamp(),
            reference: `IX-REC-${Date.now()}`,
            status: 'success'
          });
        }

        setTransferAmount('');
        setRecipientName('');
        setRecipientAccount('');
        setRecipientBank('');
        setTransferReason('');
        toast({ title: 'Transfer Initiated', description: `₦${numAmount.toLocaleString()} sent instantly via Ibom X.` });
      } catch (err) {
        console.error(err);
        toast({ variant: 'destructive', title: 'Transfer Failed', description: 'Internal failure' });
      } finally {
        setIsTransferring(false);
      }
      return;
    }

    setIsTransferring(true);
    const baseUrl = window.location.origin;

    try {
      // Step 1: Create transfer recipient on Paystack
      const recipientResponse = await fetch(`${baseUrl}/api/paystack/create-recipient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nuban',
          name: recipientName || 'Wallet User',
          account_number: recipientAccount,
          bank_code: recipientBank,
          currency: 'NGN'
        })
      });

      if (!recipientResponse.ok) {
        const errorData = await recipientResponse.json();
        throw new Error(errorData.message || 'Failed to create recipient');
      }

      const recipientData = await recipientResponse.json();
      const recipientCode = recipientData.data.recipient_code;

      // Step 2: Initiate actual transfer
      const transferResponse = await fetch(`${baseUrl}/api/paystack/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'balance',
          amount: numAmount * 100, // kobo
          recipient: recipientCode,
          reason: transferReason || 'Wallet withdrawal',
          reference: `WD-${Date.now()}-${user.uid.slice(0, 5)}`
        })
      });

      if (!transferResponse.ok) {
        const errorData = await transferResponse.json();
        throw new Error(errorData.message || 'Transfer failed');
      }

      const transferData = await transferResponse.json();

      if (transferData.status && (transferData.data.status === 'success' || transferData.data.status === 'pending')) {
        // Update local balance
        const newBalance = walletData.balance - numAmount;
        await updateDoc(walletDocRef, { balance: newBalance });

        // Add transaction
        await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
          type: 'debit',
          amount: numAmount,
          description: `Transfer to ${recipientAccount} - ${transferReason || 'Withdrawal'}`,
          timestamp: serverTimestamp(),
          reference: transferData.data.reference || `WD-${Date.now()}`,
          status: transferData.data.status
        });

        // Reset
        setTransferAmount('');
        setRecipientName('');
        setRecipientAccount('');
        setRecipientBank('');
        setTransferReason('');
        setIsTransferring(false);

        toast({
          title: 'Transfer Initiated',
          description: `₦${numAmount.toLocaleString()} is being sent to the recipient.`
        });
      } else {
        throw new Error(transferData.message || 'Transfer failed');
      }
    } catch (error: any) {
      console.error('Error processing transfer:', error);
      setIsTransferring(false);

      const errorMsg = error.message || '';
      console.log('Transfer Error Received:', errorMsg);

      if (errorMsg.toLowerCase().includes('starter')) {
        setLastError(errorMsg);
        setShowSimulatePrompt(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'Transfer Failed',
          description: errorMsg || 'Payment provider error. Please check your account details.'
        });
      }
    }
  };

  const performSimulatedTransfer = async () => {
    if (!user || !walletData || !recipientAccount) return;
    const numAmount = parseFloat(transferAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    setIsTransferring(true);
    setShowSimulatePrompt(false);

    try {
      const newBalance = walletData.balance - numAmount;
      await updateDoc(walletDocRef!, { balance: newBalance });

      await addDoc(collection(firestore!, 'wallets', user.uid, 'transactions'), {
        type: 'debit',
        amount: numAmount,
        description: `(SIMULATED) Transfer to ${recipientAccount} - ${transferReason || 'Withdrawal'}`,
        timestamp: serverTimestamp(),
        reference: `SIM-${Date.now()}`,
        status: 'success',
        isSimulated: true
      });

      setTransferAmount('');
      setRecipientName('');
      setRecipientAccount('');
      setRecipientBank('');
      setTransferReason('');

      toast({
        title: 'Simulation Successful',
        description: `₦${numAmount.toLocaleString()} deducted in Demo Mode.`
      });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Simulation Error', description: err.message });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleCreateVault = async () => {
    if (!user || !firestore || !newVaultName || !newVaultTarget) return;

    setIsCreatingVault(true);
    try {
      await addDoc(collection(firestore, 'wallets', user.uid, 'vaults'), {
        name: newVaultName,
        targetAmount: parseFloat(newVaultTarget),
        currentAmount: 0,
        createdAt: serverTimestamp()
      });
      setIsCreateVaultOpen(false);
      setNewVaultName('');
      setNewVaultTarget('');
      toast({ title: 'Vault Created', description: `Your ${newVaultName} vault is ready.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create vault.' });
    } finally {
      setIsCreatingVault(false);
    }
  };

  const handleVaultTopUp = async () => {
    if (!user || !firestore || !topUpVaultId || !vaultTopUpAmount || !walletData || !walletDocRef) return;

    const numAmount = parseFloat(vaultTopUpAmount);
    if (numAmount <= 0 || numAmount > walletData.balance) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Amount must be greater than 0 and not exceed balance.' });
      return;
    }

    setIsToppingUp(true);
    try {
      const vaultRef = doc(firestore, 'wallets', user.uid, 'vaults', topUpVaultId);
      const vaultDataRaw = await getDoc(vaultRef);

      if (!vaultDataRaw.exists()) throw new Error('Vault not found');

      const newVaultAmount = (vaultDataRaw.data().currentAmount || 0) + numAmount;
      const newWalletBalance = walletData.balance - numAmount;

      // Update Vault
      await updateDoc(vaultRef, { currentAmount: newVaultAmount });
      // Update Wallet
      await updateDoc(walletDocRef, { balance: newWalletBalance });
      // Log
      await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
        type: 'debit',
        amount: numAmount,
        description: `Vault Top-up: ${vaultDataRaw.data().name}`,
        timestamp: serverTimestamp(),
        reference: `VLT-${Date.now()}`
      });

      setTopUpVaultId(null);
      setVaultTopUpAmount('');
      toast({ title: 'Vault Funded', description: `₦${numAmount.toLocaleString()} added to your vault.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to top up vault.' });
    } finally {
      setIsToppingUp(false);
    }
  };

  const toggleCardFreeze = async () => {
    if (!walletDocRef) return;
    const isFrozen = walletData?.isCardFrozen || false;
    try {
      await updateDoc(walletDocRef, { isCardFrozen: !isFrozen });
      toast({ title: isFrozen ? 'Card Unfrozen' : 'Card Frozen', description: isFrozen ? 'Your card is now active.' : 'Your card has been temporarily disabled.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update card status.' });
    }
  };

  const balance = walletData?.balance || 0;
  const currency = walletData?.currency || 'NGN';

  // Lightweight insights from recent transactions (for UI only)
  const recentInflow = transactions
    .filter((t) => t.type === 'credit')
    .slice(0, 20)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const recentOutflow = transactions
    .filter((t) => t.type === 'debit')
    .slice(0, 20)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netFlow = recentInflow - recentOutflow;

  // ── Orion Voice Banking Logic ──
  const startVoiceBanking = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      toast({ variant: 'destructive', title: 'Not Supported', description: 'Voice recognition not available.' });
      return;
    }

    const recognition = new SpeechRec();
    recognitionInstance.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    recognition.onstart = () => {
      setOrionListening(true);
      setOrionThinking(true);
    };

    recognition.onresult = (event: any) => {
      if (OrionVoice.isSpeaking()) return;

      const results = event.results;
      const latest = results[results.length - 1];
      const transcript = Array.from(results)
        .map((result: any) => result[0].transcript)
        .join('').toLowerCase();
      
      setOrionMessage(transcript);

      // ── Interim Real-time Feedback ──
      const partialNumbers = transcript.match(/\d+/g);
      if (partialNumbers) {
         const latestNum = partialNumbers[partialNumbers.length - 1];

         if (voiceFocus === 'account' || latestNum.length === 10) {
            setRecipientAccount(latestNum);
            if (latestNum.length === 10) setVoiceFocus('bank');
         } else if (voiceFocus === 'amount' || (latestNum.length < 10 && !voiceFocus)) {
            setTransferAmount(latestNum);
            setAmount(latestNum);
         }
      }

      // ── Final Processing ──
      if (latest.isFinal) {
        setOrionThinking(false);
        processConversationalAI(transcript);
      }
    };

    const processConversationalAI = async (cmd: string) => {
      const nextTurn = () => {
        try { recognition.start(); } catch (e) { /* already started */ }
      };

      setOrionThinking(true);
      
      try {
        // ── Gemini Neural Integration ──
        const aiResponse = await processVoiceBankingIntent(cmd, orionContext);
        setOrionThinking(false);

        // 1. Handle AI Generated Confirmation Intents (The AI now decides if "yes" or "no" was intended)
        if ((aiResponse.type as string) === 'confirm') {
           if (aiResponse.isConfirmed && orionContext?.task === 'transfer_confirm') {
              OrionVoice.speak(aiResponse.spokenResponse || 'Transmission sequence active. Executing neural settlement.');
              setOrionContext(null);
              setTimeout(() => {
                performSimulatedTransfer();
                (document.querySelector('[value="manage"]') as HTMLElement)?.click();
              }, 1500);
           } else {
              OrionVoice.speak(aiResponse.spokenResponse || 'Transaction held. Link cleared.');
              setOrionContext(null);
           }
           return;
        }

        // 2. Handle AI Generated Primary Intents
        if (aiResponse.type !== 'unknown') {
          if (aiResponse.type !== 'confirm') {
             OrionVoice.speak(aiResponse.spokenResponse, false, nextTurn);
          }

          if (aiResponse.type === 'transfer') {
            if (aiResponse.amount) { setAmount(aiResponse.amount.toString()); setTransferAmount(aiResponse.amount.toString()); }
            if (aiResponse.recipientAccount) { setRecipientAccount(aiResponse.recipientAccount); }
            if (aiResponse.bank) { setRecipientBank(aiResponse.bank === 'ibom x' ? 'ibomx' : aiResponse.bank.toLowerCase()); }
            
            (document.querySelector('[value="manage"]') as HTMLElement)?.click();
            setOrionContext({ task: 'transfer', data: aiResponse });
            
            if (!aiResponse.amount) setVoiceFocus('amount');
            else if (!aiResponse.recipientAccount) setVoiceFocus('account');
            else if (!aiResponse.bank) setVoiceFocus('bank');
            else setOrionContext({ task: 'transfer_confirm', data: aiResponse });
          } 
          else if (aiResponse.type === 'history') (document.querySelector('[value="history"]') as HTMLElement)?.click();
          else if (aiResponse.type === 'freeze_card') toggleCardFreeze();
          else if (aiResponse.type === 'security') (document.querySelector('[value="security"]') as HTMLElement)?.click();
          else if (aiResponse.type === 'vaults') (document.querySelector('[value="vaults"]') as HTMLElement)?.click();
          else if (aiResponse.type === 'cards') (document.querySelector('[value="cards"]') as HTMLElement)?.click();
          else if (aiResponse.type === 'balance') {
             setIsBalanceVisible(true);
             OrionVoice.speak(aiResponse.spokenResponse);
          }
          
          return;
        }
      } catch (err) {
        console.error("Gemini failed:", err);
      }

      setOrionThinking(false);
      OrionVoice.speak('Neural link steady. Is there anything else you need across the Ibom network?', false, nextTurn);
      setTimeout(() => setOrionMessage(''), 8000);
    };

    recognition.onerror = (e: any) => { 
      if (e.error === 'no-speech') {
        // Just silent, wait for user
        return;
      }
      if (e.error === 'network') {
        OrionVoice.speak('Neural link lost. Attempting to stabilize protocol.');
        setOrionThinking(false);
        setTimeout(() => { if (orionContext) recognition.start(); }, 3000);
      } else {
        setOrionListening(false); 
        setOrionThinking(false); 
      }
    };

    recognition.onend = () => { 
      // Auto-restart if we are in the middle of a vital task and just "ended" due to silence
      if (orionContext) {
        setTimeout(() => {
          try { recognition.start(); } catch (err) { /* ignore */ }
        }, 300);
      } else {
        setOrionListening(false); 
        setOrionThinking(false); 
      }
    };
    recognition.start();
  };

  return (
    <>
      {!isUnlocked && <WalletLock onUnlock={handleUnlock} />}
      <main className="min-h-screen bg-black pb-32 relative overflow-hidden">
        {/* Dynamic Orion Background */}
        <div className="fixed inset-0 bg-black z-0" />
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="wallet-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <line x1="40" y1="0" x2="0" y2="0" stroke="#10b981" strokeWidth="0.5" />
                <line x1="0" y1="0" x2="0" y2="40" stroke="#10b981" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#wallet-grid)" />
          </svg>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-900/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[100px] mix-blend-screen" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] mix-blend-screen" />
        </div>

        <div className="w-full max-w-full mx-auto px-4 sm:px-12 pt-4 sm:pt-12 pb-4 sm:pb-12 flex flex-col gap-5 sm:gap-12 relative z-10 overflow-hidden isolate">
          {/* ── Header ── */}
          <div className="flex items-center justify-between pt-safe pt-2">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/30 shrink-0">
                <Wallet className="size-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-4xl font-black tracking-tight flex items-center gap-1">
                  Ibom <span className="bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent">Pay</span>
                </h1>
                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">Arise Wallet</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-md h-9 w-9 border border-slate-200/60 dark:border-slate-800 shadow-sm active:scale-90 transition-all"
                onClick={() => { if (navigator.vibrate) navigator.vibrate(5); }}
              >
                <Share2 className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              </Button>
              <div className="size-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center overflow-hidden shadow-md border-2 border-white dark:border-slate-900">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="size-full object-cover" />
                ) : (
                  <div className="font-black text-[11px] text-white">{user?.displayName?.[0] || 'U'}</div>
                )}
              </div>
            </div>
          </div>

          {/* ── Premium Wallet Card ── */}
          <div className="relative animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out fill-mode-both">
            {/* Glow behind card */}
            <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/30 via-emerald-400/10 to-indigo-500/20 rounded-[3rem] blur-2xl opacity-60 mix-blend-screen" />

            <div
              className={`relative w-full transition-transform duration-1000 preserve-3d cursor-pointer ${isCardFlipped ? 'rotate-y-180' : ''}`}
              onDoubleClick={(e) => {
                e.preventDefault();
                setIsCardFlipped(!isCardFlipped);
                if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
              }}
            >
              {/* FRONT */}
              <Card className="relative overflow-hidden border border-white/[0.08] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] backface-hidden rounded-[2rem] sm:rounded-[3rem] bg-[#050505] text-white group">
                {/* Holographic foil overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -translate-x-full group-hover:translate-x-full ease-in-out" style={{ transitionProperty: 'transform, opacity' }} />
                
                <CardContent className="p-6 sm:p-10 relative z-10">

                  {/* Top row */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Live Balance</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[30px] sm:text-5xl font-black font-mono tracking-tight leading-none">
                          {isBalanceVisible ? `₦${balance.toLocaleString()}` : '₦ ••••••'}
                        </h2>
                        <div className="flex flex-col gap-1.5 ml-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsBalanceVisible(!isBalanceVisible); }}
                            className="size-7 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 hover:bg-white/20 transition-all"
                          >
                            {isBalanceVisible ? <EyeOff className="size-3.5 text-slate-300" /> : <Eye className="size-3.5 text-slate-300" />}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setScanTab('my-qr'); setIsScanModalOpen(true); }}
                            className="size-7 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
                          >
                            <QrCode className="size-3.5 text-emerald-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Premium</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-50">
                        <RefreshCw className="size-2.5 animate-spin" style={{ animationDuration: '3s' }} />
                        <span className="text-[7px] uppercase font-bold tracking-widest">Tap×2 Flip</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.25em]">Cardholder</p>
                      <p className="text-sm font-bold uppercase tracking-wide truncate max-w-[160px] sm:max-w-xs">{user?.displayName || 'IbomX User'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex -space-x-2">
                        <div className="size-7 rounded-full bg-emerald-500/80 border-2 border-slate-950 flex items-center justify-center">
                          <ShieldCheck className="size-3.5 text-white" />
                        </div>
                        <div className="size-7 rounded-full bg-amber-500/80 border-2 border-slate-950 flex items-center justify-center">
                          <TrendingUp className="size-3.5 text-white" />
                        </div>
                      </div>
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">ARISE Node</p>
                    </div>
                  </div>
                </CardContent>

                {/* Mesh glows */}
                <div className="absolute -top-12 -right-12 size-48 bg-emerald-500/25 blur-[80px] rounded-full" />
                <div className="absolute -bottom-10 -left-10 size-40 bg-indigo-500/15 blur-[70px] rounded-full" />
                <div className="absolute inset-0 opacity-[0.025] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
              </Card>

              {/* BACK */}
              <Card className="absolute inset-0 bg-[#050505] border border-white/[0.08] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] rounded-[2rem] sm:rounded-[3rem] overflow-hidden text-white backface-hidden rotate-y-180 group">
                {/* Holographic foil overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform translate-x-full group-hover:-translate-x-full ease-in-out" style={{ transitionProperty: 'transform, opacity' }} />

                <CardContent className="p-6 sm:p-10 relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Account Info</p>
                      </div>
                      <div className="size-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                        <Banknote className="size-4 text-amber-400" />
                      </div>
                    </div>

                    {walletData?.dva ? (
                      <div className="space-y-4">
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">Account Number</p>
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl sm:text-4xl font-black font-mono tracking-widest text-white drop-shadow-md">{walletData?.dva?.account_number}</h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (walletData?.dva?.account_number) {
                                copyToClipboard(walletData.dva.account_number);
                              }
                            }}
                            className="size-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/15 hover:bg-white/20 transition-all shadow-inner"
                          >
                            {hasCopied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4 text-slate-300" />}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 pt-2">
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{walletData?.dva?.bank_name}</span>
                          <span className="size-1 rounded-full bg-slate-700" />
                          <span className="text-xs text-slate-500">{walletData?.dva?.account_name}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <div className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <Lock className="size-5 text-slate-400" />
                        </div>
                        <p className="text-sm font-bold text-slate-300">KYC Required</p>
                        <p className="text-[10px] text-slate-500 max-w-[180px]">Complete identity sync to unlock direct top-up.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-end pt-4 border-t border-white/[0.08]">
                    <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest">Direct Reserve Node</p>
                    <div className="flex items-center gap-1 opacity-50">
                      <RefreshCw className="size-2.5" />
                      <span className="text-[7px] uppercase font-bold tracking-widest">Tap×2 Return</span>
                    </div>
                  </div>
                </CardContent>
                <div className="absolute top-0 right-0 size-40 bg-amber-500/10 blur-[80px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-0 left-0 size-48 bg-slate-700/20 blur-[80px] rounded-full mix-blend-screen" />
              </Card>
            </div>
          </div>


          {/* ── Quick Actions Pill Bar ── */}
          <div className="bg-[#050505]/80 backdrop-blur-3xl rounded-[1.75rem] border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-700 delay-150 ease-out fill-mode-both">
            <div className="grid grid-cols-6 gap-0 sm:flex sm:overflow-x-auto sm:no-scrollbar">
              {[
                { id: 'topup', icon: Plus, label: 'Add', bg: 'bg-emerald-500/10', hoverBg: 'group-hover:bg-emerald-500/20', icon_color: 'text-emerald-400' },
                { id: 'transfer', icon: Send, label: 'Send', bg: 'bg-white/5', hoverBg: 'group-hover:bg-white/10', icon_color: 'text-slate-200' },
                { id: 'airsend', icon: Wifi, label: 'AirDrop', bg: 'bg-indigo-500/10', hoverBg: 'group-hover:bg-indigo-500/20', icon_color: 'text-indigo-400' },
                { id: 'flights', icon: Plane, label: 'Flights', bg: 'bg-sky-500/10', hoverBg: 'group-hover:bg-sky-500/20', icon_color: 'text-sky-400', href: '/flights' },
                { id: 'bills', icon: Smartphone, label: 'Bills', bg: 'bg-amber-500/10', hoverBg: 'group-hover:bg-amber-500/20', icon_color: 'text-amber-400' },
                { id: 'withdraw', icon: ArrowUpRight, label: 'Cash Out', bg: 'bg-rose-500/10', hoverBg: 'group-hover:bg-rose-500/20', icon_color: 'text-rose-400' },
              ].map((action) => {
                const inner = (
                  <div
                    key={action.id}
                    className="flex flex-col items-center gap-2 py-4 px-1 sm:min-w-[100px] sm:px-6 group cursor-pointer active:scale-95 transition-transform"
                    onClick={() => {
                      if (action.id === 'airsend') setIsAirSendOpen(true);
                    }}
                  >
                    <div className={`size-11 sm:size-12 rounded-2xl ${action.bg} ${action.hoverBg} border border-white/[0.05] flex items-center justify-center transition-all group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]`}>
                      <action.icon className={`size-4.5 sm:size-5 ${action.icon_color}`} />
                    </div>
                    <span className={`text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${action.icon_color} opacity-70 group-hover:opacity-100 transition-opacity`}>{action.label}</span>
                  </div>
                );
                return action.href ? (
                  <Link href={action.href} key={action.id} className="contents">{inner}</Link>
                ) : <React.Fragment key={action.id}>{inner}</React.Fragment>;
              })}
            </div>
          </div>

          {/* Smart Insights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 ease-out fill-mode-both">
            <div className="rounded-[1.5rem] bg-[#050505]/80 border border-white/[0.06] px-5 py-5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
              <div className="space-y-1 relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Inflow (Last 20)</p>
                <p className="text-xl font-black tracking-tight text-white">
                  ₦{recentInflow.toLocaleString()}
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative z-10 shadow-inner">
                <ArrowDownLeft className="size-5 text-emerald-400" />
              </div>
            </div>
            
            <div className="rounded-[1.5rem] bg-[#050505]/80 border border-white/[0.06] px-5 py-5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-2xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors" />
              <div className="space-y-1 relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Outflow (Last 20)</p>
                <p className="text-xl font-black tracking-tight text-white">
                  ₦{recentOutflow.toLocaleString()}
                </p>
              </div>
              <div className="size-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center relative z-10 shadow-inner">
                <ArrowUpRight className="size-5 text-rose-400" />
              </div>
            </div>
            
            <div className="rounded-[1.5rem] bg-indigo-950/20 border border-indigo-500/20 px-5 py-5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-3xl relative overflow-hidden group">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 blur-3xl rounded-full group-hover:bg-indigo-500/20 transition-colors" />
              <div className="space-y-1 relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300/60">Net Flow Snapshot</p>
                <p className="text-xl font-black tracking-tight flex items-center gap-1.5 text-white">
                  {netFlow >= 0 ? '+' : '-'}₦{Math.abs(netFlow).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 relative z-10">
                <Activity className={`size-5 ${netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
                <span className="text-[9px] uppercase tracking-widest font-black text-indigo-200/50">
                  {netFlow >= 0 ? 'Net Positive' : 'Net Spend'}
                </span>
              </div>
            </div>
          </div>

          {/* Spending Analytics Chart */}
          {transactions.length > 0 && (() => {
            // Build last-7-day buckets
            const now = new Date();
            const days = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(now);
              d.setDate(d.getDate() - (6 - i));
              return {
                label: d.toLocaleDateString('en-NG', { weekday: 'short' }),
                date: d.toDateString(),
                credit: 0,
                debit: 0,
              };
            });
            transactions.forEach((tx) => {
              const txDate = tx.timestamp instanceof Date
                ? tx.timestamp.toDateString()
                : new Date(tx.timestamp).toDateString();
              const bucket = days.find((d) => d.date === txDate);
              if (bucket) {
                if (tx.type === 'credit') bucket.credit += tx.amount;
                else bucket.debit += tx.amount;
              }
            });

            return (
              <div className="bg-[#050505]/80 backdrop-blur-3xl border border-white/[0.06] rounded-[1.5rem] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] space-y-5 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500 ease-out fill-mode-both">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Spending Analytics</p>
                    <h3 className="text-xl font-black text-white mt-0.5 tracking-tight">7-Day Flow</h3>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />Credit
                    </div>
                    <div className="flex items-center gap-2 text-rose-400">
                      <span className="size-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />Debit
                    </div>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={days} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="creditGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="debitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} tickMargin={12} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`} tickMargin={12} />
                    <Tooltip
                      contentStyle={{ borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(12px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 900, color: '#fff' }}
                      itemStyle={{ fontWeight: 900 }}
                      formatter={(value: number, name: string) => [`₦${value.toLocaleString()}`, name === 'credit' ? 'Credit' : 'Debit']}
                    />
                    <Area type="monotone" dataKey="credit" stroke="#34d399" strokeWidth={3} fill="url(#creditGrad)" dot={{ r: 0 }} activeDot={{ r: 6, fill: '#34d399', stroke: '#050505', strokeWidth: 3 }} />
                    <Area type="monotone" dataKey="debit" stroke="#fb7185" strokeWidth={3} fill="url(#debitGrad)" dot={{ r: 0 }} activeDot={{ r: 6, fill: '#fb7185', stroke: '#050505', strokeWidth: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            );
          })()}

          <Tabs defaultValue="manage" className="space-y-5 sm:space-y-6 w-full max-w-full min-w-0">
            <div className="w-full overflow-x-auto no-scrollbar pb-0.5">
              <TabsList className="flex w-full bg-slate-100 dark:bg-slate-900 rounded-xl sm:rounded-2xl p-1 h-12 sm:h-14 gap-1 shadow-inner">
                <TabsTrigger value="manage" className="flex-1 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all">Transact</TabsTrigger>
                <TabsTrigger value="cards" className="flex-1 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all">Cards</TabsTrigger>
                <TabsTrigger value="vaults" className="flex-1 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all">Vault</TabsTrigger>
                <TabsTrigger value="history" className="flex-1 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all">History</TabsTrigger>
                <TabsTrigger value="security" className="flex-1 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[8px] sm:text-[10px] data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all">Security</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="manage" className="space-y-5 sm:space-y-10 w-full max-w-full min-w-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-10">
                {/* Institutional Deposit Protocol */}
                <Card className="border-none shadow-lg sm:shadow-[0_80px_160px_-30px_rgba(16,185,129,0.15)] rounded-2xl sm:rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 hover:shadow-[0_100px_200px_-40px_rgba(16,185,129,0.25)] transition-all duration-700">

                  <CardHeader className="p-5 sm:p-10 pb-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 sm:space-y-2">
                        <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-black px-3 sm:px-4 py-1 rounded-full uppercase text-[8px] sm:text-[9px] tracking-widest">Inbound Protocol</Badge>
                        <CardTitle className="text-2xl sm:text-4xl font-black tracking-tightest">DEPOSIT</CardTitle>
                      </div>
                      <div className="size-12 sm:size-16 bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                        <Plus className="size-6 sm:size-8 text-emerald-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-10 space-y-5 sm:space-y-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Quantum of Injection</Label>
                      <div className="relative group">
                        <span className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 font-black text-slate-300 text-2xl sm:text-3xl transition-colors group-focus-within:text-emerald-500">₦</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-14 sm:pl-16 h-16 sm:h-24 text-2xl sm:text-4xl font-black rounded-2xl sm:rounded-3xl border-none bg-slate-50 dark:bg-slate-950/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner tracking-tighter"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />

                      </div>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4">
                        {['5000', '10000', '25000'].map(val => (
                          <Button
                            key={val}
                            variant="outline"
                            onClick={() => setAmount(val)}
                            className="rounded-xl sm:rounded-2xl border-slate-100 dark:border-slate-800 py-6 sm:py-8 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 active:scale-95 transition-all shadow-sm"
                          >
                            ₦{parseInt(val).toLocaleString()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={addFunds}
                      className="w-full h-16 sm:h-20 rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] bg-emerald-600 hover:bg-emerald-500 transition-all hover:scale-[1.02] active:scale-[0.95] py-6"
                      disabled={!amount || parseFloat(amount) <= 0 || isAddingFunds}
                    >
                      {isAddingFunds ? <Loader2 className="mr-3 size-5 sm:size-6 animate-spin" /> : <CreditCard className="mr-3 size-5 sm:size-6" />}
                      {isAddingFunds ? 'CALIBRATING...' : 'INITIATE SECURE PAY'}
                    </Button>


                    <Separator className="bg-slate-100/50 dark:bg-slate-800/50" />

                    {/* DVA Section Restyled */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Direct Reserve Node</Label>
                        <Badge className="bg-orange-500/10 text-orange-500 border-none font-black px-3 py-1 rounded-lg uppercase text-[8px] tracking-[0.2em]">Live Simulation Off</Badge>
                      </div>

                      {walletData?.dva ? (
                        <div className="relative overflow-hidden bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl group cursor-pointer hover:border-emerald-500/20 transition-all duration-500">
                          <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                          <div className="relative z-10 space-y-6">
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] italic">System IBAN / DVA</p>
                              <div className="size-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform">
                                <Banknote className="size-6 text-emerald-400" />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                              <h3 className="text-lg sm:text-3xl font-black font-mono tracking-widest sm:tracking-[0.15em] text-white group-hover:text-emerald-400 transition-colors truncate">{walletData?.dva?.account_number}</h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-12 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (walletData.dva) {
                                    copyToClipboard(walletData.dva.account_number);
                                  }
                                }}
                              >
                                {hasCopied ? <Check className="size-6 text-emerald-500" /> : <Copy className="size-6" />}
                              </Button>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{walletData.dva?.bank_name}</span>
                              <div className="size-1 rounded-full bg-slate-700" />
                              <span className="text-xs font-medium text-slate-500 truncate italic">{walletData.dva?.account_name}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4 group hover:border-emerald-500/50 transition-all">
                          <div className="size-16 sm:size-20 rounded-full bg-slate-100 dark:bg-slate-900 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
                            <Lock className="size-8 sm:size-10 text-slate-300 group-hover:text-white" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-xl font-black tracking-tighter">Vault Uninitialized</p>
                            <p className="text-xs text-slate-400 font-medium px-4">Direct liquidity nodes are locked until identity synchronization is completed via the ARISE gateway.</p>
                          </div>
                          <Button asChild className="h-14 rounded-2xl bg-slate-950 text-white hover:bg-emerald-600 transition-all font-black uppercase text-xs tracking-widest px-8">
                            <Link href="/kyc">Synchronize Identity <ArrowRight className="ml-2 size-4" /></Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Tactical Outbound Protocol */}
                <Card className="border-none shadow-lg sm:shadow-[0_80px_160px_-30px_rgba(15,23,42,0.15)] rounded-2xl sm:rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 hover:shadow-[0_100px_200px_-40px_rgba(15,23,42,0.25)] transition-all duration-700">

                  <CardHeader className="p-5 sm:p-10 pb-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 sm:space-y-2">
                        <Badge className="bg-slate-950/10 text-slate-500 border-none font-black px-3 sm:px-4 py-1 rounded-full uppercase text-[8px] sm:text-[9px] tracking-widest">Outbound Protocol</Badge>
                        <CardTitle className="text-2xl sm:text-4xl font-black tracking-tightest">TRANSFER</CardTitle>
                      </div>
                      <div className="size-12 sm:size-16 shrink-0 bg-slate-950 text-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl">
                        <Send className="size-6 sm:size-8" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 sm:p-10 space-y-5 sm:space-y-8">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Target Terminal</Label>
                          <Button
                            variant="ghost"
                            onClick={() => { setScanTab('scan'); setIsScanModalOpen(true); }}
                            className="h-8 rounded-full bg-emerald-500/5 text-emerald-600 font-black uppercase text-[8px] tracking-[0.2em] px-3 gap-2 hover:bg-emerald-500/10"
                          >
                            <QrCode className="size-3" /> Optical Scan
                          </Button>
                        </div>
                        <Input
                          id="recipient-account-input"
                          placeholder="RECIPIENT ACCOUNT"
                          className={`h-14 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-50/50 border-none focus:bg-white font-mono text-lg sm:text-2xl tracking-[0.1em] sm:tracking-[0.2em] px-6 sm:px-8 shadow-inner ${voiceFocus === 'account' ? 'ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`}
                          value={recipientAccount}
                          onChange={(e) => setRecipientAccount(e.target.value)}
                        />

                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:gap-6">
                        <div className="space-y-3 sm:space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Gateway</Label>
                          <Select value={recipientBank} onValueChange={setRecipientBank}>
                            <SelectTrigger className={`h-14 sm:h-16 rounded-2xl border-none bg-slate-50/50 font-black uppercase text-[9px] sm:text-[10px] tracking-widest px-3 sm:px-6 shadow-inner ${voiceFocus === 'bank' ? 'ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`}>
                              <SelectValue placeholder="GATEWAY" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              {NIGERIAN_BANKS.map((bank) => (
                                <SelectItem key={bank.code} value={bank.code} className="font-bold text-xs">
                                  {bank.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Liquidity</Label>
                          <div className="relative group">
                            <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm group-focus-within:text-slate-950 transition-colors">₦</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className={`h-14 sm:h-16 pl-8 sm:pl-10 rounded-2xl border-none bg-slate-50/50 font-black text-lg sm:text-xl shadow-inner focus:bg-white transition-all ${voiceFocus === 'amount' ? 'ring-2 ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`}
                              value={transferAmount}
                              onChange={(e) => setTransferAmount(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {recipientName && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-2xl flex items-center justify-between animate-in zoom-in-95 duration-500">
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                              <ShieldCheck className="size-6 text-emerald-600" />
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Validated Recipient</p>
                              <p className="text-base font-black tracking-tightest leading-none">{recipientName}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between px-2 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Cap</span>
                        </div>
                        <span className="text-lg font-black tracking-tighter">₦{balance.toLocaleString()}</span>
                      </div>

                      <Button
                        onClick={withdrawFunds}
                        className="w-full h-16 sm:h-20 rounded-2xl sm:rounded-3xl bg-slate-950 text-white hover:bg-emerald-600 transition-all font-black uppercase tracking-[0.3em] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)] active:scale-95 py-6"
                        disabled={isTransferring || !transferAmount || parseFloat(transferAmount) > balance || (!recipientName && !recipientBank.toLowerCase().includes('ibom'))}
                      >
                        {isTransferring ? <Loader2 className="mr-3 size-5 sm:size-6 animate-spin" /> : <ArrowUpRight className="mr-3 size-5 sm:size-6" />}
                        {isTransferring ? 'SYNCHRONIZING...' : 'EXECUTE X-TRANSFER'}
                      </Button>

                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="space-y-12 animate-in fade-in duration-700 w-full max-w-full overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Ultra-Premium Virtual Card */}
                <div className="relative group perspective-2000 overflow-hidden p-2">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-[3.5rem] blur-2xl opacity-10 sm:opacity-20 transition duration-1000"></div>

                  <Card className={`relative border-none shadow-xl sm:shadow-[0_80px_160px_-30px_rgba(0,0,0,0.4)] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden bg-slate-950 text-white min-h-[320px] sm:min-h-[380px] flex flex-col justify-between p-6 sm:p-12 transition-all duration-700 ${walletData?.isCardFrozen ? 'grayscale opacity-60' : 'hover:-translate-y-4 hover:rotate-1'}`}>
                    {/* Advanced Mesh / Holographic Background */}
                    <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-indigo-500/30 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/20 blur-[100px] rounded-full animate-pulse " style={{ animationDelay: '1s' }} />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

                    <div className="relative z-10 flex justify-between items-start">
                      <div className="space-y-1">
                        <Badge className="bg-white/10 text-white border-white/20 font-black px-4 py-1.5 rounded-xl uppercase text-[9px] tracking-widest backdrop-blur-md">Premium Virtual Asset</Badge>
                        <h3 className="text-4xl font-black tracking-tightest mt-2 leading-none">IBOM <span className="text-indigo-400 italic">X.</span></h3>
                      </div>
                      <div className="size-16 bg-white/5 rounded-[1.5rem] border border-white/10 flex items-center justify-center backdrop-blur-3xl shadow-2xl">
                        <CreditCard className="size-8 text-white" />
                      </div>
                    </div>

                    <div className="relative z-10 space-y-2 sm:space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Global Terminal Identifier</p>
                      <h3 className="text-base sm:text-4xl font-black font-mono tracking-tight sm:tracking-[0.2em] drop-shadow-2xl truncate">4092 • 8820 • 0012 • 9024</h3>
                    </div>

                    <div className="relative z-10 flex justify-between items-end">
                      <div className="flex gap-10">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Valid Thru</p>
                          <p className="text-xl font-black tracking-widest font-mono">12 / 28</p>
                        </div>
                        <div className="space-y-1 cursor-pointer group/cvv">
                          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Security Node</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xl font-black tracking-widest font-mono group-hover/cvv:text-indigo-400 transition-colors">492</p>
                            <Eye className="size-3 text-slate-600 group-hover/cvv:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={`size-12 rounded-full flex items-center justify-center border-2 ${walletData?.isCardFrozen ? 'border-rose-500/30' : 'border-emerald-500/30'}`}>
                          {walletData?.isCardFrozen ? <Snowflake className="size-6 text-rose-500" /> : <ShieldCheck className="size-6 text-emerald-500" />}
                        </div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Encrypted / Active</p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Card Control Matrix */}
                <div className="space-y-10">
                  <div className="space-y-1 px-2">
                    <h3 className="text-3xl font-black tracking-tightest leading-none">CARD CONTROL</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Asset Management Protocols</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <ControlMatrixCard
                      label={walletData?.isCardFrozen ? 'THAW PROTOCOL' : 'CRYOGENIC LOCK'}
                      desc={walletData?.isCardFrozen ? 'Re-activate asset node' : 'Temporarily suspend all IO'}
                      icon={<Snowflake className="size-6" />}
                      onClick={toggleCardFreeze}
                      active={walletData?.isCardFrozen}
                      color="rose"
                    />
                    <ControlMatrixCard
                      label="THRESHOLD CALIBRATION"
                      desc="Synchronize spend capacity"
                      icon={<TrendingUp className="size-6" />}
                      color="indigo"
                    />
                    <ControlMatrixCard
                      label="TERMINAL RESET"
                      desc="Rotate digital identifiers"
                      icon={<RefreshCw className="size-6" />}
                      color="emerald"
                    />
                    <ControlMatrixCard
                      label="GEAR REPLACEMENT"
                      desc="Provision new visual node"
                      icon={<ShieldCheck className="size-6" />}
                      color="slate"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vaults" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700 w-full max-w-full overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 space-y-10">
                    <div className="flex items-center justify-between px-2">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black tracking-tighter">Strategic Vaults</h3>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target-Based Wealth Preservation</p>
                      </div>
                      <Button onClick={() => setIsCreateVaultOpen(true)} className="size-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 active:scale-90 transition-all">
                        <Plus className="size-8" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 min-w-0">
                      {vaults.map((vault, idx) => {
                        const percentage = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
                        return (
                          <Card key={vault.id} className="group relative border-none shadow-lg sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:shadow-2xl transition-all duration-700 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10" style={{ animationDelay: `${idx * 100}ms` }}>
                            <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1 sm:space-y-2 min-w-0 pr-2">
                                  <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-black px-4 py-1.5 rounded-xl uppercase text-[9px] tracking-widest shadow-sm truncate">
                                    ID: {vault.id.slice(0, 8).toUpperCase()}
                                  </Badge>
                                  <CardTitle className="text-2xl sm:text-3xl font-black tracking-tightest leading-none truncate">{vault.name}</CardTitle>
                                </div>
                                <div className="size-12 sm:size-16 shrink-0 bg-slate-50 dark:bg-emerald-950 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                                  <PiggyBank className="size-6 sm:size-8 text-emerald-500" />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                  <div className="space-y-1 min-w-0 overflow-hidden">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Preserved Capital</p>
                                    <h4 className="text-2xl sm:text-4xl font-black font-mono tracking-tight text-slate-950 dark:text-white truncate">₦{vault.currentAmount.toLocaleString()}</h4>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-emerald-500">₦{vault.targetAmount.toLocaleString()}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objective</span>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <div className="h-4 w-full bg-slate-100 dark:bg-emerald-950 rounded-full overflow-hidden p-1 shadow-inner">
                                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-[2000ms] shadow-lg shadow-emerald-500/40 relative overflow-hidden" style={{ width: `${percentage}%` }}>
                                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Stabilization Status</span>
                                    <span className="text-emerald-500">{percentage}% Collateralized</span>
                                  </div>
                                </div>
                              </div>

                              <Button onClick={() => setTopUpVaultId(vault.id)} className="w-full h-18 rounded-2xl bg-slate-950 text-white hover:bg-emerald-600 transition-all font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 py-6">
                                <Zap className="mr-3 size-5" /> Injection Protocol
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}

                      <Card onClick={() => setIsCreateVaultOpen(true)} className="border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-none rounded-[2.5rem] bg-transparent flex flex-col items-center justify-center p-12 text-center min-h-[300px] hover:bg-white dark:hover:bg-slate-900/50 hover:border-emerald-500 transition-all cursor-pointer group hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10" style={{ animationDelay: `${vaults.length * 100}ms` }}>
                        <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                          <PiggyBank className="size-10 text-slate-300 group-hover:text-white" />
                        </div>
                        <h3 className="text-2xl font-black tracking-tightest mb-2 group-hover:text-emerald-500 transition-colors">INITIATE VAULT</h3>
                        <p className="text-sm text-slate-400 font-medium max-w-[220px]">Deploy a new capital reservation protocol for enhanced financial autonomy.</p>
                      </Card>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-1 px-2">
                      <h3 className="text-3xl font-black tracking-tighter">Orion Intelligence</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Financial Health Analytics</p>
                    </div>
                    
                    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-slate-950 p-8 text-white relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
                      <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-indigo-500/20 text-indigo-400 border-none font-black px-4 py-1 rounded-xl uppercase text-[9px] tracking-widest">Neural Mode</Badge>
                          <Brain className="size-8 text-indigo-400 animate-pulse" />
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Asset Health Index</p>
                          <div className="flex items-end gap-2">
                             <h4 className="text-6xl font-black tracking-tightest leading-none">{OrionAIEngine.getFinancialHealth(balance, transactions).score}</h4>
                             <TrendingUp className="size-6 text-emerald-500 mb-1" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Savings Rate</p>
                              <p className="text-lg font-black">{OrionAIEngine.getFinancialHealth(balance, transactions).savingsRate}%</p>
                           </div>
                           <div className="space-y-1 p-4 rounded-2xl bg-white/5 border border-white/5">
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Risk Index</p>
                              <p className="text-lg font-black text-emerald-500">LOW</p>
                           </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                           <p className="text-xs font-medium text-slate-300 italic leading-relaxed">
                              "Orion suggests increasing your target for 'Emergency' vault by 12% to reach stability before Q3."
                           </p>
                        </div>
                      </div>
                    </Card>

                    <Card className="border-none shadow-lg rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 flex flex-col items-center justify-center text-center space-y-4">
                       <div className="size-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <TrendingUp className="size-8 text-emerald-600" />
                       </div>
                       <h4 className="text-xl font-black uppercase tracking-tightest">Proactive Insights</h4>
                       <p className="text-xs text-slate-400 font-medium">Your spending has decreased by 14% this week. Orion has allocated savings to your active vaults.</p>
                       <Button variant="ghost" className="text-emerald-600 font-black uppercase text-[10px] tracking-widest">View Detailed Telemetry</Button>
                    </Card>
                 </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 px-2 sm:px-4">
                <div className="space-y-1 sm:space-y-2 min-w-0">
                  <Badge className="bg-slate-900/10 text-slate-500 border-none font-black px-4 py-1 rounded-full uppercase text-[8px] sm:text-[9px] tracking-widest">Digital Ledger</Badge>
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tightest truncate">TRANSACTION FEED</h3>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest truncate">Historical Telemetry & Settlements</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap shrink-0">
                  <Button variant="outline" className="rounded-xl sm:rounded-2xl border-slate-100 dark:border-slate-800 font-black uppercase text-[8px] sm:text-[9px] tracking-widest px-4 sm:px-6 h-10 sm:h-12 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                    All Nodes
                  </Button>
                  <Button variant="outline" className="rounded-xl sm:rounded-2xl border-slate-100 dark:border-slate-800 font-black uppercase text-[8px] sm:text-[9px] tracking-widest px-4 sm:px-6 h-10 sm:h-12 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                    Export CSV
                  </Button>
                </div>
              </div>

              <Card className="border-none shadow-lg sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-2xl sm:rounded-[3rem] overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20">
                <CardContent className="p-3 sm:p-8">
                  {transactions.length === 0 ? (
                    <div className="text-center py-32 px-4 space-y-6">
                      <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner group animate-pulse">
                        <History className="size-10 text-slate-300 dark:text-slate-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-2xl font-black tracking-tightest text-slate-900 dark:text-white">NO FEED DETECTED</p>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Current epoch has no transaction telemetry.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {transactions.map((txn, idx) => (
                        <div key={txn.id} className="group relative">
                          <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                          <div className="flex items-center justify-between p-3 sm:p-6 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-opacity active:opacity-50">
                            <div className="flex items-center gap-3 sm:gap-6 min-w-0 pr-2">
                              <div className={`size-9 sm:size-14 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${txn.type === 'credit' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-950 text-white'}`}>
                                {txn.type === 'credit' ? <ArrowDownLeft className="size-4 sm:size-7" /> : <ArrowUpRight className="size-4 sm:size-7" />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-[12px] sm:text-xl tracking-tight uppercase text-slate-900 dark:text-white truncate leading-tight mb-0.5">{txn.description}</p>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                    {txn.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })} · {txn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {txn.isSimulated && <Badge className="bg-amber-500/10 text-amber-600 text-[6px] px-1 h-3.5 uppercase border-none">Demo</Badge>}
                                </div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`font-black text-sm sm:text-2xl tracking-tight leading-none mb-0.5 ${txn.type === 'credit' ? 'text-emerald-500' : 'text-slate-950 dark:text-white'}`}>
                                {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                              </p>
                              <p className="text-[8px] font-black text-emerald-600/60 uppercase tracking-widest">Success</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <div className="flex justify-center pt-4">
                <Button variant="ghost" className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] gap-3 px-8 h-12 hover:text-emerald-500 transition-colors group">
                  <Download className="size-4 group-hover:-translate-y-1 transition-transform" />
                  Request Full Session Statement PDF
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="text-center space-y-2 sm:space-y-3 pb-2 sm:pb-4 px-2">
                <div className="size-16 sm:size-20 rounded-[1.5rem] sm:rounded-[2rem] bg-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 group hover:rotate-12 transition-transform duration-500">
                  <ShieldCheck className="size-8 sm:size-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl sm:text-4xl font-black tracking-tightest leading-none">DEFENSE PROTOCOLS</h3>
                <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Institutional Grade Assets</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[2rem] sm:rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-3xl p-6 sm:p-8 space-y-6 sm:space-y-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Biometric Gateway</p>
                        <h4 className="text-2xl font-black tracking-tight">Enterprise Bio-Unlock</h4>
                        <p className="text-xs text-slate-400 font-medium">Require face/fingerprint for all high-value transactions.</p>
                      </div>
                      <Switch className="data-[state=checked]:bg-emerald-500" />
                    </div>
                    <Separator className="bg-slate-100/50 dark:bg-slate-800/50" />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Manual Override</p>
                        <h4 className="text-2xl font-black tracking-tight">Transaction PIN</h4>
                        <p className="text-xs text-slate-400 font-medium font-medium">Secondary numeric authorization layer.</p>
                      </div>
                      <Button onClick={() => setIsPinSetup(!isPinSetup)} variant="outline" className={`rounded-xl font-black uppercase text-[9px] tracking-widest px-4 h-10 ${isPinSetup ? 'bg-emerald-500/10 text-emerald-600 border-none' : 'border-slate-200 hover:bg-slate-50'}`}>
                        {isPinSetup ? "Configured" : "Not Active"}
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-slate-950 p-10 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 p-32 bg-emerald-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                  <div className="relative z-10 space-y-6">
                    <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                      <ShieldCheck className="size-8 text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Security Architecture</p>
                      <h4 className="text-4xl font-black tracking-tightest leading-tight">ARISE SHIELD <span className="text-emerald-400 italic">v2.0</span></h4>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed italic">&quot;Enterprise RSA-4096 Multi-Region Neural Mesh is active. All terminal telemetry is end-to-end sanitized and fraud-shielded by Orion.&quot;</p>
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                      <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 w-[98%] shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">98.2% Neural Integrity</span>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SecurityStat label="Uptime" value="99.99%" icon={<Clock className="size-4" />} />
                <SecurityStat label="Node Checks" value="Validated" icon={<Shield className="size-4" />} />
                <SecurityStat label="Telemetry" value="Real-time" icon={<Activity className="size-4 text-red-500" />} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isScanModalOpen} onOpenChange={setIsScanModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] overflow-hidden p-0 max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 flex flex-col items-center text-white relative">
            <ScanLine className="h-10 w-10 mb-3 opacity-90" />
            <DialogTitle className="text-2xl font-black uppercase tracking-widest text-white">Ibom X Scan</DialogTitle>
            <DialogDescription className="text-sm font-medium opacity-90 text-center mt-1 text-emerald-50">
              Pay or Receive instantly via QR/NFC
            </DialogDescription>
            <div className="absolute top-4 right-4 bg-white/20 p-2.5 rounded-xl backdrop-blur-md animate-pulse">
              <Wifi className="h-4 w-4 text-white" />
            </div>
            {/* Visual flair for scanner header */}
            <div className="absolute -bottom-8 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent"></div>
          </div>

          <div className="p-6 relative z-10">
            <Tabs value={scanTab} onValueChange={(v) => setScanTab(v as 'scan' | 'my-qr')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-200/50 dark:bg-slate-900 rounded-xl p-1.5 mb-8">
                <TabsTrigger value="scan" className="rounded-lg font-bold uppercase tracking-widest text-xs">Scan Camera</TabsTrigger>
                <TabsTrigger value="my-qr" className="rounded-lg font-bold uppercase tracking-widest text-xs">My Code</TabsTrigger>
              </TabsList>

              <TabsContent value="scan" className="space-y-6">
                <div className="relative aspect-square w-full sm:w-[300px] mx-auto bg-slate-950 rounded-3xl overflow-hidden border border-slate-300 dark:border-slate-800 flex items-center justify-center shadow-inner">
                  <Scanner
                    onScan={(result: any) => {
                      if (result && result.length) {
                        const scanItem = result[0];
                        // Robustly extract string from various browser detector implementations
                        let val = '';
                        if (typeof scanItem === 'string') val = scanItem;
                        else if (scanItem.rawValue) val = scanItem.rawValue;
                        else if (scanItem.text) val = scanItem.text;
                        else val = String(scanItem);

                        try {
                          const parsed = JSON.parse(val);
                          if (parsed.type === 'ibomx' && parsed.account) {
                            setRecipientAccount(parsed.account);
                            setRecipientBank('ibomx'); // Must map EXACTLY to the Select option value
                            setIsScanModalOpen(false);
                            toast({ title: 'QR Scanned', description: 'Ibom X profile accepted.' });
                          } else {
                            // Correctly parsed JSON, but not an Ibom X code
                            throw new Error('Not Ibom X format');
                          }
                        } catch (e) {
                          // Could not parse as JSON (or thrown from above)
                          if (val && val.trim().length === 10 && /^\d+$/.test(val.trim())) {
                            setRecipientAccount(val.trim());
                            setIsScanModalOpen(false);
                            toast({ title: 'Account Scanned', description: `Captured account ${val.trim()}` });
                          } else {
                            const now = Date.now();
                            if (now - lastScanErrorTime.current > 3000) {
                              toast({ variant: 'destructive', title: 'Invalid QR', description: 'Not a valid Ibom X payment code.' });
                              lastScanErrorTime.current = now;
                            }
                          }
                        }
                      }
                    }}
                    components={{
                      finder: false
                    }}
                    styles={{
                      container: {
                        width: '100%',
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center'
                      },
                      video: {
                        objectFit: 'cover'
                      }
                    }}
                  />

                  {/* Viewfinder corners Overlay */}
                  <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="absolute top-6 left-6 w-12 h-12 border-t-[3px] border-l-[3px] border-emerald-500 rounded-tl-xl"></div>
                    <div className="absolute top-6 right-6 w-12 h-12 border-t-[3px] border-r-[3px] border-emerald-500 rounded-tr-xl"></div>
                    <div className="absolute bottom-6 left-6 w-12 h-12 border-b-[3px] border-l-[3px] border-emerald-500 rounded-bl-xl"></div>
                    <div className="absolute bottom-6 right-6 w-12 h-12 border-b-[3px] border-r-[3px] border-emerald-500 rounded-br-xl"></div>
                    <div className="absolute top-0 w-full h-0.5 bg-emerald-500 shadow-[0_0_20px_2px_rgba(16,185,129,0.8)] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                  </div>
                </div>

                <div className="text-center space-y-4 relative z-10 flex flex-col items-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hold camera near Code</p>
                </div>
              </TabsContent>

              <TabsContent value="my-qr" className="space-y-6">
                <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="bg-white p-6 rounded-[2rem] shadow-inner border border-slate-100 mb-6 transition-transform duration-500 hover:scale-105 group relative overflow-hidden flex items-center justify-center min-h-[224px]">
                    {walletData?.dva?.account_number ? (
                      <QRCodeSVG
                        value={`{"type":"ibomx","account":"${walletData.dva.account_number}"}`}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="Q"
                      />
                    ) : (
                      <QrCode className="w-56 h-56 text-slate-950 opacity-20" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  <h3 className="font-extrabold text-xl uppercase tracking-widest text-slate-950 dark:text-white text-center">{user?.displayName || 'PowerHub User'}</h3>
                  <p className="text-sm text-slate-500 mb-5 font-medium">@{user?.email?.split('@')[0] || 'user'}</p>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 px-6 py-2.5 rounded-2xl">
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-widest">Scan to Pay Me instantly</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isIbomAskModalOpen} onOpenChange={setIsIbomAskModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-white dark:bg-slate-950 border-none rounded-[2rem] overflow-hidden p-8 text-center uppercase">
          <div className="mx-auto bg-emerald-100 dark:bg-emerald-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <ScanLine className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Scan or Type</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mb-8">
            How would you like to enter the receiver's Ibom X account details?
          </DialogDescription>

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setIsIbomAskModalOpen(false);
                setScanTab('scan');
                setIsScanModalOpen(true);
              }}
              className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest"
            >
              <QrCode className="mr-2 h-5 w-5" />
              Scan QR
            </Button>
            <Button
              onClick={() => {
                setIsIbomAskModalOpen(false);
                // Allow them to type
                document.getElementById('recipient-account-input')?.focus();
              }}
              variant="outline"
              className="h-16 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest"
            >
              <Banknote className="mr-2 h-5 w-5" />
              Type No.
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vault Creation Dialog */}
      <Dialog open={isCreateVaultOpen} onOpenChange={setIsCreateVaultOpen}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-white dark:bg-slate-950 border-none rounded-[2.5rem] p-8">
          <DialogTitle className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">New Vault</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mb-6">Create a new savings target to lock away funds securely.</DialogDescription>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vault Goal</Label>
              <Input
                placeholder="e.g New MacBook"
                className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white text-base transition-all"
                value={newVaultName}
                onChange={(e) => setNewVaultName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Amount</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">₦</span>
                <Input
                  type="number"
                  placeholder="500000"
                  className="pl-8 h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white font-mono text-lg transition-all"
                  value={newVaultTarget}
                  onChange={(e) => setNewVaultTarget(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleCreateVault}
              disabled={isCreatingVault || !newVaultName || !newVaultTarget}
              className="w-full h-16 mt-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest"
            >
              {isCreatingVault ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
              Create Vault
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vault Top-Up Dialog */}
      <Dialog open={topUpVaultId !== null} onOpenChange={(open) => !open && setTopUpVaultId(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-white dark:bg-slate-950 border-none rounded-[2.5rem] p-8">
          <DialogTitle className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Fund Vault</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mb-6">Transfer money instantly from your main balance to this vault.</DialogDescription>

          <div className="space-y-5">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount to lock</Label>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Bal: ₦{balance.toLocaleString()}</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">₦</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-8 h-16 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white font-mono text-xl transition-all"
                  value={vaultTopUpAmount}
                  onChange={(e) => setVaultTopUpAmount(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleVaultTopUp}
              disabled={isToppingUp || !vaultTopUpAmount || parseFloat(vaultTopUpAmount) <= 0 || parseFloat(vaultTopUpAmount) > balance}
              className="w-full h-16 mt-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest"
            >
              {isToppingUp ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5" />}
              Fund Instantly
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Simulator Dialog for Starter restriction */}
      <Dialog open={showSimulatePrompt} onOpenChange={setShowSimulatePrompt}>
        <DialogContent className="w-[95vw] sm:max-w-md bg-white dark:bg-slate-950 border-none rounded-[2.5rem] p-8 text-center">
          <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Transfer Restricted</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mb-6">
            Our payment provider has restricted this account from making live transfers because it is currently in "Starter" mode.
          </DialogDescription>

          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-left mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Provider Error</p>
            <p className="text-xs font-bold text-slate-600 dark:text-slate-300 italic">"{lastError}"</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Button
              onClick={performSimulatedTransfer}
              className="h-16 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase tracking-widest shadow-xl shadow-amber-600/20"
            >
              <Zap className="mr-2 h-5 w-5" />
              Simulate Success (Demo)
            </Button>
            <Button
              onClick={() => setShowSimulatePrompt(false)}
              variant="ghost"
              className="h-12 rounded-2xl font-bold text-slate-500"
            >
              Cancel
            </Button>
          </div>
          <p className="text-[10px] text-slate-400 mt-6 font-medium">Use Simulation to test the wallet flow until your payment provider account is upgraded.</p>
        </DialogContent>
      </Dialog>
      {/* ── Premium Native Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 z-[60] sm:hidden">
        {/* AirSend FAB */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-10">
          <button
            onClick={() => { setIsAirSendOpen(true); if (navigator.vibrate) navigator.vibrate([10, 20, 10]); }}
            className="size-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-2xl shadow-indigo-500/50 border-[3px] border-white dark:border-slate-950 active:scale-90 transition-all"
          >
            <Wifi className="size-6 text-white" />
          </button>
        </div>
        <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border-t border-slate-200/50 dark:border-white/[0.05] shadow-[0_-8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.3)]">
          <div className="flex justify-around items-center px-2 pt-2 pb-safe" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
            {[
              {
                id: 'topup', icon: Plus, label: 'Add', color: 'text-emerald-600 dark:text-emerald-400', action: () => {
                  (document.querySelector('[value="manage"]') as HTMLElement)?.click();
                  if (navigator.vibrate) navigator.vibrate(8);
                }
              },
              {
                id: 'send', icon: Send, label: 'Send', color: 'text-slate-600 dark:text-slate-300', action: () => {
                  (document.querySelector('[value="manage"]') as HTMLElement)?.click();
                  setTimeout(() => document.getElementById('recipient-account-input')?.focus(), 100);
                  if (navigator.vibrate) navigator.vibrate(8);
                }
              },
              { id: 'airsend-mid', icon: Wifi, label: '', color: '', action: () => { } }, // placeholder for FAB
              {
                id: 'cards', icon: CreditCard, label: 'Cards', color: 'text-indigo-600 dark:text-indigo-400', action: () => {
                  (document.querySelector('[value="cards"]') as HTMLElement)?.click();
                  if (navigator.vibrate) navigator.vibrate(8);
                }
              },
              {
                id: 'history', icon: History, label: 'History', color: 'text-slate-600 dark:text-slate-300', action: () => {
                  (document.querySelector('[value="history"]') as HTMLElement)?.click();
                  if (navigator.vibrate) navigator.vibrate(8);
                }
              },
            ].map((item) => {
              if (item.id === 'airsend-mid') {
                return <div key={item.id} className="w-16" />; // gap for FAB
              }
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl active:scale-75 transition-all focus:outline-none group"
                >
                  <div className="size-8 rounded-xl flex items-center justify-center transition-all group-active:bg-slate-100 dark:group-active:bg-slate-800">
                    <item.icon className={`size-5 ${item.color} transition-colors`} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-widest ${item.color} opacity-80`}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <NearbyAirSend
        open={isAirSendOpen}
        onOpenChange={setIsAirSendOpen}
        currentBalance={balance}
      />

      {/* Orion Super Assistant FAB */}
      <div className="fixed bottom-24 right-6 sm:right-12 z-[70] group flex flex-col items-end gap-4">
         {orionMessage && (
           <div className="bg-slate-950/90 backdrop-blur-xl border border-indigo-500/30 text-white p-4 rounded-3xl max-w-xs shadow-2xl animate-in slide-in-from-bottom-2 fade-in">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Orion Neural Feed</p>
              <p className="text-sm font-medium leading-relaxed italic text-slate-200">"{orionMessage}"</p>
           </div>
         )}

         <div className="relative">
            <div className={`absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full transition-all duration-500 ${orionListening || orionThinking ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`} />
            <button
              onClick={startVoiceBanking}
              className={`relative size-16 sm:size-20 rounded-full bg-slate-950 border-2 flex items-center justify-center shadow-2xl transition-all duration-500 active:scale-90 ${orionListening ? 'border-indigo-400 overflow-hidden ring-4 ring-indigo-500/20 translate-y--2' : 'border-white/10 overflow-hidden hover:border-indigo-500/50'}`}
            >
              {(orionListening || orionThinking) ? (
                <div className="relative flex items-center justify-center">
                   <div className="absolute size-32 bg-indigo-500/10 animate-ping rounded-full" />
                   <div className="flex gap-1 items-center">
                      <div className="size-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="size-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="size-1.5 bg-indigo-400 rounded-full animate-bounce" />
                   </div>
                </div>
              ) : (
                <div className="relative flex flex-col items-center group-hover:scale-110 transition-transform">
                   <Brain className="size-8 text-indigo-400" />
                   <p className="absolute -bottom-1 text-[7px] font-black text-indigo-300 opacity-60 uppercase tracking-widest">Orion</p>
                </div>
              )}
              {/* Orion HUD Glow */}
              <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent transition-opacity ${orionListening ? 'opacity-100' : 'opacity-0'}`} />
            </button>
            
            {/* Command Tooltip */}
            {!orionMessage && (
              <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center">
                 <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl whitespace-nowrap shadow-2xl animate-in slide-in-from-right-2">
                    Establish Neural Link
                 </div>
                 <div className="w-2 h-2 bg-slate-950/90 border-r border-t border-white/10 rotate-45 -translate-x-1" />
              </div>
            )}
         </div>
      </div>
    </>
  );
}

function ControlMatrixCard({ label, desc, icon, onClick, active, color }: { label: string; desc: string; icon: React.ReactNode; onClick?: () => void; active?: boolean; color: string }) {
  const colorMap: Record<string, string> = {
    rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 border-slate-200 dark:border-slate-800'
  };

  return (
    <Card onClick={onClick} className={`border border-none shadow-sm rounded-[2rem] p-5 sm:p-7 flex flex-col gap-4 sm:gap-6 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group bg-white dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden relative`}>
      <div className={`size-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 ${colorMap[color] || colorMap.slate}`}>
        {icon}
      </div>
      <div>
        <p className="font-black text-base tracking-tightest uppercase text-slate-900 dark:text-white leading-tight">{label}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{desc}</p>
      </div>
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none">
        {icon}
      </div>
    </Card>
  );
}

function SecurityStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-4 sm:p-6 rounded-[2.25rem] sm:rounded-[2rem] border border-white/20 shadow-sm hover:shadow-md transition-shadow group">
      <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">{value}</p>
      </div>
    </div>
  );
}
