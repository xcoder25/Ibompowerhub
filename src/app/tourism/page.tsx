'use client';

import Image from 'next/image';
import { tourismSpots } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Camera, ChevronRight, Compass, Globe, Waves, Trees, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const categories = ['All', 'Beach', 'Park', 'Cultural', 'Heritage', 'Waterfall'];

const highlights = [
  { icon: Waves, label: 'Coastal Beaches', value: '8+' },
  { icon: Trees, label: 'Nature Parks', value: '12+' },
  { icon: Globe, label: 'UNESCO Sites', value: '2' },
  { icon: Camera, label: 'Photo Spots', value: '50+' },
];

export default function TourismPage() {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[700px] h-[700px] rounded-full bg-green-300/20 blur-[140px]" />
        <div className="absolute bottom-0 -left-40 w-[600px] h-[600px] rounded-full bg-orange-300/15 blur-[140px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-[2rem] min-h-[360px] mb-12 shadow-2xl">
          <Image
            src="https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1500&auto=format&fit=crop"
            alt="Akwa Ibom Nature"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/80 via-green-800/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-14">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5 text-white text-xs font-bold uppercase tracking-widest w-fit">
              <Compass className="h-3.5 w-3.5 text-orange-300" />
              Discover Akwa Ibom
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight tracking-tight">
              Tourism &<br />
              <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                Culture Hub
              </span>
            </h1>
            <p className="text-white/80 text-lg max-w-xl mb-8">
              Explore the breathtaking beaches, lush forests, rich culture, and hidden gems of Akwa Ibom — the Land of Promise.
            </p>
            <Button className="w-fit bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl px-8 h-12 shadow-xl shadow-orange-500/30 gap-2">
              Explore Destinations <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {highlights.map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 flex-shrink-0">
                <Icon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white/70 text-slate-600 border border-white/80 hover:bg-white'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Spot Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tourismSpots.map((spot) => {
            const image = PlaceHolderImages.find((img) => img.id === spot.imageId);
            return (
              <div
                key={spot.id}
                className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  {image ? (
                    <Image
                      src={image.imageUrl}
                      alt={spot.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                      <Trees className="size-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Spot name overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-black text-white text-xl leading-tight">{spot.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="size-3.5 text-orange-300" />
                      <span className="text-white/75 text-xs font-medium">Akwa Ibom State</span>
                    </div>
                  </div>
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur border border-white/20 rounded-full px-2.5 py-1">
                    <Star className="size-3 text-amber-400 fill-amber-400" />
                    <span className="text-white text-xs font-bold">4.8</span>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-4">{spot.description}</p>
                  <Button className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-md shadow-orange-500/20 gap-2">
                    <MapPin className="size-4" />
                    Explore on Map
                    <ChevronRight className="size-4 ml-auto" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="mt-12 bg-gradient-to-br from-green-800 to-green-900 rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden shadow-2xl shadow-green-900/30">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative z-10">
            <Compass className="size-14 text-orange-300 mx-auto mb-4" />
            <h3 className="text-3xl font-black mb-3">Plan Your AKS Adventure</h3>
            <p className="text-white/70 max-w-md mx-auto mb-8">
              Book guided tours, cultural experiences, and eco-adventures across the beautiful Land of Promise.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl px-10 h-12 shadow-xl shadow-orange-500/30 gap-2">
              Book a Tour <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
