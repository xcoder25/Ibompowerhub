'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { tourismSpots } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';

export default function TourismPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Tourism & Culture Hub</h1>
        <p className="text-muted-foreground">
          Discover the unique attractions of Cross River State, "The People's Paradise".
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tourismSpots.map((spot) => {
          const image = PlaceHolderImages.find((img) => img.id === spot.imageId);
          return (
            <Card key={spot.id} glassy className="overflow-hidden flex flex-col">
              {image && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={image.imageUrl}
                    alt={spot.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <CardTitle className="font-headline text-2xl absolute bottom-4 left-4 text-white">
                    {spot.name}
                  </CardTitle>
                </div>
              )}
              
              <CardContent className="pt-6 flex-grow">
                <p className="text-sm text-muted-foreground">{spot.description}</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">
                  <MapPin className="mr-2 h-4 w-4" />
                  Explore on Map
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
