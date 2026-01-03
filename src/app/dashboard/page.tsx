
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
import { communityAlerts } from '@/lib/data';

export default function DashboardPage() {
  const { user } = useUser();
  const mapPreviewImage = PlaceHolderImages.find((img) => img.id === 'map-preview');
  const agroMarketImage = PlaceHolderImages.find((img) => img.id === 'agro-connect');
  const forumsImage = PlaceHolderImages.find((img) => img.id === 'forum-townhall');
  const skillsHubImage = PlaceHolderImages.find((img) => img.id === 'artisan-3');
  const directoryImage = PlaceHolderImages.find((img) => img.id === 'directory-restaurant-2');

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 bg-slate-50/50 pb-24">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s your community dashboard.</p>
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

            <Card className="shadow-lg">
                <CardHeader className='flex-row items-center justify-between'>
                    <CardTitle className='font-headline'>Community Alerts</CardTitle>
                    <Link href="/alerts" className='text-sm font-medium text-primary hover:underline flex items-center gap-1'>
                        View all <ArrowRight className='size-4'/>
                    </Link>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {communityAlerts.slice(0, 2).map(alert => (
                        <div key={alert.id} className='flex items-start gap-3'>
                            <div className={cn('p-2 rounded-full', alert.iconBg)}>
                                <alert.Icon className={cn('size-5', alert.iconColor)} />
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
        </div>

         {/* Right Column */}
        <div className="space-y-6">
            <Card className="shadow-lg bg-blue-50 border-blue-200">
                <CardHeader>
                    <div className='flex items-center gap-3'>
                        <Avatar>
                            <AvatarFallback className='bg-primary text-primary-foreground'><Bot/></AvatarFallback>
                        </Avatar>
                        <CardTitle className='font-headline'>AI Assistant</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className='text-sm text-muted-foreground'>Ask me anything, {user?.displayName?.split(' ')[0] || 'User'}. I'm here to help!</p>
                </CardContent>
                <CardFooter>
                    <Button className='w-full rounded-full'>Chat now</Button>
                </CardFooter>
            </Card>
            
            <div className='grid grid-cols-2 gap-4'>
                <Link href="/market" className="block">
                    <Card className="shadow-lg h-full overflow-hidden hover:bg-slate-100 transition-colors">
                        <CardHeader className='p-4 text-center items-center'>
                            <div className='p-3 rounded-full bg-green-100 mb-2'>
                                <ShoppingBag className='size-6 text-green-600'/>
                            </div>
                            <CardTitle className='text-base font-semibold'>AgroConnect</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/skills" className="block">
                    <Card className="shadow-lg h-full overflow-hidden hover:bg-slate-100 transition-colors">
                        <CardHeader className='p-4 text-center items-center'>
                            <div className='p-3 rounded-full bg-sky-100 mb-2'>
                                <Wrench className='size-6 text-sky-600'/>
                            </div>
                            <CardTitle className='text-base font-semibold'>SkillsHub</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/directory" className="block">
                    <Card className="shadow-lg h-full overflow-hidden hover:bg-slate-100 transition-colors">
                        <CardHeader className='p-4 text-center items-center'>
                            <div className='p-3 rounded-full bg-orange-100 mb-2'>
                                <Building2 className='size-6 text-orange-600'/>
                            </div>
                            <CardTitle className='text-base font-semibold'>Directory</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
                 <Link href="/transport" className="block">
                    <Card className="shadow-lg h-full overflow-hidden hover:bg-slate-100 transition-colors">
                        <CardHeader className='p-4 text-center items-center'>
                            <div className='p-3 rounded-full bg-purple-100 mb-2'>
                                <Bus className='size-6 text-purple-600'/>
                            </div>
                            <CardTitle className='text-base font-semibold'>Transport</CardTitle>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
