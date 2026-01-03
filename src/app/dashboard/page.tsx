
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

const communityAlerts = [
    {
        id: 1,
        type: 'Power Outage',
        description: 'Equipment failure.',
        time: '1 hour ago',
        Icon: Zap,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
    },
    {
        id: 2,
        type: 'Flood Alert',
        description: 'Heavy rains',
        time: '3 hours ago',
        Icon: Droplets,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
    },
    {
        id: 3,
        type: 'Waste Overflow',
        description: 'Bins full since last night',
        time: '5 hours ago',
        Icon: Trash2,
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
    }
]

export default function DashboardPage() {
  const { user } = useUser();
  const mapPreviewImage = PlaceHolderImages.find((img) => img.id === 'map-preview');
  const agroMarketImage = PlaceHolderImages.find((img) => img.id === 'agro-connect');
  const forumsImage = PlaceHolderImages.find((img) => img.id === 'forum-townhall');
  const skillsHubImage = PlaceHolderImages.find((img) => img.id === 'artisan-3');
  const directoryImage = PlaceHolderImages.find((img) => img.id === 'directory-restaurant-2');
  const propertyImage = PlaceHolderImages.find((img) => img.id === 'property-house');

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 bg-slate-50">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Welcome back, {user?.displayName?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">Here&apos;s your community dashboard.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search here..."
          className="pl-10 text-base bg-white shadow-sm"
        />
        <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-primary">
            <Sparkles />
        </Button>
      </div>

      {/* Map and Live Alerts */}
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
               <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
               <div className='absolute bottom-4 left-4'>
                <h3 className='font-bold text-2xl text-white shadow-2xl'>Calabar</h3>
               </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-slate-50 rounded-b-xl">
          <div className='w-full'>
            <p className='text-sm font-medium text-muted-foreground mb-3'>Live community alerts in your area</p>
            <div className='grid grid-cols-3 gap-2 text-center'>
                <Link href="/power" className='block'>
                    <div className='flex items-center gap-2 p-2 rounded-lg bg-white shadow-sm hover:bg-slate-100 transition-colors'>
                        <div className='p-2 rounded-full bg-red-100'>
                            <Zap className='size-5 text-red-600' />
                        </div>
                        <div>
                            <p className='font-bold text-lg'>9</p>
                            <p className='text-xs text-muted-foreground -mt-1'>Power</p>
                        </div>
                    </div>
                </Link>
                 <Link href="/water" className='block'>
                    <div className='flex items-center gap-2 p-2 rounded-lg bg-white shadow-sm hover:bg-slate-100 transition-colors'>
                        <div className='p-2 rounded-full bg-blue-100'>
                            <Droplets className='size-5 text-blue-600' />
                        </div>
                        <div>
                            <p className='font-bold text-lg'>5</p>
                            <p className='text-xs text-muted-foreground -mt-1'>Water</p>
                        </div>
                    </div>
                 </Link>
                 <Link href="/waste" className='block'>
                    <div className='flex items-center gap-2 p-2 rounded-lg bg-white shadow-sm hover:bg-slate-100 transition-colors'>
                        <div className='p-2 rounded-full bg-yellow-100'>
                            <Trash2 className='size-5 text-yellow-600' />
                        </div>
                        <div>
                            <p className='font-bold text-lg'>2</p>
                            <p className='text-xs text-muted-foreground -mt-1'>Waste</p>
                        </div>
                    </div>
                 </Link>
            </div>
          </div>
        </CardFooter>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        
        {/* Left Column */}
        <div className="space-y-6">
            <Card className="shadow-lg">
                <CardHeader className='flex-row items-center justify-between'>
                    <CardTitle className='font-headline'>Community Alerts</CardTitle>
                    <Link href="/alerts" className='text-sm font-medium text-primary hover:underline flex items-center gap-1'>
                        View all <ArrowRight className='size-4'/>
                    </Link>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {communityAlerts.map(alert => (
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

             <div className='grid grid-cols-2 gap-4'>
                {agroMarketImage && (
                    <Link href="/market" className="block">
                        <Card className="shadow-lg h-full overflow-hidden">
                             <div className="relative h-24 w-full">
                                <Image src={agroMarketImage.imageUrl} alt="AgroConnect Market" fill className="object-cover" data-ai-hint={agroMarketImage.imageHint}/>
                            </div>
                            <CardHeader className='p-3'>
                                <CardTitle className='text-base font-semibold flex items-center gap-2'><ShoppingBag className='size-4 text-primary'/>AgroConnect</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                )}
                 {skillsHubImage && (
                    <Link href="/skills" className="block">
                        <Card className="shadow-lg h-full overflow-hidden">
                             <div className="relative h-24 w-full">
                                <Image src={skillsHubImage.imageUrl} alt="Skills Hub" fill className="object-cover" data-ai-hint={skillsHubImage.imageHint} />
                            </div>
                            <CardHeader className='p-3'>
                                <CardTitle className='text-base font-semibold flex items-center gap-2'><Wrench className='size-4 text-primary'/>SkillsHub</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                )}
             </div>

             <div className='grid grid-cols-2 gap-4'>
                {directoryImage && (
                    <Link href="/directory" className="block">
                        <Card className="shadow-lg h-full overflow-hidden">
                             <div className="relative h-24 w-full">
                                <Image src={directoryImage.imageUrl} alt="Local Directory" fill className="object-cover" data-ai-hint={directoryImage.imageHint}/>
                            </div>
                            <CardHeader className='p-3'>
                                <CardTitle className='text-base font-semibold flex items-center gap-2'><Building2 className='size-4 text-primary'/>Directory</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                )}
                 {forumsImage && (
                    <Link href="/forums" className="block">
                        <Card className="shadow-lg h-full overflow-hidden">
                             <div className="relative h-24 w-full">
                                <Image src={forumsImage.imageUrl} alt="Community Forums" fill className="object-cover" data-ai-hint={forumsImage.imageHint} />
                            </div>
                            <CardHeader className='p-3'>
                                <CardTitle className='text-base font-semibold flex items-center gap-2'><MessageSquare className='size-4 text-primary'/>Forums</CardTitle>
                            </CardHeader>
                        </Card>
                    </Link>
                )}
             </div>

             <div className='grid grid-cols-2 gap-4'>
                <Link href="/voting">
                    <Card className="shadow-lg">
                        <CardHeader className='pb-2'>
                            <CardTitle className='text-base font-semibold flex items-center gap-2'>
                                <Vote className='size-4 text-primary'/> Community Polls
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className='text-xs text-muted-foreground'>2 active polls</p>
                        </CardContent>
                    </Card>
                </Link>
                 {propertyImage && <Link href="/property">
                 <Card className="shadow-lg">
                    <CardHeader className='pb-2'>
                        <CardTitle className='text-base font-semibold flex items-center gap-2'>
                            <Home className='size-4 text-primary'/> Property Listings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-xs text-muted-foreground'>5 new listings</p>
                    </CardContent>
                </Card>
                 </Link>}
             </div>


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

            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className='font-headline'>Quick Services</CardTitle>
                </CardHeader>
                <CardContent className='space-y-1'>
                    <Link href="/power">
                        <div className='flex items-center justify-between p-3 hover:bg-slate-100 rounded-lg'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-full bg-red-100'>
                                    <Zap className='size-5 text-red-600'/>
                                </div>
                                <p className='font-semibold'>Power Services</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <p className='text-sm text-muted-foreground'>2 outages</p>
                                <ArrowRight className='size-4 text-muted-foreground'/>
                            </div>
                        </div>
                    </Link>
                    <Link href="/water">
                        <div className='flex items-center justify-between p-3 hover:bg-slate-100 rounded-lg'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-full bg-blue-100'>
                                    <Droplets className='size-5 text-blue-600'/>
                                </div>
                                <p className='font-semibold'>Water Services</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <p className='text-sm text-muted-foreground'>1 issue</p>
                                <ArrowRight className='size-4 text-muted-foreground'/>
                            </div>
                        </div>
                    </Link>
                    <Link href="/transport">
                        <div className='flex items-center justify-between p-3 hover:bg-slate-100 rounded-lg'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-full bg-green-100'>
                                    <Bus className='size-5 text-green-600'/>
                                </div>
                                <p className='font-semibold'>Transport Guide</p>
                            </div>
                            <div className='flex items-center gap-2'>
                                <p className='text-sm text-muted-foreground'>Check fares</p>
                                <ArrowRight className='size-4 text-muted-foreground'/>
                            </div>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

    

    
