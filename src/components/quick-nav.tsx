'use client';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose,
} from '@/components/ui/sheet';
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
    Navigation,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const navCategories = [
    {
        title: "Main Services",
        items: [
            { href: '/dashboard', icon: Home, label: 'Home', color: 'bg-blue-500/10 text-blue-500' },
            { href: '/map', icon: Map, label: 'Map View', color: 'bg-emerald-500/10 text-emerald-500' },
            { href: '/alerts', icon: Bell, label: 'Alerts', color: 'bg-amber-500/10 text-amber-500' },
            { href: '/wallet', icon: Wallet, label: 'Ibom X', color: 'bg-indigo-500/10 text-indigo-500' },
        ]
    },
    {
        title: "Daily Life",
        items: [
            { href: '/market', icon: ShoppingBag, label: 'AgroConnect', color: 'bg-green-500/10 text-green-500' },
            { href: '/transport', icon: Bus, label: 'Transport', color: 'bg-orange-500/10 text-orange-500' },
            { href: '/live-tracking', icon: Navigation, label: 'Live Tracking', color: 'bg-cyan-500/10 text-cyan-500' },
            { href: '/skills', icon: Wrench, label: 'SkillsHub', color: 'bg-slate-500/10 text-slate-500' },
        ]
    },
    {
        title: "Utilities",
        items: [
            { href: '/power', icon: Power, label: 'Power', color: 'bg-yellow-500/10 text-yellow-500' },
            { href: '/water', icon: Droplets, label: 'Water', color: 'bg-blue-400/10 text-blue-400' },
            { href: '/waste', icon: Trash2, label: 'Waste', color: 'bg-brown-500/10 text-brown-500' },
            { href: '/safety', icon: Shield, label: 'Safety', color: 'bg-red-500/10 text-red-500' },
        ]
    },
    {
        title: "Community",
        items: [
            { href: '/news', icon: Newspaper, label: 'News', color: 'bg-sky-500/10 text-sky-500' },
            { href: '/events', icon: Calendar, label: 'Events', color: 'bg-violet-500/10 text-violet-500' },
            { href: '/forums', icon: MessageSquare, label: 'Forums', color: 'bg-pink-500/10 text-pink-500' },
            { href: '/directory', icon: Building2, label: 'Directory', color: 'bg-zinc-500/10 text-zinc-500' },
        ]
    },
    {
        title: "Public Services",
        items: [
            { href: '/government', icon: Building, label: 'Govt', color: 'bg-gray-600/10 text-gray-600' },
            { href: '/health', icon: HeartPulse, label: 'Health', color: 'bg-rose-500/10 text-rose-500' },
            { href: '/education', icon: BookOpen, label: 'Education', color: 'bg-lime-500/10 text-lime-500' },
            { href: '/voting', icon: Vote, label: 'Voting', color: 'bg-purple-500/10 text-purple-500' },
        ]
    },
    {
        title: "Others",
        items: [
            { href: '/jobs', icon: Briefcase, label: 'Jobs', color: 'bg-teal-500/10 text-teal-500' },
            { href: '/issues', icon: Lightbulb, label: 'Issues', color: 'bg-amber-600/10 text-amber-600' },
            { href: '/property', icon: Building2, label: 'Property', color: 'bg-neutral-500/10 text-neutral-500' },
            { href: '/tourism', icon: Palmtree, label: 'Tourism', color: 'bg-emerald-600/10 text-emerald-600' },
        ]
    }
];

export function QuickNav({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] sm:h-[80vh] rounded-t-[2rem] px-4 pb-8 border-none shadow-2xl overflow-hidden flex flex-col">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-muted rounded-full" />

                <SheetHeader className="pt-6 pb-4">
                    <SheetTitle className="text-2xl font-bold text-left flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10">
                            <GanttChartSquare className="w-6 h-6 text-primary" />
                        </div>
                        Explore Services
                    </SheetTitle>
                </SheetHeader>

                <ScrollArea className="flex-1 -mx-2 px-2">
                    <div className="space-y-8 pb-10">
                        {navCategories.map((category) => (
                            <div key={category.title}>
                                <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 mb-4 px-1">
                                    {category.title}
                                </h3>
                                <div className="grid grid-cols-4 gap-x-2 gap-y-5">
                                    {category.items.map((item) => (
                                        <SheetClose asChild key={item.href}>
                                            <Link href={item.href}>
                                                <div className="flex flex-col items-center justify-start gap-2.5 group active:scale-95 transition-transform duration-200 text-center">
                                                    <div className={cn(
                                                        "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg",
                                                        item.color
                                                    )}>
                                                        <item.icon className="w-6 h-6 md:w-7 md:h-7" />
                                                    </div>
                                                    <span className="text-[10px] md:text-xs font-semibold leading-tight line-clamp-2 px-0.5 text-foreground/80 group-hover:text-primary transition-colors">
                                                        {item.label}
                                                    </span>
                                                </div>
                                            </Link>
                                        </SheetClose>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="pt-4 mt-auto">
                    <SheetClose asChild>
                        <Link href="/services" className="flex items-center justify-between p-4 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all group">
                            <div className="flex items-center gap-3">
                                <GanttChartSquare className="w-6 h-6" />
                                <span className="font-bold text-base">All Services Catalog</span>
                            </div>
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </SheetClose>
                </div>
            </SheetContent>
        </Sheet>
    );
}
