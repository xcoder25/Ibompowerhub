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
  DollarSign
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection, addDoc, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

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

  const walletDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
    [firestore, user]
  );

  const { data: walletData, isLoading } = useDoc<WalletData>(walletDocRef);

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
    if (!amount || !user || !firestore || !walletData) return;

    const numAmount = parseFloat(amount);
    if (numAmount <= 0) return;

    try {
      const newBalance = walletData.balance + numAmount;

      // Update wallet balance
      await updateDoc(walletDocRef!, { balance: newBalance });

      // Add transaction
      await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
        type: 'credit',
        amount: numAmount,
        description: 'Funds added to wallet',
        timestamp: new Date(),
        reference: `ADD-${Date.now()}`
      });

      setAmount('');
      toast({
        title: 'Funds Added',
        description: `₦${numAmount.toLocaleString()} has been added to your wallet.`
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add funds. Please try again.'
      });
    }
  };

  const withdrawFunds = async () => {
    if (!amount || !user || !firestore || !walletData) return;

    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > walletData.balance) return;

    try {
      const newBalance = walletData.balance - numAmount;

      // Update wallet balance
      await updateDoc(walletDocRef!, { balance: newBalance });

      // Add transaction
      await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
        type: 'debit',
        amount: numAmount,
        description: 'Funds withdrawn from wallet',
        timestamp: new Date(),
        reference: `WD-${Date.now()}`
      });

      setAmount('');
      toast({
        title: 'Funds Withdrawn',
        description: `₦${numAmount.toLocaleString()} has been withdrawn from your wallet.`
      });
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to withdraw funds. Please try again.'
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
                    disabled={!amount || parseFloat(amount) <= 0}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Funds
                  </Button>
                </CardContent>
              </Card>

              {/* Withdraw Funds */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Minus className="h-5 w-5 text-red-600" />
                    Withdraw Funds
                  </CardTitle>
                  <CardDescription>
                    Transfer money to your bank account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">Amount (₦)</Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      placeholder="1000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Available: ₦{balance.toLocaleString()}
                  </div>
                  <Button
                    variant="outline"
                    onClick={withdrawFunds}
                    className="w-full"
                    disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > balance}
                  >
                    <Minus className="mr-2 h-4 w-4" />
                    Withdraw
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