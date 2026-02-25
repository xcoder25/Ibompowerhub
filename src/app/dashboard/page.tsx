'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  Bell,
  Building2,
  HeartPulse,
  GraduationCap,
  Briefcase,
  ShoppingBag,
  Shield,
  Search,
  Bot,
  MessageSquare,
  Cloud,
  TrendingUp,
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronRight,
  Zap,
  Award,
  Users,
  Sun,
  Droplets,
  Wind,
  Sparkles,
  LayoutDashboard,
  Map,
  AlertCircle,
  Store,
  Wrench,
  Leaf,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/firebase';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';

type Alert = {
  id: string;
  type: string;
  category: string;
  location: string;
  time: any;
  description: string;
  upvotes: number;
  commentsCount: number;
  userId: string;
  status: string;
  user: {
    name: string;
    avatarUrl: string;
  };
};

function getAlertIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'emergency':
      return <Bell className="size-4 text-red-500" />;
    case 'weather':
      return <Cloud className="size-4 text-sky-500" />;
    case 'health':
      return <HeartPulse className="size-4 text-emerald-500" />;
    case 'security':
      return <Shield className="size-4 text-amber-500" />;
    default:
      return <Bell className="size-4 text-slate-400" />;
  }
}

function getTimeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const services = [
  { id: 'government', title: 'Government', icon: Building2, href: '/government', color: 'from-blue-500/20 to-blue-600/10', iconColor: 'text-blue-600', borderColor: 'border-blue-200/60', badge: 'New' },
  { id: 'health', title: 'Health', icon: HeartPulse, href: '/health', color: 'from-rose-500/20 to-rose-600/10', iconColor: 'text-rose-600', borderColor: 'border-rose-200/60' },
  { id: 'education', title: 'Education', icon: GraduationCap, href: '/education', color: 'from-emerald-500/20 to-emerald-600/10', iconColor: 'text-emerald-600', borderColor: 'border-emerald-200/60' },
  { id: 'jobs', title: 'Jobs', icon: Briefcase, href: '/jobs', color: 'from-violet-500/20 to-violet-600/10', iconColor: 'text-violet-600', borderColor: 'border-violet-200/60' },
  { id: 'market', title: 'Market', icon: ShoppingBag, href: '/market', color: 'from-amber-500/20 to-amber-600/10', iconColor: 'text-amber-600', borderColor: 'border-amber-200/60' },
  { id: 'safety', title: 'Safety', icon: Shield, href: '/safety', color: 'from-slate-500/20 to-slate-600/10', iconColor: 'text-slate-600', borderColor: 'border-slate-200/60' },
];

const stats = [
  { label: 'Active Services', value: 12, icon: Zap, color: 'text-blue-600', bg: 'bg-blue-500/15', progress: 80 },
  { label: 'Notifications', value: 5, icon: Bell, color: 'text-violet-600', bg: 'bg-violet-500/15', progress: 25 },
  { label: 'Completed Tasks', value: 28, icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-500/15', progress: 70 },
  { label: 'Community Score', value: '92%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-500/15', progress: 92 },
];

const activities = [
  { title: 'Business License Renewed', timestamp: '2 hours ago', icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
  { title: 'Health Certificate Submitted', timestamp: '5 hours ago', icon: HeartPulse, color: 'text-rose-600', bg: 'bg-rose-500/15' },
  { title: 'Community Task Completed', timestamp: '1 day ago', icon: Users, color: 'text-violet-600', bg: 'bg-violet-500/15' },
];

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [searchQuery, setSearchQuery] = useState('');

  const alertsQuery = useMemoFirebase(
    () =>
      firestore
        ? query(collection(firestore, 'reports'), orderBy('time', 'desc'), limit(5))
        : null,
    [firestore]
  );
  const { data: alerts = [], error: alertsError } = useCollection<Alert>(alertsQuery);
  const alertsList = Array.isArray(alerts) ? alerts : [];

  if (alertsError) console.error('Error loading alerts:', alertsError);

  if (!firestore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = user?.displayName?.split(' ')[0] || 'User';
  const greeting = getTimeGreeting();

  return (
    <div className="min-h-screen mesh-gradient bg-slate-50/80 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-indigo-300/30 blur-3xl animate-float" />
        <div className="absolute top-1/2 -left-32 w-64 h-64 rounded-full bg-violet-300/25 blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
        <div className="absolute bottom-20 right-1/3 w-48 h-48 rounded-full bg-cyan-300/20 blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
      </div>

      <div className="relative flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">

        {/* Header: greeting + search + profile */}
        <header className="mb-8 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-0.5">{greeting}</p>
              <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                {firstName}! <span className="text-gradient">👋</span>
              </h1>
              <p className="text-slate-500 text-sm mt-1">Your gateway to Cross River&apos;s digital services</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 md:flex-initial relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="search"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-56 pl-9 pr-4 py-2.5 rounded-xl glass-card border border-white/50 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 transition-all"
                />
              </div>
              <Link href="/profile" className="flex-shrink-0">
                <div className="p-2.5 rounded-xl glass-card border border-white/50 hover:border-white/80 glass-card-hover cursor-pointer flex items-center justify-center">
                  <User className="h-5 w-5 text-indigo-600" />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section: CRS Key Features */}
        <Card className="glass-card border-0 overflow-hidden mb-8 shadow-lg">
          <CardContent className="p-0">
            <div
              className="relative text-white p-6 md:p-8 overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, hsl(221.2, 83.2%, 30%) 0%, hsl(221.2, 83.2%, 40%) 100%)',
              }}
            >
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <Badge className="mb-1 bg-white/20 text-white border-white/30 hero-text-wave">
                      Cross River State
                    </Badge>
                    <h2 className="text-2xl md:text-3xl font-bold mb-1 hero-text-wave">
                      Your Digital Gateway to Cross River
                    </h2>
                    <p className="text-white/90 text-sm md:text-base max-w-2xl hero-text-wave">
                      Access government services, connect with local businesses, report issues, and
                      stay informed—all in one place.
                    </p>
                  </div>
                  <div className="flex-shrink-0 hero-icon-orbit">
                    <Button
                      asChild
                      size="lg"
                      className="bg-white text-indigo-600 hover:bg-slate-100 rounded-xl shadow-lg"
                    >
                      <Link href="/services">
                        Explore Services <ArrowRight className="ml-2 h-4 w-4 hero-icon-dance" />
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                  {[
                    { icon: Map, label: 'Live Map', desc: 'Real-time alerts across CRS', href: '/map' },
                    { icon: Store, label: 'Marketplace', desc: 'Shop from local sellers', href: '/market' },
                    { icon: AlertCircle, label: 'Report Issues', desc: 'Flooding, power, waste & more', href: '/report' },
                    { icon: Shield, label: 'Government', desc: 'Official state services', href: '/government' },
                  ].map((feature, idx) => (
                    <Link
                      key={feature.label}
                      href={feature.href}
                      className="group"
                    >
                      <div
                        className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 glass-card-hover cursor-pointer h-full flex flex-col justify-between"
                        style={{ animationDelay: `${idx * 80}ms` }}
                      >
                        <div>
                          <feature.icon className="h-6 w-6 mb-2 hero-icon-dance" />
                          <p className="font-semibold text-sm hero-text-wave">{feature.label}</p>
                          <p className="text-xs text-white/70 mt-0.5 hero-text-wave">
                            {feature.desc}
                          </p>
                        </div>
                        <div className="mt-3 flex items-center text-[11px] text-white/80 opacity-80 group-hover:opacity-100 transition-opacity">
                          <span>Open {feature.label}</span>
                          <ArrowRight className="ml-1 h-3 w-3 hero-icon-dance" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts - wrapped in card */}
        {alertsList.length > 0 && (
          <Card className="glass-card border-0 mb-8">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-200/50">
                  <Bell className="h-4 w-4 text-rose-600" />
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">Active Alerts</CardTitle>
                <Badge className="ml-auto bg-rose-100 text-rose-800 border-0">{alertsList.length} new</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {alertsList.slice(0, 3).map((alert) => (
                  <Card key={alert.id} className="glass-card glass-card-hover border-l-4 border-l-rose-400 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 rounded-lg bg-rose-500/15 border border-rose-200/50 flex-shrink-0">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 text-sm">{alert.type}</p>
                              <Badge variant="outline" className="text-xs border-slate-200">{alert.status}</Badge>
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {alert.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Recent
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10">
                          View <ChevronRight className="h-4 w-4 ml-0.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Access Services - 3D glass tiles - wrapped in card */}
        <Card className="glass-card border-0 mb-8">
          <CardHeader className="border-b border-slate-200/60 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-indigo-600" />
              Quick Access Services
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {services.map((service) => (
                <Link key={service.id} href={service.href}>
                  <Card className="glass-card glass-card-hover card-3d h-full overflow-hidden border-0 group cursor-pointer">
                    <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color} border ${service.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                        <service.icon className={`h-5 w-5 ${service.iconColor}`} />
                      </div>
                      <CardTitle className="font-headline text-xs font-semibold text-slate-900 truncate w-full">
                        {service.title}
                      </CardTitle>
                      {service.badge && (
                        <Badge className="text-xs bg-indigo-100 text-indigo-700 border-0">{service.badge}</Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Two columns: Activity + Featured & Weather - wrapped in card container */}
        <Card className="glass-card border-0 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="glass-card border-0 overflow-hidden">
                  <CardHeader className="border-b border-slate-200/60 pb-4">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-200/60">
                      {activities.map((activity, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg ${activity.bg} border border-white/50 flex-shrink-0`}>
                              <activity.icon className={`h-5 w-5 ${activity.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 text-sm">{activity.title}</p>
                              <p className="text-xs text-slate-500 mt-1">{activity.timestamp}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                {/* Weather widget */}
                <Card className="glass-card border-0 overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-semibold text-slate-700">Calabar</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-slate-900">28°</span>
                      <span className="text-slate-500 text-sm">Partly cloudy</span>
                    </div>
                    <div className="flex gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3" /> 65%</span>
                      <span className="flex items-center gap-1"><Wind className="h-3.5 w-3" /> 12 km/h</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-0 overflow-hidden">
                  <CardHeader className="border-b border-slate-200/60 pb-4">
                    <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-amber-500" />
                      Featured
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/10 border border-indigo-200/50 glass-card-hover">
                      <p className="font-semibold text-sm text-slate-900">Smart City Portal</p>
                      <p className="text-xs text-slate-600 mt-1">Access all government services in one place</p>
                      <Button size="sm" className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                        Explore
                      </Button>
                    </div>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/15 to-purple-500/10 border border-violet-200/50 glass-card-hover">
                      <p className="font-semibold text-sm text-slate-900">Community Rewards</p>
                      <p className="text-xs text-slate-600 mt-1">Earn points & unlock exclusive benefits</p>
                      <Button size="sm" className="mt-3 w-full bg-violet-600 hover:bg-violet-700 text-white rounded-lg">
                        Learn More
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Stats */}
        <div className="mb-8">
          <Card className="glass-card border-0 overflow-hidden">
            <CardHeader className="border-b border-slate-200/60 pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Personal Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[
                  { label: 'Profile Completion', value: '85%', color: 'text-indigo-600' },
                  { label: 'Services Used', value: '12', color: 'text-violet-600' },
                  { label: 'Total Transactions', value: '24', color: 'text-emerald-600' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-3 rounded-xl glass-card border border-white/40"
                  >
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant - gradient glass CTA */}
        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white relative">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          <CardContent className="relative p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 border border-white/30">
                <Bot className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  AI-Powered Assistant <Sparkles className="h-4 w-4 text-amber-300 animate-glow" />
                </h3>
                <p className="text-white/90 text-sm mt-0.5">Get instant help with any government service</p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-slate-100 rounded-xl shadow-lg"
              onClick={() => alert('AI Assistant coming soon!')}
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Chat Now
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
