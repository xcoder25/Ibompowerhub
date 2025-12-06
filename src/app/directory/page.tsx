
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { businesses, businessCategories } from '@/lib/directory';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin, Phone, Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          business.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Local Directory</h1>
        <p className="text-muted-foreground">
          Find local businesses and services in your area.
        </p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or category (e.g., restaurant, mechanic...)"
            className="pl-10 text-base bg-background/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['All', ...businessCategories].map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBusinesses.map((business) => {
          const image = PlaceHolderImages.find((img) => img.id === business.imageId);
          return (
            <Card key={business.id} glassy className="overflow-hidden">
              {image ? (
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={image.imageUrl}
                    alt={business.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              ) : (
                <div className="relative aspect-[3/2] w-full bg-muted flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline">{business.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{business.category}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4 mt-0.5 shrink-0" />
                  <span>{business.address}</span>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <a href={`tel:${business.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </a>
                </Button>
                 <Button asChild size="sm" className="flex-1">
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ', ' + business.address)}`} target="_blank" rel="noopener noreferrer">
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
        {filteredBusinesses.length === 0 && (
            <div className='text-center py-16 text-muted-foreground'>
                <p className='font-semibold text-lg'>No businesses found</p>
                <p>Try adjusting your search or filter.</p>
            </div>
        )}
    </div>
  );
}
