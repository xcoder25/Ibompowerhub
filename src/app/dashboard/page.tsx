
'use client';

import Link from 'next/link';
import {
  ArrowRight,
  GanttChartSquare,
  ShoppingBag,
  Wrench,
  Bus,
  Bell,
  User,
  CreditCard,
  Plus,
  Megaphone,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReportIssueDialog } from '@/components/report-issue-dialog';
import { DialogTrigger } from '@/components/ui/dialog';

const serviceIcons = [
  { href: '/services', icon: GanttChartSquare, label: 'Services' },
  { href: '/market', icon: ShoppingBag, label: 'Market' },
  { href: '/skills', icon: Wrench, label: 'SkillsHub' },
  { href: '/transport', icon: Bus, label: 'Transport' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-6 bg-muted/30 p-4 sm:p-6 md:p-8">
      <Card glassy className="shadow-lg">
        <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
            <div className='flex-shrink-0'>
                <div className='size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center'>
                    <Megaphone className='size-10'/>
                </div>
            </div>
          <div className="flex-1 text-center md:text-left">
            <CardTitle className="font-headline text-2xl">Welcome to PowerHub CRS!</CardTitle>
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
          <CardTitle className="font-headline">Quick Actions</CardTitle>
          <CardDescription>Access all your services in one place.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-center">
          {serviceIcons.map((item) => (
            <Link
              href={item.href}
              key={item.label}
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
                <item.icon className="size-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
            </Link>
          ))}
            <Link
              href="#"
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
                <CreditCard className="size-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Pay Bills</span>
            </Link>
            <Link
              href="#"
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
                <Plus className="size-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">More</span>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
