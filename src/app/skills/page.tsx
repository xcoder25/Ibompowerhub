'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { artisans as initialArtisans } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star, MapPin, Search, HardHat } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { RequestQuoteDialog } from '@/components/request-quote-dialog';
import { useGeolocation } from '@/hooks/use-geolocation';
import { sortArtisansByDistance } from '@/ai/flows/sort-by-distance-flow';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useLoading } from '@/context/loading-context';

export default function SkillsPage() {
  const [artisans, setArtisans] = useState(initialArtisans);
  const { location, error: geoError, getLocation } = useGeolocation();
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useLoading();

  const handleSortByDistance = () => {
    setIsLoading(true);
    // Request location. The sorting logic will be triggered by the useEffect below
    // once the location is successfully retrieved.
    getLocation();
  };

  useEffect(() => {
    if (!isLoading) return; // Only run if loading has been triggered

    if (location) {
      sortArtisansByDistance({
        userLocation: { latitude: location.latitude, longitude: location.longitude },
        // Pass a version of initialArtisans that includes the coords property
        artisans: initialArtisans.map(a => ({ ...a, coords: { latitude: 0, longitude: 0 } })),
      })
        .then((result) => {
          setArtisans(result.sortedArtisans);
          toast({
            title: 'Artisans Sorted',
            description: 'Showing the closest artisans first.',
          });
        })
        .catch((err) => {
          console.error(err);
          toast({
            variant: 'destructive',
            title: 'AI Sort Error',
            description: 'Could not sort artisans by distance.',
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    
    if (geoError) {
      toast({
        variant: 'destructive',
        title: 'Location Error',
        description: geoError,
      });
      setIsLoading(false);
    }
  }, [location, geoError, toast, setIsLoading, isLoading]);

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight">SkillsHub</h1>
          <p className="text-muted-foreground">
            Find trusted and verified artisans for your home and office needs.
          </p>
        </div>
        <Button asChild>
          <Link href="/skills/register">
            <HardHat className="mr-2" />
            Become an Artisan
          </Link>
        </Button>
      </div>

      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search by category (e.g., electrician, plumber...)"
            className="pl-10 text-base bg-background/50"
          />
        </div>
        <Button variant="outline" onClick={handleSortByDistance} disabled={isLoading}>
          <MapPin className="mr-2 h-4 w-4" />
          Sort by Distance
        </Button>
      </div>

      <div className="space-y-4">
        {artisans.map((artisan) => {
          const image = PlaceHolderImages.find((img) => img.id === artisan.imageId);
          return (
            <Card key={artisan.id} glassy className="p-4">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={artisan.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover border-2 border-primary self-center sm:self-start"
                    data-ai-hint={image.imageHint}
                  />
                )}
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row items-start justify-between">
                    <div>
                      <h3 className="font-headline text-lg font-semibold">{artisan.name}</h3>
                      <div className='flex items-center flex-wrap gap-2 mt-1'>
                        <Badge>{artisan.skill}</Badge>
                        <Badge
                          variant='outline'
                          className={cn(
                            artisan.availability === 'Available'
                              ? 'border-green-500 text-green-700'
                              : 'border-amber-500 text-amber-700'
                          )}
                        >
                          {artisan.availability}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 sm:mt-0 w-full sm:w-auto">
                      <RequestQuoteDialog artisan={artisan}>
                        <Button className="w-full sm:w-auto">
                          Request Quote
                        </Button>
                      </RequestQuoteDialog>
                    </div>
                  </div>
                  <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-3 pt-3 border-t sm:border-none sm:pt-0 sm:mt-2">
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span>{artisan.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span>{artisan.distance}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{artisan.hourlyRate}/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
