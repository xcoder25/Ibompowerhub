
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Trash2, Calendar, Phone, Search, SlidersHorizontal, MapPin, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ReportIssueDialog } from '@/components/report-issue-dialog';
import { DialogTrigger } from '@/components/ui/dialog';
import { privateWasteCollectors } from '@/lib/waste-management';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const collectionSchedule = [
  { area: 'State Housing Estate', day: 'Mondays & Thursdays', time: '8:00 AM - 12:00 PM' },
  { area: 'Marian', day: 'Tuesdays & Fridays', time: '8:00 AM - 12:00 PM' },
  { area: '8 Miles', day: 'Wednesdays & Saturdays', time: '8:00 AM - 12:00 PM' },
  { area: 'Akpabuyo', day: 'Wednesdays', time: '9:00 AM - 1:00 PM' },
];

export default function WastePage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'waste-management-hero');
  const cudaImage = PlaceHolderImages.find((img) => img.id === 'cuda-logo');


  return (
    <div className="flex-1 space-y-8 p-4 sm:p-6 md:p-8">
      <Card glassy className="overflow-hidden">
        <div className="relative h-48 w-full">
            {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt="Waste Management Hero"
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                />
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white">Waste Management</h1>
                <p className="text-slate-200 mt-2 max-w-2xl">Keep our community clean. Report issues, find collectors, and view schedules.</p>
            </div>
        </div>
        <CardFooter className="p-4 flex flex-col sm:flex-row gap-2">
             <ReportIssueDialog>
                <DialogTrigger asChild>
                    <Button className="w-full">
                        <Trash2 className="mr-2" /> Report Illegal Dumping
                    </Button>
                </DialogTrigger>
            </ReportIssueDialog>
             <Button variant="outline" className="w-full">
                <Calendar className="mr-2" /> View Collection Schedule
            </Button>
        </CardFooter>
      </Card>

      <Card glassy>
        <CardHeader className="flex-row items-center gap-4">
           {cudaImage && (
             <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                <Image src={cudaImage.imageUrl} alt="CUDA Logo" fill className="object-cover" data-ai-hint={cudaImage.imageHint}/>
             </div>
           )}
          <div>
            <CardTitle className="font-headline">Calabar Urban Development Authority (CUDA)</CardTitle>
            <CardDescription>The official government body for waste management in Calabar.</CardDescription>
          </div>
        </CardHeader>
        <CardFooter>
            <Button asChild variant='secondary' className='w-full'>
                <a href="tel:07033445566"><Phone className='mr-2'/>Contact CUDA</a>
            </Button>
        </CardFooter>
      </Card>
      
      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline">Hire Private Waste Collectors</CardTitle>
          <CardDescription>Find reliable private waste collectors for your home or business.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {privateWasteCollectors.map(collector => {
                    const image = PlaceHolderImages.find((img) => img.id === collector.imageId);
                    return (
                        <Card key={collector.id} className="overflow-hidden">
                            {image && (
                                <div className="relative aspect-video w-full">
                                    <Image src={image.imageUrl} alt={collector.name} fill className="object-cover" data-ai-hint={image.imageHint}/>
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className='font-headline text-lg'>{collector.name}</CardTitle>
                                <CardDescription className='flex items-center pt-1'>
                                    <MapPin className='mr-2 size-4'/>
                                    {collector.serviceArea}
                                </CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button asChild variant="outline" className='w-full'>
                                    <a href={`tel:${collector.phone}`}>
                                        <Phone className='mr-2'/>
                                        Contact
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </CardContent>
      </Card>

      <Card glassy>
        <CardHeader>
          <CardTitle className="font-headline">Public Collection Schedule</CardTitle>
          <CardDescription>Find out the public waste collection schedule for your area.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Area</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {collectionSchedule.map(schedule => (
                        <TableRow key={schedule.area}>
                            <TableCell className='font-medium'>{schedule.area}</TableCell>
                            <TableCell>{schedule.day}</TableCell>
                            <TableCell>{schedule.time}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

    </div>
  );
}
