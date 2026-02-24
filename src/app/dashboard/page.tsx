'use client';

import Link from 'next/link';
import React from 'react';
import {
  ArrowRight,
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
  Eye,
  Heart,
  MessageCircle,
  Share2,
  ChevronRight,
  Zap,
  Award,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  }
};

function getAlertIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'emergency':
      return <Bell className="size-4 text-red-600" />;
    case 'weather':
      return <Cloud className="size-4 text-blue-600" />;
    case 'health':
      return <HeartPulse className="size-4 text-green-600" />;
    case 'security':
      return <Shield className="size-4 text-yellow-600" />;
    default:
      return <Bell className="size-4 text-muted-foreground" />;
  }
}

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const alertsQuery = useMemoFirebase(() =>
    firestore ? query(collection(firestore, 'reports'), orderBy('time', 'desc'), limit(5)) : null,
    [firestore]
  );
  const { data: alerts = [], error: alertsError } = useCollection<Alert>(alertsQuery);
  const alertsList = Array.isArray(alerts) ? alerts : [];

  // Handle Firebase errors gracefully
  if (alertsError) {
    console.error('Error loading alerts:', alertsError);
  }

  // Show loading state if Firebase is not ready
  if (!firestore) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">

        {/* Welcome Header with User Profile */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight text-gray-900">
                Welcome back, {user?.displayName?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Your gateway to Cross River's digital services
              </p>
            </div>
            <Link href="/profile" className="hidden md:block">
              <div className="p-3 rounded-xl bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </Link>
          </div>
        </div>

        {/* Stats Cards - Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Active Services</p>
                  <p className="text-3xl font-bold mt-2">12</p>
                </div>
                <Zap className="h-10 w-10 text-blue-200 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Notifications</p>
                  <p className="text-3xl font-bold mt-2">5</p>
                </div>
                <Bell className="h-10 w-10 text-purple-200 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Completed Tasks</p>
                  <p className="text-3xl font-bold mt-2">28</p>
                </div>
                <Award className="h-10 w-10 text-emerald-200 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Community Score</p>
                  <p className="text-3xl font-bold mt-2">92%</p>
                </div>
                <TrendingUp className="h-10 w-10 text-orange-200 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Alerts - Enhanced */}
        {alertsList.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-red-600" />
              <h2 className="font-headline text-lg font-bold text-gray-900">Active Alerts</h2>
              <Badge className="bg-red-100 text-red-800 ml-auto">
                {alertsList.length} new
              </Badge>
            </div>
            <div className="space-y-3">
              {alertsList.slice(0, 3).map(alert => (
                <Card key={alert.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow bg-white">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-red-100 mt-1 flex-shrink-0">
                          {getAlertIcon(alert.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{alert.type}</p>
                            <Badge variant="outline" className="text-xs">{alert.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {alert.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Recent
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
                        View <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Access Services - Enhanced */}
        <div className="mb-8">
          <h2 className="font-headline text-xl font-bold tracking-tight mb-4 text-gray-900">Quick Access Services</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              {
                id: 'government',
                title: 'Government',
                icon: Building2,
                href: '/government',
                color: 'text-blue-600',
                bgColor: 'bg-blue-50',
                badge: 'New'
              },
              {
                id: 'health',
                title: 'Health',
                icon: HeartPulse,
                href: '/health',
                color: 'text-red-600',
                bgColor: 'bg-red-50'
              },
              {
                id: 'education',
                title: 'Education',
                icon: GraduationCap,
                href: '/education',
                color: 'text-green-600',
                bgColor: 'bg-green-50'
              },
              {
                id: 'jobs',
                title: 'Jobs',
                icon: Briefcase,
                href: '/jobs',
                color: 'text-purple-600',
                bgColor: 'bg-purple-50'
              },
              {
                id: 'market',
                title: 'Market',
                icon: ShoppingBag,
                href: '/market',
                color: 'text-orange-600',
                bgColor: 'bg-orange-50'
              },
              {
                id: 'safety',
                title: 'Safety',
                icon: Shield,
                href: '/safety',
                color: 'text-gray-600',
                bgColor: 'bg-gray-50'
              }
            ].map((service) => (
              <Link key={service.id} href={service.href}>
                <Card className="overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer group h-full">
                  <CardContent className="p-4">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <div className={`p-3 rounded-lg ${service.bgColor} group-hover:scale-110 transition-transform`}>
                        <service.icon className={`h-5 w-5 ${service.color}`} />
                      </div>
                      <CardTitle className="font-headline text-xs font-semibold text-gray-900 truncate w-full">
                        {service.title}
                      </CardTitle>
                      {service.badge && (
                        <Badge className="text-xs bg-blue-100 text-blue-700">{service.badge}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader className="border-b border-gray-200 pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200">
                  {[
                    {
                      title: 'Business License Renewed',
                      timestamp: '2 hours ago',
                      icon: Award,
                      color: 'text-green-600',
                      bgColor: 'bg-green-50'
                    },
                    {
                      title: 'Health Certificate Submitted',
                      timestamp: '5 hours ago',
                      icon: HeartPulse,
                      color: 'text-red-600',
                      bgColor: 'bg-red-50'
                    },
                    {
                      title: 'Community Task Completed',
                      timestamp: '1 day ago',
                      icon: Users,
                      color: 'text-purple-600',
                      bgColor: 'bg-purple-50'
                    },
                  ].map((activity, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${activity.bgColor} flex-shrink-0`}>
                          <activity.icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-300 flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Services Card */}
          <div>
            <Card className="border-0 shadow-md h-full">
              <CardHeader className="border-b border-gray-200 pb-4">
                <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Featured
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <p className="font-semibold text-sm text-gray-900">Smart City Portal</p>
                    <p className="text-xs text-gray-600 mt-1">Access all government services in one place</p>
                    <Button size="sm" className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Explore
                    </Button>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <p className="font-semibold text-sm text-gray-900">Community Rewards</p>
                    <p className="text-xs text-gray-600 mt-1">Earn points & unlock exclusive benefits</p>
                    <Button size="sm" className="mt-3 w-full bg-purple-600 hover:bg-purple-700 text-white">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Quick Stats */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Personal Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Profile Completion</span>
                  <span className="text-lg font-bold text-blue-600">85%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Services Used</span>
                  <span className="text-lg font-bold text-purple-600">12</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="text-lg font-bold text-emerald-600">24</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b border-gray-200 pb-4">
              <CardTitle className="text-lg font-bold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button asChild className="w-full justify-start bg-blue-50 text-blue-700 hover:bg-blue-100">
                  <Link href="/services">
                    <Search className="mr-2 h-4 w-4" />
                    Find Services
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start bg-purple-50 text-purple-700 hover:bg-purple-100">
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                  <Link href="/transactions">
                    <Calendar className="mr-2 h-4 w-4" />
                    View History
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Prominent Card */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">AI-Powered Assistant</h3>
                  <p className="text-blue-100 text-sm mt-1">Get instant help with any government service</p>
                </div>
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                  onClick={() => alert('AI Assistant coming soon!')}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Chat Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
