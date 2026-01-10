
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { governmentOffices } from '@/lib/government';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin, Phone, Search, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function GovernmentPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOffices = governmentOffices.filter(office => {
    return office.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const heroImage = PlaceHolderImages.find(img => img.id === 'government-building');

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      {heroImage && (
        <Card glassy className="mb-8 overflow-hidden">
            <div className="relative h-48 w-full">
                <Image
                    src={heroImage.imageUrl}
                    alt="Government Building"
                    fill
                    className="object-cover"
                    data-ai-hint={heroImage.imageHint}
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center p-4">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-white">Government Services</h1>
                    <p className="text-slate-200 mt-2 max-w-2xl">Find ministries, agencies, and public services.</p>
                </div>
            </div>
        </Card>
      )}

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for a ministry or agency..."
            className="pl-10 text-base bg-background/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOffices.map((office) => {
          return (
            <Card key={office.id} glassy className="overflow-hidden">
              <CardHeader>
                <CardTitle className="font-headline flex items-start gap-3">
                  <div className='p-3 bg-muted rounded-lg mt-1'>
                    <Building className='size-5 text-primary' />
                  </div>
                  <div className='flex-1'>{office.name}</div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4 mt-0.5 shrink-0" />
                  <span>{office.address}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <a href={`tel:${office.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Contact
                  </a>
                </Button>
                 <Button asChild size="sm" className="flex-1">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.name + ', ' + office.address)}`} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Directions
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
        {filteredOffices.length === 0 && (
            <div className='text-center py-16 text-muted-foreground'>
                <p className='font-semibold text-lg'>No offices found</p>
                <p>Try adjusting your search terms.</p>
            </div>
        )}
    </div>
  );
}
