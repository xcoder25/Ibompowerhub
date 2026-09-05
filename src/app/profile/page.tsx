'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Settings, ShieldCheck, MapPin, Store, ArrowRight, 
  ExternalLink, Sparkles, CheckCircle2, AlertTriangle, 
  Zap, ShoppingBag, MessageSquare, Clock, Filter,
  Building2, Briefcase, RefreshCw, ChevronRight, UserCheck
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, limit, onSnapshot, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { EditProfileDialog } from '@/components/profile/edit-profile-dialog';
import { useToast } from '@/hooks/use-toast';
import { SellerProfileRecord } from '@/lib/seller-types';

type UserProfile = {
  name: string;
  role: string;
  profileImageUrl?: string;
  rating?: number;
  bio?: string;
  location?: string;
  activePersona?: 'citizen' | 'seller';
};

interface UnifiedActivityItem {
  id: string;
  type: 'civic' | 'power' | 'market' | 'wallet';
  title: string;
  description: string;
  time: string;
  status: 'completed' | 'in_progress' | 'verified';
  amount?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [localProfile, setLocalProfile] = useState<Partial<UserProfile>>({});
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(null);
  const [sellerRecord, setSellerRecord] = useState<SellerProfileRecord | null>(null);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const [isSellerMode, setIsSellerMode] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'civic' | 'power' | 'market'>('all');
  const [activities, setActivities] = useState<UnifiedActivityItem[]>([]);

  // User profile ref
  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [firestore, user]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userDocRef);

  // Sync profile data
  useEffect(() => {
    if (userProfile) {
      setLocalProfile(userProfile);
      setIsSellerMode(userProfile.activePersona === 'seller' || userProfile.role === 'Seller');
    } else if (user) {
      setLocalProfile({
        name: user.displayName || 'Akwa Ibom Citizen',
        role: 'Resident',
        location: 'Uyo, Akwa Ibom State',
        bio: 'Citizen of Akwa Ibom State using Ibom Power Hub.'
      });
    }
  }, [userProfile, user]);

  // Check if current user has an active seller profile in Firestore
  useEffect(() => {
    if (!user || !firestore) {
      setIsSellerLoading(false);
      return;
    }

    async function checkSellerStatus() {
      try {
        const sellerRef = doc(firestore!, 'sellers', user!.uid);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSellerRecord(sellerSnap.data() as SellerProfileRecord);
          setIsSellerMode(true);
        } else {
          setSellerRecord(null);
        }
      } catch (err) {
        console.warn('[Profile] Error checking seller status:', err);
      } finally {
        setIsSellerLoading(false);
      }
    }

    checkSellerStatus();
  }, [user, firestore]);

  // Load real user activity from transactions & civic reports
  useEffect(() => {
    if (!user || !firestore) {
      // Mock seed activities for visual polish
      setActivities([
        {
          id: 'act-1',
          type: 'power',
          title: 'Purchased Electricity Token',
          description: 'Vended 68 kWh for STS Prepaid Meter (PHED Feeder)',
          time: '2 hours ago',
          status: 'completed',
          amount: '₦5,000'
        },
        {
          id: 'act-2',
          type: 'civic',
          title: 'FloodSense Hazard Report',
          description: 'Logged localized drain overflow at Ikot Ekpene Road',
          time: 'Yesterday',
          status: 'verified'
        },
        {
          id: 'act-3',
          type: 'market',
          title: 'AgoraConnect Order Received',
          description: 'Item purchased from Uyo Central Market Merchant',
          time: '3 days ago',
          status: 'completed',
          amount: '₦12,400'
        },
        {
          id: 'act-4',
          type: 'civic',
          title: 'Digital Identity Verified',
          description: 'Level 2 KYC Phone & BVN linked successfully',
          time: '1 week ago',
          status: 'completed'
        }
      ]);
      return;
    }

    const txnsRef = collection(firestore, 'wallets', user.uid, 'transactions');
    const q = query(txnsRef, orderBy('timestamp', 'desc'), limit(8));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: UnifiedActivityItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        items.push({
          id: d.id,
          type: data.description?.toLowerCase().includes('power') ? 'power' : data.description?.toLowerCase().includes('market') ? 'market' : 'wallet',
          title: data.description || 'Wallet Transaction',
          description: `Reference: ${data.reference || d.id.slice(0, 8)}`,
          time: data.timestamp?.toDate ? new Date(data.timestamp.toDate()).toLocaleDateString() : 'Recent',
          status: 'completed',
          amount: data.amount ? `₦${data.amount.toLocaleString()}` : undefined
        });
      });

      if (items.length > 0) {
        setActivities(items);
      } else {
        // Fallback default activity items
        setActivities([
          {
            id: 'act-1',
            type: 'power',
            title: 'Grid Power Activity',
            description: 'Meter linked to Ibom Power Feeder Station',
            time: 'Active',
            status: 'completed'
          },
          {
            id: 'act-2',
            type: 'civic',
            title: 'Profile Created',
            description: 'Registered as verified Akwa Ibom Hub user',
            time: 'Joined',
            status: 'completed'
          }
        ]);
      }
    }, () => {});

    return () => unsubscribe();
  }, [user, firestore]);

  const handleUpdateProfile = async (updates: { name?: string; bio?: string; location?: string }) => {
    if (!user || !userDocRef) return;
    setLocalProfile(prev => ({ ...prev, ...updates }));
    try {
      await setDoc(userDocRef, updates, { merge: true });
      if (updates.name && updates.name !== user.displayName) {
        await updateProfile(user, { displayName: updates.name });
      }
      toast({ title: 'Profile Updated', description: 'Your citizen profile changes have been saved.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not sync changes.' });
      throw error;
    }
  };

  const handleImageSaved = (url: string) => {
    setLocalProfile(prev => ({ ...prev, profileImageUrl: url }));
    setPendingImageUrl(null);
  };

  const handlePreviewImage = (url: string | null) => {
    setPendingImageUrl(url);
  };

  // Switch between Citizen and Seller persona
  const handleToggleSellerMode = async (checked: boolean) => {
    setIsSellerMode(checked);
    if (!sellerRecord && checked) {
      // If user isn't an approved seller yet, navigate to seller dashboard or application
      toast({
        title: 'Merchant Access',
        description: 'Navigating to AgoraConnect Merchant Hub...',
      });
      router.push('/seller/dashboard');
      return;
    }

    if (userDocRef) {
      try {
        await updateDoc(userDocRef, {
          activePersona: checked ? 'seller' : 'citizen'
        });
        toast({
          title: checked ? '🏬 Switched to Seller Mode' : '👤 Switched to Citizen Mode',
          description: checked 
            ? `Active store: ${sellerRecord?.storeName || 'Merchant Dashboard'}`
            : 'Viewing citizen municipal services and personal activity.'
        });
      } catch (e) {
        console.warn('Persona update error:', e);
      }
    }
  };

  const currentName = localProfile?.name ?? user?.displayName ?? 'Akwa Ibom Citizen';
  const currentBio = localProfile?.bio ?? 'Verified Akwa Ibom State resident and municipal services subscriber.';
  const currentLocation = localProfile?.location ?? 'Uyo, Akwa Ibom';
  const currentProfileImageUrl = pendingImageUrl ?? localProfile?.profileImageUrl ?? user?.photoURL ?? undefined;

  const filteredActivities = activities.filter(a => {
    if (activityFilter === 'all') return true;
    return a.type === activityFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-background dark:via-background dark:to-background pb-24">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-300 font-bold text-xs gap-1.5 py-1 px-3">
            <UserCheck className="size-3.5" />
            Verified Profile
          </Badge>
        </div>
        <Link href="/settings">
          <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-2 border-slate-200 hover:bg-slate-100 dark:hover:bg-muted">
            <Settings className="size-3.5 text-slate-600 dark:text-slate-300" />
            Settings
          </Button>
        </Link>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-4 space-y-6">
        {/* Profile Card */}
        <Card className="border-border/60 shadow-md rounded-3xl overflow-hidden bg-card/80 backdrop-blur-md">
          {/* Header Banner Gradient */}
          <div className="h-28 bg-gradient-to-r from-emerald-700 via-green-800 to-slate-900 relative">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          </div>

          <CardContent className="relative pt-0 px-6 sm:px-8 pb-7">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-12 mb-4">
              <div className="flex items-end gap-4">
                <Avatar className="size-24 sm:size-28 border-4 border-background shadow-xl text-3xl font-black bg-emerald-100 text-emerald-800">
                  <AvatarImage src={currentProfileImageUrl} alt={currentName} />
                  <AvatarFallback>{currentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="mb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{currentName}</h1>
                    <ShieldCheck className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mt-0.5">
                    <MapPin className="size-3.5 text-emerald-600" />
                    <span>{currentLocation}</span>
                    <span>•</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">{localProfile?.role ?? 'Citizen'}</span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <div className="shrink-0 mb-1">
                <EditProfileDialog
                  user={{
                    name: currentName,
                    bio: currentBio,
                    location: currentLocation,
                    profileImageUrl: currentProfileImageUrl
                  }}
                  onUpdateProfile={handleUpdateProfile}
                  onImageSaved={handleImageSaved}
                  onPreviewImage={handlePreviewImage}
                />
              </div>
            </div>

            <p className="text-xs sm:text-sm text-foreground/85 max-w-2xl leading-relaxed">
              {currentBio}
            </p>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* SELLER DASHBOARD SWITCHING CARD                                          */}
        {/* ========================================================================= */}
        <Card className="border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-card to-amber-500/5 shadow-md rounded-3xl overflow-hidden">
          <CardHeader className="pb-3 pt-6 px-6 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                  <Store className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-black tracking-tight text-foreground">
                      Seller & Merchant Mode
                    </CardTitle>
                    {sellerRecord ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-bold text-[10px]">
                        Active Merchant
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="font-bold text-[10px] text-amber-700 dark:text-amber-400 bg-amber-500/10">
                        Merchant Ready
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    Toggle your account view between Citizen services and Merchant store management
                  </CardDescription>
                </div>
              </div>

              {/* Direct Switcher Toggle */}
              <div className="flex items-center gap-3 bg-background/90 border border-border/80 px-4 py-2 rounded-2xl shadow-sm self-start sm:self-auto">
                <div className="text-right">
                  <p className="text-xs font-bold text-foreground">
                    {isSellerMode ? 'Seller Mode Active' : 'Citizen Mode Active'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isSellerMode ? 'Storefront tools enabled' : 'Personal services'}
                  </p>
                </div>
                <Switch
                  id="seller-mode-switch"
                  checked={isSellerMode}
                  onCheckedChange={handleToggleSellerMode}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-6 pt-2">
            {sellerRecord ? (
              /* User is an Approved Seller */
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-foreground flex items-center gap-2">
                      <span>{sellerRecord.storeName}</span>
                      <CheckCircle2 className="size-4 text-emerald-600" />
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      AgoraConnect Merchant ID: <span className="font-mono text-foreground font-semibold">{sellerRecord.merchantId || sellerRecord.id.slice(0, 10)}</span>
                    </p>
                  </div>
                  <Link href="/seller/dashboard">
                    <Button className="rounded-xl font-black text-xs gap-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-sm hover:from-emerald-700 hover:to-green-800">
                      Open Seller Dashboard
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-border/40 text-xs">
                  <div className="p-2.5 rounded-xl bg-muted/40">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Business Type</p>
                    <p className="font-bold text-foreground mt-0.5 capitalize">{sellerRecord.businessType || 'Enterprise'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">LGA Hub</p>
                    <p className="font-bold text-foreground mt-0.5">{sellerRecord.location?.lga || 'Uyo'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Delivery</p>
                    <p className="font-bold text-foreground mt-0.5 capitalize">{sellerRecord.delivery?.coverage || 'State-wide'}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-muted/40">
                    <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Status</p>
                    <p className="font-bold text-emerald-600 mt-0.5">Verified & Live</p>
                  </div>
                </div>
              </div>
            ) : (
              /* User is not yet an Approved Seller */
              <div className="p-5 rounded-2xl bg-card border border-border/70 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <h3 className="text-base font-black text-foreground">
                      Expand your trade across all 31 Local Government Areas
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Switch to Seller Mode to list agricultural produce, artisanal crafts, or wholesale goods on AgoraConnect with instant IbomPay digital settlements.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Link href="/seller/application">
                      <Button className="rounded-xl font-black text-xs gap-1.5 bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-sm hover:from-emerald-700 hover:to-green-800">
                        Become a Seller
                        <ChevronRight className="size-3.5" />
                      </Button>
                    </Link>
                    <Link href="/seller/dashboard">
                      <Button variant="outline" className="rounded-xl font-bold text-xs gap-1.5 border-border">
                        Seller Preview
                        <ExternalLink className="size-3" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/40 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Zero setup fees for registered citizens</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Real-time logistics & dispatch integration</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>Direct IbomPay instant wallet payouts</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* RECENT CITIZEN ACTIVITY SECTION                                          */}
        {/* ========================================================================= */}
        <Card className="border-border/60 shadow-md rounded-3xl overflow-hidden bg-card/90">
          <CardHeader className="pb-3 pt-6 px-6 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Clock className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-black tracking-tight text-foreground">
                    Account Activity
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Recent utility transactions, civic alerts, and marketplace actions
                  </CardDescription>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 self-start sm:self-auto text-xs font-bold">
                {(['all', 'power', 'market', 'civic'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setActivityFilter(filterKey)}
                    className={`px-3 py-1 rounded-lg capitalize transition-all ${
                      activityFilter === filterKey
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {filterKey === 'all' ? 'All' : filterKey}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-6 sm:px-8 pb-6 pt-2">
            {filteredActivities.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground space-y-2">
                <Clock className="size-8 mx-auto opacity-30" />
                <p className="text-xs font-semibold">No activity records found under this filter.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Only display 2 activities at a time on profile page */}
                {filteredActivities.slice(0, 2).map((act) => {
                  let iconBg = 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
                  let Icon = Clock;
                  if (act.type === 'power') {
                    iconBg = 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
                    Icon = Zap;
                  } else if (act.type === 'market') {
                    iconBg = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                    Icon = ShoppingBag;
                  } else if (act.type === 'civic') {
                    iconBg = 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
                    Icon = ShieldCheck;
                  }

                  return (
                    <div 
                      key={act.id} 
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-border/60 bg-card hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl ${iconBg} shrink-0`}>
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground leading-snug">{act.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{act.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        {act.amount && (
                          <p className="text-xs font-black text-foreground">{act.amount}</p>
                        )}
                        <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{act.time}</p>
                      </div>
                    </div>
                  );
                })}

                {/* View More button opening full activity page */}
                <div className="pt-3 border-t border-border/40 mt-3 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-bold text-foreground">{Math.min(2, filteredActivities.length)}</span> of <span className="font-bold text-foreground">{filteredActivities.length}</span> activities
                  </p>
                  <Link href="/profile/activity">
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold text-xs gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40">
                      View More
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
