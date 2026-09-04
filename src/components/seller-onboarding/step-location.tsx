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
import {
  AKWA_IBOM_31_LGAS,
  DeliveryOption,
  DeliveryCoverage,
  locationStepSchema,
} from '@/lib/seller-types';
import {
  MapPin,
  Truck,
  Building,
  Navigation,
  Compass,
  ArrowRight,
  ArrowLeft,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

export function StepLocation({ data, updateData, onNext, onPrev, onSaveDraft, savingDraft }: StepProps) {
  const [lgaSearch, setLgaSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredLgas = AKWA_IBOM_31_LGAS.filter((lga) =>
    lga.toLowerCase().includes(lgaSearch.toLowerCase())
  );

  const handleLocationChange = (field: keyof typeof data.location, value: string) => {
    updateData({
      location: {
        ...data.location,
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

  const handleDeliveryChange = (field: keyof typeof data.delivery, value: string) => {
    updateData({
      delivery: {
        ...data.delivery,
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
    const payloadToValidate = {
      state: data.location.state,
      lga: data.location.lga,
      ward: data.location.ward,
      communityVillage: data.location.communityVillage,
      farmBusinessAddress: data.location.farmBusinessAddress,
      landmark: data.location.landmark,
      deliveryMethod: data.delivery.deliveryMethod,
      deliveryCoverage: data.delivery.deliveryCoverage,
      pickupAddress: data.delivery.pickupAddress,
      estimatedDeliveryTime: data.delivery.estimatedDeliveryTime,
      deliveryNotes: data.delivery.deliveryNotes,
    };

    const result = locationStepSchema.safeParse(payloadToValidate);
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
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2 sm:pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-none font-bold uppercase text-[10px] tracking-wider">
            Step 5 of 7
          </Badge>
          <span className="text-[11px] text-slate-400">• Strict Akwa Ibom State</span>
        </div>
        <h2 className="text-base sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Location & Logistics
        </h2>
        <p className="text-slate-500 text-[11px] sm:text-xs mt-0.5">
          Buyers and aggregators search produce by LGA and community corridor.
        </p>
      </div>

      {/* State Enforcement Card */}
      <div className="rounded-xl border border-emerald-500/25 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-2.5 sm:p-4 flex items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="size-8 sm:size-9 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
            <MapPin className="size-4 sm:size-5" />
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none">
              Exclusively For
            </p>
            <h3 className="text-xs sm:text-base font-black text-white mt-0.5">Akwa Ibom State, Nigeria</h3>
          </div>
        </div>
        <Badge className="bg-emerald-500 text-slate-950 font-black text-[9px] sm:text-[10px] uppercase tracking-wider px-2 sm:px-3 py-0.5 sm:py-1 flex-shrink-0">
          Verified
        </Badge>
      </div>

      <div className="space-y-3.5 sm:space-y-5">
        {/* LGA & Ward Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label htmlFor="lga" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Local Government Area (31 LGAs) <span className="text-emerald-600">*</span>
            </Label>
            <Select
              value={data.location.lga}
              onValueChange={(val) => handleLocationChange('lga', val)}
            >
              <SelectTrigger className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800">
                <SelectValue placeholder="Select Akwa Ibom LGA" />
              </SelectTrigger>
              <SelectContent className="rounded-xl max-h-60">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <Search className="size-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Search LGA..."
                      value={lgaSearch}
                      onChange={(e) => setLgaSearch(e.target.value)}
                      className="pl-8 h-8 text-xs rounded-lg border-slate-200"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                {filteredLgas.map((lga) => (
                  <SelectItem key={lga} value={lga} className="text-xs sm:text-sm">
                    {lga}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lga && <p className="text-[11px] font-bold text-rose-500">{errors.lga}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="ward" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Ward <span className="text-emerald-600">*</span>
            </Label>
            <Input
              id="ward"
              placeholder="e.g. Ward 1, Central, or Urban Ward 3"
              value={data.location.ward}
              onChange={(e) => handleLocationChange('ward', e.target.value)}
              className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
            />
            {errors.ward && <p className="text-[11px] font-bold text-rose-500">{errors.ward}</p>}
          </div>
        </div>

        {/* Community & Physical Address */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="space-y-1">
            <Label htmlFor="community" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Community / Village <span className="text-emerald-600">*</span>
            </Label>
            <Input
              id="community"
              placeholder="e.g. Ikot Oku Ikono, Afaha Eket, Nwaniba"
              value={data.location.communityVillage}
              onChange={(e) => handleLocationChange('communityVillage', e.target.value)}
              className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
            />
            {errors.communityVillage && (
              <p className="text-[11px] font-bold text-rose-500">{errors.communityVillage}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="landmark" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Prominent Landmark (Optional)
            </Label>
            <Input
              id="landmark"
              placeholder="e.g. Behind Itam Market or Near Primary School"
              value={data.location.landmark || ''}
              onChange={(e) => handleLocationChange('landmark', e.target.value)}
              className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="address" className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Physical Farm / Store / Dispatch Address <span className="text-emerald-600">*</span>
          </Label>
          <Input
            id="address"
            placeholder="e.g. Km 4 Ikot Ekpene Road, Beside Agro Service Center, Uyo"
            value={data.location.farmBusinessAddress}
            onChange={(e) => handleLocationChange('farmBusinessAddress', e.target.value)}
            className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800"
          />
          {errors.farmBusinessAddress && (
            <p className="text-[11px] font-bold text-rose-500">{errors.farmBusinessAddress}</p>
          )}
        </div>

        {/* Delivery & Logistics Section */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-emerald-600" />
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Order Fulfillment & Delivery Options
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                How do you deliver orders? <span className="text-emerald-600">*</span>
              </Label>
              <Select
                value={data.delivery.deliveryMethod}
                onValueChange={(val: DeliveryOption) => handleDeliveryChange('deliveryMethod', val)}
              >
                <SelectTrigger className="rounded-xl h-10 sm:h-11 text-xs sm:text-sm border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Delivery Method" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Delivery + Pickup">Delivery + Customer Pickup (Recommended)</SelectItem>
                  <SelectItem value="Seller Delivery">Seller Direct Delivery Only</SelectItem>
                  <SelectItem value="Customer Pickup">Customer Farm Pickup Only</SelectItem>
                  <SelectItem value="Marketplace Delivery">Marketplace Logistics Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Delivery Coverage Area <span className="text-emerald-600">*</span>
              </Label>
              <Select
                value={data.delivery.deliveryCoverage}
                onValueChange={(val: DeliveryCoverage) =>
                  handleDeliveryChange('deliveryCoverage', val)
                }
              >
                <SelectTrigger className="rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Coverage" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="Across Akwa Ibom State">Across Entire Akwa Ibom State</SelectItem>
                  <SelectItem value="My LGA">Within My LGA Only</SelectItem>
                  <SelectItem value="My Community">Within My Immediate Community Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="pickupAddress" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Pickup Point Address <span className="text-emerald-600">*</span>
              </Label>
              <Input
                id="pickupAddress"
                placeholder="Address where buyers/riders pick up goods"
                value={data.delivery.pickupAddress}
                onChange={(e) => handleDeliveryChange('pickupAddress', e.target.value)}
                className="rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
              />
              {errors.pickupAddress && (
                <p className="text-[11px] font-bold text-rose-500">{errors.pickupAddress}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deliveryTime" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Estimated Delivery Turnaround <span className="text-emerald-600">*</span>
              </Label>
              <div className="relative">
                <Clock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  id="deliveryTime"
                  placeholder="e.g. Same Day, 24 Hours, or 2-3 Days"
                  value={data.delivery.estimatedDeliveryTime}
                  onChange={(e) =>
                    handleDeliveryChange('estimatedDeliveryTime', e.target.value)
                  }
                  className="pl-10 rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
                />
              </div>
              {errors.estimatedDeliveryTime && (
                <p className="text-[11px] font-bold text-rose-500">
                  {errors.estimatedDeliveryTime}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deliveryNotes" className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Special Handling / Delivery Instructions (Optional)
            </Label>
            <Textarea
              id="deliveryNotes"
              rows={2}
              placeholder="e.g. Harvested fresh every morning; fish transported with water tanks; bulk tubers require pickup truck..."
              value={data.delivery.deliveryNotes || ''}
              onChange={(e) => handleDeliveryChange('deliveryNotes', e.target.value)}
              className="rounded-xl text-sm border-slate-200 dark:border-slate-800 resize-none"
            />
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
            <span>Continue</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
