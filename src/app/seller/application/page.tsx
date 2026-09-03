'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Store,
  Phone,
  HelpCircle,
  RotateCcw,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { SellerApplicationRecord, ApplicationStatus } from '@/lib/seller-types';

export default function SellerApplicationStatusPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [application, setApplication] = useState<SellerApplicationRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firestore || isUserLoading) return;

    if (!user) {
      // Check localStorage for offline demo or anon submission
      const localDraft = localStorage.getItem('aks_agro_seller_draft_v1');
      if (!localDraft) {
        setLoading(false);
        return;
      }
      setLoading(false);
      return;
    }

    const appRef = doc(firestore, 'seller_applications', user.uid);
    const unsubscribe = onSnapshot(
      appRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setApplication({
            id: snap.id,
            ...data,
            submittedAt: data.submittedAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as SellerApplicationRecord);
        } else {
          setApplication(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to application status:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, firestore, isUserLoading]);

  if (loading || isUserLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full size-10 border-2 border-emerald-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Retrieving Application Status...
          </p>
        </div>
      </div>
    );
  }

  // If no application exists yet
  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="size-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <FileText className="size-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            No Application Found
          </h1>
          <p className="text-sm text-slate-500">
            You haven't submitted a seller registration yet for the Akwa Ibom Agro Marketplace.
          </p>
          <div className="pt-2">
            <Link href="/market/sell">
              <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6 gap-2">
                <span>Start Seller Onboarding</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const status = application.status || 'UNDER_REVIEW';

  const getStatusBadge = (s: ApplicationStatus) => {
    switch (s) {
      case 'APPROVED':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 px-3 py-1 font-black uppercase text-xs tracking-wider gap-1.5">
            <CheckCircle2 className="size-3.5" /> Approved & Active
          </Badge>
        );
      case 'UNDER_REVIEW':
      case 'SUBMITTED':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 px-3 py-1 font-black uppercase text-xs tracking-wider gap-1.5 animate-pulse">
            <Clock className="size-3.5" /> Under Review
          </Badge>
        );
      case 'REQUIRES_CHANGES':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 px-3 py-1 font-black uppercase text-xs tracking-wider gap-1.5">
            <RotateCcw className="size-3.5" /> Action Needed
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30 px-3 py-1 font-black uppercase text-xs tracking-wider gap-1.5">
            <XCircle className="size-3.5" /> Application Declined
          </Badge>
        );
      case 'SUSPENDED':
        return (
          <Badge className="bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-500/30 px-3 py-1 font-black uppercase text-xs tracking-wider gap-1.5">
            <AlertTriangle className="size-3.5" /> Suspended
          </Badge>
        );
      default:
        return <Badge>{s}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 py-5 sm:py-10 px-3.5 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
        {/* Top Header Card */}
        <Card className="rounded-2xl sm:rounded-[2.5rem] border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div
            className={`p-4 sm:p-8 text-white relative overflow-hidden ${
              status === 'APPROVED'
                ? 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950'
                : status === 'REQUIRES_CHANGES'
                ? 'bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950'
                : status === 'REJECTED'
                ? 'bg-gradient-to-br from-rose-950 via-slate-900 to-slate-950'
                : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950'
            }`}
          >
            <div className="relative z-10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-[11px] font-bold tracking-wider uppercase text-white">
                  Application ID: <span className="font-mono">{application.applicationId}</span>
                </div>
                {getStatusBadge(status)}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {status === 'APPROVED' && 'Welcome, Verified Agro Merchant! 🌱'}
                {(status === 'UNDER_REVIEW' || status === 'SUBMITTED') &&
                  'Application Successfully Submitted'}
                {status === 'REQUIRES_CHANGES' && 'Application Requires Minor Updates'}
                {status === 'REJECTED' && 'Application Declined'}
                {status === 'SUSPENDED' && 'Merchant Account Suspended'}
              </h1>

              <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
                {status === 'APPROVED' &&
                  `Congratulations! Your farm/business "${application.business?.farmBusinessName}" has been verified by the Akwa Ibom State Agro Bureau. Your Merchant ID has been activated.`}
                {(status === 'UNDER_REVIEW' || status === 'SUBMITTED') &&
                  'Your seller registration has been received and queued for review by the Akwa Ibom State agricultural verification desk. We verify identity and farm locations to maintain highest trust for state produce.'}
                {status === 'REQUIRES_CHANGES' &&
                  'The review officer requested a few clarifications on your application. Please review the notes below, update the required fields, and re-submit.'}
                {status === 'REJECTED' &&
                  'Unfortunately, this application could not be approved at this time. Please see the officer notes below for details.'}
              </p>

              {/* Quick Actions in Header */}
              {status === 'APPROVED' && (
                <div className="pt-2 flex flex-wrap gap-3">
                  <Link href="/seller/dashboard">
                    <Button className="rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs h-11 px-6 shadow-lg gap-2">
                      <Store className="size-4" /> Enter Merchant Dashboard
                    </Button>
                  </Link>
                  <Link href={`/seller/${user?.uid}`}>
                    <Button
                      variant="outline"
                      className="rounded-xl border-white/30 text-white hover:bg-white/10 font-bold text-xs h-11 px-5"
                    >
                      View Public Storefront
                    </Button>
                  </Link>
                </div>
              )}

              {status === 'REQUIRES_CHANGES' && (
                <div className="pt-2">
                  <Link href="/market/sell">
                    <Button className="rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-xs h-11 px-6 shadow-lg gap-2">
                      <RotateCcw className="size-4" /> Edit Application & Re-submit
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Merchant ID Certificate Strip if Approved */}
            {status === 'APPROVED' && application.merchantId && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Official Merchant Identification
                    </p>
                    <p className="text-base font-black text-slate-900 dark:text-white font-mono">
                      {application.merchantId}
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1">
                  Akwa Ibom State Verified
                </Badge>
              </div>
            )}

            {/* Admin Change Request or Rejection Notes */}
            {application.changeRequest && status === 'REQUIRES_CHANGES' && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <RotateCcw className="size-4" /> Review Officer Feedback
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "{application.changeRequest}"
                </p>
              </div>
            )}

            {application.rejectionReason && status === 'REJECTED' && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs uppercase tracking-wider">
                  <XCircle className="size-4" /> Reason for Decline
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  "{application.rejectionReason}"
                </p>
              </div>
            )}

            {/* Dossier Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Submission Date</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {application.submittedAt
                    ? new Date(application.submittedAt).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recent'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Local Govt Area</span>
                <p className="font-bold text-emerald-600 mt-0.5">{application.location?.lga}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Products Registered</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {application.products?.length || 0} items
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-medium">Est. Review Turnaround</span>
                <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">24 - 48 Hours</p>
              </div>
            </div>

            {/* Need Help / Contact */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <HelpCircle className="size-4 text-emerald-600" />
                <span>Questions regarding verification? Contact the AKS Agro Helpdesk:</span>
              </div>
              <a
                href="tel:08031120001"
                className="font-bold text-emerald-600 hover:underline flex items-center gap-1.5"
              >
                <Phone className="size-3.5" /> 0803 112 0001 (Mon-Fri 8am-5pm)
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
