
'use client';

import Link from 'next/link';
import {
  Plus,
  Bell,
  GanttChartSquare,
  Wrench,
  Bus,
  ShoppingBag,
  User,
  Power,
  CloudRain,
  Trash2,
  FileText,
  LayoutGrid
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportIssueDialog } from '@/components/report-issue-dialog';
import { DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { recentActivities } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const serviceIcons = [
    { href: '/services', icon: GanttChartSquare, label: 'Services' },
    { href: '/market', icon: ShoppingBag, label: 'Market' },
    { href: '/skills', icon: Wrench, label: 'SkillsHub' },
    { href: '/transport', icon: Bus, label: 'Transport' },
    { href: '/alerts', icon: Bell, label: 'Alerts' },
    { href: '/profile', icon: User, label: 'Profile' },
];

const activityIcons = {
    "Power Outage": { icon: Power, color: "text-yellow-500" },
    "Flood Alert": { icon: CloudRain, color: "text-blue-500" },
    "Waste Overflow": { icon: Trash2, color: "text-gray-500" },
};

export default function DashboardPage() {
  const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar-1');

  return (
    <div className="flex-1 space-y-6 bg-muted/30 p-4 sm:p-6 md:p-8">
        
        <div className="flex items-center gap-4">
            {userAvatar && (
                <Avatar className="h-14 w-14 border-2 border-primary">
                    <AvatarImage src={userAvatar.imageUrl} alt="Esther Howard" />
                    <AvatarFallback>EH</AvatarFallback>
                </Avatar>
            )}
            <div>
                <h1 className="font-headline text-2xl font-bold">Welcome, Esther!</h1>
                <p className="text-muted-foreground">Here's your community snapshot.</p>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Card glassy>
                <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">My Reports</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">12</div>
                </CardContent>
            </Card>
            <Card glassy>
                <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">Services</CardTitle>
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">5</div>
                    <p className="text-xs text-muted-foreground">Used this month</p>
                </CardContent>
            </Card>
            <Card glassy className='col-span-2 md:col-span-1'>
                <CardHeader className="p-4 flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <div className="text-2xl font-bold">3</div>
                </CardContent>
            </Card>
        </div>
        
        <Card glassy className='shadow-lg'>
             <CardContent className='p-4 flex items-center justify-between'>
                <div>
                    <h3 className='font-semibold'>See an issue?</h3>
                    <p className='text-sm text-muted-foreground'>Help improve your community.</p>
                </div>
                <ReportIssueDialog>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 size-4" />
                            Report
                        </Button>
                    </DialogTrigger>
                </ReportIssueDialog>
             </CardContent>
        </Card>

        <Tabs defaultValue="actions">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="actions">
                    <LayoutGrid className='mr-2 size-4'/>
                    Quick Actions
                </TabsTrigger>
                <TabsTrigger value="activity">
                    <Bell className='mr-2 size-4'/>
                    Recent Activity
                </TabsTrigger>
            </TabsList>
            <TabsContent value="actions">
                <Card glassy>
                    <CardContent className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 text-center">
                        {serviceIcons.map((item) => (
                            <Link
                            href={item.href}
                            key={item.label}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors"
                            >
                            <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
                                <item.icon className="size-6" />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="activity">
                 <Card glassy>
                    <CardContent className='p-4 space-y-4'>
                        {recentActivities.map((activity) => {
                            const activityUserAvatar = PlaceHolderImages.find((img) => img.id === activity.user.avatarId);
                            const ActivityIcon = activityIcons[activity.type as keyof typeof activityIcons];
                            return (
                                <div key={activity.id} className='flex items-start gap-3'>
                                    <Avatar className='size-9 border-2 border-background'>
                                        {activityUserAvatar && <AvatarImage src={activityUserAvatar.imageUrl} />}
                                        <AvatarFallback>{activity.user.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className='flex-1 text-sm'>
                                        <p>
                                            <span className='font-semibold'>{activity.user.name}</span> reported an issue.
                                        </p>
                                        <div className='text-xs text-muted-foreground flex items-center gap-2 mt-1'>
                                            {ActivityIcon && <ActivityIcon.icon className={cn('size-3.5', ActivityIcon.color)} />}
                                            <span>{activity.type}</span>
                                            <span className='font-mono'>&#8226;</span>
                                            <span>{activity.time}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
}
