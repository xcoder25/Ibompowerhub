'use client';

import React, { useState } from 'react';
import { StepProps } from './types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  User,
  Store,
  Sprout,
  Package,
  MapPin,
  Truck,
  ShieldCheck,
  Edit2,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import { SELLER_TYPES } from '@/lib/seller-types';

interface StepReviewProps extends StepProps {
  onJumpToStep: (stepNumber: number) => void;
  onSubmitApplication: () => void;
  isSubmitting: boolean;
}

export function StepReview({
  data,
  updateData,
  onPrev,
  onJumpToStep,
  onSubmitApplication,
  isSubmitting,
  onSaveDraft,
  savingDraft,
}: StepReviewProps) {
  const [error, setError] = useState<string | null>(null);

  const handleCheckbox = (field: keyof typeof data.confirmation, checked: boolean) => {
    updateData({
      confirmation: {
        ...data.confirmation,
        [field]: checked,
      },
    });
    if (error) setError(null);
  };

  const handleSubmit = () => {
    if (
      !data.confirmation.infoAccurate ||
      !data.confirmation.termsAgreed ||
      !data.confirmation.understandsReview
    ) {
      setError('Please check all three confirmation boxes below before submitting your application.');
      return;
    }
    setError(null);
    onSubmitApplication();
  };

  const selectedTypeLabels = data.sellerTypes
    .map((id) => SELLER_TYPES.find((s) => s.id === id)?.title || id)
    .join(', ');

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-none font-bold uppercase text-[10px] tracking-wider">
            Step 7 of 7
          </Badge>
          <span className="text-[11px] text-slate-400">• Final Review</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Review Your Seller Application
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Please confirm your details before submitting to the Akwa Ibom State Agro Verification Desk.
        </p>
      </div>

      {error && (
        <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Review Cards Grid */}
      <div className="space-y-2.5 sm:space-y-3.5">
        {/* Section 1: Account */}
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-7 sm:size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <User className="size-3.5 sm:size-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  1. Contact Details
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(1)}
                className="h-7 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-lg px-2"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] sm:text-xs">
              <div>
                <p className="text-slate-400 font-medium">Full Name</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.account.firstName} {data.account.lastName}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Email</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {data.account.email}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Phone</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.account.phone}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">WhatsApp</p>
                <p className="font-bold text-emerald-600 mt-0.5">{data.account.whatsapp}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Seller Type */}
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-7 sm:size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Sprout className="size-3.5 sm:size-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  2. Seller Categories
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(2)}
                className="h-7 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-lg px-2"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2">
              {data.sellerTypes.map((st) => {
                const item = SELLER_TYPES.find((s) => s.id === st);
                return (
                  <Badge
                    key={st}
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] sm:text-xs font-bold py-0.5 px-2 rounded-md"
                  >
                    {item?.title || st}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Farm & Business */}
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-7 sm:size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Store className="size-3.5 sm:size-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  3. Farm & Enterprise Info
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(3)}
                className="h-7 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-lg px-2"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] sm:text-xs">
              <div>
                <p className="text-slate-400 font-medium">Business Name</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.business.farmBusinessName}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Structure</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.business.businessType}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Est. Year</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.business.yearEstablished}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">CAC Reg</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.business.cacNumber || 'Smallholder / None'}
                </p>
              </div>
            </div>
            {data.business.farmSize && (
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] sm:text-xs flex gap-3">
                <p className="text-slate-500">
                  Land Size: <strong className="text-slate-800 dark:text-slate-200">{data.business.farmSize} {data.business.farmSizeUnit}</strong>
                </p>
                <p className="text-slate-500">
                  Ownership: <strong className="text-slate-800 dark:text-slate-200">{data.business.farmOwnership}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 4: Products */}
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-7 sm:size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Package className="size-3.5 sm:size-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  4. Products ({data.products.length})
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(4)}
                className="h-7 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-lg px-2"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-1">
              {data.products.map((prod, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-[11px] sm:text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{prod.name}</span>
                    <span className="text-slate-400 ml-1.5">({prod.category})</span>
                  </div>
                  <span className="font-black text-emerald-600">
                    ₦{Number(prod.price).toLocaleString()} / {prod.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 5: Location & Delivery */}
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-7 sm:size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <MapPin className="size-3.5 sm:size-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  5. Location & Logistics
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(5)}
                className="h-7 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-lg px-2"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] sm:text-xs">
              <div>
                <p className="text-slate-400 font-medium">State</p>
                <p className="font-bold text-emerald-600 mt-0.5">{data.location.state}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">LGA</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{data.location.lga}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Community</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {data.location.communityVillage}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Delivery</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                  {data.delivery.deliveryMethod}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 6: Verification */}
        <Card className="rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-2.5 sm:p-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="size-7 sm:size-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <ShieldCheck className="size-3.5 sm:size-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  6. Trust & Verification
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(6)}
                className="h-7 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-lg px-2"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-[11px] sm:text-xs">
              <div>
                <p className="text-slate-400 font-medium">ID Type</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.verification.identificationType}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">ID Number</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                  ••••••{data.verification.identificationNumber.slice(-4)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Docs Attached</p>
                <p className="font-bold text-emerald-600 mt-0.5">
                  {(data.verification.farmPhotoUrls?.length || 0) + (data.verification.profilePhotoUrl ? 1 : 0)} Files
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Checkboxes */}
      <div className="p-3 sm:p-4 rounded-xl bg-emerald-50/60 dark:bg-slate-900/60 border border-emerald-500/20 space-y-2.5">
        <h4 className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Merchant Affirmation & Declaration
        </h4>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirmAccurate"
              checked={data.confirmation.infoAccurate}
              onCheckedChange={(checked) => handleCheckbox('infoAccurate', Boolean(checked))}
              className="mt-0.5"
            />
            <Label htmlFor="confirmAccurate" className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed cursor-pointer">
              I confirm that all farm, business, product, and identity details provided are accurate.
            </Label>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirmTerms"
              checked={data.confirmation.termsAgreed}
              onCheckedChange={(checked) => handleCheckbox('termsAgreed', Boolean(checked))}
              className="mt-0.5"
            />
            <Label htmlFor="confirmTerms" className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed cursor-pointer">
              I agree to the <span className="text-emerald-600 font-bold underline">Akwa Ibom Agro Marketplace Seller Terms & Quality Assurance Guidelines</span>.
            </Label>
          </div>

          <div className="flex items-start gap-2.5">
            <Checkbox
              id="confirmReview"
              checked={data.confirmation.understandsReview}
              onCheckedChange={(checked) => handleCheckbox('understandsReview', Boolean(checked))}
              className="mt-0.5"
            />
            <Label htmlFor="confirmReview" className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed cursor-pointer">
              I understand that my application will be reviewed by state agricultural administrators before my Merchant ID is activated.
            </Label>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
        {onSaveDraft && (
          <Button type="button" variant="outline" onClick={onSaveDraft} disabled={savingDraft || isSubmitting}
            className="w-full rounded-xl text-xs font-bold h-10 border-slate-200">
            {savingDraft ? 'Saving Draft...' : 'Save Draft'}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onPrev} disabled={isSubmitting}
            className="rounded-xl text-xs font-bold h-12 border-slate-200 gap-1 px-3 flex-shrink-0">
            <ArrowLeft className="size-4" />
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 px-4 shadow-lg shadow-emerald-600/30 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Submit Application</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
