'use client';

import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { artisans as initialArtisans } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Star, MapPin, Search, HardHat, ShieldCheck, Zap, ArrowRight, Sparkles } from 'lucide-react';
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
    getLocation();
  };

  useEffect(() => {
    if (!isLoading) return;
    if (location) {
      sortArtisansByDistance({
        userLocation: { latitude: location.latitude, longitude: location.longitude },
        artisans: initialArtisans.map(a => ({ ...a, coords: { latitude: 0, longitude: 0 } })),
      })
        .then((result) => {
          setArtisans(result.sortedArtisans);
          toast({ title: 'Artisans Sorted', description: 'Showing the closest artisans first.' });
        })
        .catch((err) => {
          console.error(err);
          toast({ variant: 'destructive', title: 'AI Sort Error', description: 'Could not sort artisans by distance.' });
        })
        .finally(() => setIsLoading(false));
    }
    if (geoError) {
      toast({ variant: 'destructive', title: 'Location Error', description: geoError });
      setIsLoading(false);
    }
  }, [location, geoError, toast, setIsLoading, isLoading]);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-emerald-600/10 text-emerald-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Verified Marketplace
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              SKILLS<span className="bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">HUB</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Connect with top-tier, verified artisans. The premier network for professional services in Akwa Ibom.
            </p>
          </div>
          <Button asChild className="h-12 px-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-emerald-600 hover:text-white rounded-xl font-bold transition-all shadow-xl active:scale-95 group w-full md:w-auto">
            <Link href="/skills/register">
              <HardHat className="mr-3 size-5" />
              Become a Pro <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Verified Pros" value="1,200+" icon={<ShieldCheck className="text-emerald-500 size-6" />} />
          <StatCard label="Jobs Completed" value="15k+" icon={<Zap className="text-orange-500 size-6" />} />
          <StatCard label="Avg Rating" value="4.8/5.0" icon={<Star className="text-amber-500 size-6" />} />
        </section>

        {/* Search and Filters */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-3 sm:p-4 rounded-2xl border border-white/20 shadow-sm flex flex-col md:flex-row gap-3 relative z-20">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by category, name, or skill..."
              className="pl-12 h-12 bg-white/50 dark:bg-slate-800/50 border-none rounded-xl text-base font-medium shadow-inner placeholder:text-slate-400"
            />
          </div>
          <Button
            onClick={handleSortByDistance}
            disabled={isLoading}
            className="h-12 px-6 w-full md:w-auto rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm transition-all active:scale-95"
          >
            <MapPin className="mr-2 h-5 w-5" />
            {isLoading ? 'Locating...' : 'Sort by Distance'}
          </Button>
        </div>

        {/* Grid of Artisans */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {artisans.map((artisan) => {
            const image = PlaceHolderImages.find((img) => img.id === artisan.imageId);
            return (
              <Card key={artisan.id} className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-1 rounded-2xl hover:bg-slate-950 group transition-all duration-300 hover:-translate-y-1 overflow-hidden relative border border-white/20">
                <div className="absolute top-0 right-0 p-6 bg-white/5 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none z-0">
                  <Sparkles className="size-16" />
                </div>
                <CardContent className="p-4 sm:p-5 relative z-10 flex flex-col h-full">
                  <div className="flex items-start gap-4 mb-6">
                    {image && (
                      <div className="relative size-20 rounded-2xl overflow-hidden shadow-inner group-hover:shadow-emerald-500/20 transition-all border-2 border-white/20">
                        <Image
                          src={image.imageUrl}
                          alt={artisan.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-black text-slate-950 dark:text-white group-hover:text-white tracking-tight">{artisan.name}</h3>
                      <p className="text-sm font-bold text-slate-400 group-hover:text-emerald-400 tracking-wider uppercase mb-2">{artisan.skill}</p>
                      <Badge variant="outline" className={cn("border-none bg-slate-100 dark:bg-slate-800 text-xs font-black px-2.5 py-1 tracking-widest uppercase", artisan.availability === 'Available' ? 'text-emerald-500' : 'text-orange-500')}>
                        {artisan.availability}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl mb-6 group-hover:bg-white/10 transition-colors">
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rating</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-950 dark:text-white group-hover:text-white">
                        <Star className="size-4 text-amber-500 fill-amber-500" /> {artisan.rating}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rate</p>
                      <div className="font-bold text-slate-950 dark:text-white group-hover:text-white">
                        {artisan.hourlyRate}/hr
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Distance</p>
                      <div className="flex items-center gap-1.5 font-bold text-slate-950 dark:text-white group-hover:text-white">
                        <MapPin className="size-4 text-emerald-500" /> {artisan.distance}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <RequestQuoteDialog artisan={artisan}>
                      <Button className="w-full h-11 rounded-xl bg-slate-100 dark:bg-slate-800 dark:text-white text-slate-950 font-bold hover:bg-emerald-600 hover:text-white transition-colors uppercase tracking-wider text-xs border border-transparent dark:border-slate-700">
                        Request Quote
                      </Button>
                    </RequestQuoteDialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-white/20 shadow-sm hover:-translate-y-1 transition-transform">
      <div className="size-12 rounded-xl bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter">{value}</p>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
