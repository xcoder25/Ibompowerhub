'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import {
  doc,
  getDoc,
  collection,
  setDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  addDoc,
  getDocs,
  limit,
  writeBatch,
  increment,
  deleteDoc,
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
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Clock,
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Truck,
  Layers,
  ArrowRight,
  Settings,
  CheckCircle2,
  AlertCircle,
  Banknote,
  ArrowDownToLine,
  Loader2,
} from 'lucide-react';
import {
  SellerProfileRecord,
  ProductItem,
  singleProductSchema,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  ProductUnit,
  ProductAvailability,
} from '@/lib/seller-types';
import { formatNaira } from '@/lib/wallet-utils';

/** Marketplace order linked to this merchant (created at checkout). */
export type SellerOrder = {
  id: string;
  orderRef?: string;
  buyerId?: string;
  buyerName?: string;
  buyerPhone?: string;
  sellerId: string;
  sellerName?: string;
  items?: { productId: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  deliveryFee?: number;
  total: number;
  paymentMethod?: string;
  status: string;
  fulfillmentStatus?: string;
  settled?: boolean;
  createdAt?: any;
  deliveryAddress?: string;
};

export default function MerchantDashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [seller, setSeller] = useState<SellerProfileRecord | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // —— Finance (connected to IbomPay wallet + marketplace orders) ——
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [settling, setSettling] = useState(false);

  // Product Add/Edit Modal
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ProductItem>({
    id: '',
    name: '',
    category: 'Cassava',
    description: '',
    price: 3500,
    availableQuantity: 25,
    unit: 'Bag (50kg)',
    minimumOrderQuantity: 1,
    availability: 'Available Now',
    images: [],
  });

  useEffect(() => {
    async function loadMerchantData() {
      if (isUserLoading) return;

      const userId = user?.uid;

      if (!firestore || !userId) {
        // Fallback demo merchant profile + sample finance
        setSeller({
          id: 'demo_merchant',
          merchantId: 'AKM-2026-000042',
          applicationId: 'AKS-AGRO-2026-8812',
          userId: 'demo_merchant',
          storeName: 'Ibom Harvest Agro Cooperative',
          storeSlug: 'ibom-harvest-agro',
          sellerTypes: ['farmer', 'agro_processor'],
          description:
            'Specialized in organic yellow garri, fresh tubers, and quality palm oil processed in Uyo metropolis.',
          phone: '0803 112 3344',
          whatsapp: '0803 112 3344',
          email: 'merchant@ibomagro.ng',
          businessType: 'Cooperative',
          farmSize: '15 Hectares',
          location: {
            state: 'Akwa Ibom State',
            lga: 'Uyo',
            community: 'Ikot Oku Ikono',
            address: 'Km 3 Abak Road, Uyo',
            landmark: 'Near Tropicana Mall',
          },
          delivery: {
            methods: 'Delivery + Pickup',
            coverage: 'Across Akwa Ibom State',
            pickupAddress: 'Km 3 Abak Road, Agro Hub Depot',
            deliveryNotes: 'Dispatched daily within 24 hours',
            estimatedTime: '24 Hours',
          },
          isVerified: true,
          verifiedAt: new Date(),
          rating: 4.9,
          totalReviews: 24,
          completedOrders: 58,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        setProducts([
          {
            id: 'p1',
            name: 'Akwa Yellow Garri (Premium Grade)',
            category: 'Garri (Yellow/White)',
            description: 'Naturally crisped with genuine red palm oil. Sand-free and highly sour.',
            price: 4500,
            availableQuantity: 40,
            unit: 'Bag (50kg)',
            minimumOrderQuantity: 1,
            availability: 'Available Now',
            images: [],
          },
          {
            id: 'p2',
            name: 'Pure Red Palm Oil (AKS Special)',
            category: 'Palm Oil (Pure AKS Red)',
            description: 'Direct press from fresh oil palm bunches in Itu/Ibiono groves.',
            price: 28000,
            availableQuantity: 15,
            unit: 'Carton',
            minimumOrderQuantity: 1,
            availability: 'Available Now',
            images: [],
          },
        ]);
        setWalletBalance(385500);
        setOrders([
          {
            id: 'demo1',
            orderRef: 'AKS-9941',
            sellerId: 'demo_merchant',
            buyerName: 'Anietie Udoh',
            items: [{ productId: 'p1', name: 'Yellow Garri (50kg)', price: 4500, quantity: 5 }],
            subtotal: 22500,
            total: 23000,
            status: 'paid',
            fulfillmentStatus: 'awaiting_dispatch',
            settled: false,
            createdAt: new Date(),
          },
          {
            id: 'demo2',
            orderRef: 'AKS-9938',
            sellerId: 'demo_merchant',
            buyerName: 'Ekaette Bassey',
            items: [{ productId: 'p2', name: 'Red Palm Oil', price: 28000, quantity: 2 }],
            subtotal: 56000,
            total: 56500,
            status: 'paid',
            fulfillmentStatus: 'delivered',
            settled: true,
            createdAt: new Date(Date.now() - 86400000 * 2),
          },
          {
            id: 'demo3',
            orderRef: 'AKS-9920',
            sellerId: 'demo_merchant',
            buyerName: 'Okokon Essien',
            items: [{ productId: 'p3', name: 'Live Catfish', price: 3500, quantity: 10 }],
            subtotal: 35000,
            total: 35500,
            status: 'paid',
            fulfillmentStatus: 'delivered',
            settled: true,
            createdAt: new Date(Date.now() - 86400000 * 5),
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        const profileRef = doc(firestore, 'seller_profiles', userId);
        const snap = await getDoc(profileRef);

        if (snap.exists()) {
          setSeller(snap.data() as SellerProfileRecord);
        } else {
          const appRef = doc(firestore, 'seller_applications', userId);
          const appSnap = await getDoc(appRef);
          if (appSnap.exists() && appSnap.data().status === 'APPROVED') {
            const data = appSnap.data();
            setSeller({
              id: userId,
              merchantId: data.merchantId || 'AKM-2026-000001',
              applicationId: data.applicationId,
              userId: userId,
              storeName: data.business?.farmBusinessName || 'My Agro Store',
              storeSlug: 'store',
              sellerTypes: data.sellerTypes || ['farmer'],
              description: data.business?.businessDescription || '',
              phone: data.business?.businessPhone || '',
              whatsapp: data.account?.whatsapp || '',
              email: data.business?.businessEmail || '',
              businessType: data.business?.businessType || 'Individual',
              location: {
                state: 'Akwa Ibom State',
                lga: data.location?.lga || 'Uyo',
                community: data.location?.communityVillage || '',
                address: data.location?.farmBusinessAddress || '',
              },
              delivery: data.delivery,
              isVerified: true,
              verifiedAt: new Date(),
              rating: 5.0,
              totalReviews: 0,
              completedOrders: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            setProducts(data.products || []);
          } else {
            router.push('/seller/application');
            return;
          }
        }

        const appRef = doc(firestore, 'seller_applications', userId);
        const appSnap = await getDoc(appRef);
        if (appSnap.exists()) {
          setProducts(appSnap.data().products || []);
        }
      } catch (err) {
        console.error('Failed to load merchant:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMerchantData();
  }, [user, firestore, isUserLoading, router]);

  // Live IbomPay wallet balance + marketplace orders for this seller
  useEffect(() => {
    if (!firestore || !user?.uid) return;

    const unsubWallet = onSnapshot(doc(firestore, 'wallets', user.uid), (snap) => {
      if (snap.exists()) {
        setWalletBalance(Number(snap.data()?.balance ?? 0));
      } else {
        setWalletBalance(0);
      }
    });

    // Orders where this user is the merchant
    const ordersQ = query(
      collection(firestore, 'orders'),
      where('sellerId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubOrders = onSnapshot(
      ordersQ,
      (snap) => {
        const list: SellerOrder[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<SellerOrder, 'id'>),
        }));
        setOrders(list);
      },
      (err) => {
        // Index may be missing; fall back to unordered query
        console.warn('Seller orders query fallback:', err.message);
        getDocs(query(collection(firestore, 'orders'), where('sellerId', '==', user.uid), limit(50)))
          .then((snap) => {
            const list: SellerOrder[] = snap.docs.map((d) => ({
              id: d.id,
              ...(d.data() as Omit<SellerOrder, 'id'>),
            }));
            setOrders(list);
          })
          .catch(() => {});
      }
    );

    return () => {
      unsubWallet();
      unsubOrders();
    };
  }, [firestore, user?.uid]);

  // Derived finance metrics from real orders
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'completed');
  const pendingOrdersCount = orders.filter(
    (o) =>
      o.fulfillmentStatus === 'awaiting_dispatch' ||
      o.status === 'pending_payment' ||
      o.fulfillmentStatus === 'in_transit'
  ).length;
  const completedOrdersCount =
    orders.filter((o) => o.fulfillmentStatus === 'delivered' || o.status === 'completed').length ||
    seller?.completedOrders ||
    0;
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.subtotal) || Number(o.total) || 0), 0);
  // Available payout = paid orders not yet settled into seller wallet
  const availablePayout = paidOrders
    .filter((o) => !o.settled)
    .reduce((sum, o) => sum + (Number(o.subtotal) || Number(o.total) || 0), 0);

  /** Claim unsettled order earnings into the seller's own IbomPay wallet. */
  const handleClaimPayout = async () => {
    if (!firestore || !user?.uid) return;
    if (availablePayout <= 0) {
      toast({ title: 'Nothing to claim', description: 'No unsettled marketplace earnings yet.' });
      return;
    }

    setSettling(true);
    try {
      const unsettled = paidOrders.filter((o) => !o.settled);
      const claimAmount = unsettled.reduce(
        (sum, o) => sum + (Number(o.subtotal) || Number(o.total) || 0),
        0
      );

      // Credit seller's own wallet (allowed by rules: owner write)
      const walletRef = doc(firestore, 'wallets', user.uid);
      const walletSnap = await getDoc(walletRef);
      if (walletSnap.exists()) {
        await updateDoc(walletRef, { balance: increment(claimAmount) });
      } else {
        await setDoc(walletRef, {
          balance: claimAmount,
          currency: 'NGN',
          updatedAt: serverTimestamp(),
        });
      }

      await addDoc(collection(firestore, 'wallets', user.uid, 'transactions'), {
        type: 'credit',
        amount: claimAmount,
        description: `Agro Marketplace Payout (${unsettled.length} order${unsettled.length === 1 ? '' : 's'})`,
        category: 'market',
        timestamp: new Date(),
        reference: `AGR_PAYOUT_${Date.now()}`,
        status: 'success',
      });

      // Mark orders settled
      const batch = writeBatch(firestore);
      for (const o of unsettled) {
        if (o.id.startsWith('demo')) continue;
        batch.update(doc(firestore, 'orders', o.id), {
          settled: true,
          settledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();

      toast({
        title: 'Payout claimed',
        description: `${formatNaira(claimAmount)} credited to your IbomPay wallet.`,
      });
    } catch (err) {
      console.error('Payout claim failed:', err);
      toast({
        variant: 'destructive',
        title: 'Payout failed',
        description: 'Could not settle earnings. Try again or contact support.',
      });
    } finally {
      setSettling(false);
    }
  };


  /** Seller updates fulfillment status on their order (wires ops → finance timeline). */
  const handleUpdateOrderFulfillment = async (
    orderId: string,
    fulfillmentStatus: 'awaiting_dispatch' | 'in_transit' | 'delivered'
  ) => {
    if (!firestore || !user?.uid) return;
    if (orderId.startsWith('demo')) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                fulfillmentStatus,
                status: fulfillmentStatus === 'delivered' ? 'completed' : o.status,
              }
            : o
        )
      );
      toast({ title: 'Order updated', description: `Marked as ${fulfillmentStatus.replace('_', ' ')}.` });
      return;
    }
    try {
      const patch: Record<string, unknown> = {
        fulfillmentStatus,
        updatedAt: serverTimestamp(),
      };
      if (fulfillmentStatus === 'delivered') {
        patch.status = 'completed';
      }
      await updateDoc(doc(firestore, 'orders', orderId), patch);
      toast({ title: 'Order updated', description: `Marked as ${fulfillmentStatus.replace(/_/g, ' ')}.` });
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'Could not update order status.',
      });
    }
  };

  const handleSaveProduct = async () => {
    const res = singleProductSchema.safeParse(currentProduct);
    if (!res.success) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please verify all product fields.',
      });
      return;
    }

    const productId =
      editingIndex !== null && currentProduct.id
        ? currentProduct.id
        : 'prod_' + Date.now();
    const savedProduct = { ...currentProduct, id: productId };

    const nextList = [...products];
    if (editingIndex !== null) {
      nextList[editingIndex] = savedProduct;
    } else {
      nextList.push(savedProduct);
    }

    setProducts(nextList);

    if (user && firestore) {
      const appRef = doc(firestore, 'seller_applications', user.uid);
      await setDoc(appRef, { products: nextList }, { merge: true });

      // Wire to market catalog with sellerId so checkout credits this merchant
      await setDoc(
        doc(firestore, 'approved_products', productId),
        {
          id: productId,
          name: savedProduct.name,
          description: savedProduct.description,
          price: savedProduct.price,
          quantity: savedProduct.availableQuantity,
          availableQuantity: savedProduct.availableQuantity,
          unit: savedProduct.unit,
          category: savedProduct.category,
          images: savedProduct.images || [],
          availability: savedProduct.availability,
          sellerId: user.uid,
          sellerName: seller?.storeName || 'Ibom Merchant',
          userId: user.uid,
          status: 'approved',
          approvedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    toast({
      title: 'Listing Updated',
      description: `${savedProduct.name} saved to your store and market.`,
    });

    setProductModalOpen(false);
  };

  const handleDeleteProduct = async (idx: number) => {
    const removed = products[idx];
    const nextList = [...products];
    nextList.splice(idx, 1);
    setProducts(nextList);

    if (user && firestore) {
      const appRef = doc(firestore, 'seller_applications', user.uid);
      await setDoc(appRef, { products: nextList }, { merge: true });
      if (removed?.id) {
        try {
          await deleteDoc(doc(firestore, 'approved_products', removed.id));
        } catch {
          /* ignore */
        }
      }
    }

    toast({
      title: 'Product Removed',
      description: 'The listing was removed from your store.',
    });
  };

  if (loading || isUserLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full size-10 border-2 border-emerald-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Loading Merchant Dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4 text-center">
        <p className="text-sm text-slate-500 font-bold">Please complete seller verification.</p>
        <Link href="/market/sell">
          <Button className="mt-4 rounded-xl bg-emerald-600 text-white">Go to Onboarding</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Merchant Profile Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-emerald-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20 flex-shrink-0">
              {seller.storeName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {seller.storeName}
                </h1>
                <Badge className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 gap-1">
                  <ShieldCheck className="size-3 fill-current" /> Verified
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                <span>{seller.location.lga}, Akwa Ibom State</span>
                <span>•</span>
                <span className="font-mono text-emerald-600 font-bold">
                  Merchant ID: {seller.merchantId}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/seller/${seller.userId || seller.id}`} target="_blank">
              <Button
                variant="outline"
                className="rounded-xl text-xs font-bold h-10 border-slate-200 gap-1.5"
              >
                <ExternalLink className="size-3.5" /> View Public Store
              </Button>
            </Link>
            <Button
              onClick={() => {
                setCurrentProduct({
                  id: 'p_' + Date.now(),
                  name: '',
                  category: 'Cassava',
                  description: '',
                  price: 5000,
                  availableQuantity: 10,
                  unit: 'Bag (50kg)',
                  minimumOrderQuantity: 1,
                  availability: 'Available Now',
                  images: [],
                });
                setEditingIndex(null);
                setProductModalOpen(true);
              }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs h-10 px-4 gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Plus className="size-4" /> Add Product
            </Button>
          </div>
        </div>

        {/* 6 Key Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Products</span>
                <Package className="size-3.5 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{products.length}</p>
              <span className="text-[10px] text-emerald-600 font-bold">Catalog active</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Active Listings</span>
                <Store className="size-3.5 text-blue-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {products.filter((p) => p.availability === 'Available Now').length}
              </p>
              <span className="text-[10px] text-blue-600 font-bold">In stock now</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</span>
                <ShoppingCart className="size-3.5 text-indigo-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {orders.length > 0 ? completedOrdersCount : seller.completedOrders || 0}
              </p>
              <span className="text-[10px] text-indigo-600 font-bold">Completed / delivered</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Orders</span>
                <Clock className="size-3.5 text-amber-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">{pendingOrdersCount}</p>
              <span className="text-[10px] text-amber-600 font-bold">Awaiting dispatch</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue</span>
                <TrendingUp className="size-3.5 text-emerald-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {formatNaira(totalRevenue)}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">Paid marketplace sales</span>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Available Payout</span>
                <Wallet className="size-3.5 text-teal-600" />
              </div>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {formatNaira(availablePayout)}
              </p>
              <span className="text-[10px] text-teal-600 font-bold">Unsettled earnings</span>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-1 rounded-2xl flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="rounded-xl text-xs font-bold">
              Overview
            </TabsTrigger>
            <TabsTrigger value="finance" className="rounded-xl text-xs font-bold">
              Finance & Payouts
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl text-xs font-bold">
              Products & Inventory ({products.length})
            </TabsTrigger>
            <TabsTrigger value="store" className="rounded-xl text-xs font-bold">
              Storefront Profile
            </TabsTrigger>
            <TabsTrigger value="verification" className="rounded-xl text-xs font-bold">
              Verification Badge
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                      Recent Buyer Orders
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Live marketplace orders for your store
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-emerald-600"
                    onClick={() => setActiveTab('finance')}
                  >
                    Finance &amp; Payouts
                  </Button>
                </CardHeader>
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                  {orders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No marketplace orders yet. When buyers pay via Ibom Market, they appear here
                      and credit your available payout.
                    </div>
                  ) : (
                    orders.slice(0, 8).map((order) => {
                      const itemSummary =
                        order.items
                          ?.map((i) => `${i.quantity}x ${i.name}`)
                          .join(', ') || 'Order items';
                      const isPending =
                        order.fulfillmentStatus === 'awaiting_dispatch' ||
                        order.status === 'pending_payment';
                      return (
                        <div
                          key={order.id}
                          className="p-4 flex items-center justify-between text-xs gap-3"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {order.orderRef || order.id.slice(0, 10)} • {itemSummary}
                            </p>
                            <p className="text-slate-400 text-[11px] mt-0.5 truncate">
                              Buyer: {order.buyerName || 'Customer'}
                              {order.deliveryAddress ? ` • ${order.deliveryAddress}` : ''}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-black text-slate-900 dark:text-white">
                              {formatNaira(order.subtotal || order.total)}
                            </p>
                            <Badge
                              className={
                                isPending
                                  ? 'bg-amber-500/15 text-amber-700 text-[9px] font-bold border-none'
                                  : order.settled
                                    ? 'bg-slate-500/15 text-slate-600 text-[9px] font-bold border-none'
                                    : 'bg-emerald-500/15 text-emerald-700 text-[9px] font-bold border-none'
                              }
                            >
                              {isPending
                                ? 'Preparing'
                                : order.settled
                                  ? 'Settled'
                                  : order.status === 'paid'
                                    ? 'Paid'
                                    : order.fulfillmentStatus || order.status}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-3xl border-teal-500/20 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 shadow-sm">
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Wallet className="size-4 text-teal-600" /> IbomPay Snapshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3 text-xs">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500">Wallet balance</span>
                      <span className="font-black text-lg text-slate-900 dark:text-white">
                        {formatNaira(walletBalance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500">Unsettled payout</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">
                        {formatNaira(availablePayout)}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 gap-1.5"
                      onClick={() => setActiveTab('finance')}
                    >
                      Manage Finance <ArrowRight className="size-3.5" />
                    </Button>
                    <Link href="/wallet" className="block">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl text-xs font-bold h-9"
                      >
                        Open IbomPay Wallet
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                  <CardHeader className="p-5 pb-3">
                    <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                      Fulfillment Hub
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 pt-0 space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                      <span className="text-slate-400 font-medium">Pickup Point</span>
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {seller.delivery?.pickupAddress || 'Not set'}
                      </p>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                      <span className="text-slate-400 font-medium">Coverage Area</span>
                      <p className="font-bold text-emerald-600">
                        {seller.delivery?.coverage || 'Akwa Ibom State'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Finance & Payouts — connected to orders + IbomPay wallet */}
          <TabsContent value="finance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <CardContent className="p-5 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    IbomPay Wallet
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatNaira(walletBalance)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Already in your citizen wallet (withdraw / transfer anytime)
                  </p>
                  <Link href="/wallet">
                    <Button variant="outline" size="sm" className="mt-2 rounded-xl text-xs font-bold h-8">
                      Open Wallet
                    </Button>
                  </Link>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-teal-500/25 bg-teal-500/5 shadow-sm">
                <CardContent className="p-5 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-teal-700/80 tracking-wider">
                    Available to Claim
                  </p>
                  <p className="text-2xl font-black text-teal-800 dark:text-teal-300">
                    {formatNaira(availablePayout)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Paid orders not yet settled into your wallet
                  </p>
                  <Button
                    size="sm"
                    disabled={availablePayout <= 0 || settling}
                    onClick={handleClaimPayout}
                    className="mt-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold h-8 gap-1.5"
                  >
                    {settling ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <ArrowDownToLine className="size-3.5" />
                    )}
                    Claim to IbomPay
                  </Button>
                </CardContent>
              </Card>
              <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <CardContent className="p-5 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Lifetime Revenue
                  </p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">
                    {formatNaira(totalRevenue)}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Sum of paid marketplace sales (product subtotal)
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base font-black flex items-center gap-2">
                  <Banknote className="size-4 text-emerald-600" />
                  How seller finance is connected
                </CardTitle>
                <CardDescription className="text-xs">
                  End-to-end path from buyer cart to your earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5">
                  <li>
                    Buyer adds products (with your sellerId) to cart and checks out.
                  </li>
                  <li>
                    Wallet payments debit the buyer IbomPay wallet and write a debit transaction.
                  </li>
                  <li>
                    Checkout creates one orders document per seller with status paid (or pending for COD).
                  </li>
                  <li>
                    This dashboard listens to orders where sellerId equals you for revenue, pending, and payout.
                  </li>
                  <li>
                    Claim to IbomPay credits your wallet and marks those orders settled (shows as Agro Marketplace Payout in wallet history).
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
                <CardTitle className="text-base font-black">Order ledger</CardTitle>
                <CardDescription className="text-xs">All orders driving your finance numbers</CardDescription>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                {orders.length === 0 ? (
                  <p className="p-6 text-center text-xs text-slate-400">No orders yet.</p>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {order.orderRef || order.id}
                        </p>
                        <p className="text-slate-400 mt-0.5">
                          {order.buyerName || 'Buyer'} · {order.paymentMethod || '—'} ·{' '}
                          {order.settled ? 'Settled' : order.status}
                        </p>
                      </div>
                      <div className="text-right space-y-1.5">
                        <p className="font-black">{formatNaira(order.subtotal || order.total)}</p>
                        <p className="text-[10px] text-slate-400">
                          {order.fulfillmentStatus || '—'}
                        </p>
                        <div className="flex flex-wrap justify-end gap-1">
                          {order.fulfillmentStatus !== 'in_transit' &&
                            order.fulfillmentStatus !== 'delivered' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[10px] font-bold rounded-lg px-2"
                                onClick={() => handleUpdateOrderFulfillment(order.id, 'in_transit')}
                              >
                                Dispatch
                              </Button>
                            )}
                          {order.fulfillmentStatus !== 'delivered' && (
                            <Button
                              size="sm"
                              className="h-7 text-[10px] font-bold rounded-lg px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleUpdateOrderFulfillment(order.id, 'delivered')}
                            >
                              Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab Content */}
          {/* Products Tab Content */}
          <TabsContent value="products" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((prod, idx) => (
                <Card
                  key={prod.id || idx}
                  className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border-none">
                        {prod.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${
                          prod.availability === 'Available Now'
                            ? 'text-emerald-600 border-emerald-500/30'
                            : 'text-amber-600 border-amber-500/30'
                        }`}
                      >
                        {prod.availability}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                        {prod.description}
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₦{Number(prod.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400"> / {prod.unit}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-bold">
                        Stock: {prod.availableQuantity}
                      </span>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCurrentProduct({ ...prod });
                          setEditingIndex(idx);
                          setProductModalOpen(true);
                        }}
                        className="h-8 text-xs font-bold text-slate-600 hover:text-emerald-600 gap-1 rounded-xl"
                      >
                        <Edit2 className="size-3" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteProduct(idx)}
                        className="h-8 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Storefront Tab */}
          <TabsContent value="store" className="space-y-4">
            <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 space-y-4">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                Storefront Profile Settings
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Store Name</span>
                  <Input value={seller.storeName} disabled className="rounded-xl h-10" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Merchant ID</span>
                  <Input value={seller.merchantId} disabled className="rounded-xl h-10 font-mono" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Phone Contact</span>
                  <Input value={seller.phone} disabled className="rounded-xl h-10" />
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">WhatsApp Order Line</span>
                  <Input value={seller.whatsapp} disabled className="rounded-xl h-10" />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <Card className="rounded-3xl border-emerald-500/20 bg-emerald-500/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    Verified Akwa Ibom Agro Merchant
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official Certificate of Agricultural Verification — Government of Akwa Ibom State
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/20 space-y-2 text-xs">
                <p>
                  Merchant ID: <strong className="font-mono text-emerald-600">{seller.merchantId}</strong>
                </p>
                <p>
                  Territory: <strong>{seller.location.lga} LGA, Akwa Ibom State</strong>
                </p>
                <p>
                  Status: <strong className="text-emerald-600">Active & Certified</strong>
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add / Edit Product Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black">
              {editingIndex !== null ? 'Edit Produce Listing' : 'Add New Produce Listing'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <label className="font-bold text-slate-700">Product Name</label>
              <Input
                value={currentProduct.name}
                onChange={(e) =>
                  setCurrentProduct({ ...currentProduct, name: e.target.value })
                }
                className="rounded-xl h-10 text-xs mt-1"
                placeholder="e.g. Fresh Yam Tubers"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700">Price (₦)</label>
                <Input
                  type="number"
                  value={currentProduct.price || ''}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      price: Number(e.target.value),
                    })
                  }
                  className="rounded-xl h-10 text-xs mt-1"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700">Stock Qty</label>
                <Input
                  type="number"
                  value={currentProduct.availableQuantity || ''}
                  onChange={(e) =>
                    setCurrentProduct({
                      ...currentProduct,
                      availableQuantity: Number(e.target.value),
                    })
                  }
                  className="rounded-xl h-10 text-xs mt-1"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700">Description</label>
              <Textarea
                rows={2}
                value={currentProduct.description}
                onChange={(e) =>
                  setCurrentProduct({
                    ...currentProduct,
                    description: e.target.value,
                  })
                }
                className="rounded-xl text-xs mt-1 resize-none"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setProductModalOpen(false)}
              className="rounded-xl text-xs h-9"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4"
            >
              Save Produce
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
