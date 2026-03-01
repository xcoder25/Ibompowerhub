'use client';

import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/context/loading-context';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventsPage() {
  const { toast } = useToast();
  const { isLoading } = useLoading();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'events'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList: any[] = [];
      snapshot.forEach((doc) => {
        eventList.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventList);
      setIsLoadingEvents(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const handleViewDetails = (eventTitle: string) => {
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
        {isLoadingEvents ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} glassy className="overflow-hidden flex flex-col">
              <Skeleton className="aspect-video w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="flex-grow">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))
        ) : events.length === 0 ? (
          <div className='col-span-full text-center py-16 text-muted-foreground'>
            <p className='font-semibold text-lg'>No events found</p>
            <p>Check back later for upcoming community events.</p>
          </div>
        ) : (
          events.map((event) => {
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
                    <span>{event.date?.toDate ? event.date.toDate().toLocaleDateString() : event.date}</span>
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
          })
        )}
      </div>
    </div>
  );
}
