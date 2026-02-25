'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Send
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { loadPaystackScript, initializePaystack, verifyPayment } from '@/lib/paystack';

type WalletData = {
  balance: number;
  currency: string;
};

type Transaction = {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: Date;
  reference?: string;
};

export default function WalletPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Transfer states
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [recipientBank, setRecipientBank] = useState('');
  const [transferReason, setTransferReason] = useState('');

  const walletDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
    [firestore, user]
  );

  const { data: walletData, isLoading } = useDoc<WalletData>(walletDocRef);

  // Load Paystack script
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_...';
    if (publicKey && publicKey !== 'pk_test_...') {
      loadPaystackScript(publicKey)
        .then(() => {
          setPaystackLoaded(true);
        })
        .catch((error) => {
          console.error('Failed to load Paystack:', error);
          toast({
            variant: 'destructive',
            title: 'Payment Error',
            description: 'Failed to load payment system. Please refresh the page.'
          });
        });
    } else {
      console.warn('Paystack public key not configured');
    }
  }, [toast]);

  // Initialize wallet if it doesn't exist
  useEffect(() => {
    if (user && firestore && !walletData && !isLoading) {
      const initWallet = async () => {
        try {
          await updateDoc(doc(firestore, 'wallets', user.uid), {
            balance: 10000, // Starting balance for demo
            currency: 'NGN'
          });
        } catch (error) {
          console.error('Error initializing wallet:', error);
        }
      };
      initWallet();
    }
  }, [user, firestore, walletData, isLoading]);

  // Load transactions
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

  const addFunds = async () => {
    if (!amount || !user || !firestore || !paystackLoaded) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Payment system not ready. Please wait a moment.'
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

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '';
    if (!publicKey || publicKey === 'pk_test_...') {
      toast({
        variant: 'destructive',
        title: 'Configuration Error',
        description: 'Paystack public key not configured. Please contact support.'
      });
      return;
    }

    setIsProcessing(true);
    const reference = `PH-${Date.now()}-${user.uid}`;

    try {
      initializePaystack({
        publicKey,
        email: user.email || '',
        amount: numAmount * 100, // Convert to kobo
        reference,
        metadata: {
          userId: user.uid,
          userName: user.displayName || '',
          custom_fields: [
            {
              display_name: 'Wallet Top-up',
              variable_name: 'wallet_topup',
              value: 'true'
            }
          ]
        },
        onSuccess: async (response: any) => {
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
              setIsProcessing(false);
              toast({
                title: 'Payment Successful',
                description: `₦${verifiedAmount.toLocaleString()} has been added to your wallet.`
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            setIsProcessing(false);
            toast({
              variant: 'destructive',
              title: 'Verification Error',
              description: 'Payment received but verification failed. Please contact support with reference: ' + response.reference
            });
          }
        },
        onClose: () => {
          setIsProcessing(false);
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment process.'
          });
        }
      });
    } catch (error) {
      console.error('Error initializing payment:', error);
      setIsProcessing(false);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.'
      });
    }
  };

  const withdrawFunds = async () => {
    if (!transferAmount || !user || !firestore || !walletData) {
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

    if (!recipientName || !recipientAccount || !recipientBank) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide recipient name, account number, and bank.'
      });
      return;
    }

    setIsProcessing(true);
    const baseUrl = window.location.origin;

    try {
      // Step 1: Create transfer recipient
      const recipientResponse = await fetch(`${baseUrl}/api/paystack/create-recipient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'nuban',
          name: recipientName,
          account_number: recipientAccount,
          bank_code: recipientBank,
          currency: 'NGN'
        })
      });

      if (!recipientResponse.ok) {
        throw new Error('Failed to create recipient');
      }

      const recipientData = await recipientResponse.json();
      const recipientCode = recipientData.data.recipient_code;

      // Step 2: Initiate transfer
      const transferResponse = await fetch(`${baseUrl}/api/paystack/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'balance',
          amount: numAmount * 100, // Convert to kobo
          recipient: recipientCode,
          reason: transferReason || 'Wallet withdrawal',
          reference: `WD-${Date.now()}-${user.uid}`
        })
      });

      if (!transferResponse.ok) {
        throw new Error('Transfer failed');
      }

      const transferData = await transferResponse.json();

      if (transferData.status && transferData.data.status === 'success') {
        // Update wallet balance
        const newBalance = walletData.balance - numAmount;
        await updateDoc(walletDocRef!, { balance: newBalance });

        // Add transaction
        await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
          type: 'debit',
          amount: numAmount,
          description: `Transfer to ${recipientName} - ${transferReason || 'Wallet withdrawal'}`,
          timestamp: new Date(),
          reference: transferData.data.reference || `WD-${Date.now()}`
        });

        // Reset form
        setTransferAmount('');
        setRecipientName('');
        setRecipientAccount('');
        setRecipientBank('');
        setTransferReason('');
        setIsProcessing(false);

        toast({
          title: 'Transfer Successful',
          description: `₦${numAmount.toLocaleString()} has been transferred to ${recipientName}.`
        });
      } else {
        throw new Error(transferData.message || 'Transfer failed');
      }
    } catch (error: any) {
      console.error('Error processing transfer:', error);
      setIsProcessing(false);
      toast({
        variant: 'destructive',
        title: 'Transfer Failed',
        description: error.message || 'Failed to process transfer. Please try again.'
      });
    }
  };

  const balance = walletData?.balance || 0;
  const currency = walletData?.currency || 'NGN';

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-headline text-3xl font-bold">PowerHub Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and transactions</p>
        </div>

        {/* Balance Card */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Current Balance</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold">₦{balance.toLocaleString()}</span>
                  <Badge variant="secondary" className="text-xs">
                    {currency}
                  </Badge>
                </div>
              </div>
              <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="manage" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manage">Manage Funds</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>

          <TabsContent value="manage" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Funds */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    Add Funds
                  </CardTitle>
                  <CardDescription>
                    Top up your wallet balance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-amount">Amount (₦)</Label>
                    <Input
                      id="add-amount"
                      type="number"
                      placeholder="1000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAmount('1000')}
                      className="text-xs"
                    >
                      ₦1,000
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAmount('5000')}
                      className="text-xs"
                    >
                      ₦5,000
                    </Button>
                  </div>
                  <Button
                    onClick={addFunds}
                    className="w-full"
                    disabled={!amount || parseFloat(amount) <= 0 || isProcessing || !paystackLoaded}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Pay with Paystack'}
                  </Button>
                  {!paystackLoaded && (
                    <p className="text-xs text-muted-foreground text-center">
                      Loading payment system...
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Transfer Funds */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5 text-blue-600" />
                    Transfer Funds
                  </CardTitle>
                  <CardDescription>
                    Send money to bank account via Paystack
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="transfer-amount">Amount (₦)</Label>
                    <Input
                      id="transfer-amount"
                      type="number"
                      placeholder="1000"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient-name">Recipient Name</Label>
                    <Input
                      id="recipient-name"
                      type="text"
                      placeholder="John Doe"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient-account">Account Number</Label>
                    <Input
                      id="recipient-account"
                      type="text"
                      placeholder="0123456789"
                      value={recipientAccount}
                      onChange={(e) => setRecipientAccount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recipient-bank">Bank Code</Label>
                    <Input
                      id="recipient-bank"
                      type="text"
                      placeholder="058 (GTBank)"
                      value={recipientBank}
                      onChange={(e) => setRecipientBank(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Find bank codes at paystack.com/docs/payments/transfers/bank-codes
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transfer-reason">Reason (Optional)</Label>
                    <Input
                      id="transfer-reason"
                      type="text"
                      placeholder="Payment for services"
                      value={transferReason}
                      onChange={(e) => setTransferReason(e.target.value)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Available: ₦{balance.toLocaleString()}
                  </div>
                  <Button
                    onClick={withdrawFunds}
                    className="w-full"
                    disabled={!transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > balance || isProcessing || !recipientName || !recipientAccount || !recipientBank}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {isProcessing ? 'Processing...' : 'Transfer'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common wallet operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Smartphone className="h-6 w-6" />
                    <span className="text-xs">Mobile Top-up</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <CreditCard className="h-6 w-6" />
                    <span className="text-xs">Pay Bills</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <Banknote className="h-6 w-6" />
                    <span className="text-xs">Send Money</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col space-y-2">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-xs">Invest</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>
                  Your wallet activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {txn.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{txn.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {txn.timestamp.toLocaleDateString()} • {txn.reference}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.type === 'credit' ? '+' : '-'}₦{txn.amount.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}