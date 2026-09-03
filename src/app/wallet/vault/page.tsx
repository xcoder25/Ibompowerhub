'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  PiggyBank,
  Plus,
  TrendingUp,
  Lock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { formatNaira } from '@/lib/wallet-utils';

export default function WalletVaultPage() {
  const [vaults, setVaults] = useState([
    {
      id: 'v1',
      name: 'Farmland Expansion Savings',
      targetAmount: 500000,
      currentAmount: 185000,
      interestRate: 12.5,
    },
    {
      id: 'v2',
      name: 'Christmas Foodstuff Bulk Fund',
      targetAmount: 150000,
      currentAmount: 95000,
      interestRate: 11.0,
    },
  ]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultTarget, setNewVaultTarget] = useState('');

  const totalSaved = vaults.reduce((acc, v) => acc + v.currentAmount, 0);

  const handleCreateVault = () => {
    if (!newVaultName || !newVaultTarget) return;
    setVaults([
      ...vaults,
      {
        id: 'v_' + Date.now(),
        name: newVaultName,
        targetAmount: parseFloat(newVaultTarget) || 100000,
        currentAmount: 0,
        interestRate: 12.0,
      },
    ]);
    setNewVaultName('');
    setNewVaultTarget('');
    setCreateModalOpen(false);
  };

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
              Savings Vaults
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">High-yield target savings</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setCreateModalOpen(true)}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 px-3 gap-1 shadow-xs"
        >
          <Plus className="size-3.5" /> New Vault
        </Button>
      </div>

      <div className="max-w-md mx-auto px-4 pt-5 space-y-5">
        {/* Total Vault Balance Banner */}
        <Card className="rounded-3xl border-emerald-500/30 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                Total Saved in Vaults
              </span>
              <Badge className="bg-emerald-500 text-slate-950 font-black text-[9px] px-2 py-0.5">
                Up to 12.5% p.a.
              </Badge>
            </div>
            <p className="text-3xl font-black text-white">{formatNaira(totalSaved)}</p>
            <p className="text-xs text-slate-300 flex items-center gap-1">
              <TrendingUp className="size-3.5 text-emerald-400" />
              Accruing daily interest paid at maturity
            </p>
          </div>
        </Card>

        {/* Vaults List */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
            Active Targets ({vaults.length})
          </h2>

          {vaults.map((v) => {
            const pct = Math.min(100, Math.round((v.currentAmount / v.targetAmount) * 100));
            return (
              <Card
                key={v.id}
                className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                        <PiggyBank className="size-4" />
                      </div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[200px]">
                        {v.name}
                      </h3>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-700 text-[9px] font-bold border-none">
                      {v.interestRate}% p.a.
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-black text-slate-900 dark:text-white">
                        {formatNaira(v.currentAmount)}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Goal: {formatNaira(v.targetAmount)}
                      </span>
                    </div>
                    <Progress value={pct} className="h-2 bg-slate-100 dark:bg-slate-800" />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{pct}% Achieved</span>
                      <span>Target locked</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Create Vault Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black">Create Savings Vault</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-slate-700">Goal Name</label>
              <Input
                placeholder="e.g. Fertilizer & Seeds Fund"
                value={newVaultName}
                onChange={(e) => setNewVaultName(e.target.value)}
                className="rounded-xl h-10 text-xs mt-1"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Target Amount (₦)</label>
              <Input
                type="number"
                placeholder="e.g. 200000"
                value={newVaultTarget}
                onChange={(e) => setNewVaultTarget(e.target.value)}
                className="rounded-xl h-10 text-xs mt-1"
              />
            </div>
          </div>
          <DialogFooter className="pt-2 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateModalOpen(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateVault}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4"
            >
              Start Vault
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
