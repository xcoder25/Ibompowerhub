'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { events } from '@/lib/events';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/context/loading-context';

export default function EventsPage() {
  const { toast } = useToast();
  const { isLoading, showLoader } = useLoading();

  const handleViewDetails = (eventTitle: string) => {
    showLoader(3000);
    toast({
      title: 'Coming Soon!',
      description: `Full details for "${eventTitle}" will be available shortly.`,
    });
  };

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Community Events</h1>
        <p className="text-muted-foreground">
          Discover what&apos;s happening in your local area.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => {
          const image = PlaceHolderImages.find((img) => img.id === event.imageId);
          return (
            <Card key={event.id} glassy className="overflow-hidden flex flex-col">
              {image && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={image.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline">{event.title}</CardTitle>
                <CardDescription className="flex items-center pt-1">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>{event.date}</span>
                </CardDescription>
                <CardDescription className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{event.location}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewDetails(event.title)}
                  disabled={isLoading}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
