import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { services } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';

export default function ServicesPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">All Services</h1>
        <p className="text-muted-foreground">
          One map. All the services. Everyday life, simplified.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const image = PlaceHolderImages.find((img) => img.id === service.iconId);
          return (
            <Card key={service.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                {image && (
                  <Image
                    src={image.imageUrl}
                    alt={service.name}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                    data-ai-hint={image.imageHint}
                  />
                )}
                <div>
                  <CardTitle className="font-headline">{service.name}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex-grow"></CardContent>
              <div className="p-6 pt-0">
                <Button asChild className="w-full">
                  <Link href={service.href}>
                    Browse
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
