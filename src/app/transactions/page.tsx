'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight, Plus, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import React, { useState, useEffect } from 'react';
import { useLoading } from '@/context/loading-context';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function TransactionsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { isLoading, showLoader } = useLoading();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const walletDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'wallets', user.uid) : null),
    [firestore, user]
  );

  const { data: walletData, isLoading: isWalletLoading } = useDoc<WalletData>(walletDocRef);

  // Load transactions
  useEffect(() => {
    if (!user || !firestore) return;

    const transactionsRef = collection(firestore, 'wallets', user.uid, 'transactions');
    const q = query(transactionsRef, orderBy('timestamp', 'desc'));

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

    showLoader(2000);
    try {
      const newBalance = walletData.balance + numAmount;
      await updateDoc(walletDocRef!, { balance: newBalance });

      await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
        type: 'credit',
        amount: numAmount,
        description: 'Funds added',
        timestamp: new Date()
      });

      setAmount('');
      toast({
        title: 'Funds Added',
        description: `₦${numAmount.toLocaleString()} has been added to your wallet.`
      });
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({
        title: 'Error',
        description: 'Failed to add funds. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const withdrawFunds = async () => {
    if (!amount || !user || !firestore || !walletData) return;

    const numAmount = parseFloat(amount);
    if (numAmount <= 0 || numAmount > walletData.balance) return;

    showLoader(2000);
    try {
      const newBalance = walletData.balance - numAmount;
      await updateDoc(walletDocRef!, { balance: newBalance });

      await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
        type: 'debit',
        amount: numAmount,
        description: 'Funds withdrawn',
        timestamp: new Date()
      });

      setAmount('');
      toast({
        title: 'Funds Withdrawn',
        description: `₦${numAmount.toLocaleString()} has been withdrawn from your wallet.`
      });
    } catch (error) {
      console.error('Error withdrawing funds:', error);
      toast({
        title: 'Error',
        description: 'Failed to withdraw funds. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="mb-8">
            <h1 className="font-headline text-3xl font-bold tracking-tight">Your Wallet</h1>
            <p className="text-muted-foreground">
            Manage your balance and view your transaction history.
            </p>
        </div>
        
        <Card glassy>
            <CardHeader>
                <CardTitle className='font-headline'>Current Balance</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-4xl font-bold tracking-tighter">
                ₦{walletData?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
                <div className="mt-4 space-y-2">
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
            </CardContent>
            <CardFooter className='flex-col sm:flex-row gap-2'>
                <Button className='w-full sm:flex-1' onClick={addFunds} disabled={!amount || isLoading || isWalletLoading}>
                    <Plus className='mr-2'/>
                    Add Funds
                </Button>
                <Button variant="outline" className='w-full sm:flex-1' onClick={withdrawFunds} disabled={!amount || !walletData || parseFloat(amount) > walletData.balance || isLoading || isWalletLoading}>
                    Withdraw Funds
                </Button>
            </CardFooter>
        </Card>

        <Card glassy>
          <CardHeader className='flex-row items-center justify-between'>
            <CardTitle className="font-headline">Transaction History</CardTitle>
            <Button variant="outline" size="sm">
                <Download className='mr-2'/>
                Export
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No transactions yet</p>
            ) : (
              transactions.map((tx, index) => (
                <React.Fragment key={tx.id}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className='flex items-center gap-3'>
                          <div className={cn(
                              'p-2 rounded-full',
                              tx.type === 'credit' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                          )}>
                              {tx.type === 'credit' ? <ArrowDownLeft /> : <ArrowUpRight />}
                          </div>
                          <div>
                              <p className='font-semibold'>{tx.description}</p>
                              <p className='text-sm text-muted-foreground'>{tx.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                      </div>
                      <p className={cn(
                          'font-bold text-lg',
                          tx.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      )}>
                          {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                      </p>
                  </div>
                  {index < transactions.length - 1 && <Separator />}
                </React.Fragment>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
