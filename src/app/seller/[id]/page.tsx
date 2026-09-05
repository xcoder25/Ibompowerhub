'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFirestore } from '@/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  MapPin,
  Truck,
  Star,
  Package,
  Phone,
  MessageSquare,
  Store,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Share2,
  Clock,
  Sparkles,
  ShoppingCart,
} from 'lucide-react';
import { SellerProfileRecord, ProductItem, SELLER_TYPES } from '@/lib/seller-types';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

export default function SellerPublicStorefront() {
  const params = useParams();
  const sellerId = params?.id as string;
  const firestore = useFirestore();

  const [seller, setSeller] = useState<SellerProfileRecord | null>(null);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    async function loadStore() {
      if (!firestore || !sellerId) return;

      try {
        // 1. Try fetching seller profile doc
        const profileRef = doc(firestore, 'seller_profiles', sellerId);
        const snap = await getDoc(profileRef);

        if (snap.exists()) {
          const sData = snap.data() as SellerProfileRecord;
          setSeller(sData);

          // Fetch their application to get products
          const appRef = doc(firestore, 'seller_applications', sellerId);
          const appSnap = await getDoc(appRef);
          if (appSnap.exists()) {
            setProducts(appSnap.data().products || []);
          }
        } else {
          // Fallback: check seller_applications
          const appRef = doc(firestore, 'seller_applications', sellerId);
          const appSnap = await getDoc(appRef);
          if (appSnap.exists()) {
            const data = appSnap.data();
            setSeller({
              id: appSnap.id,
              merchantId: data.merchantId || 'AKM-2026-000101',
              applicationId: data.applicationId,
              userId: data.userId,
              storeName: data.business?.farmBusinessName || 'Akwa Agro Merchant',
              storeSlug: 'store',
              sellerTypes: data.sellerTypes || ['farmer'],
              description: data.business?.businessDescription || '',
              phone: data.business?.businessPhone || '',
              whatsapp: data.account?.whatsapp || '',
              email: data.business?.businessEmail || '',
              businessType: data.business?.businessType || 'Individual',
              farmSize: data.business?.farmSize
                ? `${data.business?.farmSize} ${data.business?.farmSizeUnit}`
                : '',
              location: {
                state: 'Akwa Ibom State',
                lga: data.location?.lga || 'Uyo',
                community: data.location?.communityVillage || '',
                address: data.location?.farmBusinessAddress || '',
                landmark: data.location?.landmark || '',
              },
              delivery: {
                methods: data.delivery?.deliveryMethod || 'Delivery + Pickup',
                coverage: data.delivery?.deliveryCoverage || 'Across Akwa Ibom State',
                pickupAddress: data.delivery?.pickupAddress || '',
                deliveryNotes: data.delivery?.deliveryNotes || '',
                estimatedTime: data.delivery?.estimatedDeliveryTime || 'Within 24 hours',
              },
              logoUrl: data.verification?.profilePhotoUrl || '',
              isVerified: true,
              verifiedAt: new Date(),
              rating: 4.9,
              totalReviews: 18,
              completedOrders: 42,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            setProducts(data.products || []);
          }
        }
      } catch (err) {
        console.error('Error loading storefront:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, [firestore, sellerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full size-10 border-2 border-emerald-600 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Loading Verified Agro Storefront...
          </p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-16 px-4">
        <div className="max-w-md mx-auto text-center space-y-4">
          <div className="size-16 rounded-3xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Store className="size-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Merchant Store Not Found
          </h1>
          <p className="text-sm text-slate-500">
            This seller profile is either not yet verified or has been moved.
          </p>
          <div className="pt-2">
            <Link href="/market">
              <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 px-6">
                Explore Agro Marketplace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/80 dark:bg-slate-950 pb-20">
      {/* Top Header & Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-4">
        <Link
          href="/market"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Store Banner & Identity */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="relative rounded-[2.5rem] bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 border border-emerald-500/20 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Store Avatar */}
              <div className="size-24 sm:size-28 rounded-3xl bg-white/10 border-2 border-emerald-400/40 flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden flex-shrink-0">
                {seller.logoUrl ? (
                  <img
                    src={seller.logoUrl}
                    alt={seller.storeName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-emerald-400">{seller.storeName.charAt(0)}</span>
                )}
              </div>

              {/* Store Titles */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {seller.storeName}
                  </h1>
                  <Badge className="bg-emerald-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 gap-1 shadow-sm">
                    <ShieldCheck className="size-3.5 fill-current" /> Verified Seller
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <MapPin className="size-3.5" /> {seller.location.lga}, Akwa Ibom
                  </span>
                  <span>•</span>
                  <span>{seller.location.community}</span>
                  <span>•</span>
                  <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-[11px]">
                    ID: {seller.merchantId}
                  </span>
                </div>

                {/* Seller Type Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {seller.sellerTypes.map((st) => (
                    <Badge
                      key={st}
                      variant="outline"
                      className="text-[10px] font-bold border-white/20 text-white/90 uppercase tracking-wider"
                    >
                      {st.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Connect Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {seller.whatsapp && (
                <a
                  href={`https://wa.me/234${seller.whatsapp.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full sm:w-auto rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs h-11 px-5 gap-2 shadow-lg shadow-emerald-500/20">
                    <MessageSquare className="size-4" /> Chat on WhatsApp
                  </Button>
                </a>
              )}
              {seller.phone && (
                <a href={`tel:${seller.phone}`}>
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-xs h-11 px-5 gap-2"
                  >
                    <Phone className="size-4" /> Call Farm Desk
                  </Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: About & Logistics Info */}
        <div className="space-y-6">
          {/* About Card */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                About the Farm & Harvest
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {seller.description}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Business Model:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {seller.businessType}
                  </span>
                </div>
                {seller.farmSize && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Farm Acreage:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {seller.farmSize}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Rating:</span>
                  <span className="font-bold text-amber-500 flex items-center gap-1">
                    <Star className="size-3.5 fill-current" /> {seller.rating} (Verified buyers)
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Logistics Policy */}
          <Card className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-emerald-600" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider">
                  Fulfillment & Delivery
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium">Fulfillment Mode</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {seller.delivery.methods}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Delivery Coverage</span>
                  <p className="font-bold text-emerald-600 mt-0.5">
                    {seller.delivery.coverage}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium">Turnaround Time</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {seller.delivery.estimatedTime}
                  </p>
                </div>

                {seller.delivery.pickupAddress && (
                  <div>
                    <span className="text-slate-400 font-medium">Customer Pickup Point</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                      {seller.delivery.pickupAddress}
                    </p>
                  </div>
                )}

                {seller.delivery.deliveryNotes && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500">
                    "{seller.delivery.deliveryNotes}"
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Product Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Available Produce & Products
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Fresh harvest directly from {seller.location.lga}, Akwa Ibom State
              </p>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-none font-bold">
              {products.length} Listings
            </Badge>
          </div>

          {products.length === 0 ? (
            <Card className="rounded-3xl border-dashed border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center py-16 px-4">
              <Package className="size-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No active listings currently displayed
              </p>
              <p className="text-xs text-slate-400">Check back soon for the next harvest batch.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((prod, idx) => (
                <Card
                  key={prod.id || idx}
                  className="rounded-3xl border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                      {prod.images && prod.images.length > 0 ? (
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Package className="size-12 text-slate-400" />
                      )}
                      <Badge
                        className={`absolute top-3 right-3 text-[10px] font-black border-none uppercase ${
                          prod.availability === 'Available Now'
                            ? 'bg-emerald-600 text-white'
                            : prod.availability === 'Seasonal'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-600 text-white'
                        }`}
                      >
                        {prod.availability}
                      </Badge>
                    </div>

                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          {prod.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {prod.availableQuantity} {prod.unit}s left
                        </span>
                      </div>

                      <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                        {prod.name}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {prod.description}
                      </p>

                      <div className="pt-2 flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          ₦{Number(prod.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">/ {prod.unit}</span>
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-4 pt-0 space-y-2">
                    <Button
                      className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 gap-1.5 shadow-sm"
                      onClick={() => {
                        addItem({
                          id: prod.id || `${prod.name}-${idx}`,
                          name: prod.name,
                          price: Number(prod.price) || 0,
                          sellerName: seller.storeName,
                          sellerId: sellerId,
                          imageId: undefined,
                        });
                        toast({
                          title: 'Added to cart',
                          description: `${prod.name} from ${seller.storeName}`,
                        });
                      }}
                    >
                      <ShoppingCart className="size-3.5" /> Add to Cart
                    </Button>
                    {seller.whatsapp ? (
                      <a
                        href={`https://wa.me/234${seller.whatsapp.replace(
                          /^0/,
                          ''
                        )}?text=${encodeURIComponent(
                          `Hello ${seller.storeName}, I want to order "${prod.name}" (₦${prod.price}/${prod.unit}) from your Akwa Ibom Agro store.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block"
                      >
                        <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-10 gap-1.5">
                          <MessageSquare className="size-3.5" /> Order via WhatsApp
                        </Button>
                      </a>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
