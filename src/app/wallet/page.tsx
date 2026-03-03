'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, updateDoc, where, getDocs } from 'firebase/firestore';
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

  // Simulator for Starter/Test mode
  const [showSimulatePrompt, setShowSimulatePrompt] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
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

  return (
    <>
      {!isUnlocked && <WalletLock onUnlock={handleUnlock} />}
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
        {/* Cinematic Background Glows */}
        <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-emerald-500/10 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
        <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-orange-500/10 rounded-full blur-[200px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

        <div className="container mx-auto p-4 md:p-12 space-y-12 relative z-10">

          {/* Header - Premium Look */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <Wallet className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                  Ibom <span className="bg-gradient-to-r from-emerald-500 to-orange-500 bg-clip-text text-transparent italic tracking-tightest">Pay.</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em]">Official ARISE Ecosystem</p>
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

            <TabsContent value="manage" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Institutional Deposit Protocol */}
                <Card className="border-none shadow-[0_80px_160px_-30px_rgba(16,185,129,0.15)] rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 hover:shadow-[0_100px_200px_-40px_rgba(16,185,129,0.25)] transition-all duration-700">
                  <CardHeader className="p-10 pb-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-black px-4 py-1 rounded-full uppercase text-[9px] tracking-widest">Inbound Protocol</Badge>
                        <CardTitle className="text-4xl font-black tracking-tightest">DEPOSIT</CardTitle>
                      </div>
                      <div className="size-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center shadow-inner">
                        <Plus className="size-8 text-emerald-600" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Quantum of Injection</Label>
                      <div className="relative group">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-slate-300 text-3xl transition-colors group-focus-within:text-emerald-500">₦</span>
                        <Input
                          type="number"
                          placeholder="0.00"
                          className="pl-16 h-24 text-4xl font-black rounded-3xl border-none bg-slate-50 dark:bg-slate-950/50 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-inner tracking-tighter"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {['5000', '10000', '25000'].map(val => (
                          <Button
                            key={val}
                            variant="outline"
                            onClick={() => setAmount(val)}
                            className="rounded-2xl border-slate-100 dark:border-slate-800 py-8 font-black text-xs uppercase tracking-widest hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 active:scale-95 transition-all shadow-sm"
                          >
                            ₦{parseInt(val).toLocaleString()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={addFunds}
                      className="w-full h-20 rounded-3xl text-sm font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(16,185,129,0.4)] bg-emerald-600 hover:bg-emerald-500 transition-all hover:scale-[1.02] active:scale-[0.95] py-6"
                      disabled={!amount || parseFloat(amount) <= 0 || isAddingFunds}
                    >
                      {isAddingFunds ? <Loader2 className="mr-3 size-6 animate-spin" /> : <CreditCard className="mr-3 size-6" />}
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
                            <div className="flex items-center gap-4">
                              <h3 className="text-3xl font-black font-mono tracking-[0.15em] text-white group-hover:text-emerald-400 transition-colors">{walletData.dva.account_number}</h3>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-12 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl"
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(walletData.dva.account_number); }}
                              >
                                {hasCopied ? <Check className="size-6 text-emerald-500" /> : <Copy className="size-6" />}
                              </Button>
                            </div>
                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                              <span className="text-xs font-black uppercase tracking-widest text-slate-400">{walletData.dva.bank_name}</span>
                              <div className="size-1 rounded-full bg-slate-700" />
                              <span className="text-xs font-medium text-slate-500 truncate italic">{walletData.dva.account_name}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4 group hover:border-emerald-500/50 transition-all">
                          <div className="size-20 rounded-full bg-slate-100 dark:bg-slate-900 mx-auto flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500 transition-all">
                            <Lock className="size-10 text-slate-300 group-hover:text-white" />
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
                <Card className="border-none shadow-[0_80px_160px_-30px_rgba(15,23,42,0.15)] rounded-[3rem] overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 hover:shadow-[0_100px_200px_-40px_rgba(15,23,42,0.25)] transition-all duration-700">
                  <CardHeader className="p-10 pb-0">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Badge className="bg-slate-950/10 text-slate-500 border-none font-black px-4 py-1 rounded-full uppercase text-[9px] tracking-widest">Outbound Protocol</Badge>
                        <CardTitle className="text-4xl font-black tracking-tightest">TRANSFER</CardTitle>
                      </div>
                      <div className="size-16 bg-slate-950 text-white rounded-2xl flex items-center justify-center shadow-xl">
                        <Send className="size-8" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
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
                          placeholder="RECIPIENT ACCOUNT"
                          className="h-20 rounded-3xl bg-slate-50/50 border-none focus:bg-white font-mono text-2xl tracking-[0.2em] px-8 shadow-inner"
                          value={recipientAccount}
                          onChange={(e) => setRecipientAccount(e.target.value)}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Gateway</Label>
                          <Select value={recipientBank} onValueChange={setRecipientBank}>
                            <SelectTrigger className="h-16 rounded-2xl border-none bg-slate-50/50 font-black uppercase text-[10px] tracking-widest px-6 shadow-inner">
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
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Liquidity</Label>
                          <div className="relative group">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm group-focus-within:text-slate-950 transition-colors">₦</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              className="h-16 pl-10 rounded-2xl border-none bg-slate-50/50 font-black text-xl shadow-inner focus:bg-white transition-all"
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
                        className="w-full h-20 rounded-3xl bg-slate-950 text-white hover:bg-emerald-600 transition-all font-black uppercase tracking-[0.3em] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.3)] active:scale-95 py-6"
                        disabled={isTransferring || !transferAmount || parseFloat(transferAmount) > balance || (!recipientName && !recipientBank.toLowerCase().includes('ibom'))}
                      >
                        {isTransferring ? <Loader2 className="mr-3 size-6 animate-spin" /> : <ArrowUpRight className="mr-3 size-6" />}
                        {isTransferring ? 'SYNCHRONIZING...' : 'EXECUTE X-TRANSFER'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cards" className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Ultra-Premium Virtual Card */}
                <div className="relative group perspective-2000">
                  <div className="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-emerald-600 rounded-[3.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>

                  <Card className={`relative border-none shadow-[0_80px_160px_-30px_rgba(0,0,0,0.4)] rounded-[3.5rem] overflow-hidden bg-slate-950 text-white min-h-[380px] flex flex-col justify-between p-12 transition-all duration-700 ${walletData?.isCardFrozen ? 'grayscale opacity-60' : 'hover:-translate-y-4 hover:rotate-1'}`}>
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

                    <div className="relative z-10 space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Global Terminal Identifier</p>
                      <h3 className="text-3xl sm:text-4xl font-black font-mono tracking-[0.2em] drop-shadow-2xl">4092 • 8820 • 0012 • 9024</h3>
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

            <TabsContent value="vaults" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
              <div className="flex items-center justify-between px-2">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black tracking-tighter">Strategic Vaults</h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Target-Based Wealth Preservation</p>
                </div>
                <Button onClick={() => setIsCreateVaultOpen(true)} className="size-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/20 active:scale-90 transition-all">
                  <Plus className="size-8" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {vaults.map((vault, idx) => {
                  const percentage = Math.min(100, Math.round((vault.currentAmount / vault.targetAmount) * 100));
                  return (
                    <Card key={vault.id} className="group relative border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_120px_-30px_rgba(16,185,129,0.3)] transition-all duration-700 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-10" style={{ animationDelay: `${idx * 100}ms` }}>
                      <CardContent className="p-8 space-y-8">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-black px-4 py-1.5 rounded-xl uppercase text-[9px] tracking-widest shadow-sm">
                              ID: {vault.id.slice(0, 8).toUpperCase()}
                            </Badge>
                            <CardTitle className="text-3xl font-black tracking-tightest leading-none">{vault.name}</CardTitle>
                          </div>
                          <div className="size-16 bg-slate-50 dark:bg-emerald-950 rounded-[1.5rem] flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-500">
                            <PiggyBank className="size-8 text-emerald-500" />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex justify-between items-end">
                            <div className="space-y-1">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Preserved Capital</p>
                              <h4 className="text-4xl font-black font-mono tracking-tight text-slate-950 dark:text-white">₦{vault.currentAmount.toLocaleString()}</h4>
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
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg">Transaction Feed</h3>
                <Button variant="ghost" size="sm" className="text-xs gap-2 rounded-full border border-slate-200">
                  <Filter className="h-3 w-3" />
                  Filter
                </Button>
              </div>

              <TabsContent value="history" className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                  <div className="space-y-2">
                    <Badge className="bg-slate-900/10 text-slate-500 border-none font-black px-4 py-1 rounded-full uppercase text-[9px] tracking-widest">Digital Ledger</Badge>
                    <h3 className="text-4xl font-black tracking-tightest">TRANSACTION FEED</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Historical Telemetry & Settlements</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-2xl border-slate-100 dark:border-slate-800 font-black uppercase text-[9px] tracking-widest px-6 h-12 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                      All Nodes
                    </Button>
                    <Button variant="outline" className="rounded-2xl border-slate-100 dark:border-slate-800 font-black uppercase text-[9px] tracking-widest px-6 h-12 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all">
                      Export CSV
                    </Button>
                  </div>
                </div>

                <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20">
                  <CardContent className="p-4 sm:p-8">
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
                            <div className="flex items-center justify-between p-6 cursor-pointer border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-all">
                              <div className="flex items-center gap-6">
                                <div className={`size-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 group-active:scale-90 ${txn.type === 'credit' ? 'bg-emerald-500/10 text-emerald-600 shadow-emerald-500/10' : 'bg-slate-950 text-white shadow-slate-950/10'}`}>
                                  {txn.type === 'credit' ? <ArrowDownLeft className="size-7" /> : <ArrowUpRight className="size-7" />}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-black text-xl tracking-tightest uppercase text-slate-900 dark:text-white">{txn.description}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-slate-100 dark:bg-slate-800 text-[8px] font-black tracking-widest uppercase py-0.5 px-2 rounded-md border-none text-slate-400">Node ID: {txn.id.slice(-8).toUpperCase()}</Badge>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                      {txn.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} • {txn.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right space-y-2">
                                <p className={`font-black text-2xl tracking-tighter ${txn.type === 'credit' ? 'text-emerald-500' : 'text-slate-950 dark:text-white'}`}>
                                  {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                                </p>
                                <div className="flex justify-end">
                                  <Badge className="text-[9px] h-5 px-3 font-black border-none bg-emerald-500/10 text-emerald-600 uppercase tracking-[0.2em] rounded-lg">Settled ✓</Badge>
                                </div>
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

              <TabsContent value="security" className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700">
                <div className="text-center space-y-3 pb-4">
                  <div className="size-20 rounded-[2rem] bg-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20 group hover:rotate-12 transition-transform duration-500">
                    <ShieldCheck className="size-10 text-emerald-500" />
                  </div>
                  <h3 className="text-4xl font-black tracking-tightest">DEFENSE PROTOCOLS</h3>
                  <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Institutional Grade Assets Protection</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] rounded-[2.5rem] bg-white dark:bg-slate-900/40 backdrop-blur-3xl p-8 space-y-8 border border-white/20">
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
                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    <div className="relative z-10 space-y-6">
                      <div className="size-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                        <Terminal className="size-8 text-emerald-400" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-3xl font-black tracking-tightest leading-tight">Advanced Encryption Status: <span className="text-emerald-400 italic">SECURE.</span></h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed italic">&quot;RSA-4096 Multi-Region Node Verification is active on this session. All telemetry data is end-to-end sanitized.&quot;</p>
                      </div>
                      <div className="flex items-center gap-3 pt-4">
                        <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 w-[94%] shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">94.8% Integrity</span>
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

      {/* Simulator Dialog for Starter restriction */}
      <Dialog open={showSimulatePrompt} onOpenChange={setShowSimulatePrompt}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-950 border-none rounded-[2.5rem] p-8 text-center">
          <div className="mx-auto bg-amber-100 dark:bg-amber-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <DialogTitle className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">Transfer Restricted</DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500 mb-6">
            Paystack has restricted your account from making live transfers because it is currently in "Starter" mode.
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
          <p className="text-[10px] text-slate-400 mt-6 font-medium">Use Simulation to test the wallet flow until your Paystack account is upgraded.</p>
        </DialogContent>
      </Dialog>
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
    <Card onClick={onClick} className={`border border-none shadow-sm rounded-[2rem] p-7 flex flex-col gap-6 cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all group bg-white dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden relative`}>
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
    <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/20 shadow-sm hover:shadow-md transition-shadow group">
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
