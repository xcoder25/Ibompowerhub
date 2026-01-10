
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownLeft, ArrowUpRight, Plus, Download } from 'lucide-react';
import { transactions } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function TransactionsPage() {
  const balance = 245350.75; // Placeholder balance

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
                ₦{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </CardContent>
            <CardFooter className='flex-col sm:flex-row gap-2'>
                <Button className='w-full sm:flex-1'>
                    <Plus className='mr-2'/>
                    Add Funds
                </Button>
                <Button variant="outline" className='w-full sm:flex-1'>
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
            {transactions.map((tx, index) => (
              <React.Fragment key={tx.id}>
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                    <div className='flex items-center gap-3'>
                        <div className={cn(
                            'p-2 rounded-full',
                            tx.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        )}>
                            {tx.type === 'credit' ? <ArrowDownLeft /> : <ArrowUpRight />}
                        </div>
                        <div>
                            <p className='font-semibold'>{tx.description}</p>
                            <p className='text-sm text-muted-foreground'>{new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <p className={cn(
                        'font-bold text-lg',
                        tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    )}>
                        {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                    </p>
                </div>
                {index < transactions.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add a new file at src/app/transactions/page.tsx
import React from 'react';
