'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { INITIAL_ONBOARDING_DATA } from './types';
import { SellerOnboardingData, generateApplicationId } from '@/lib/seller-types';

import { StepAccount } from './step-account';
import { StepSellerType } from './step-seller-type';
import { StepBusiness } from './step-business';
import { StepProducts } from './step-products';
import { StepLocation } from './step-location';
import { StepVerification } from './step-verification';
import { StepReview } from './step-review';

import {
  User,
  Sprout,
  Store,
  Package,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Save,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { step: 1, title: 'Account', icon: User, desc: 'Contact' },
  { step: 2, title: 'Seller Type', icon: Sprout, desc: 'Category' },
  { step: 3, title: 'Farm/Business', icon: Store, desc: 'Enterprise' },
  { step: 4, title: 'Products', icon: Package, desc: 'Produce' },
  { step: 5, title: 'Location & Delivery', icon: MapPin, desc: 'Akwa Ibom' },
  { step: 6, title: 'Verification', icon: ShieldCheck, desc: 'Trust & ID' },
  { step: 7, title: 'Review & Submit', icon: CheckCircle2, desc: 'Finish' },
];

const LOCAL_STORAGE_DRAFT_KEY = 'aks_agro_seller_draft_v1';

export function SellerOnboardingWizard() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SellerOnboardingData>(INITIAL_ONBOARDING_DATA);
  const [savingDraft, setSavingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  // Load existing application or draft on mount
  useEffect(() => {
    async function loadDraftOrExisting() {
      try {
        // 1. Check if user already has an active application in Firestore
        if (user && firestore) {
          const appRef = doc(firestore, 'seller_applications', user.uid);
          const appSnap = await getDoc(appRef);

          if (appSnap.exists()) {
            const appData = appSnap.data();
            // If already submitted or under review, redirect to application status page!
            if (['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].includes(appData.status)) {
              router.push('/seller/application');
              return;
            }
            // If draft or requires_changes, prefill data
            if (appData.draftData) {
              setFormData((prev) => ({ ...prev, ...appData.draftData }));
            }
          }
        }

        // 2. Otherwise check localStorage for draft
        const localDraft = localStorage.getItem(LOCAL_STORAGE_DRAFT_KEY);
        if (localDraft) {
          const parsed = JSON.parse(localDraft);
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error('Failed to load seller draft:', err);
      } finally {
        setIsLoadingExisting(false);
      }
    }

    loadDraftOrExisting();
  }, [user, firestore]);

  const updateData = (fields: Partial<SellerOnboardingData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...fields };
      // Save quick cache to localStorage
      try {
        localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    try {
      localStorage.setItem(LOCAL_STORAGE_DRAFT_KEY, JSON.stringify(formData));

      if (user && firestore) {
        const draftDocRef = doc(firestore, 'seller_applications', user.uid);
        await setDoc(
          draftDocRef,
          {
            userId: user.uid,
            status: 'DRAFT',
            draftData: formData,
            lastSavedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      toast({
        title: 'Draft Saved',
        description: 'Your seller registration progress has been saved securely.',
      });
    } catch (err) {
      console.error('Failed to save draft:', err);
      toast({
        variant: 'destructive',
        title: 'Save Error',
        description: 'Could not sync draft to cloud, saved locally on your device.',
      });
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      const appId = generateApplicationId();
      const userId = user?.uid || formData.account.userId || 'anon_' + Date.now();

      const applicationPayload = {
        applicationId: appId,
        userId: userId,
        sellerTypes: formData.sellerTypes,
        account: {
          firstName: formData.account.firstName,
          lastName: formData.account.lastName,
          email: formData.account.email,
          phone: formData.account.phone,
          whatsapp: formData.account.whatsapp,
        },
        business: formData.business,
        products: formData.products,
        location: formData.location,
        delivery: formData.delivery,
        verification: {
          identificationType: formData.verification.identificationType,
          identificationNumberMasked:
            '••••••' + formData.verification.identificationNumber.slice(-4),
          profilePhotoUrl: formData.verification.profilePhotoUrl || '',
          farmPhotoUrls: formData.verification.farmPhotoUrls || [],
          proofOfOwnershipUrl: formData.verification.proofOfOwnershipUrl || '',
          businessDocumentUrl: formData.verification.businessDocumentUrl || '',
        },
        status: 'UNDER_REVIEW',
        submittedAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to Firestore if available
      if (firestore) {
        const appRef = doc(firestore, 'seller_applications', userId);
        await setDoc(
          appRef,
          {
            ...applicationPayload,
            submittedAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }

      // Also invoke API endpoint for server-side persistence / notification
      try {
        await fetch('/api/sellers/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicationPayload),
        });
      } catch (apiErr) {
        console.warn('API sync completed with local fallback:', apiErr);
      }

      // Clear local draft
      localStorage.removeItem(LOCAL_STORAGE_DRAFT_KEY);

      toast({
        title: 'Application Submitted!',
        description: 'Your Akwa Ibom Agro seller application is now under review.',
      });

      router.push('/seller/application');
    } catch (err: any) {
      console.error('Submission failed:', err);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: err.message || 'An error occurred while submitting your application.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  if (isLoadingExisting) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full size-10 border-2 border-emerald-600 border-t-transparent mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
          Loading Agro Onboarding System...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header — step counter + % */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-600 dark:text-slate-400">
          Step {currentStep} of {STEPS.length}:{' '}
          <strong className="text-slate-900 dark:text-white">{STEPS[currentStep - 1].title}</strong>
        </span>
        <span className="font-black text-emerald-600">{progressPercent}%</span>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-1.5 bg-slate-100 dark:bg-slate-800" />

      {/* Mobile: horizontally scrollable step pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 lg:hidden scrollbar-none">
        {STEPS.map((s) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          const Icon = s.icon;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => { if (currentStep > s.step) setCurrentStep(s.step); }}
              disabled={currentStep < s.step}
              className={cn(
                'flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold border transition-all whitespace-nowrap',
                isCurrent
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 cursor-pointer'
                  : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 opacity-50 cursor-not-allowed'
              )}
            >
              {isCompleted ? (
                <Check className="size-2.5 stroke-[3]" />
              ) : (
                <Icon className="size-2.5" />
              )}
              {s.title}
            </button>
          );
        })}
      </div>

      {/* Desktop: 7-col grid */}
      <div className="hidden lg:grid grid-cols-7 gap-2">
        {STEPS.map((s) => {
          const isCompleted = currentStep > s.step;
          const isCurrent = currentStep === s.step;
          const Icon = s.icon;
          return (
            <button
              key={s.step}
              type="button"
              onClick={() => { if (currentStep > s.step) setCurrentStep(s.step); }}
              disabled={currentStep < s.step}
              className={cn(
                'p-2.5 rounded-xl text-left border transition-all select-none flex flex-col justify-between',
                isCurrent
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : isCompleted
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20 cursor-pointer'
                  : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200/60 dark:border-slate-800 opacity-60 cursor-not-allowed'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider">{s.desc}</span>
                {isCompleted ? (
                  <Check className="size-3 text-emerald-600 stroke-[3]" />
                ) : (
                  <Icon className="size-3 opacity-80" />
                )}
              </div>
              <span className="text-xs font-bold truncate">{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Form Container: Flat & edge-to-edge on mobile, elevated card on desktop */}
      <div className="rounded-2xl border-0 sm:border border-slate-200/80 dark:border-slate-800 bg-transparent sm:bg-white dark:sm:bg-slate-900 shadow-none sm:shadow-xs overflow-hidden p-0 sm:p-6 md:p-8">
        {currentStep === 1 && (
            <StepAccount
              data={formData}
              updateData={updateData}
              onNext={() => setCurrentStep(2)}
              onPrev={() => {}}
              isFirstStep={true}
              isLastStep={false}
              onSaveDraft={handleSaveDraft}
              savingDraft={savingDraft}
            />
          )}

          {currentStep === 2 && (
            <StepSellerType
              data={formData}
              updateData={updateData}
              onNext={() => setCurrentStep(3)}
              onPrev={() => setCurrentStep(1)}
              isFirstStep={false}
              isLastStep={false}
              onSaveDraft={handleSaveDraft}
              savingDraft={savingDraft}
            />
          )}

          {currentStep === 3 && (
            <StepBusiness
              data={formData}
              updateData={updateData}
              onNext={() => setCurrentStep(4)}
              onPrev={() => setCurrentStep(2)}
              isFirstStep={false}
              isLastStep={false}
              onSaveDraft={handleSaveDraft}
              savingDraft={savingDraft}
            />
          )}

          {currentStep === 4 && (
            <StepProducts
              data={formData}
              updateData={updateData}
              onNext={() => setCurrentStep(5)}
              onPrev={() => setCurrentStep(3)}
              isFirstStep={false}
              isLastStep={false}
              onSaveDraft={handleSaveDraft}
              savingDraft={savingDraft}
            />
          )}

          {currentStep === 5 && (
            <StepLocation
              data={formData}
              updateData={updateData}
              onNext={() => setCurrentStep(6)}
              onPrev={() => setCurrentStep(4)}
              isFirstStep={false}
              isLastStep={false}
              onSaveDraft={handleSaveDraft}
              savingDraft={savingDraft}
            />
          )}

          {currentStep === 6 && (
            <StepVerification
              data={formData}
              updateData={updateData}
              onNext={() => setCurrentStep(7)}
              onPrev={() => setCurrentStep(5)}
              isFirstStep={false}
              isLastStep={false}
              onSaveDraft={handleSaveDraft}
              savingDraft={savingDraft}
            />
          )}

          {currentStep === 7 && (
            <StepReview
              data={formData}
              updateData={updateData}
              onNext={() => {}}
              onPrev={() => setCurrentStep(6)}
              isFirstStep={false}
              isLastStep={true}
              onJumpToStep={(stepNum) => setCurrentStep(stepNum)}
              onSubmitApplication={handleSubmitApplication}
              isSubmitting={isSubmitting}
              onSaveDraft={handleSaveDraft}
              savingDraft={savingDraft}
            />
          )}
      </div>
    </div>
  );
}
