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
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-none font-bold uppercase text-[10px] tracking-wider">
            Step 7 of 7
          </Badge>
          <span className="text-xs text-slate-400">• Final Review</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Review Your Seller Application
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Please confirm your details before submitting to the Akwa Ibom State Agro Verification Desk.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-semibold">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Review Cards Grid */}
      <div className="space-y-4">
        {/* Section 1: Account */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <User className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  1. Merchant Contact Details
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(1)}
                className="h-8 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-xl"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
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
                <p className="text-slate-400 font-medium">Phone Number</p>
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
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Sprout className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  2. Seller Categories
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(2)}
                className="h-8 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-xl"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 pt-3">
              {data.sellerTypes.map((st) => {
                const item = SELLER_TYPES.find((s) => s.id === st);
                return (
                  <Badge
                    key={st}
                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold py-1 px-3 rounded-lg"
                  >
                    {item?.title || st}
                  </Badge>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Farm & Business */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Store className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  3. Farm & Enterprise Info
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(3)}
                className="h-8 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-xl"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
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
              <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 text-xs flex gap-4">
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
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Package className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  4. Registered Products ({data.products.length})
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(4)}
                className="h-8 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-xl"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-1">
              {data.products.map((prod, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{prod.name}</span>
                    <span className="text-slate-400 ml-2">({prod.category} • {prod.availableQuantity} {prod.unit}s)</span>
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
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <MapPin className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  5. Akwa Ibom Location & Logistics
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(5)}
                className="h-8 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-xl"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">State</p>
                <p className="font-bold text-emerald-600 mt-0.5">{data.location.state}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">LGA</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{data.location.lga}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Community / Ward</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.location.communityVillage} ({data.location.ward})
                </p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Delivery Mode</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {data.delivery.deliveryMethod}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Dispatch Address: <strong className="text-slate-700 dark:text-slate-300">{data.location.farmBusinessAddress}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Section 6: Verification */}
        <Card className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <ShieldCheck className="size-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  6. Trust & Verification
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onJumpToStep(6)}
                className="h-8 text-xs font-bold text-emerald-600 hover:text-emerald-700 gap-1 rounded-xl"
              >
                <Edit2 className="size-3" /> Edit
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
              <div>
                <p className="text-slate-400 font-medium">ID Document</p>
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
                <p className="text-slate-400 font-medium">Photos Attached</p>
                <p className="font-bold text-emerald-600 mt-0.5">
                  {(data.verification.farmPhotoUrls?.length || 0) + (data.verification.profilePhotoUrl ? 1 : 0)} Documents
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Checkboxes */}
      <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-slate-900/60 border border-emerald-500/20 space-y-3.5">
        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
          Merchant Affirmation & Declaration
        </h4>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmAccurate"
              checked={data.confirmation.infoAccurate}
              onCheckedChange={(checked) => handleCheckbox('infoAccurate', Boolean(checked))}
              className="mt-0.5"
            />
            <Label htmlFor="confirmAccurate" className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed cursor-pointer">
              I confirm that all farm, business, product, and identity details provided in this application are accurate and represent authentic agricultural operations in Akwa Ibom State.
            </Label>
          </div>

          <div className="flex items-start gap-3">
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

          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmReview"
              checked={data.confirmation.understandsReview}
              onCheckedChange={(checked) => handleCheckbox('understandsReview', Boolean(checked))}
              className="mt-0.5"
            />
            <Label htmlFor="confirmReview" className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed cursor-pointer">
              I understand that my application will be reviewed by state agricultural administrators before my verified storefront and unique Merchant ID are activated.
            </Label>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          disabled={isSubmitting}
          className="rounded-xl text-xs font-bold h-11 border-slate-200 gap-1.5"
        >
          <ArrowLeft className="size-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center gap-2">
          {onSaveDraft && (
            <Button
              type="button"
              variant="ghost"
              onClick={onSaveDraft}
              disabled={savingDraft || isSubmitting}
              className="rounded-xl text-xs font-bold h-11"
            >
              {savingDraft ? 'Saving...' : 'Save Draft'}
            </Button>
          )}

          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11 px-8 shadow-lg shadow-emerald-600/30 gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Submitting Application...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Submit Seller Application</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
