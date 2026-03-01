'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownLeft,
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
  ArrowRight,
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
  Zap
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { loadPaystackScript, initializePaystack, verifyPayment, resolveBankAccount, createDedicatedAccount } from '@/lib/paystack';
import { Copy, Check, Info } from 'lucide-react';
import { WalletLock } from '@/components/wallet/wallet-lock';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeSVG } from 'qrcode.react';

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
};

type KycData = {
  emailVerified?: boolean;
  phoneVerified?: boolean;
  bvnVerified?: boolean;
  identityVerified?: boolean;
  addressVerified?: boolean;
  faceVerified?: boolean;
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
  const [isCreatingDva, setIsCreatingDva] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isIbomAskModalOpen, setIsIbomAskModalOpen] = useState(false);
  const [scanTab, setScanTab] = useState<'scan' | 'my-qr'>('scan');

  // Rate limit scanner errors so it doesn't flood the UI
  const lastScanErrorTime = useRef(0);

  // Vault/Card states
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isCreateVaultOpen, setIsCreateVaultOpen] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTarget, setNewVaultTarget] = useState('');
  const [isCreatingVault, setIsCreatingVault] = useState(false);

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

  useEffect(() => {
    if (recipientAccount.length >= 10 && recipientBank.length >= 3) {
      if (recipientBank.toLowerCase().includes('ibom')) {
        setRecipientName('Ibom X User');
        return;
      }
      handleResolveAccount();
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
        title: 'Missing Public Key',
        description: 'The Paystack Public Key is not loaded. If you just added it to .env.local, please restart the dev server manually in your terminal.'
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
        console.error('Paystack script load error:', error);
        setIsAddingFunds(false);
        toast({
          variant: 'destructive',
          title: 'Script Error',
          description: 'Could not load Paystack. Check your internet connection or Public Key.'
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
        publicKey,
        email: userEmail,
        amount: Math.round(numAmount * 100), // Ensure it's an integer
        reference,
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
        onSuccess: async (response: any) => {
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
                description: 'Funds added via Paystack',
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
        await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
          type: 'debit',
          amount: numAmount,
          description: `Internal Transfer to ${recipientAccount}`,
          timestamp: serverTimestamp(),
          reference: `IX-${Date.now()}`,
          status: 'success'
        });

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
      toast({
        variant: 'destructive',
        title: 'Transfer Failed',
        description: error.message || 'Payment provider error. Please check your account details.'
      });
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

  return (
    <>
      {!isUnlocked && <WalletLock onUnlock={handleUnlock} />}
      <div className="flex-1 bg-slate-50/50 dark:bg-slate-950 pb-20 md:pb-8 overflow-x-hidden w-full">
        <div className="max-w-md mx-auto sm:max-w-2xl md:max-w-4xl lg:max-w-6xl p-4 sm:p-6 md:p-8 space-y-6">

          {/* Header - Premium Look */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
                  Ibom <span className="text-emerald-500 italic">X</span>
                </h1>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Financial Super App</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full bg-slate-100 dark:bg-slate-900">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Premium Wallet Card - Modern Card UI */}
          <div className="relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>

            <div
              className={`relative w-full transition-transform duration-700 preserve-3d cursor-pointer ${isCardFlipped ? 'rotate-y-180' : ''}`}
              onDoubleClick={(e) => {
                e.preventDefault();
                setIsCardFlipped(!isCardFlipped);
                // Also trigger haptic feedback if available for mobile feel
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                  navigator.vibrate(50);
                }
              }}
            >
              {/* Front side elements */}
              <Card className="relative bg-slate-950 text-white rounded-[2.5rem] overflow-hidden border-none shadow-2xl backface-hidden">
                <CardContent className="p-8 sm:p-10 relative z-10">
                  <div className="flex justify-between items-start mb-10">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Balance</p>
                      </div>
                      <div className="flex items-center gap-2 max-w-full overflow-hidden">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-mono tracking-tighter truncate">
                          {isBalanceVisible ? `₦${balance.toLocaleString()}` : '••••••'}
                        </h2>
                        <div
                          className="bg-white/10 p-1.5 mx-1 rounded-xl border border-white/20 pointer-events-auto cursor-pointer hover:bg-white/20 transition-all shrink-0 shadow-lg relative group"
                          onClick={(e) => { e.stopPropagation(); setScanTab('my-qr'); setIsScanModalOpen(true); }}
                        >
                          <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsBalanceVisible(!isBalanceVisible);
                          }}
                          className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-10 w-10 transition-colors z-20"
                        >
                          {isBalanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-md">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Premium Tier</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 opacity-60">
                        <RefreshCw className="h-3 w-3 animate-spin duration-[3000ms]" />
                        <span className="text-[8px] uppercase font-bold tracking-widest">Double-Tap to Flip</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div className="space-y-1">
                      <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Card Holder</p>
                      <p className="text-base sm:text-lg font-bold tracking-tight uppercase truncate max-w-[150px] sm:max-w-[300px]">{user?.displayName || 'PowerHub User'}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex -space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-600/80 border-2 border-slate-950 flex items-center justify-center backdrop-blur-sm">
                          <ShieldCheck className="h-5 w-5 text-white" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-500/80 border-2 border-slate-950 flex items-center justify-center backdrop-blur-sm shadow-xl">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                      </div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Powered by ARISE</p>
                    </div>
                  </div>
                </CardContent>

                {/* Advanced visual flare / Mesh background for Front */}
                <div className="absolute top-[-30%] right-[-10%] w-[70%] h-[70%] bg-emerald-500/30 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-30%] left-[-10%] w-[60%] h-[60%] bg-emerald-400/20 blur-[80px] rounded-full"></div>
                <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>
              </Card>

              {/* Back side elements (Flipped Card) */}
              <Card className="absolute inset-0 bg-slate-900 border-none shadow-2xl rounded-[2.5rem] overflow-hidden text-white backface-hidden rotate-y-180">
                <CardContent className="p-8 sm:p-10 relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Account Info</p>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl backdrop-blur-md">
                        <Banknote className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>

                    {walletData?.dva ? (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">Bank Account Number</p>
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white">{walletData.dva.account_number}</h3>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(walletData.dva.account_number);
                              }}
                              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 z-20"
                            >
                              {hasCopied ? <Check className="h-4 w-4 text-amber-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-widest">{walletData.dva.bank_name}</p>
                          <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                          <p className="text-xs sm:text-sm font-medium text-slate-400">{walletData.dva.account_name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                        <Lock className="h-8 w-8 text-slate-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-300">Account Not Ready</p>
                          <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">Complete KYC to unlock your direct top-up account.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/10">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Direct Top-up</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-80 flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Double-Tap to Return
                    </p>
                  </div>
                </CardContent>

                {/* Back Card Flare */}
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-amber-500/10 blur-[80px] rounded-full"></div>
                <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-slate-700/20 blur-[100px] rounded-full"></div>
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>
              </Card>
            </div>
          </div>


          {/* Quick Actions Bar */}
          <div className="flex overflow-x-auto gap-4 sm:gap-5 pb-5 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 relative w-[calc(100%+2rem)] sm:w-auto">
            {[
              { id: 'topup', icon: Plus, label: 'Add', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
              { id: 'transfer', icon: Send, label: 'Send', color: 'bg-slate-900', shadow: 'shadow-slate-900/20' },
              { id: 'flights', icon: Plane, label: 'Flights', color: 'bg-indigo-600', shadow: 'shadow-indigo-600/20', href: '/flights' },
              { id: 'bills', icon: Smartphone, label: 'Bills', color: 'bg-amber-600', shadow: 'shadow-amber-600/20' },
              { id: 'withdraw', icon: ArrowUpRight, label: 'Cash Out', color: 'bg-slate-500', shadow: 'shadow-slate-500/20' },
            ].map((action, index, array) => {
              const content = (
                <div
                  key={action.id}
                  className={`flex flex-col items-center gap-2.5 min-w-[75px] group cursor-pointer ${index === array.length - 1 ? 'pr-4 sm:pr-0' : ''}`}
                  onClick={() => {
                    if (action.id === 'scan') setIsScanModalOpen(true);
                  }}
                >
                  <div className={`${action.color} p-5 rounded-[1.75rem] text-white shadow-xl ${action.shadow} group-active:scale-90 transition-all duration-300`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-primary transition-colors">{action.label}</span>
                </div>
              );
              return action.href ? (
                <Link href={action.href} key={action.id}>
                  {content}
                </Link>
              ) : content;
            })}
          </div>

          <Tabs defaultValue="manage" className="space-y-6">
            <div className="overflow-x-auto no-scrollbar pb-1">
              <TabsList className="flex w-max min-w-full bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 h-14 gap-1">
                <TabsTrigger value="manage" className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1 min-w-[100px]">Transact</TabsTrigger>
                <TabsTrigger value="cards" className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1 min-w-[100px]">Cards</TabsTrigger>
                <TabsTrigger value="vaults" className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1 min-w-[100px]">Vault</TabsTrigger>
                <TabsTrigger value="history" className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1 min-w-[100px]">History</TabsTrigger>
                <TabsTrigger value="security" className="rounded-xl font-bold uppercase tracking-widest text-[10px] flex-1 min-w-[100px]">Security</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="manage" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Enhanced Add Funds */}
                <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                        <Plus className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-black uppercase tracking-widest">Deposit</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-tight">Instant Secure Top-up</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-8">
                    <div className="space-y-3">
                      <Label htmlFor="add-amount" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount to Deposit</Label>
                      <div className="relative">
                        <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-xl">₦</span>
                        <Input
                          id="add-amount"
                          type="number"
                          placeholder="0.00"
                          className="pl-12 h-16 text-2xl font-black rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-emerald-500 transition-all"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {['1000', '5000', '10000'].map(val => (
                        <Button
                          key={val}
                          variant="outline"
                          onClick={() => setAmount(val)}
                          className="rounded-2xl border-slate-100 py-7 font-black text-sm hover:border-emerald-500 hover:bg-emerald-50/30 active:scale-95 transition-all"
                        >
                          ₦{parseInt(val).toLocaleString()}
                        </Button>
                      ))}
                    </div>

                    <Button
                      onClick={addFunds}
                      className="w-full h-16 rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      disabled={!amount || parseFloat(amount) <= 0 || isAddingFunds}
                    >
                      {isAddingFunds ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <CreditCard className="mr-2 h-5 w-5" />
                      )}
                      {isAddingFunds ? 'Verifying...' : 'Pay Securely'}
                    </Button>

                    <Separator />

                    {/* Dedicated Virtual Account Section */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-slate-500 font-bold text-xs uppercase tracking-widest">Bank Transfer Top-up</Label>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px]">Permanent</Badge>
                      </div>

                      {walletData?.dva ? (
                        <div className="relative overflow-hidden bg-slate-950 text-white p-6 rounded-[1.5rem] border border-white/5 shadow-2xl group">
                          <div className="relative z-10 space-y-5">
                            <div className="flex justify-between items-center">
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Bank Account Number</p>
                              <div className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                                <Banknote className="h-4 w-4 text-emerald-400" />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-widest break-all">{walletData.dva.account_number}</h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                                onClick={() => copyToClipboard(walletData.dva.account_number)}
                              >
                                {hasCopied ? <Check className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                              </Button>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-white/5 overflow-hidden">
                              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{walletData.dva.bank_name}</p>
                              <div className="w-1 h-1 rounded-full bg-slate-700 shrink-0"></div>
                              <p className="text-[10px] sm:text-xs font-medium text-slate-500 truncate">{walletData.dva.account_name}</p>
                            </div>
                          </div>
                          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="h-24 w-24" />
                          </div>
                        </div>
                      ) : !isKycComplete ? (
                        <div className="space-y-4">
                          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl">
                            <div className="flex gap-3">
                              <Lock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wide">KYC Required</p>
                                <p className="text-[10px] text-amber-800/70 dark:text-amber-500/70 mt-0.5">Your permanent transfer account is automatically generated once you complete your identity verification.</p>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            asChild
                            className="w-full h-14 rounded-2xl border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-amber-700 font-bold"
                          >
                            <Link href="/kyc">
                              <ShieldCheck className="mr-2 h-5 w-5" />
                              Complete KYC to Unlock
                            </Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                          <div>
                            <p className="text-sm font-bold">Generating your DVA...</p>
                            <p className="text-xs text-slate-500">Your account will be ready in a moment.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                      <div className="flex gap-3">
                        <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-blue-900 dark:text-blue-300">Secured Settlement</p>
                          <p className="text-[10px] text-blue-700/70 dark:text-blue-400/60">Your payments are encrypted and strictly verified through Paystack's security layer.</p>
                        </div>
                      </div>
                    </div>


                  </CardContent>
                </Card>

                {/* Enhanced Transfer */}
                <Card className="border-none shadow-sm rounded-[2rem] overflow-hidden bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800">
                  <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-slate-900 dark:bg-slate-800 rounded-xl">
                        <Send className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-black uppercase tracking-widest">Transfer</CardTitle>
                        <CardDescription className="text-[10px] font-bold uppercase tracking-tight">Send to Bank Account</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none">Recipient Account</Label>
                        <button
                          onClick={() => {
                            setScanTab('scan');
                            setIsScanModalOpen(true);
                          }}
                          className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors"
                        >
                          <QrCode className="h-3 w-3" />
                          Use QR
                        </button>
                      </div>
                      <Input
                        id="recipient-account-input"
                        placeholder="0000000000"
                        className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 focus:bg-white font-mono text-lg tracking-widest transition-all"
                        value={recipientAccount}
                        onChange={(e) => setRecipientAccount(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bank Code</Label>
                        <Input
                          placeholder="058"
                          className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-mono tracking-widest"
                          value={recipientBank}
                          onChange={(e) => setRecipientBank(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">₦</span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="h-14 pl-8 rounded-2xl bg-slate-50/50 border-slate-100 font-black text-lg"
                            value={transferAmount}
                            onChange={(e) => setTransferAmount(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {recipientName && (
                      <div className="bg-green-500/5 border border-green-500/10 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-green-600" />
                          <span className="text-[10px] font-bold text-green-700 uppercase">Verified Name</span>
                        </div>
                        <span className="text-xs font-bold text-green-900">{recipientName}</span>
                      </div>
                    )}

                    {isResolving && (
                      <div className="flex items-center gap-2 px-1">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        <span className="text-[10px] text-slate-400 font-medium">Verifying account...</span>
                      </div>
                    )}

                    {walletData && (
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-slate-400">AVAILABLE</span>
                        <span className="text-xs font-bold text-slate-700">₦{balance.toLocaleString()}</span>
                      </div>
                    )}

                    <Button
                      onClick={withdrawFunds}
                      className="w-full h-16 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 transition-all font-black uppercase tracking-[0.2em] shadow-2xl mt-2"
                      disabled={isTransferring || !transferAmount || parseFloat(transferAmount) > balance || (!recipientName && !recipientBank.toLowerCase().includes('ibom'))}
                    >
                      {isTransferring ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      ) : (
                        <ArrowUpRight className="mr-2 h-5 w-5" />
                      )}
                      {isTransferring ? 'Verifying...' : 'Confirm X-Transfer'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className={`border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-slate-950 text-white relative transition-all duration-500 ${walletData?.isCardFrozen ? 'grayscale opacity-70' : ''}`}>
                  {/* Visual Mesh */}
                  <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none"></div>

                  <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-8">
                    <div>
                      <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-1">Virtual Card</p>
                      <CardTitle className="text-2xl font-black">Ibom X Global</CardTitle>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                      <CreditCard className="h-6 w-6 text-indigo-400" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 space-y-8">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Card Number</p>
                      <h3 className="text-xl sm:text-2xl font-mono tracking-widest">**** **** **** 4092</h3>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Expiry</p>
                          <p className="font-mono font-medium tracking-widest">12/28</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">CVV</p>
                          <div className="flex items-center gap-2 cursor-pointer group">
                            <p className="font-mono font-medium tracking-widest">***</p>
                            <Eye className="h-3 w-3 text-slate-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Status</p>
                        {walletData?.isCardFrozen ? (
                          <Badge variant="outline" className="text-rose-400 border-rose-400/30 bg-rose-400/10 uppercase font-black text-[9px] tracking-widest">Frozen</Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10 uppercase font-black text-[9px] tracking-widest">Active</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 px-1">Card Controls</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div onClick={toggleCardFreeze} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl flex flex-col gap-4 cursor-pointer hover:scale-105 transition-transform">
                      <div className="h-10 w-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Snowflake className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{walletData?.isCardFrozen ? 'Unfreeze Card' : 'Freeze Card'}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{walletData?.isCardFrozen ? 'Re-enable for use' : 'Temporarily disable'}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl flex flex-col gap-4 cursor-pointer hover:scale-105 transition-transform">
                      <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Set Limits</p>
                        <p className="text-[10px] text-slate-500 font-medium">Daily & monthly caps</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl flex flex-col gap-4 cursor-pointer hover:scale-105 transition-transform col-span-2">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Replace Card</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Lost or stolen? Get a new virtual card instantly.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vaults" className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Savings Vaults</h3>
                <Button size="sm" onClick={() => setIsCreateVaultOpen(true)} className="h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase text-[10px] tracking-widest shadow-md">
                  <Plus className="mr-1 h-4 w-4" /> New Vault
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {vaults.map(vault => {
                  const percentage = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
                  return (
                    <Card key={vault.id} className="border border-emerald-100 dark:border-emerald-900/30 shadow-sm rounded-3xl overflow-hidden bg-emerald-50 dark:bg-emerald-900/10">
                      <CardContent className="p-6 space-y-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Target: ₦{vault.targetAmount.toLocaleString()}</p>
                            <CardTitle className="text-xl font-bold">{vault.name}</CardTitle>
                          </div>
                          <div className="h-12 w-12 bg-white dark:bg-emerald-950 rounded-full flex items-center justify-center shadow-sm">
                            <PiggyBank className="h-6 w-6 text-emerald-500" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-end">
                            <h4 className="text-2xl font-black font-mono tracking-tight text-emerald-950 dark:text-white">₦{vault.currentAmount.toLocaleString()}</h4>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2 py-0.5 rounded text-[10px]">{percentage}%</span>
                          </div>
                          <div className="h-2 w-full bg-emerald-200 dark:bg-emerald-950 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>

                        <Button onClick={() => setTopUpVaultId(vault.id)} variant="outline" className="w-full h-12 rounded-2xl border-emerald-200 dark:border-emerald-800 bg-white/50 dark:bg-slate-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-bold text-emerald-800 dark:text-emerald-300">
                          <Zap className="mr-2 h-4 w-4" /> Quick Top-up
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}

                <Card onClick={() => setIsCreateVaultOpen(true)} className="border border-dashed border-slate-300 dark:border-slate-800 shadow-none rounded-3xl bg-transparent flex flex-col items-center justify-center p-8 text-center min-h-[200px] hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group">
                  <div className="h-14 w-14 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <PiggyBank className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">Create a Vault</h3>
                  <p className="text-xs text-slate-500 max-w-[200px]">Lock funds away securely to meet your specific financial goals.</p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Transaction Feed</h3>
                <Button variant="ghost" size="sm" className="text-xs gap-2 rounded-full border border-slate-200">
                  <Filter className="h-3 w-3" />
                  Filter
                </Button>
              </div>

              <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                <CardContent className="p-0">
                  {transactions.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <History className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-slate-500 font-medium">No activity in this period</p>
                      <p className="text-xs text-slate-400 mt-1">Your payments will show up here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {transactions.map((txn) => (
                        <div key={txn.id} className="flex items-center justify-between p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group border-b border-slate-50 dark:border-slate-800 last:border-0">
                          <div className="flex items-center gap-5">
                            <div className={`p-3.5 rounded-2xl shadow-sm ${txn.type === 'credit' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-800'} group-active:scale-90 transition-transform`}>
                              {txn.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                            </div>
                            <div className="space-y-1">
                              <p className="font-black text-sm tracking-tight">{txn.description}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                  {txn.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {txn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <p className={`font-black text-base tracking-tighter ${txn.type === 'credit' ? 'text-emerald-500' : 'text-slate-950 dark:text-white'}`}>
                              {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                            </p>
                            <div className="flex justify-end">
                              <Badge variant="outline" className="text-[8px] h-4 px-2 font-black border-none bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase tracking-widest">Completed</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
              <Button variant="ghost" className="w-full text-slate-400 text-xs font-bold gap-2">
                <Download className="h-3 w-3" />
                Statement PDF
              </Button>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="space-y-4">
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Security Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm">Transaction PIN</p>
                        <p className="text-xs text-muted-foreground">Require PIN for all transfers</p>
                      </div>
                      <Button
                        variant={isPinSetup ? "outline" : "default"}
                        size="sm"
                        onClick={() => setIsPinSetup(!isPinSetup)}
                        className="rounded-full"
                      >
                        {isPinSetup ? "Disable" : "Enable"}
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-bold text-sm">Biometric Authentication</p>
                        <p className="text-xs text-muted-foreground">Use FaceID or Fingerprint</p>
                      </div>
                      <div className="bg-primary/10 text-primary p-2 rounded-full">
                        <Fingerprint className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                      <div className="flex gap-3">
                        <Lock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-900 dark:text-amber-300">Privacy Mode Enabled</p>
                          <p className="text-[10px] text-amber-700/70 dark:text-amber-400/60">Balance masking is available on the wallet card using the eye icon.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900 text-white rounded-3xl border-none shadow-xl">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Verified Account</p>
                      <p className="text-sm font-medium">KYC Tier 1: ₦50,000 Limit/Day</p>
                    </div>
                    <ShieldCheck className="h-8 w-8 text-green-500" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isScanModalOpen} onOpenChange={setIsScanModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-50 dark:bg-slate-950 border-none rounded-[2rem] overflow-hidden p-0 max-h-[90vh] overflow-y-auto">
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
                      if (result && result.length && result[0]) {
                        // The scanner found something
                        const val = typeof result[0].rawValue === 'string' ? result[0].rawValue : result[0];
                        try {
                          const parsed = JSON.parse(val);
                          if (parsed.type === 'ibomx' && parsed.account) {
                            setRecipientAccount(parsed.account);
                            setRecipientBank('Ibom X (Internal)'); // Dummy code for visual representation
                            setIsScanModalOpen(false);
                            toast({ title: 'QR Scanned', description: 'Ibom X profile accepted.' });
                          }
                        } catch (e) {
                          // Not our JSON payload
                          if (val && val.length === 10 && /^\d+$/.test(val)) {
                            setRecipientAccount(val);
                            setIsScanModalOpen(false);
                            toast({ title: 'Account Scanned', description: `Captured account ${val}` });
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
                      audio: false,
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
                        value={JSON.stringify({ type: 'ibomx', account: walletData.dva.account_number })}
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-none rounded-[2rem] overflow-hidden p-8 text-center">
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-none rounded-[2.5rem] p-8">
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
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-none rounded-[2.5rem] p-8">
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
    </>
  );
}
