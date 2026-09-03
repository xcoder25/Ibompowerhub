'use client';

import React, { useState, useEffect } from 'react';
import { StepProps } from './types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/firebase';
import { UserCheck, Shield, Phone, Mail, Lock, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2 } from 'lucide-react';
import { accountStepSchema } from '@/lib/seller-types';

export function StepAccount({ data, updateData, onNext, onSaveDraft, savingDraft }: StepProps) {
  const { user } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto populate if user is authenticated
  useEffect(() => {
    if (user && (!data.account.email || !data.account.firstName)) {
      const names = (user.displayName || '').split(' ');
      updateData({
        account: {
          ...data.account,
          firstName: data.account.firstName || names[0] || '',
          lastName: data.account.lastName || names.slice(1).join(' ') || '',
          email: data.account.email || user.email || '',
          phone: data.account.phone || user.phoneNumber || '',
          userId: user.uid,
        },
      });
    }
  }, [user]);

  const handleChange = (field: keyof typeof data.account, value: string) => {
    updateData({
      account: {
        ...data.account,
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
    const result = accountStepSchema.safeParse(data.account);
    const newErrors: Record<string, string> = {};

    if (!result.success) {
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          newErrors[String(err.path[0])] = err.message;
        }
      });
    }

    // If user is not logged in, password is required
    if (!user) {
      if (!data.account.password || data.account.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (data.account.password !== data.account.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Merchant Contact & Account
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">
          Provide your primary contact and security credentials for your Akwa Ibom agro storefront.
        </p>
      </div>

      {user && (
        <Card className="bg-emerald-500/10 border-emerald-500/25 rounded-2xl overflow-hidden">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="size-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <UserCheck className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                Connected Citizen Account
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                Logged in as <span className="font-bold text-slate-900 dark:text-white">{user.email}</span>. Your merchant application will be linked directly to your state ID.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs font-bold text-slate-700 dark:text-slate-200">
            First Name <span className="text-emerald-600">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="e.g. Edidiong"
            value={data.account.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className="rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
          />
          {errors.firstName && <p className="text-[11px] font-bold text-rose-500">{errors.firstName}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Last Name <span className="text-emerald-600">*</span>
          </Label>
          <Input
            id="lastName"
            placeholder="e.g. Akpan"
            value={data.account.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className="rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
          />
          {errors.lastName && <p className="text-[11px] font-bold text-rose-500">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Email Address <span className="text-emerald-600">*</span>
          </Label>
          <div className="relative">
            <Mail className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              id="email"
              type="email"
              placeholder="edidiong@akwaibomagro.ng"
              value={data.account.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="pl-10 rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.email && <p className="text-[11px] font-bold text-rose-500">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Primary Phone Number <span className="text-emerald-600">*</span>
          </Label>
          <div className="relative">
            <Phone className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              id="phone"
              type="tel"
              placeholder="0803 123 4567"
              value={data.account.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="pl-10 rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.phone && <p className="text-[11px] font-bold text-rose-500">{errors.phone}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="whatsapp" className="text-xs font-bold text-slate-700 dark:text-slate-200">
          WhatsApp Number (For instant buyer inquiries) <span className="text-emerald-600">*</span>
        </Label>
        <div className="relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 rounded-full bg-emerald-500 flex items-center justify-center text-[9px] text-white font-black">
            W
          </div>
          <Input
            id="whatsapp"
            type="tel"
            placeholder="0802 987 6543 (Buyers can chat directly on WhatsApp)"
            value={data.account.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value)}
            className="pl-10 rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
          />
        </div>
        {errors.whatsapp && <p className="text-[11px] font-bold text-rose-500">{errors.whatsapp}</p>}
        <p className="text-[11px] text-slate-400">
          Buyers across Uyo, Eket, and Ikot Ekpene often initiate bulk orders over WhatsApp.
        </p>
      </div>

      {!user && (
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Create Storefront Password <span className="text-emerald-600">*</span>
              </Label>
              <div className="relative">
                <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 8 characters"
                  value={data.account.password || ''}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="pl-10 pr-10 rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] font-bold text-rose-500">{errors.password}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Confirm Password <span className="text-emerald-600">*</span>
              </Label>
              <div className="relative">
                <Lock className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={data.account.confirmPassword || ''}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="pl-10 rounded-xl h-11 text-sm border-slate-200 dark:border-slate-800"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] font-bold text-rose-500">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        {onSaveDraft ? (
          <Button
            type="button"
            variant="outline"
            onClick={onSaveDraft}
            disabled={savingDraft}
            className="rounded-xl text-xs font-bold h-11 border-slate-200"
          >
            {savingDraft ? 'Saving Draft...' : 'Save Draft'}
          </Button>
        ) : (
          <div />
        )}

        <Button
          type="button"
          onClick={handleContinue}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 shadow-md shadow-emerald-600/20 gap-2"
        >
          <span>Continue to Seller Type</span>
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
