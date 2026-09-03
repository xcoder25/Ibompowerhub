'use client';

import React, { useState } from 'react';
import { StepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BUSINESS_TYPES, BusinessType, FarmSizeUnit, FarmOwnership, businessStepSchema } from '@/lib/seller-types';
import { Building2, Info, Sprout, ArrowRight, ArrowLeft, Phone, Mail, Calendar, Sparkles } from 'lucide-react';

export function StepBusiness({ data, updateData, onNext, onPrev, onSaveDraft, savingDraft }: StepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if any producer type is chosen (farmer, fish_farmer, poultry_farmer, livestock_farmer)
  const isProducer = data.sellerTypes.some((t) =>
    ['farmer', 'fish_farmer', 'poultry_farmer', 'livestock_farmer', 'agro_processor'].includes(t)
  );

  const handleChange = (field: keyof typeof data.business, value: any) => {
    updateData({
      business: {
        ...data.business,
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

  const handleContinue = () => {
    const result = businessStepSchema.safeParse(data.business);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(newErrors);
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
            Step 3 of 7
          </Badge>
          <span className="text-[11px] text-slate-400">• Business Profile</span>
        </div>
        <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Farm & Business Information
        </h2>
        <p className="text-slate-500 text-xs mt-0.5">
          Tell buyers about your agricultural venture, enterprise structure, and operational background.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <div className="space-y-1">
          <Label htmlFor="farmBusinessName" className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Farm / Business Name <span className="text-emerald-600">*</span>
          </Label>
          <Input
            id="farmBusinessName"
            placeholder="e.g. Uyo Palm Ridge Farms or Ibom Agri-Hub"
            value={data.business.farmBusinessName}
            onChange={(e) => handleChange('farmBusinessName', e.target.value)}
            className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
          />
          {errors.farmBusinessName && (
            <p className="text-[11px] font-bold text-rose-500">{errors.farmBusinessName}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="businessDescription" className="text-xs font-bold text-slate-700 dark:text-slate-200">
            About Your Farm / Enterprise <span className="text-emerald-600">*</span>
          </Label>
          <Textarea
            id="businessDescription"
            rows={3}
            placeholder="Describe what you cultivate, harvest, breed, or sell in Akwa Ibom State..."
            value={data.business.businessDescription}
            onChange={(e) => handleChange('businessDescription', e.target.value)}
            className="rounded-xl text-xs sm:text-sm border-slate-200 dark:border-slate-800 resize-none"
          />
          {errors.businessDescription && (
            <p className="text-[11px] font-bold text-rose-500">{errors.businessDescription}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label htmlFor="businessPhone" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Business Phone <span className="text-emerald-600">*</span>
            </Label>
            <div className="relative">
              <Phone className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="businessPhone"
                type="tel"
                placeholder="0803 000 1122"
                value={data.business.businessPhone}
                onChange={(e) => handleChange('businessPhone', e.target.value)}
                className="pl-9 rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
              />
            </div>
            {errors.businessPhone && (
              <p className="text-[11px] font-bold text-rose-500">{errors.businessPhone}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="businessEmail" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Business Email <span className="text-emerald-600">*</span>
            </Label>
            <div className="relative">
              <Mail className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="businessEmail"
                type="email"
                placeholder="farm@akwaibomagro.ng"
                value={data.business.businessEmail}
                onChange={(e) => handleChange('businessEmail', e.target.value)}
                className="pl-9 rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
              />
            </div>
            {errors.businessEmail && (
              <p className="text-[11px] font-bold text-rose-500">{errors.businessEmail}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label htmlFor="businessType" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Business Structure <span className="text-emerald-600">*</span>
            </Label>
            <Select
              value={data.business.businessType}
              onValueChange={(val: BusinessType) => handleChange('businessType', val)}
            >
              <SelectTrigger className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Select Business Type" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {BUSINESS_TYPES.map((bt) => (
                  <SelectItem key={bt} value={bt} className="text-xs sm:text-sm">
                    {bt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="text-[11px] font-bold text-rose-500">{errors.businessType}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="yearEstablished" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Year Established <span className="text-emerald-600">*</span>
            </Label>
            <div className="relative">
              <Calendar className="size-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="yearEstablished"
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                placeholder="e.g. 2020"
                value={data.business.yearEstablished}
                onChange={(e) => handleChange('yearEstablished', e.target.value)}
                className="pl-9 rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
              />
            </div>
            {errors.yearEstablished && (
              <p className="text-[11px] font-bold text-rose-500">{errors.yearEstablished}</p>
            )}
          </div>
        </div>

        {/* CAC Number - Explicitly Optional */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label htmlFor="cacNumber" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              CAC Number (Optional)
            </Label>
            <span className="text-[10px] font-semibold text-emerald-600">Not required for farmers</span>
          </div>
          <Input
            id="cacNumber"
            placeholder="e.g. RC-1234567 (Leave blank if not registered)"
            value={data.business.cacNumber || ''}
            onChange={(e) => handleChange('cacNumber', e.target.value)}
            className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
          />
          <p className="text-[10px] sm:text-[11px] text-slate-400">
            We welcome unregistered individual smallholders, cooperatives, and community agrarian groups.
          </p>
        </div>

        {/* Dynamic Farm Details for Agricultural Producers */}
        {isProducer && (
          <Card className="rounded-xl border-emerald-500/20 bg-emerald-500/5 overflow-hidden mt-3 sm:mt-4">
            <CardContent className="p-3 sm:p-5 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2">
                <Sprout className="size-4 text-emerald-600" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Agricultural Cultivation & Farm Acreage
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="farmSize" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Farm Land / Pond / Facility Size
                  </Label>
                  <Input
                    id="farmSize"
                    placeholder="e.g. 5, 12, or 25"
                    value={data.business.farmSize || ''}
                    onChange={(e) => handleChange('farmSize', e.target.value)}
                    className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm bg-white dark:bg-slate-900 border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="farmSizeUnit" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Unit
                  </Label>
                  <Select
                    value={data.business.farmSizeUnit || 'Hectares'}
                    onValueChange={(val: FarmSizeUnit) => handleChange('farmSizeUnit', val)}
                  >
                    <SelectTrigger className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm bg-white dark:bg-slate-900 border-slate-200">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Acres">Acres</SelectItem>
                      <SelectItem value="Hectares">Hectares</SelectItem>
                      <SelectItem value="Plots">Plots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="farmOwnership" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Land / Facility Ownership Model
                </Label>
                <Select
                  value={data.business.farmOwnership || 'Family Land'}
                  onValueChange={(val: FarmOwnership) => handleChange('farmOwnership', val)}
                >
                  <SelectTrigger className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm bg-white dark:bg-slate-900 border-slate-200">
                    <SelectValue placeholder="Select Ownership" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="Owned">Solely Owned</SelectItem>
                    <SelectItem value="Family Land">Family Land</SelectItem>
                    <SelectItem value="Leased">Leased / Rented Farmland</SelectItem>
                    <SelectItem value="Community Land">Community / Cooperative Allocation</SelectItem>
                    <SelectItem value="Other">Other Arrangement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
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
            <span>Continue</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
