'use client';

import { ArrowRight, Building2, Calendar, Map, Search, ShoppingBag, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';

// Helper component for the feature cards
function FeatureCard({ title, description, href, image }: { title: string; description: string; href: string; image: any }) {
    return (
        <Link href={href} className="block group">
            <Card className="overflow-hidden h-full shadow-md transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                {image && (
                    <div className="relative h-40">
                        <Image src={image.imageUrl} alt={title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" data-ai-hint={image.imageHint} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4">
                            <h3 className="text-white font-bold text-xl">{title}</h3>
                        </div>
                    </div>
                )}
                <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
            </Card>
        </Link>
    );
}

export default function DiscoverPage() {
    const marketImage = PlaceHolderImages.find(i => i.id === 'agro-connect');
    const skillsImage = PlaceHolderImages.find(i => i.id === 'skills-hub');
    const eventsImage = PlaceHolderImages.find(i => i.id === 'event-carnival');
    const directoryImage = PlaceHolderImages.find(i => i.id === 'directory-hotel');
    const mapPreviewImage = PlaceHolderImages.find(i => i.id === 'map-preview');

    return (
        <div className="flex-1 p-4 sm:p-6 md:p-8 space-y-8 bg-slate-50/50">
            {/* Hero Section */}
            <div className="text-center space-y-4 pt-4">
                <h1 className="font-headline text-4xl font-bold tracking-tight">Discover Cross River</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Find everything you need, from local markets and skilled artisans to community events and essential services.
                </p>
                <div className="relative max-w-lg mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Search for services, places, or events..." className="pl-12 text-base h-12 rounded-full" />
                    <Button size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full h-9 w-9">
                        <ArrowRight />
                    </Button>
                </div>
            </div>
            
            {/* Featured Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketImage && <FeatureCard
                    title="AgroConnect"
                    description="Fresh produce from local farmers."
                    href="/market"
                    image={marketImage}
                />}
                {skillsImage && <FeatureCard
                    title="SkillsHub"
                    description="Find trusted local artisans."
                    href="/skills"
                    image={skillsImage}
                />}
                {eventsImage && <FeatureCard
                    title="Events"
                    description="What's happening in your area."
                    href="/events"
                    image={eventsImage}
                />}
                {directoryImage && <FeatureCard
                    title="Directory"
                    description="Find local businesses."
                    href="/directory"
                    image={directoryImage}
                />}
            </div>
            
            {/* Map Card */}
            <Card className="shadow-lg overflow-hidden">
                 <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 flex flex-col justify-center">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle className="font-headline text-2xl">Interactive Map</CardTitle>
                            <CardDescription>Visualize alerts, services, and points of interest in real-time.</CardDescription>
                        </CardHeader>
                        <CardFooter className="p-0">
                            <Button asChild>
                                <Link href="/map">
                                    <Map className="mr-2" />
                                    Open Live Map
                                </Link>
                            </Button>
                        </CardFooter>
                    </div>
                     <div className="relative h-48 md:h-full min-h-[200px]">
                        {mapPreviewImage && <Image
                            src={mapPreviewImage.imageUrl}
                            alt="Map Preview"
                            fill
                            className="object-cover"
                            data-ai-hint={mapPreviewImage.imageHint}
                        />}
                    </div>
                </div>
            </Card>

        </div>
    );
}
