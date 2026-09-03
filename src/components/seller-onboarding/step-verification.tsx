'use client';

import React, { useState } from 'react';
import { StepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IdentificationType, verificationStepSchema } from '@/lib/seller-types';
import {
  ShieldCheck,
  FileCheck,
  Upload,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  FileText,
  Lock,
  X,
} from 'lucide-react';

export function StepVerification({ data, updateData, onNext, onPrev, onSaveDraft, savingDraft }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleVerificationChange = (field: keyof typeof data.verification, value: any) => {
    updateData({
      verification: {
        ...data.verification,
        [field]: value,
      },
    });
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileUpload = (
    field: 'profilePhotoUrl' | 'proofOfOwnershipUrl' | 'businessDocumentUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      handleVerificationChange(field, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMultiUpload = (
    field: 'farmPhotoUrls' | 'productPhotoUrls',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const current = data.verification[field] || [];
      handleVerificationChange(field, [...current, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const removeMultiPhoto = (field: 'farmPhotoUrls' | 'productPhotoUrls', idx: number) => {
    const current = [...(data.verification[field] || [])];
    current.splice(idx, 1);
    handleVerificationChange(field, current);
  };

  const handleContinue = () => {
    const result = verificationStepSchema.safeParse({
      identificationType: data.verification.identificationType,
      identificationNumber: data.verification.identificationNumber,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errMap[String(err.path[0])] = err.message;
      });
      setErrors(errMap);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-none font-bold uppercase text-[10px] tracking-wider">
            Step 6 of 7
          </Badge>
          <span className="text-[11px] text-slate-400">• Trust & Safety</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Merchant & Farm Verification
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Verify your identity to earn the <strong className="text-emerald-600">🌱 Verified Merchant Badge</strong>.
        </p>
      </div>

      {/* Security notice */}
      <Card className="rounded-xl border-blue-500/20 bg-blue-500/5 text-slate-800 dark:text-slate-200">
        <CardContent className="p-2.5 sm:p-3.5 flex items-start gap-2.5">
          <Lock className="size-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <p className="font-bold text-blue-900 dark:text-blue-300 text-[11px] sm:text-xs">
              Encrypted Government Identity Safeguard
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] sm:text-xs">
              Your NIN or identity numbers are encrypted and accessible strictly to authorized state agricultural verifiers. They are <span className="font-bold">never</span> visible on your public storefront.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3.5 sm:space-y-4">
        {/* ID Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Government Identification Type <span className="text-emerald-600">*</span>
            </Label>
            <Select
              value={data.verification.identificationType}
              onValueChange={(val: IdentificationType) =>
                handleVerificationChange('identificationType', val)
              }
            >
              <SelectTrigger className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Select ID Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="NIN">National Identity Number (NIN)</SelectItem>
                <SelectItem value="Voter's Card">INEC Voter's Card</SelectItem>
                <SelectItem value="Driver's Licence">FRSC Driver's Licence</SelectItem>
                <SelectItem value="International Passport">International Passport</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="idNumber" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {data.verification.identificationType} Number <span className="text-emerald-600">*</span>
            </Label>
            <Input
              id="idNumber"
              placeholder="e.g. 11-digit NIN or Voter VIN"
              value={data.verification.identificationNumber}
              onChange={(e) => handleVerificationChange('identificationNumber', e.target.value)}
              className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
            />
            {errors.identificationNumber && (
              <p className="text-[11px] font-bold text-rose-500">
                {errors.identificationNumber}
              </p>
            )}
          </div>
        </div>

        {/* Uploads Grid */}
        <div className="pt-1 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Verification Documents & Photos
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400">Max 5MB (JPEG, PNG)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
            {/* Merchant Profile Photo */}
            <div className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="size-7 sm:size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Camera className="size-3.5 sm:size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Merchant Photo
                  </h4>
                  <p className="text-[10px] text-slate-400">Headshot or portrait on the farm</p>
                </div>
              </div>

              {data.verification.profilePhotoUrl ? (
                <div className="relative size-16 sm:size-20 rounded-xl overflow-hidden border">
                  <img
                    src={data.verification.profilePhotoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerificationChange('profilePhotoUrl', '')}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <Upload className="size-4 text-slate-400 mb-0.5" />
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Upload Profile Picture
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('profilePhotoUrl', e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Farm / Business Photos */}
            <div className="p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
              <div className="flex items-center gap-2">
                <div className="size-7 sm:size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <FileCheck className="size-3.5 sm:size-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Farm / Shop Pictures
                  </h4>
                  <p className="text-[10px] text-slate-400">Ponds, crops, storage, or storefront</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 items-center">
                {(data.verification.farmPhotoUrls || []).map((img, idx) => (
                  <div
                    key={idx}
                    className="relative size-14 sm:size-16 rounded-xl overflow-hidden border flex-shrink-0"
                  >
                    <img src={img} alt="Farm" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMultiPhoto('farmPhotoUrls', idx)}
                      className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 text-white"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ))}

                <label className="size-14 sm:size-16 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors flex-shrink-0">
                  <Upload className="size-3 text-slate-400 mb-0.5" />
                  <span className="text-[9px] font-bold text-slate-500">Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleMultiUpload('farmPhotoUrls', e)}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Optional Business Documentation / Land Proof */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Proof of Farmland / Business Registration (Optional)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-600">Optional</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              If available, you may upload a scan of your family land agreement, lease slip, CAC certificate, or cooperative membership card to expedite verification. Smallholder farmers may leave this blank.
            </p>

            {data.verification.proofOfOwnershipUrl ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle className="size-4" />
                  <span>Document Uploaded</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleVerificationChange('proofOfOwnershipUrl', '')}
                  className="text-xs text-rose-500 font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors bg-white dark:bg-slate-900">
                <Upload className="size-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Upload Optional Documentation (PDF / Image)
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => handleFileUpload('proofOfOwnershipUrl', e)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-4 space-y-2 border-t border-slate-100 dark:border-slate-800">
        {onSaveDraft && (
          <Button type="button" variant="outline" onClick={onSaveDraft} disabled={savingDraft}
            className="w-full rounded-xl text-xs font-bold h-10 border-slate-200">
            {savingDraft ? 'Saving Draft...' : 'Save Draft'}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={onPrev}
            className="rounded-xl text-xs font-bold h-11 border-slate-200 gap-1 px-3 flex-shrink-0">
            <ArrowLeft className="size-4" />
          </Button>
          <Button type="button" onClick={handleContinue}
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-4 shadow-md shadow-emerald-600/20 gap-2">
            <span>Review Application</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
