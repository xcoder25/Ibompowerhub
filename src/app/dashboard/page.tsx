
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
  Eye,
  CreditCard,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
      <Card glassy className="bg-primary text-primary-foreground shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardDescription className="text-primary-foreground/80">Available Balance</CardDescription>
            <Eye className="size-5 text-primary-foreground/80" />
          </div>
          <CardTitle className="font-headline text-4xl">₦12,500.00</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="secondary" className="flex-1">
            <Plus className="mr-2 size-4" />
            Add Money
          </Button>
          <Button variant="outline" className="flex-1 bg-primary/80 border-primary-foreground/50 text-primary-foreground hover:bg-primary/70 hover:text-primary-foreground">
            <ArrowRight className="mr-2 size-4" />
            Withdraw
          </Button>
        </CardContent>
      </Card>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline">Quick Actions</CardTitle>
          <CardDescription>Access all your services in one place.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-4 gap-4 text-center">
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
            <div
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
                <CreditCard className="size-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Pay Bills</span>
            </div>
            <div
              className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-center p-3 rounded-full bg-primary/10 text-primary">
                <Plus className="size-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">More</span>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
