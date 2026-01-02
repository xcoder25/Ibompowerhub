
'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
  Zap,
  AlertTriangle,
  Trash2,
  CheckCircle,
  ArrowRight,
  User,
  Power,
  Bell,
  Wrench,
  ShoppingBag,
  Bus,
  Building2,
  Map,
  PlusCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { polls, recentActivities } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ReportIssueDialog } from '@/components/report-issue-dialog';
import { DialogTrigger } from '@/components/ui/dialog';

const quickActions = [
  { href: '/map', icon: Map, label: 'Map View' },
  { href: '/alerts', icon: Bell, label: 'Alerts Feed' },
  { href: '/market', icon: ShoppingBag, label: 'Marketplace' },
  { href: '/skills', icon: Wrench, label: 'Artisans' },
  { href: '/transport', icon: Bus, label: 'Transport' },
  { href: '/property', icon: Building2, label: 'Property' },
  { href: '/power', icon: Power, label: 'Power Schedule' },
  { href: '/profile', icon: User, label: 'My Profile' },
];

const neighborhoodStatus = {
    powerStatus: 'ON',
    floodRisk: 'LOW',
    wasteOverflow: 'NO',
    overallStatus: 'Overall, the neighborhood is stable with power on and no immediate flood risk.'
};

const statusConfig = {
    power: { ON: { icon: Zap, color: 'text-green-500 border-green-500', label: 'Power On' }, OFF: { icon: Zap, color: 'text-red-500 border-red-500', label: 'Power Off' }, UNKNOWN: { icon: Zap, color: 'text-gray-500 border-gray-500', label: 'Power Unknown' } },
    flood: { LOW: { icon: AlertTriangle, color: 'text-green-500 border-green-500', label: 'Low Risk' }, MEDIUM: { icon: AlertTriangle, color: 'text-yellow-500 border-yellow-500', label: 'Medium Risk' }, HIGH: { icon: AlertTriangle, color: 'text-red-500 border-red-500', label: 'High Risk' }, UNKNOWN: { icon: AlertTriangle, color: 'text-gray-500 border-gray-500', label: 'Flood Unknown' } },
    waste: { NO: { icon: CheckCircle, color: 'text-green-500 border-green-500', label: 'Clean' }, YES: { icon: Trash2, color: 'text-yellow-500 border-yellow-500', label: 'Waste Overflow' }, UNKNOWN: { icon: Trash2, color: 'text-gray-500 border-gray-500', label: 'Waste Unknown' } },
};

export default function DashboardPage() {
  const [votedPolls, setVotedPolls] = useState<Record<number, string>>({});
  const { user } = useUser();

  const handleVote = (pollId: number, option: string) => {
    if (votedPolls[pollId]) return;
    setVotedPolls(prev => ({ ...prev, [pollId]: option }));
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
            <h1 className="font-headline text-3xl font-bold tracking-tight">
                Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
            </h1>
            <p className="text-muted-foreground">Here&apos;s your community snapshot for today.</p>
        </div>
        <ReportIssueDialog>
            <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Report an Issue
                </Button>
            </DialogTrigger>
        </ReportIssueDialog>
      </div>

      {/* Neighborhood Status */}
      <Card glassy>
        <CardHeader>
            <CardTitle>Live Neighborhood Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
             <Badge variant="outline" className={cn('text-sm border-2 py-1 px-3', statusConfig.power[neighborhoodStatus.powerStatus as keyof typeof statusConfig.power].color)}>
                {React.createElement(statusConfig.power[neighborhoodStatus.powerStatus as keyof typeof statusConfig.power].icon, { className: "mr-2 h-4 w-4" })}
                {statusConfig.power[neighborhoodStatus.powerStatus as keyof typeof statusConfig.power].label}
            </Badge>
            <Badge variant="outline" className={cn('text-sm border-2 py-1 px-3', statusConfig.flood[neighborhoodStatus.floodRisk as keyof typeof statusConfig.flood].color)}>
                {React.createElement(statusConfig.flood[neighborhoodStatus.floodRisk as keyof typeof statusConfig.flood].icon, { className: "mr-2 h-4 w-4" })}
                {statusConfig.flood[neighborhoodStatus.floodRisk as keyof typeof statusConfig.flood].label}
            </Badge>
            <Badge variant="outline" className={cn('text-sm border-2 py-1 px-3', statusConfig.waste[neighborhoodStatus.wasteOverflow as keyof typeof statusConfig.waste].color)}>
                {React.createElement(statusConfig.waste[neighborhoodStatus.wasteOverflow as keyof typeof statusConfig.waste].icon, { className: "mr-2 h-4 w-4" })}
                {statusConfig.waste[neighborhoodStatus.wasteOverflow as keyof typeof statusConfig.waste].label}
            </Badge>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card glassy>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {quickActions.map((item) => (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-background/50 hover:bg-accent transition-colors text-center aspect-square"
                >
                  <div className="flex items-center justify-center size-12 rounded-full bg-primary/10 text-primary">
                    <item.icon className="size-6" />
                  </div>
                  <span className="text-xs font-medium text-center">{item.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Community Hub */}
        <div className="space-y-6">
            <Card glassy className='h-full'>
                <CardHeader>
                    <CardTitle>Community Hub</CardTitle>
                    <CardDescription>Latest reports and polls from your area.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Featured Poll */}
                    <div>
                        <p className="font-semibold text-sm mb-2">{polls[0].title}</p>
                        <div className="space-y-3">
                            {Object.entries(polls[0].votes).map(([option, count]) => {
                                const hasVoted = !!votedPolls[polls[0].id];
                                const percentage = polls[0].totalVotes > 0 ? Math.round((count / polls[0].totalVotes) * 100) : 0;
                                return (
                                    <div key={option}>
                                        {hasVoted ? (
                                             <div className="space-y-1">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className={cn("font-medium", votedPolls[polls[0].id] === option && "text-primary")}>{option}</span>
                                                    <span className="font-semibold">{percentage}%</span>
                                                </div>
                                                <Progress value={percentage} />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full justify-start h-8 text-xs"
                                                onClick={() => handleVote(polls[0].id, option)}
                                            >
                                                {option}
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                     <div className="space-y-3 pt-3 border-t">
                        {recentActivities.slice(0, 2).map((activity) => {
                            const activityUserAvatar = PlaceHolderImages.find((img) => img.id === activity.user.avatarId);
                            return (
                                <div key={activity.id} className="flex items-center gap-3">
                                    {activityUserAvatar && (
                                        <div className='size-8 rounded-full overflow-hidden'>
                                            <img src={activityUserAvatar.imageUrl} alt={activity.user.name} className='w-full h-full object-cover' />
                                        </div>
                                    )}
                                    <div className="flex-1 text-sm">
                                    <p className="text-muted-foreground"><span className="font-semibold text-foreground">{activity.user.name}</span> reported a <span className="font-semibold text-foreground">{activity.type}</span></p>
                                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
                 <CardFooter>
                    <Button variant="outline" size="sm" asChild className="w-full">
                        <Link href="/alerts">View Community Feed <ArrowRight className="ml-2 size-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );

    