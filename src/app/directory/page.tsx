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
      <div className="absolute top-0 right-0 w-[1200px] h-[1200px] bg-emerald-500/10 rounded-full blur-[200px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[1000px] h-[1000px] bg-orange-500/10 rounded-full blur-[200px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 md:p-12 space-y-16 relative z-10 animate-in fade-in duration-1000">
        <div className="space-y-4 text-center md:text-left">
          <Badge className="bg-emerald-600/10 text-emerald-500 border-none font-black px-6 py-2 rounded-full uppercase tracking-[0.3em] text-[10px]">
            Ecosystem Directory
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-none">
            Ibom <span className="bg-gradient-to-r from-emerald-500 to-orange-500 bg-clip-text text-transparent italic">Network.</span>
          </h1>
          <p className="text-slate-500 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">
            The neural interface to Akwa Ibom&apos;s commercial landscape. Discover elite services and state-validated enterprises.
          </p>
        </div>

        <div className="w-full max-w-4xl mx-auto space-y-8">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-[2.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-700"></div>
            <div className="relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[2.5rem] p-4 flex flex-col md:flex-row items-center gap-4 border border-white/40 shadow-2xl">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                <Input
                  placeholder="Search the Ibom Network..."
                  className="pl-16 h-18 text-xl font-bold bg-transparent border-none focus-visible:ring-0 placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Separator orientation="vertical" className="hidden md:block h-12 bg-slate-200/50" />
              <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center p-2">
                {['All', ...businessCategories.slice(0, 3)].map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'ghost'}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-2xl font-black uppercase text-[10px] tracking-widest px-6 h-12 ${selectedCategory === category ? 'bg-slate-950 text-white shadow-xl' : 'text-slate-500 hover:text-slate-950'}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-6">
                <Skeleton className="h-[350px] w-full rounded-[3.5rem]" />
                <div className="space-y-3 px-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredBusinesses.length === 0 ? (
            <div className="col-span-full py-32 text-center space-y-6">
              <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-8">
                <Search className="size-12 text-slate-300" />
              </div>
              <p className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Zero Connections Found</p>
              <p className="text-xl text-slate-400 font-medium">Refine your search parameters to recalibrate the network.</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }} variant="outline" className="rounded-2xl px-10 h-16 font-black uppercase tracking-widest border-slate-200">Reset Interface</Button>
            </div>
          ) : (
            filteredBusinesses.map((business, idx) => {
              const image = PlaceHolderImages.find((img) => img.id === business.imageId);
              return (
                <Card
                  key={business.id}
                  className="group relative border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_60px_120px_-30px_rgba(16,185,129,0.3)] transition-all duration-700 rounded-[3.5rem] overflow-hidden bg-white/80 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 hover:-translate-y-4 animate-in fade-in slide-in-from-bottom-10"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute top-6 left-6 z-20">
                    <Badge className="bg-white/90 backdrop-blur-xl text-slate-950 border-none font-black px-4 py-2 rounded-xl uppercase text-[9px] tracking-widest shadow-2xl">
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

                    <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4 text-white translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                      <div className="space-y-1">
                        <CardTitle className="text-4xl font-black tracking-tightest leading-none drop-shadow-2xl">{business.name}</CardTitle>
                        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                          <CheckCircle className="size-4" /> State Verified
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm font-medium leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">{business.description || "Elite commercial partner within the Ibom ecosystem. Committed to quality and the ARISE developmental agenda."}</p>

                      <div className="flex gap-3 pt-4">
                        <Button asChild className="h-16 flex-1 bg-white text-slate-950 hover:bg-emerald-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl active:scale-95">
                          <a href={`tel:${business.phone}`}>
                            <Phone className="mr-2 size-5" /> Contact
                          </a>
                        </Button>
                        <Button asChild className="h-16 size-16 bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-slate-950 rounded-2xl p-0 transition-all border border-white/20 active:scale-95 shadow-2xl" variant="outline">
                          <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.name + ', ' + business.address)}`} target="_blank" rel="noopener noreferrer">
                            <MapPin className="size-6" />
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
