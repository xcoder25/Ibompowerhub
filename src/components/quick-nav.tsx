
'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Map,
    GanttChartSquare,
    ShoppingBag,
    Wrench,
    Bus,
    Bell,
    Home,
    Lightbulb,
    Shield,
    Building,
    Building2,
    Calendar,
    HeartPulse,
    Briefcase,
    Vote,
    Droplets,
    BookOpen,
    Power,
    MessageSquare,
    Trash2,
    Palmtree,
    Newspaper,
    Wallet,
  } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { DialogClose } from '@radix-ui/react-dialog';

const allNavItems = [
    { href: '/dashboard', icon: Home, label: 'Home' },
    { href: '/map', icon: Map, label: 'Map View' },
    { href: '/alerts', icon: Bell, label: 'Alerts' },
    { href: '/transactions', icon: Wallet, label: 'Wallet' },
    { href: '/services', icon: GanttChartSquare, label: 'All Services' },
    { href: '/market', icon: ShoppingBag, label: 'AgroConnect' },
    { href: '/skills', icon: Wrench, label: 'SkillsHub' },
    { href: '/transport', icon: Bus, label: 'Transport' },
    { href: '/directory', icon: Building2, label: 'Directory' },
    { href: '/news', icon: Newspaper, label: 'News' },
    { href: '/events', icon: Calendar, label: 'Events' },
    { href: '/forums', icon: MessageSquare, label: 'Forums' },
    { href: '/voting', icon: Vote, label: 'Voting' },
    { href: '/jobs', icon: Briefcase, label: 'Jobs' },
    { href: '/issues', icon: Lightbulb, label: 'All Issues' },
    { href: '/safety', icon: Shield, label: 'Safety' },
    { href: '/waste', icon: Trash2, label: 'Waste' },
    { href: '/water', icon: Droplets, label: 'Water' },
    { href: '/power', icon: Power, label: 'Power' },
    { href: '/government', icon: Building, label: 'Government' },
    { href: '/health', icon: HeartPulse, label: 'Health' },
    { href: '/education', icon: BookOpen, label: 'Education' },
    { href: '/property', icon: Building2, label: 'Property' },
    { href: '/tourism', icon: Palmtree, label: 'Tourism' },
];

export function QuickNav({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-headline">All Pages</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 py-4">
                    {allNavItems.map(item => (
                         <DialogClose asChild key={item.href}>
                            <Link href={item.href}>
                                <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg bg-background hover:bg-accent text-center aspect-square transition-colors">
                                    <item.icon className="w-7 h-7 text-primary" />
                                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                                </div>
                            </Link>
                        </DialogClose>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
