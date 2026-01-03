
'use client';

import Link from 'next/link';
import React from 'react';
import {
  Zap,
  Droplets,
  Trash2,
  ArrowRight,
  User,
  Power,
  Bell,
  Wrench,
  ShoppingBag,
  Bus,
  Building2,
  MapPin,
  Search,
  Bot,
  MessageSquare,
  Briefcase,
  Calendar,
  HeartPulse,
  HardHat,
  Sparkles,
  Vote,
  Home,
  Plus,
  CloudRain,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { alerts } from '@/lib/data';

export default function DashboardPage() {
  const { user } = useUser();
  const mapPreviewImage = PlaceHolderImages.find((img) => img.id === 'map-preview');
  const agroMarketImage = PlaceHolderImages.find((img) => img.id === 'agro-connect');
  const forumsImage = PlaceHolderImages.find((img) => img.id === 'forum-townhall');
  const skillsHubImage = PlaceHolderImages.find((img) => img.id === 'artisan-3');
  const directoryImage = PlaceHolderImages.find((img) => img.id === 'directory-restaurant-2');

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'Power Outage':
        return <Power className="size-5 text-yellow-500" />;
      case 'Flood Alert':
        return <CloudRain className="size-5 text-blue-500" />;
      case 'Waste Overflow':
        return <Trash2 className="size-5 text-gray-500" />;
      default:
        return <Bell className="size-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 bg-slate-50/50 pb-24">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's a snapshot of your community's activities and services.
        </p>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
             <Card className="shadow-lg">
                <CardContent className="p-0">
                {mapPreviewImage && (
                    <div className="relative h-48 w-full">
                    <Image
                        src={mapPreviewImage.imageUrl}
                        alt="Map of Calabar"
                        fill
                        className="object-cover rounded-t-xl"
                        data-ai-hint={mapPreviewImage.imageHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className='absolute bottom-4 left-4 flex items-center gap-4'>
                        <div>
                            <h3 className='font-bold text-2xl text-white shadow-2xl'>Calabar</h3>
                            <p className='text-slate-200 text-sm'>Cross River State</p>
                        </div>
                         <Button asChild variant="secondary" size="sm">
                            <Link href="/map">
                                <MapPin className='mr-2'/>
                                View Live Map
                            </Link>
                         </Button>
                    </div>
                    </div>
                )}
                </CardContent>
                <CardFooter className="p-4 bg-slate-100/50 rounded-b-xl grid grid-cols-3 gap-4 text-center">
                    <Link href="/power" className='block p-2 rounded-lg bg-white shadow-sm hover:bg-slate-100 transition-colors'>
                        <div className='flex items-center justify-center gap-2'>
                             <div className='p-2 rounded-full bg-red-100'>
                                <Zap className='size-5 text-red-600' />
                            </div>
                            <div>
                                <p className='font-bold text-lg'>9</p>
                                <p className='text-xs text-muted-foreground -mt-1'>Power</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/water" className='block p-2 rounded-lg bg-white shadow-sm hover:bg-slate-100 transition-colors'>
                        <div className='flex items-center justify-center gap-2'>
                            <div className='p-2 rounded-full bg-blue-100'>
                                <Droplets className='size-5 text-blue-600' />
                            </div>
                            <div>
                                <p className='font-bold text-lg'>5</p>
                                <p className='text-xs text-muted-foreground -mt-1'>Water</p>
                            </div>
                        </div>
                    </Link>
                    <Link href="/waste" className='block p-2 rounded-lg bg-white shadow-sm hover:bg-slate-100 transition-colors'>
                        <div className='flex items-center justify-center gap-2'>
                           <div className='p-2 rounded-full bg-yellow-100'>
                                <Trash2 className='size-5 text-yellow-600' />
                            </div>
                            <div>
                                <p className='font-bold text-lg'>2</p>
                                <p className='text-xs text-muted-foreground -mt-1'>Waste</p>
                            </div>
                        </div>
                    </Link>
                </CardFooter>
            </Card>

            <div className="space-y-6">
                <Card className="shadow-lg">
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle className='font-headline'>Community Alerts</CardTitle>
                        <Link href="/alerts" className='text-sm font-medium text-primary hover:underline flex items-center gap-1'>
                            View all <ArrowRight className='size-4'/>
                        </Link>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        {alerts.slice(0, 3).map(alert => (
                            <div key={alert.id} className='flex items-start gap-3 p-3 rounded-lg hover:bg-slate-100/80'>
                                <div className={cn('p-2 rounded-full bg-white')}>
                                    {getAlertIcon(alert.type)}
                                </div>
                                <div className='flex-1'>
                                    <p className='font-semibold'>{alert.type}</p>
                                    <p className='text-sm text-muted-foreground'>{alert.description}</p>
                                </div>
                                <p className='text-xs text-muted-foreground whitespace-nowrap'>{alert.time}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {agroMarketImage && (
                        <Card className="shadow-lg flex flex-col">
                            <CardHeader>
                                <CardTitle className='font-headline'>AgroConnect</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <Image src={agroMarketImage.imageUrl} alt="AgroConnect Market" width={400} height={200} className='rounded-lg object-cover' data-ai-hint={agroMarketImage.imageHint} />
                            </CardContent>
                            <CardFooter>
                                 <Button asChild className='w-full'><Link href="/market">Go to Market</Link></Button>
                            </CardFooter>
                        </Card>
                    )}
                     <div className="space-y-6">
                        <Card className="shadow-lg">
                            <CardHeader className="flex-row items-center gap-4">
                                <div className="p-3 bg-sky-100 rounded-lg"><Wrench className="text-sky-600" /></div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">SkillsHub</CardTitle>
                                    <p className="text-sm text-muted-foreground">Find local artisans.</p>
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full"><Link href="/skills">Browse Artisans</Link></Button>
                            </CardFooter>
                        </Card>
                         <Card className="shadow-lg">
                            <CardHeader className="flex-row items-center gap-4">
                                <div className="p-3 bg-orange-100 rounded-lg"><Building2 className="text-orange-600" /></div>
                                <div>
                                    <CardTitle className="text-lg font-semibold">Directory</CardTitle>
                                    <p className="text-sm text-muted-foreground">Find local businesses.</p>
                                </div>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild variant="outline" className="w-full"><Link href="/directory">View Directory</Link></Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card className="shadow-lg">
                        <CardHeader className="flex-row items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg"><Vote className="text-blue-600" /></div>
                            <div>
                                <CardTitle className="text-lg font-semibold">Community Voting</CardTitle>
                                <p className="text-sm text-muted-foreground">Make your voice heard.</p>
                            </div>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full"><Link href="/voting">View Polls</Link></Button>
                        </CardFooter>
                    </Card>
                    <Card className="shadow-lg">
                        <CardHeader className="flex-row items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg"><Briefcase className="text-purple-600" /></div>
                            <div>
                                <CardTitle className="text-lg font-semibold">Property Listings</CardTitle>
                                <p className="text-sm text-muted-foreground">Rent or buy property.</p>
                            </div>
                        </CardHeader>
                        <CardFooter>
                            <Button asChild variant="outline" className="w-full"><Link href="/property">Browse Properties</Link></Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>

         {/* Right Column */}
        <div className="space-y-6">
             <Card className="shadow-lg bg-primary text-primary-foreground">
                <CardHeader>
                    <CardTitle className='font-headline'>Report an Issue</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Help improve your community by reporting power outages, waste, or water issues.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button asChild variant="secondary" className="w-full">
                        <Link href="/report">
                            <Plus className="mr-2" /> Report Now
                        </Link>
                    </Button>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Activity</CardTitle>
                </CardHeader>
                 <CardContent className="space-y-4">
                    {alerts.slice(0, 4).map((alert) => (
                        <div key={alert.id} className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={PlaceHolderImages.find(p => p.id === alert.user.avatarId)?.imageUrl} alt={alert.user.name} />
                                <AvatarFallback>{alert.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 text-sm">
                                <p><span className="font-semibold">{alert.user.name}</span> reported an issue.</p>
                                <p className="text-xs text-muted-foreground">{alert.time}</p>
                            </div>
                        </div>
                    ))}
                 </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
