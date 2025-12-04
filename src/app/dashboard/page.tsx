
'use client';

import Link from 'next/link';
import {
  Bell,
  Wrench,
  User,
  Power,
  CloudRain,
  Trash2,
  ArrowRight,
  Map,
  GanttChartSquare,
  ShoppingBag,
  Bus,
  Home,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { recentActivities } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';

const quickLinks = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map View' },
  { href: '/services', icon: GanttChartSquare, label: 'Services' },
  { href: '/market', icon: ShoppingBag, label: 'AgroConnect' },
  { href: '/skills', icon: Wrench, label: 'SkillsHub' },
  { href: '/transport', icon: Bus, label: 'Transport' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const activityIcons = {
  "Power Outage": { icon: Power, color: "text-chart-1" },
  "Flood Alert": { icon: CloudRain, color: "text-chart-2" },
  "Waste Overflow": { icon: Trash2, color: "text-chart-3" },
};

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
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  return (
    <div className="flex-1 space-y-6 bg-muted/30 p-4 sm:p-6 md:p-8">
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Welcome, Esther!</h1>
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
                 <div className="h-48">
                    <ChartContainer config={chartConfig}>
                        <PieChart accessibilityLayer>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                            <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={70}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </div>
                <div className="space-y-3">
                  <p className="text-4xl font-bold">15</p>
                  <p className="text-muted-foreground">Total Active Reports</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {chartData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                        <span>{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card glassy className="shadow-lg animate-fade-in-up" style={{ animationDelay: '200ms' }}>
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
                        <Avatar className="size-9">
                            <AvatarImage src={activityUserAvatar.imageUrl} alt={activity.user.name} />
                            <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
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

        {/* Right Column */}
        <div className="space-y-6">
          <Card glassy className="shadow-lg animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-2">
              {quickLinks.map((item) => (
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
