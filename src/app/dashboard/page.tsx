
'use client';

import Link from 'next/link';
import {
  ArrowRight,
  GanttChartSquare,
  Wrench,
  Bus,
  Bell,
  User,
  Plus,
  Megaphone,
  ShoppingBag,
  Power,
  CloudRain,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportIssueDialog } from '@/components/report-issue-dialog';
import { DialogTrigger } from '@/components/ui/dialog';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { recentActivities } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';


const serviceIcons = [
  { href: '/services', icon: GanttChartSquare, label: 'Services' },
  { href: '/market', icon: ShoppingBag, label: 'Market' },
  { href: '/skills', icon: Wrench, label: 'SkillsHub' },
  { href: '/transport', icon: Bus, label: 'Transport' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

const reportData = [
    { name: 'Power', count: 12, fill: 'hsl(var(--chart-1))' },
    { name: 'Flood', count: 8, fill: 'hsl(var(--chart-2))' },
    { name: 'Waste', count: 5, fill: 'hsl(var(--chart-3))' },
    { name: 'Transport', count: 3, fill: 'hsl(var(--chart-4))' },
    { name: 'Other', count: 2, fill: 'hsl(var(--chart-5))' },
];

const activityIcons = {
    "Power Outage": { icon: Power, color: "text-yellow-500" },
    "Flood Alert": { icon: CloudRain, color: "text-blue-500" },
    "Waste Overflow": { icon: Trash2, color: "text-gray-500" },
};


export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 bg-muted/30 p-4 sm:p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card glassy className="shadow-lg">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                <div className='flex-shrink-0'>
                    <div className='size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center'>
                        <Megaphone className='size-10'/>
                    </div>
                </div>
              <div className="flex-1 text-center md:text-left">
                <CardTitle className="font-headline text-2xl">Welcome, Esther!</CardTitle>
                <CardDescription className="mt-1">
                  Your one-stop platform for community services and alerts.
                </CardDescription>
              </div>
              <ReportIssueDialog>
                <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">
                        <Plus className="mr-2 size-4" />
                        Report an Issue
                    </Button>
                </DialogTrigger>
              </ReportIssueDialog>
            </CardContent>
          </Card>

           <Card glassy>
                <CardHeader>
                    <CardTitle className="font-headline">Reports Overview</CardTitle>
                    <CardDescription>A summary of community reports in the last 7 days.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={reportData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                            <Tooltip
                                cursor={{ fill: 'hsla(var(--accent))' }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: 'var(--radius)',
                                }}
                            />
                            <Bar dataKey="count" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-6">
          <Card glassy>
            <CardHeader>
              <CardTitle className="font-headline">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-4 text-center">
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

          <Card glassy>
            <CardHeader>
                <CardTitle className='font-headline'>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
                {recentActivities.map((activity) => {
                    const userAvatar = PlaceHolderImages.find((img) => img.id === activity.user.avatarId);
                    const ActivityIcon = activityIcons[activity.type as keyof typeof activityIcons];
                    return (
                        <div key={activity.id} className='flex items-start gap-3'>
                             <Avatar className='size-9 border-2 border-background'>
                                {userAvatar && <AvatarImage src={userAvatar.imageUrl} />}
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
        </div>
      </div>
    </div>
  );
}
