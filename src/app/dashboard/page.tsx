
'use client';

import Link from 'next/link';
import {
  Bell,
  Wrench,
  User,
  Power,
  ArrowRight,
  Map,
  GanttChartSquare,
  ShoppingBag,
  Bus,
  Home,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { recentActivities } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

const primaryQuickLinks = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map View' },
  { href: '/services', icon: GanttChartSquare, label: 'Services' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const secondaryQuickLinks = [
    { href: '/market', icon: ShoppingBag, label: 'AgroConnect' },
    { href: '/skills', icon: Wrench, label: 'SkillsHub' },
    { href: '/transport', icon: Bus, label: 'Transport' },
]

const chartData = [
  { name: 'Power Outage', value: 8, fill: 'hsl(var(--chart-1))' },
  { name: 'Flood Alert', value: 4, fill: 'hsl(var(--chart-2))' },
  { name: 'Waste Overflow', value: 3, fill: 'hsl(var(--chart-3))' },
];

const chartConfig = {
    reports: {
      label: "Reports",
    },
    'Power Outage': {
      label: 'Power Outage',
      color: 'hsl(var(--chart-1))',
    },
    'Flood Alert': {
      label: 'Flood Alert',
      color: 'hsl(var(--chart-2))',
    },
    'Waste Overflow': {
      label: 'Waste Overflow',
      color: 'hsl(var(--chart-3))',
    },
};

export default function DashboardPage() {
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [showSecondaryActions, setShowSecondaryActions] = useState(false);


  useEffect(() => {
    const firstLogin = localStorage.getItem('isFirstDashboardVisit') !== 'false';
    if (firstLogin) {
        setIsFirstLogin(true);
        localStorage.setItem('isFirstDashboardVisit', 'false');
    } else {
        setIsFirstLogin(false);
    }
  }, []);

  const visibleActions = showSecondaryActions ? secondaryQuickLinks : primaryQuickLinks;

  return (
    <div className="flex-1 space-y-6 bg-muted/30 p-4 sm:p-6 md:p-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
            {isFirstLogin ? 'Welcome to your Dashboard, Esther!' : 'Welcome back, Esther!'}
        </h1>
        <p className="text-muted-foreground">Here&apos;s your community snapshot for today.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card glassy className="shadow-lg animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Community Pulse</CardTitle>
              <CardDescription>Live breakdown of active community reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                 <div className="h-40">
                    <ChartContainer config={chartConfig}>
                        <PieChart accessibilityLayer>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold">15</p>
                  <p className="text-sm text-muted-foreground">Total Active Reports</p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                    {chartData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

            <Card glassy className="shadow-lg animate-fade-in-up" style={{ animationDelay: '300ms' }}>
              <CardHeader>
                <CardTitle className="font-headline">Provider Mode</CardTitle>
                <CardDescription>Manage your services and availability.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className='flex items-center gap-4'>
                        <Package className='size-6 text-muted-foreground'/>
                        <div>
                            <Label htmlFor="listing-status" className='font-semibold'>My Listings</Label>
                            <p className='text-sm text-muted-foreground'>Manage your products or services</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                </div>
                 <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className='flex items-center gap-4'>
                        <Power className='size-6 text-muted-foreground'/>
                        <div>
                            <Label htmlFor="availability-status" className='font-semibold'>Availability</Label>
                            <p className='text-sm text-muted-foreground'>Set your status to available</p>
                        </div>
                    </div>
                  <Switch id="availability-status" defaultChecked/>
                </div>
              </CardContent>
            </Card>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
             <Card glassy className="shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-2">
                 {showSecondaryActions && (
                     <button
                        onClick={() => setShowSecondaryActions(false)}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-background/50 hover:bg-accent transition-colors text-center"
                     >
                        <div className="flex items-center justify-center p-2.5 rounded-full bg-primary/10 text-primary">
                            <ChevronLeft className="size-5" />
                        </div>
                        <span className="text-xs font-medium">Back</span>
                    </button>
                 )}
                {visibleActions.map((item) => (
                    <Link
                    href={item.href}
                    key={item.label}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-background/50 hover:bg-accent transition-colors text-center"
                    >
                    <div className="flex items-center justify-center p-2.5 rounded-full bg-primary/10 text-primary">
                        <item.icon className="size-5" />
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
                 {!showSecondaryActions && (
                     <button
                        onClick={() => setShowSecondaryActions(true)}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-lg bg-background/50 hover:bg-accent transition-colors text-center"
                     >
                        <div className="flex items-center justify-center p-2.5 rounded-full bg-primary/10 text-primary">
                            <ChevronRight className="size-5" />
                        </div>
                        <span className="text-xs font-medium">More</span>
                    </button>
                 )}
                </CardContent>
            </Card>
          
          <Card glassy className="shadow-lg animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/alerts">View all <ArrowRight className="ml-2 size-4" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivities.slice(0, 2).map((activity) => {
                const activityUserAvatar = PlaceHolderImages.find((img) => img.id === activity.user.avatarId);
                return (
                  <div key={activity.id} className="flex items-center gap-3">
                    {activityUserAvatar && (
                        <div className='size-9 rounded-full overflow-hidden'>
                            <img src={activityUserAvatar.imageUrl} alt={activity.user.name} className='w-full h-full object-cover' />
                        </div>
                    )}
                    <div className="flex-1 text-sm">
                      <p><span className="font-semibold">{activity.type}</span> report by {activity.user.name}.</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
