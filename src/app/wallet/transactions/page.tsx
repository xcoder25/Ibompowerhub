'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Share2,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Transaction, formatNaira } from '@/lib/wallet-utils';

export default function WalletTransactionsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user || !firestore) {
      // Demo transactions
      setTransactions([
        {
          id: 't1',
          type: 'credit',
          amount: 25000,
          description: 'Direct Bank Deposit via Wema DVA',
          category: 'deposit',
          reference: 'DVA_883192039',
          timestamp: new Date(),
          status: 'success',
        },
        {
          id: 't2',
          type: 'debit',
          amount: 6000,
          description: 'Transfer to Anietie Udoh (OPay)',
          category: 'transfer',
          recipientName: 'ANIETIE UDOH',
          recipientBank: 'OPay',
          recipientAccount: '8031123344',
          reference: 'TRF_991823901',
          timestamp: new Date(Date.now() - 3600000 * 4),
          status: 'success',
        },
        {
          id: 't3',
          type: 'debit',
          amount: 3500,
          description: 'IBEDC Electricity Bill Token',
          category: 'bill',
          reference: 'PWR_773129033',
          timestamp: new Date(Date.now() - 86400000),
          status: 'success',
        },
        {
          id: 't4',
          type: 'credit',
          amount: 15000,
          description: 'Agro Marketplace Payout (Garri Order)',
          category: 'market',
          reference: 'AGR_110293811',
          timestamp: new Date(Date.now() - 86400000 * 3),
          status: 'success',
        },
      ]);
      setLoading(false);
      return;
    }

    const txnsRef = collection(firestore, 'wallets', user.uid, 'transactions');
    const q = query(txnsRef, orderBy('timestamp', 'desc'));

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
        setTransactions(list);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching transactions:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, firestore, isUserLoading]);

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchRef = (t.reference || '').toLowerCase().includes(q);
      const matchRecipient = (t.recipientName || '').toLowerCase().includes(q);
      return matchDesc || matchRef || matchRecipient;
    }
    return true;
  });

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
              Transaction History
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">All inflows & payments</p>
          </div>
        </div>

        <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border-none px-2.5 py-0.5">
          {filtered.length} Recorded
        </Badge>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by description, reference, or recipient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-2xl h-11 text-xs bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2">
          {(['all', 'credit', 'debit'] as const).map((ft) => (
            <button
              key={ft}
              type="button"
              onClick={() => setFilterType(ft)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                filterType === ft
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {ft === 'all' ? 'All Activity' : ft === 'credit' ? 'Money In' : 'Money Out'}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="py-16 text-center">
            <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-400 font-bold">Loading transactions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center py-16 px-4">
            <Layers className="size-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No transactions found
            </p>
            <p className="text-xs text-slate-400">
              {search ? 'Try clearing your search query.' : 'Transactions will appear here once made.'}
            </p>
          </Card>
        ) : (
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
            <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTxn(t)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        t.type === 'credit'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-rose-500/10 text-rose-600'
                      }`}
                    >
                      {t.type === 'credit' ? (
                        <ArrowDownLeft className="size-5" />
                      ) : (
                        <ArrowUpRight className="size-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {t.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {t.timestamp
                          ? new Date(t.timestamp).toLocaleDateString('en-NG', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Recent'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-3">
                    <p
                      className={`font-black text-sm ${
                        t.type === 'credit'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {t.type === 'credit' ? '+' : '-'}
                      {formatNaira(t.amount)}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600">Successful</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Official Transaction Receipt Modal */}
      {selectedTxn && (
        <Dialog open={Boolean(selectedTxn)} onOpenChange={() => setSelectedTxn(null)}>
          <DialogContent className="max-w-sm rounded-3xl p-6">
            <div className="text-center space-y-2 pb-2">
              <div
                className={`size-12 rounded-full flex items-center justify-center mx-auto ${
                  selectedTxn.type === 'credit'
                    ? 'bg-emerald-500/15 text-emerald-600'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                }`}
              >
                {selectedTxn.type === 'credit' ? (
                  <ArrowDownLeft className="size-6" />
                ) : (
                  <ArrowUpRight className="size-6" />
                )}
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Transaction Receipt
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {selectedTxn.type === 'credit' ? '+' : '-'}
                {formatNaira(selectedTxn.amount)}
              </h3>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] px-2.5 py-0.5">
                Successful
              </Badge>
            </div>

            {/* Receipt Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Description</span>
                <span className="font-bold text-slate-900 dark:text-white text-right max-w-[180px] truncate">
                  {selectedTxn.description}
                </span>
              </div>
              {selectedTxn.recipientName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedTxn.recipientName}
                  </span>
                </div>
              )}
              {selectedTxn.recipientBank && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Bank</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {selectedTxn.recipientBank}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Reference</span>
                <span className="font-mono text-[10px] text-slate-600 dark:text-slate-300">
                  {selectedTxn.reference || selectedTxn.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp</span>
                <span className="text-[10px] text-slate-600 dark:text-slate-300">
                  {selectedTxn.timestamp
                    ? new Date(selectedTxn.timestamp).toLocaleString('en-NG')
                    : 'N/A'}
                </span>
              </div>
            </div>

            <DialogFooter className="pt-2 flex gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setSelectedTxn(null)}
                className="rounded-2xl text-xs h-10 flex-1"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(selectedTxn.reference || selectedTxn.id);
                  alert('Transaction reference copied!');
                }}
                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 flex-1 gap-1.5"
              >
                <Share2 className="size-3.5" /> Copy Ref
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
