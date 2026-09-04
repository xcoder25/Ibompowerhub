'use client';

import React, { useState } from 'react';
import { StepProps } from './types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Sprout,
  Factory,
  Fish,
  Egg,
  Beef,
  TreePine,
  FlaskConical,
  Wrench,
  Briefcase,
  Building2,
  Users,
  Store,
  Check,
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { SELLER_TYPES, SellerCategory } from '@/lib/seller-types';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sprout,
  Factory,
  Fish,
  Egg,
  Beef,
  TreePine,
  FlaskConical,
  Wrench,
  Briefcase,
  Building2,
  Users,
  Store,
};

export function StepSellerType({ data, updateData, onNext, onPrev, onSaveDraft, savingDraft }: StepProps) {
  const [error, setError] = useState<string | null>(null);

  const toggleType = (id: SellerCategory) => {
    const current = [...data.sellerTypes];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    updateData({ sellerTypes: current });
    if (error) setError(null);
  };

  const handleContinue = () => {
    if (data.sellerTypes.length === 0) {
      setError('Please select at least one seller category that describes your agricultural business.');
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2 sm:pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-none font-bold uppercase text-[10px] tracking-wider">
            Step 2 of 7
          </Badge>
          <span className="text-[11px] text-slate-400">• Multi-select allowed</span>
        </div>
        <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          What type of agricultural merchant are you?
        </h2>
        <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">
          Select all categories that apply to your operations in Akwa Ibom State.
        </p>
      </div>

      {error && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {SELLER_TYPES.map((type) => {
          const isSelected = data.sellerTypes.includes(type.id);
          const IconComponent = ICON_MAP[type.iconName] || Sprout;

          return (
            <div
              key={type.id}
              onClick={() => toggleType(type.id)}
              className={cn(
                "p-2.5 sm:p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 relative group flex flex-col justify-between select-none",
                isSelected
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20"
                  : "bg-white dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50/50"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={cn(
                      "size-8 sm:size-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-colors",
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600"
                    )}
                  >
                    <IconComponent className="size-4 sm:size-5" />
                  </div>

                  <div
                    className={cn(
                      "size-4 sm:size-5 rounded-full flex items-center justify-center border transition-all",
                      isSelected
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 dark:border-slate-700 opacity-40 group-hover:opacity-100"
                    )}
                  >
                    {isSelected && <Check className="size-2.5 sm:size-3 stroke-[3]" />}
                  </div>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                  {type.title}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {type.description}
                </p>
              </div>

              {type.isProducer && (
                <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Farm Producer
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          Selected categories: <strong className="text-emerald-600">{data.sellerTypes.length}</strong>
        </span>
        {data.sellerTypes.length > 0 && (
          <button
            type="button"
            onClick={() => updateData({ sellerTypes: [] })}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-semibold"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
        {/* Save Draft — full width on its own row */}
        {onSaveDraft && (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={savingDraft}
            className="w-full rounded-xl text-xs font-bold h-10 border-slate-200"
          >
            {savingDraft ? 'Saving Draft...' : 'Save Draft'}
          </Button>
        )}

        {/* Prev + Continue row */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="rounded-xl text-xs font-bold h-11 border-slate-200 gap-1 px-3 flex-shrink-0"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden xs:inline">Back</span>
          </Button>

          <Button
            type="button"
            onClick={handleContinue}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-4 shadow-md shadow-emerald-600/20 gap-2"
          >
            <span>Continue</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
