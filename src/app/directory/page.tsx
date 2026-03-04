'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { businessCategories } from '@/lib/directory';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { MapPin, Phone, Search, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle } from 'lucide-react';

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    const q = query(collection(firestore, 'businesses'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const businessList: any[] = [];
      snapshot.forEach((doc) => {
        businessList.push({ id: doc.id, ...doc.data() });
      });
      setBusinesses(businessList);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [firestore]);

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
    const matchesSearch = business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">
        <div className="space-y-4 text-center md:text-left">
          <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-bold px-4 py-1.5 rounded-full uppercase tracking-widest text-[9px] shadow-sm">
            Ecosystem Directory
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none">
            Ibom <span className="bg-gradient-to-r from-emerald-500 to-orange-500 bg-clip-text text-transparent italic">Network.</span>
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium max-w-2xl leading-relaxed">
            The neural interface to Akwa Ibom&apos;s commercial landscape. Discover elite services and state-validated enterprises.
          </p>
        </div>

        <div className="w-full max-w-3xl mx-auto space-y-6">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-3xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-3xl p-3 flex flex-col md:flex-row items-center gap-3 border border-white/40 shadow-xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search the Ibom Network..."
                  className="pl-12 h-12 text-base md:text-lg font-bold bg-transparent border-none focus-visible:ring-0 placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Separator orientation="vertical" className="hidden md:block h-8 bg-slate-200/50" />
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center p-1">
                {['All', ...businessCategories.slice(0, 3)].map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'ghost'}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-xl font-bold uppercase text-[9px] tracking-widest px-4 h-10 ${selectedCategory === category ? 'bg-slate-950 text-white shadow-md' : 'text-slate-500 hover:text-slate-950'}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[250px] w-full rounded-2xl" />
                <div className="space-y-2 px-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredBusinesses.length === 0 ? (
            <div className="col-span-full py-16 md:py-24 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Search className="size-8 text-slate-300" />
              </div>
              <p className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Zero Connections Found</p>
              <p className="text-base text-slate-400 font-medium">Refine your search parameters to recalibrate the network.</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} variant="outline" className="rounded-xl px-6 h-11 font-bold uppercase tracking-widest text-[10px] border-slate-200">Reset Interface</Button>
            </div>
          ) : (
            filteredBusinesses.map((business, idx) => {
              const image = PlaceHolderImages.find((img) => img.id === business.imageId);
              return (
                <Card
                  key={business.id}
                  className="group relative border border-white/20 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-5"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute top-4 left-4 z-20">
                    <Badge className="bg-white/90 backdrop-blur-xl text-slate-950 border-none font-bold px-3 py-1 rounded-lg uppercase text-[8px] tracking-widest shadow-sm">
                      {business.category}
                    </Badge>
                  </div>

                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    {image ? (
                      <Image
                        src={image.imageUrl}
                        alt={business.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-[2000ms]"
                        data-ai-hint={image.imageHint}
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                        <Building2 className="size-20 text-slate-200" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="space-y-0.5">
                        <CardTitle className="text-2xl font-black tracking-tight leading-none drop-shadow-md">{business.name}</CardTitle>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                          <CheckCircle className="size-3.5" /> State Verified
                        </div>
                      </div>
                      <p className="text-slate-300 text-xs font-medium leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">{business.description || "Elite commercial partner within the Ibom ecosystem. Committed to quality and the ARISE developmental agenda."}</p>

                      <div className="flex gap-2 pt-2">
                        <Button asChild className="h-11 flex-1 bg-white text-slate-950 hover:bg-emerald-500 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95">
                          <a href={`tel:${business.phone}`}>
                            <Phone className="mr-1.5 size-4" /> Contact
                          </a>
                        </Button>
                        <Button asChild className="h-11 size-11 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-slate-950 rounded-xl p-0 transition-all border border-white/20 active:scale-95 shadow-md flex items-center justify-center shrink-0" variant="outline">
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ', ' + business.address)}`} target="_blank" rel="noopener noreferrer">
                            <MapPin className="size-5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}
