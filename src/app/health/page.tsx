'use client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { healthFacilities } from '@/lib/data';
import { HeartPulse, Phone, Clock } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';

export default function HealthPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Health Services</h1>
        <p className="text-muted-foreground">Find hospitals, clinics, and pharmacies near you.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {healthFacilities.map((facility) => {
          const image = PlaceHolderImages.find((img) => img.id === facility.imageId);
          return (
            <Card key={facility.id} glassy className="overflow-hidden">
              {image && (
                <div className="relative h-40 w-full">
                  <Image src={image.imageUrl} alt={facility.name} fill className="object-cover" data-ai-hint={image.imageHint} />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline">{facility.name}</CardTitle>
                <CardDescription>{facility.type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{facility.hours}</span>
                </div>
              </CardContent>
              <CardFooter>
                 <Button asChild variant="outline" className="w-full">
                  <a href={`tel:${facility.phone}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Call Now
                  </a>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
