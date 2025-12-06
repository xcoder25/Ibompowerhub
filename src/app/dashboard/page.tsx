
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
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Building2,
  HeartPulse,
  Briefcase,
  Vote,
  Calendar,
  MessageSquare,
  Droplets,
  Shield,
  Lightbulb,
  LogOut,
  Zap,
  AlertTriangle,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { recentActivities, polls } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell } from 'recharts';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEffect, useState, useCallback } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';


const primaryQuickLinks = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/map', icon: Map, label: 'Map View' },
  { href: '/services', icon: GanttChartSquare, label: 'Services' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/market', icon: ShoppingBag, label: 'Market' },
  { href: '/skills', icon: Wrench, label: 'SkillsHub' },
  { href: '/transport', icon: Bus, label: 'Transport' },
];

const secondaryQuickLinks = [
    { href: '/directory', icon: Building2, label: 'Directory' },
    { href: '/events', icon: Calendar, label: 'Events' },
    { href: '/issues', icon: Lightbulb, label: 'Issues' },
    { href: '/safety', icon: Shield, label: 'Safety' },
    { href: '/water', icon: Droplets, label: 'Water' },
    { href: '/forums', icon: MessageSquare, label: 'Forums' },
    { href: '/voting', icon: Vote, label: 'Voting' },
    { href: '/jobs', icon: Briefcase, label: 'Jobs' },
    { href: '/health', icon: HeartPulse, label: 'Health' },
    { href: '/property', icon: Building2, label: 'Property' },
    { href: '/education', icon: BookOpen, label: 'Education' },
    { href: '/power', icon: Power, label: 'Power' },
    { href: '/logout', icon: LogOut, label: 'Logout' },
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

const statusConfig = {
    power: { ON: { icon: Zap, color: 'text-green-500 border-green-500', label: 'Power On' }, OFF: { icon: Zap, color: 'text-red-500 border-red-500', label: 'Power Off' }, UNKNOWN: { icon: Zap, color: 'text-gray-500 border-gray-500', label: 'Power Unknown' } },
    flood: { LOW: { icon: AlertTriangle, color: 'text-green-500 border-green-500', label: 'Low Risk' }, MEDIUM: { icon: AlertTriangle, color: 'text-yellow-500 border-yellow-500', label: 'Medium Risk' }, HIGH: { icon: AlertTriangle, color: 'text-red-500 border-red-500', label: 'High Risk' }, UNKNOWN: { icon: AlertTriangle, color: 'text-gray-500 border-gray-500', label: 'Flood Unknown' } },
    waste: { NO: { icon: CheckCircle, color: 'text-green-500 border-green-500', label: 'Clean' }, YES: { icon: Trash2, color: 'text-yellow-500 border-yellow-500', label: 'Waste Overflow' }, UNKNOWN: { icon: Trash2, color: 'text-gray-500 border-gray-500', label: 'Waste Unknown' } },
};

const neighborhoodStatus = {
    powerStatus: 'ON',
    floodRisk: 'LOW',
    wasteOverflow: 'NO',
    overallStatus: 'Overall, the neighborhood is stable with power on and no immediate flood risk.'
};

const featuredPoll = polls[0];


export default function DashboardPage() {
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [votedPolls, setVotedPolls] = useState<Record<number, string>>({});

  const handleVote = (pollId: number, option: string) => {
    if (votedPolls[pollId]) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: option }));
  };
  const hasVotedOnFeatured = !!votedPolls[featuredPoll.id];
  const userVote = votedPolls[featuredPoll.id];


  useEffect(() => {
    const firstLogin = localStorage.getItem('isFirstDashboardVisit') !== 'false';
    if (firstLogin) {
        setIsFirstLogin(true);
        localStorage.setItem('isFirstDashboardVisit', 'false');
    } else {
        setIsFirstLogin(false);
    }
  }, []);

  const QuickActionItem = ({ item }: { item: { href: string; icon: React.ElementType; label: string } }) => (
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
  );

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
            <Carousel className="w-full">
                <CarouselContent>
                    <CarouselItem>
                        <Card glassy className="shadow-lg">
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
                    </CarouselItem>
                     <CarouselItem>
                        <Card glassy className="shadow-lg">
                            <CardHeader>
                                <CardTitle>Neighborhood Status</CardTitle>
                                <CardDescription>AI-powered summary from recent reports.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 h-[208px] flex flex-col justify-center">
                                <div className="flex flex-wrap gap-2">
                                     <Badge variant="outline" className={cn('text-sm border-2', statusConfig.power[neighborhoodStatus.powerStatus as keyof typeof statusConfig.power].color)}>
                                        {React.createElement(statusConfig.power[neighborhoodStatus.powerStatus as keyof typeof statusConfig.power].icon, { className: "mr-2 h-4 w-4" })}
                                        {statusConfig.power[neighborhoodStatus.powerStatus as keyof typeof statusConfig.power].label}
                                    </Badge>
                                    <Badge variant="outline" className={cn('text-sm border-2', statusConfig.flood[neighborhoodStatus.floodRisk as keyof typeof statusConfig.flood].color)}>
                                        {React.createElement(statusConfig.flood[neighborhoodStatus.floodRisk as keyof typeof statusConfig.flood].icon, { className: "mr-2 h-4 w-4" })}
                                        {statusConfig.flood[neighborhoodStatus.floodRisk as keyof typeof statusConfig.flood].label}
                                    </Badge>
                                    <Badge variant="outline" className={cn('text-sm border-2', statusConfig.waste[neighborhoodStatus.wasteOverflow as keyof typeof statusConfig.waste].color)}>
                                        {React.createElement(statusConfig.waste[neighborhoodStatus.wasteOverflow as keyof typeof statusConfig.waste].icon, { className: "mr-2 h-4 w-4" })}
                                        {statusConfig.waste[neighborhoodStatus.wasteOverflow as keyof typeof statusConfig.waste].label}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground pt-2">{neighborhoodStatus.overallStatus}</p>
                            </CardContent>
                        </Card>
                    </CarouselItem>
                     <CarouselItem>
                        <Card glassy className="shadow-lg">
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">{featuredPoll.title}</CardTitle>
                                <CardDescription>{featuredPoll.totalVotes} votes so far</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 h-[208px] overflow-y-auto">
                                {Object.entries(featuredPoll.votes).map(([option, count]) => {
                                    const percentage = Math.round((count / featuredPoll.totalVotes) * 100);
                                    return (
                                    <div key={option}>
                                        <div className="mb-2 flex items-center justify-between">
                                        <span className={cn("font-medium", hasVotedOnFeatured && userVote === option && "text-primary")}>
                                            {option}
                                        </span>
                                        {hasVotedOnFeatured && <span className="text-sm font-semibold">{percentage}%</span>}
                                        </div>
                                        {hasVotedOnFeatured ? (
                                        <Progress value={percentage} />
                                        ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full justify-start"
                                            onClick={() => handleVote(featuredPoll.id, option)}
                                        >
                                            Vote for {option}
                                        </Button>
                                        )}
                                    </div>
                                    );
                                })}
                            </CardContent>
                        </Card>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
            </Carousel>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
             <Card glassy className="shadow-lg animate-fade-in-up overflow-hidden" style={{ animationDelay: '200ms' }}>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-12">
                    <Carousel>
                        <CarouselContent>
                            <CarouselItem>
                                <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                                    {primaryQuickLinks.map((item) => <QuickActionItem key={item.label} item={item} />)}
                                </div>
                            </CarouselItem>
                             <CarouselItem>
                                <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                                    {secondaryQuickLinks.slice(0, 8).map((item) => <QuickActionItem key={item.label} item={item} />)}
                                </div>
                            </CarouselItem>
                             <CarouselItem>
                                <div className="grid grid-cols-4 gap-x-2 gap-y-4">
                                    {secondaryQuickLinks.slice(8).map((item) => <QuickActionItem key={item.label} item={item} />)}
                                </div>
                            </CarouselItem>
                        </CarouselContent>
                        <CarouselPrevious className="left-2 size-7" />
                        <CarouselNext className="right-2 size-7"/>
                    </Carousel>
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

    