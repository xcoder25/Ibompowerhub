'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
  Search,
  Eye,
  Filter,
  Store,
  MapPin,
  Package,
  Phone,
  Mail,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  Truck,
} from 'lucide-react';
import {
  SellerApplicationRecord,
  ApplicationStatus,
  generateMerchantId,
} from '@/lib/seller-types';

export default function AdminSellersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [applications, setApplications] = useState<SellerApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('pending');

  // Modal states
  const [viewingApp, setViewingApp] = useState<SellerApplicationRecord | null>(null);
  const [actionType, setActionType] = useState<
    'approve' | 'reject' | 'request_changes' | 'suspend' | null
  >(null);
  const [reasonText, setReasonText] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!firestore) return;

    const q = query(
      collection(firestore, 'seller_applications'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SellerApplicationRecord[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            ...data,
            submittedAt: data.submittedAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date(),
          } as SellerApplicationRecord);
        });
        setApplications(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching applications:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [firestore]);

  // Filter applications by tab and search
  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      (app.business?.farmBusinessName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.account?.firstName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.account?.lastName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location?.lga || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.applicationId || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedTab === 'pending') {
      return ['UNDER_REVIEW', 'SUBMITTED', 'DRAFT'].includes(app.status);
    }
    if (selectedTab === 'approved') {
      return app.status === 'APPROVED';
    }
    if (selectedTab === 'rejected') {
      return app.status === 'REJECTED';
    }
    if (selectedTab === 'changes') {
      return app.status === 'REQUIRES_CHANGES';
    }
    if (selectedTab === 'suspended') {
      return app.status === 'SUSPENDED';
    }
    return true; // 'all'
  });

  const handleAdminAction = async () => {
    if (!viewingApp || !actionType || !firestore) return;

    if ((actionType === 'reject' || actionType === 'request_changes' || actionType === 'suspend') && !reasonText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input Required',
        description: 'Please provide explanatory notes for this action.',
      });
      return;
    }

    setProcessing(true);
    try {
      let newStatus: ApplicationStatus = 'UNDER_REVIEW';
      let merchantId = viewingApp.merchantId;

      if (actionType === 'approve') {
        newStatus = 'APPROVED';
        if (!merchantId) {
          const randomSeq = Math.floor(1000 + Math.random() * 9000);
          merchantId = generateMerchantId(randomSeq);
        }

        // 1. Create or activate public merchant profile
        const profileRef = doc(firestore, 'seller_profiles', viewingApp.userId);
        await setDoc(
          profileRef,
          {
            id: viewingApp.userId,
            merchantId,
            applicationId: viewingApp.applicationId,
            userId: viewingApp.userId,
            storeName: viewingApp.business.farmBusinessName,
            storeSlug: viewingApp.business.farmBusinessName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, ''),
            sellerTypes: viewingApp.sellerTypes || [],
            description: viewingApp.business.businessDescription,
            phone: viewingApp.business.businessPhone,
            whatsapp: viewingApp.account.whatsapp,
            email: viewingApp.business.businessEmail,
            businessType: viewingApp.business.businessType,
            cacNumber: viewingApp.business.cacNumber || '',
            farmSize: viewingApp.business.farmSize
              ? `${viewingApp.business.farmSize} ${viewingApp.business.farmSizeUnit}`
              : '',
            location: {
              state: 'Akwa Ibom State',
              lga: viewingApp.location.lga,
              community: viewingApp.location.communityVillage,
              address: viewingApp.location.farmBusinessAddress,
              landmark: viewingApp.location.landmark || '',
            },
            delivery: {
              methods: viewingApp.delivery.deliveryMethod,
              coverage: viewingApp.delivery.deliveryCoverage,
              pickupAddress: viewingApp.delivery.pickupAddress,
              deliveryNotes: viewingApp.delivery.deliveryNotes || '',
              estimatedTime: viewingApp.delivery.estimatedDeliveryTime,
            },
            logoUrl: viewingApp.verification.profilePhotoUrl || '',
            isVerified: true,
            verifiedAt: serverTimestamp(),
            rating: 5.0,
            totalReviews: 0,
            completedOrders: 0,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } else if (actionType === 'reject') {
        newStatus = 'REJECTED';
      } else if (actionType === 'request_changes') {
        newStatus = 'REQUIRES_CHANGES';
      } else if (actionType === 'suspend') {
        newStatus = 'SUSPENDED';
      }

      // 2. Update application document
      const appRef = doc(firestore, 'seller_applications', viewingApp.id);
      await setDoc(
        appRef,
        {
          status: newStatus,
          merchantId: merchantId || null,
          reviewedAt: serverTimestamp(),
          reviewedBy: user?.email || 'admin',
          rejectionReason: actionType === 'reject' ? reasonText : null,
          changeRequest: actionType === 'request_changes' ? reasonText : null,
          suspensionReason: actionType === 'suspend' ? reasonText : null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: 'Action Applied',
        description: `Application updated to ${newStatus}. Merchant ID: ${merchantId || 'N/A'}.`,
      });

      setActionType(null);
      setReasonText('');
      setViewingApp(null);
    } catch (err: any) {
      console.error('Error applying admin action:', err);
      toast({
        variant: 'destructive',
        title: 'Action Failed',
        description: err.message || 'Could not process admin action.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto bg-slate-50/50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="text-xs font-bold text-slate-400 hover:text-emerald-600 flex items-center gap-1"
            >
              <ArrowLeft className="size-3.5" /> Back to Admin Control Center
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Agro Seller Applications & Verification
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Review, verify, and approve agricultural merchants across the 31 LGAs of Akwa Ibom State.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold py-1.5 px-3">
            Total Applications: {applications.length}
          </Badge>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full md:w-auto"
        >
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 rounded-2xl">
            <TabsTrigger value="pending" className="rounded-xl text-xs font-bold">
              Pending ({applications.filter((a) => ['UNDER_REVIEW', 'SUBMITTED'].includes(a.status)).length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-xl text-xs font-bold">
              Approved ({applications.filter((a) => a.status === 'APPROVED').length})
            </TabsTrigger>
            <TabsTrigger value="changes" className="rounded-xl text-xs font-bold">
              Requires Changes ({applications.filter((a) => a.status === 'REQUIRES_CHANGES').length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-xl text-xs font-bold">
              Rejected ({applications.filter((a) => a.status === 'REJECTED').length})
            </TabsTrigger>
            <TabsTrigger value="all" className="rounded-xl text-xs font-bold">
              All ({applications.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-72">
          <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search seller, farm, LGA, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-2xl h-10 text-xs bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Applications Table / Cards */}
      <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        {filteredApps.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Store className="size-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No applications in this view
            </p>
            <p className="text-xs text-slate-400">
              Try selecting a different filter tab or clearing your search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-black tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Merchant / Farm</th>
                  <th className="py-3.5 px-4">Categories</th>
                  <th className="py-3.5 px-4">Location (LGA)</th>
                  <th className="py-3.5 px-4">Products</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-700 dark:text-slate-200">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 font-black flex items-center justify-center flex-shrink-0">
                          {app.business?.farmBusinessName?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {app.business?.farmBusinessName || 'Unnamed Farm'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {app.account?.firstName} {app.account?.lastName} • {app.account?.phone}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(app.sellerTypes || []).slice(0, 2).map((t) => (
                          <Badge
                            key={t}
                            variant="secondary"
                            className="text-[10px] font-bold py-0.5 px-2 rounded-md"
                          >
                            {t.replace('_', ' ')}
                          </Badge>
                        ))}
                        {(app.sellerTypes || []).length > 2 && (
                          <span className="text-[10px] text-slate-400 font-bold">
                            +{(app.sellerTypes || []).length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {app.location?.lga}, AKS
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-xs">
                        {app.location?.communityVillage}
                      </p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-emerald-600">
                        {app.products?.length || 0} products
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 ${
                          app.status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                            : app.status === 'UNDER_REVIEW' || app.status === 'SUBMITTED'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                            : app.status === 'REQUIRES_CHANGES'
                            ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {app.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        onClick={() => setViewingApp(app)}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-950 font-bold text-xs h-8 px-3.5 gap-1.5 shadow-xs"
                      >
                        <Eye className="size-3.5" /> Review Dossier
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Dossier Review Modal */}
      {viewingApp && (
        <Dialog open={Boolean(viewingApp)} onOpenChange={(open) => !open && setViewingApp(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
            <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                    Seller Application Dossier
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 mt-0.5">
                    Application ID: <strong className="font-mono">{viewingApp.applicationId}</strong>
                  </DialogDescription>
                </div>
                <Badge className="text-xs font-black uppercase px-2.5 py-1">
                  {viewingApp.status}
                </Badge>
              </div>
            </DialogHeader>

            {/* Dossier Content */}
            <div className="space-y-6 py-3 text-xs">
              {/* Merchant Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  1. Merchant & Account Contact
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400">Name</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.account?.firstName} {viewingApp.account?.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Email</span>
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {viewingApp.account?.email}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Phone</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.account?.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">WhatsApp</span>
                    <p className="font-bold text-emerald-600">
                      {viewingApp.account?.whatsapp}
                    </p>
                  </div>
                </div>
              </div>

              {/* Farm / Business Info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  2. Farm & Enterprise Details
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400">Farm / Business</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.business?.farmBusinessName}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Structure</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.business?.businessType}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Est. Year</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.business?.yearEstablished}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">CAC Number</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.business?.cacNumber || 'Smallholder / None'}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                  <p className="font-semibold">{viewingApp.business?.businessDescription}</p>
                </div>
              </div>

              {/* Location & Delivery */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  3. Akwa Ibom Location & Logistics
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <span className="text-slate-400">LGA</span>
                    <p className="font-bold text-emerald-600">{viewingApp.location?.lga}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Ward & Community</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.location?.communityVillage} ({viewingApp.location?.ward})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Delivery Mode</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.delivery?.deliveryMethod}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">Coverage</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.delivery?.deliveryCoverage}
                    </p>
                  </div>
                </div>
                <p className="pt-2 text-slate-500">
                  Address: <strong>{viewingApp.location?.farmBusinessAddress}</strong>
                </p>
              </div>

              {/* Products List */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  4. Registered Produce ({viewingApp.products?.length || 0})
                </h4>
                <div className="divide-y divide-slate-200/60 dark:divide-slate-800">
                  {(viewingApp.products || []).map((p, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
                        <span className="text-slate-400 ml-2">
                          ({p.category} • {p.availableQuantity} {p.unit}s)
                        </span>
                      </div>
                      <span className="font-black text-emerald-600">
                        ₦{Number(p.price).toLocaleString()} / {p.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Verification & ID */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  5. Verification & Documents
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-slate-400">ID Type</span>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {viewingApp.verification?.identificationType}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400">ID Number Masked</span>
                    <p className="font-bold text-slate-900 dark:text-white font-mono">
                      {viewingApp.verification?.identificationNumberMasked}
                    </p>
                  </div>
                </div>

                {/* Uploaded Photos Preview */}
                <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    Farm & Profile Imagery
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {viewingApp.verification?.profilePhotoUrl && (
                      <div className="size-20 rounded-xl overflow-hidden border">
                        <img
                          src={viewingApp.verification.profilePhotoUrl}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {(viewingApp.verification?.farmPhotoUrls || []).map((img, idx) => (
                      <div key={idx} className="size-20 rounded-xl overflow-hidden border">
                        <img src={img} alt="Farm" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2 justify-between sm:justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewingApp(null)}
                  className="rounded-xl text-xs h-10"
                >
                  Close
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setActionType('request_changes');
                    setReasonText('');
                  }}
                  className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 gap-1.5"
                >
                  <RotateCcw className="size-3.5" /> Request Changes
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setActionType('reject');
                    setReasonText('');
                  }}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-10 gap-1.5"
                >
                  <XCircle className="size-3.5" /> Reject
                </Button>

                <Button
                  type="button"
                  onClick={() => {
                    setActionType('approve');
                    setReasonText('');
                  }}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-5 gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle className="size-4" /> Approve & Issue Merchant ID
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Action Dialog (Rejection reason / Change request / Suspension) */}
      {actionType && (
        <Dialog open={Boolean(actionType)} onOpenChange={(open) => !open && setActionType(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogHeader className="pb-2">
              <DialogTitle className="text-lg font-black text-slate-900 dark:text-white capitalize">
                {actionType === 'approve' && 'Approve Merchant Application'}
                {actionType === 'reject' && 'Decline Application'}
                {actionType === 'request_changes' && 'Request Changes from Seller'}
                {actionType === 'suspend' && 'Suspend Seller Profile'}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {actionType === 'approve' &&
                  'This will generate an official Akwa Ibom Merchant ID (e.g. AKM-2026-XXXXXX) and activate their merchant dashboard and public store.'}
                {actionType === 'reject' &&
                  'Please explain clearly why this application is declined so the applicant understands.'}
                {actionType === 'request_changes' &&
                  'Specify what the applicant needs to correct (e.g. upload clearer farm photos, specify LGA).'}
              </DialogDescription>
            </DialogHeader>

            {actionType !== 'approve' && (
              <div className="space-y-2 py-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Officer Notes / Reason <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  rows={3}
                  placeholder="Enter detailed feedback for the applicant..."
                  value={reasonText}
                  onChange={(e) => setReasonText(e.target.value)}
                  className="rounded-xl text-xs resize-none"
                />
              </div>
            )}

            <DialogFooter className="pt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActionType(null)}
                disabled={processing}
                className="rounded-xl text-xs h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAdminAction}
                disabled={processing}
                className={`rounded-xl text-white font-black text-xs h-10 px-5 shadow-sm ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'reject'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {processing ? 'Processing...' : 'Confirm Action'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
