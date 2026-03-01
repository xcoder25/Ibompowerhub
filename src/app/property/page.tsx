'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { propertyListings } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Building2, Search, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useLoading } from '@/context/loading-context';
import { useToast } from '@/hooks/use-toast';

export default function PropertyPage() {
  const { isLoading } = useLoading();
  const { toast } = useToast();

  const handleViewDetails = () => {
    toast({
      title: 'Coming Soon!',
      description: 'Property details feature is coming soon!'
    })
  }

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Property Listings</h1>
        <p className="text-muted-foreground">Find properties for rent or sale in your area.</p>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search by location, property type..." className="pl-10 text-base bg-background/50" />
        </div>
        <Button variant="outline" className="shrink-0">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {propertyListings.map((listing) => {
          const image = PlaceHolderImages.find((img) => img.id === listing.imageId);
          return (
            <Card key={listing.id} glassy className="overflow-hidden">
              <div className="relative">
                {image && (
                  <div className="relative h-52 w-full">
                    <Image src={image.imageUrl} alt={listing.title} fill className="object-cover" data-ai-hint={image.imageHint} />
                  </div>
                )}
                <Badge className="absolute top-2 right-2">{listing.type}</Badge>
              </div>
              <CardHeader>
                <CardTitle className="font-headline leading-tight">{listing.title}</CardTitle>
                <CardDescription className="font-bold text-lg text-primary">{listing.price}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full" onClick={handleViewDetails} disabled={isLoading}>View Details</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
