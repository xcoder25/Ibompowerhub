
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Bus, GanttChartSquare, ShoppingBag, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SplashScreen } from '@/components/splash-screen';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Logo } from '@/components/logo';

const features = [
  {
    name: 'AgroConnect',
    description: 'Find fresh farm produce directly from local sellers.',
    icon: ShoppingBag,
    href: '/market',
  },
  {
    name: 'SkillsHub',
    description: 'Connect with verified artisans for your home and office needs.',
    icon: Wrench,
    href: '/skills',
  },
  {
    name: 'Transport Guide',
    description: 'Navigate the city with ease using our transport guide.',
    icon: Bus,
    href: '/transport',
  },
  {
    name: 'All Services',
    description: 'Explore all available community services in one place.',
    icon: GanttChartSquare,
    href: '/services',
  },
];

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const mapImage = PlaceHolderImages.find((img) => img.id === 'map-main');

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="relative h-[60svh] flex flex-col items-center justify-center text-center p-4 overflow-hidden">
        {mapImage && (
          <Image
            src={mapImage.imageUrl}
            alt={mapImage.description}
            fill
            className="object-cover"
            data-ai-hint={mapImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 via-blue-950/40 to-transparent"></div>
        <div className="relative z-10 flex flex-col items-center">
            <Logo withText={true} className="text-4xl" />
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
              One map. All the services. Everyday life, simplified.
            </p>
            <Button asChild size="lg" className="mt-8">
              <Link href="/map">
                Explore the Map <ArrowRight className="ml-2" />
              </Link>
            </Button>
        </div>
      </div>
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-center mb-8">
                What can we help you with?
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
                <Card key={feature.name} glassy className="flex flex-col text-center items-center">
                <CardHeader>
                    <div className="p-4 bg-primary/20 rounded-full mb-4 mx-auto">
                        <feature.icon className="size-8 text-primary" />
                    </div>
                    <CardTitle className="font-headline">{feature.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
                <div className="p-6 pt-0">
                    <Button asChild variant="outline">
                    <Link href={feature.href}>
                        Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    </Button>
                </div>
                </Card>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
}
