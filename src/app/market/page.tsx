import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { sellers } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin, Phone, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MarketPage() {
  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">AgroConnect Market</h1>
        <p className="text-muted-foreground">
          Connect with local farmers and sellers for fresh produce.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sellers.map((seller) => {
          const image = PlaceHolderImages.find((img) => img.id === seller.imageId);
          return (
            <Card key={seller.id} glassy className="overflow-hidden">
              {image && (
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={image.imageUrl}
                    alt={seller.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline">{seller.name}</CardTitle>
                <CardDescription>
                  <Badge variant="secondary">{seller.product}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-2 h-4 w-4" />
                  <span>{seller.distance} away</span>
                </div>
                <p className="font-semibold mt-2">{seller.priceRange}</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button size="sm" className="flex-1">
                  <Truck className="mr-2 h-4 w-4" />
                  Delivery
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
