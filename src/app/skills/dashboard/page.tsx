'use client';

import React, { useState, useEffect } from 'react';
import { 
  HardHat, Star, MapPin, Clock, ShieldCheck, Zap, 
  ArrowUpRight, TrendingUp, Users, MessageSquare, 
  FileText, Settings, Bell, LayoutDashboard, Wallet,
  Calendar, Briefcase, Camera, Edit3, Share2, Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { doc } from 'firebase/firestore';
import Link from 'next/link';

export default function ArtisanDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState('overview');

  const artisanDocRef = React.useMemo(() => 
    user && firestore ? doc(firestore, 'artisans', user.uid) : null,
  [user, firestore]);

  const { data: artisanData, isLoading: artisanLoading } = useDoc(artisanDocRef);

  if (artisanLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-pulse space-y-4 text-center">
          <HardHat className="size-12 mx-auto text-emerald-500 mb-4" />
          <p className="text-slate-500 font-bold animate-bounce uppercase tracking-widest text-xs">Initializing Your Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <Avatar className="size-24 rounded-2xl border-4 border-white dark:border-slate-900 shadow-2xl relative">
              <AvatarImage src={artisanData?.profileImageUrl || user?.photoURL || undefined} className="object-cover" />
              <AvatarFallback className="bg-emerald-50 text-emerald-600 font-black text-2xl uppercase">
                {artisanData?.name?.charAt(0) || user?.displayName?.charAt(0) || 'P'}
              </AvatarFallback>
            </Avatar>
            <Button 
                size="icon" 
                variant="secondary" 
                className="absolute -bottom-2 -right-2 size-8 rounded-lg shadow-lg border border-white dark:border-slate-800"
                asChild
            >
                <Link href="/profile">
                    <Camera className="size-4" />
                </Link>
            </Button>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black text-slate-950 dark:text-white tracking-tighter">
                {user?.displayName || 'Artisan Pro'}
              </h1>
              <Badge className="bg-emerald-500 text-white border-none px-2 py-0 h-5 text-[10px] font-black uppercase">Verified</Badge>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
              <HardHat className="size-3 text-emerald-500" /> Professional {artisanData?.skill || 'Artisan'}
            </p>
            <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
              <span className="flex items-center gap-1"><Star className="size-4 text-amber-500 fill-amber-500" /> {artisanData?.rating || '4.0'}</span>
              <span className="flex items-center gap-1"><MapPin className="size-4 text-emerald-500" /> Uyo, AKS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl font-bold bg-white/50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800 shadow-sm" asChild>
            <Link href="/profile">
               <Edit3 className="size-4 mr-2" /> Edit Profile
            </Link>
          </Button>
          <Button className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold hover:bg-emerald-600 hover:text-white transition-all shadow-xl active:scale-95 group">
            <Share2 className="size-4 mr-2" /> Share Portfolio
          </Button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Earnings" value="₦245,600" trend="+12.5%" icon={<Wallet className="text-emerald-500" />} />
        <MetricCard label="Profile Views" value="1,402" trend="+3.2k" icon={<Eye className="text-blue-500" />} />
        <MetricCard label="Active Quotes" value="12" trend="3 NEW" icon={<FileText className="text-amber-500" />} />
        <MetricCard label="Success Rate" value="98%" trend="Elite" icon={<Zap className="text-orange-500" />} />
      </div>

      {/* Main Content Areas */}
      <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2 overflow-x-auto gap-4 no-scrollbar">
          <TabsList className="bg-transparent h-auto p-0 flex space-x-6">
            <TabsTrigger value="overview" className="border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent rounded-none px-0 py-2 h-auto font-bold uppercase tracking-widest text-[11px] text-slate-500 data-[state=active]:text-slate-950 dark:data-[state=active]:text-white">Overview Hub</TabsTrigger>
            <TabsTrigger value="jobs" className="border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent rounded-none px-0 py-2 h-auto font-bold uppercase tracking-widest text-[11px] text-slate-500 data-[state=active]:text-slate-950 dark:data-[state=active]:text-white">Job Requests</TabsTrigger>
            <TabsTrigger value="analytics" className="border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent rounded-none px-0 py-2 h-auto font-bold uppercase tracking-widest text-[11px] text-slate-500 data-[state=active]:text-slate-950 dark:data-[state=active]:text-white">Earnings Hub</TabsTrigger>
            <TabsTrigger value="reviews" className="border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent rounded-none px-0 py-2 h-auto font-bold uppercase tracking-widest text-[11px] text-slate-500 data-[state=active]:text-slate-950 dark:data-[state=active]:text-white">Reviews</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Real-time Requests Card */}
            <Card className="lg:col-span-2 border-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                    <Zap className="size-5 text-emerald-500" /> Recent Live Requests
                  </CardTitle>
                  <CardDescription>Direct leads from the SkillsHub marketplace</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="font-bold uppercase tracking-widest text-[10px]">View All</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <JobRequestItem title="AC Maintenance & Repair" user="Udom E." location="Shelter Afrique" amount="₦12,000" time="15m ago" status="urgent" />
                  <JobRequestItem title="Lighting Wiring" user="Blessing K." location="Ewet Housing" amount="₦8,500" time="1h ago" status="standard" />
                  <JobRequestItem title="Generator Servicing" user="Mfon O." location="Osongama" amount="₦25,000" time="3h ago" status="standard" />
                  <JobRequestItem title="Main Switch Replacement" user="Effiong A." location="Oron Road" amount="₦10,000" time="5h ago" status="standard" />
                </div>
              </CardContent>
            </Card>

            {/* Profile Completion Card */}
            <div className="space-y-6">
              <Card className="border-none bg-slate-950 text-white rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <ShieldCheck className="size-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-black tracking-tight">Pro Level: Platinum</CardTitle>
                  <CardDescription className="text-slate-400">You are in the top 5% of artisans in Uyo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                      <span>Completion Score</span>
                      <span>85%</span>
                    </div>
                    <Progress value={85} className="bg-white/10 h-1.5 [&>div]:bg-emerald-500" />
                  </div>
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs h-12 shadow-inner">
                    Upgrade to Diamond
                  </Button>
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="border-none bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-3xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="size-4" /> Growth Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Upload "Before & After" photos of your latest work to increase your booking rate by up to 40%.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="animate-in slide-in-from-bottom-2">
           <Card className="border-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl shadow-sm rounded-3xl min-h-[400px] flex flex-col items-center justify-center text-center p-8">
              <Briefcase className="size-16 text-slate-200 mb-4" />
              <h3 className="text-xl font-black tracking-tight mb-2">Manage Your Workload</h3>
              <p className="text-slate-500 max-w-sm font-medium mb-6">Detailed job requests and quote negotiations will appear here.</p>
              <Button className="font-black uppercase tracking-widest text-xs h-11 px-8 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950">Settings</Button>
           </Card>
        </TabsContent>

        {/* Placeholder for other tabs */}
        <TabsContent value="analytics" className="text-center py-24">
            <TrendingUp className="size-12 mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Analytics Under Neural Training...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ label, value, trend, icon }: { label: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <Card className="border-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl shadow-sm rounded-3xl transition-transform hover:-translate-y-1">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="size-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            {React.cloneElement(icon as React.ReactElement, { className: 'size-5' })}
          </div>
          <Badge variant="secondary" className={cn(
            "rounded-full px-2 py-0 text-[10px] font-black uppercase tracking-widest",
            trend.startsWith('+') ? 'text-emerald-500' : 'text-slate-500'
          )}>{trend}</Badge>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter">{value}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function JobRequestItem({ title, user, location, amount, time, status }: { title: string, user: string, location: string, amount: string, time: string, status: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-colors group cursor-pointer border border-transparent hover:border-emerald-500/20">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
          {user.charAt(0)}
        </div>
        <div>
          <h4 className="font-black text-slate-950 dark:text-white text-sm tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{title}</h4>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
            Requested by {user} • <MapPin className="size-3" /> {location}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-black text-slate-950 dark:text-white text-sm">{amount}</p>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{time}</p>
      </div>
    </div>
  );
}
