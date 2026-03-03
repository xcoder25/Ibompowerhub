'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { propertyListings } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Building2, Search, SlidersHorizontal, MapPin, BedDouble, Bath, Maximize, ChevronRight, Home, TrendingUp, Key, Tag } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button as Btn } from '@/components/ui/button';

const typeColors: Record<string, string> = {
  Rent: 'bg-green-100 text-green-800 border-green-200',
  Sale: 'bg-orange-100 text-orange-700 border-orange-200',
  'Short-let': 'bg-blue-100 text-blue-700 border-blue-200',
};

const stats = [
  { label: 'Listings', value: '800+', icon: Building2 },
  { label: 'For Rent', value: '400+', icon: Home },
  { label: 'For Sale', value: '300+', icon: Key },
  { label: 'Avg. Price', value: '₦85k/m', icon: TrendingUp },
];

const propertyTypes = ['All', 'Rent', 'Sale', 'Short-let'];

export default function PropertyPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('All');

  const filtered = propertyListings.filter((l) => {
    const matchesSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeType === 'All' || l.type === activeType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-green-300/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white p-8 md:p-12 mb-10 shadow-2xl shadow-green-900/30">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5 text-white text-xs font-bold uppercase tracking-widest">
              <Building2 className="h-3.5 w-3.5 text-orange-300" />
              AKS Property Listings
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
              Find Your Perfect
              <br />
              <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                Home in AKS
              </span>
            </h1>
            <p className="text-white/75 text-lg max-w-xl">
              Browse hundreds of property listings for rent, sale, and short-let across Akwa Ibom State.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon }) => (
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

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search by location, property type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur border border-white/90 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {propertyTypes.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeType === type
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'bg-white/70 text-slate-600 border border-white/80 hover:bg-white'
                  }`}
              >
                {type}
              </button>
            ))}
            <Button variant="outline" className="rounded-xl border-slate-200 font-bold gap-2 bg-white/70">
              <SlidersHorizontal className="size-4" /> Filters
            </Button>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((listing) => {
            const image = PlaceHolderImages.find(img => img.id === listing.imageId);
            const badgeClass = typeColors[listing.type] || 'bg-slate-100 text-slate-700 border-slate-200';
            return (
              <div
                key={listing.id}
                className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative h-52 w-full overflow-hidden">
                  {image ? (
                    <Image
                      src={image.imageUrl} alt={listing.title} fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                      <Building2 className="size-16 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badgeClass}`}>
                      {listing.type}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-slate-900 text-base mb-1 leading-tight">{listing.title}</h3>
                  <p className="text-2xl font-black text-green-700 mb-3">{listing.price}</p>

                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                    <MapPin className="size-3.5 text-orange-500 flex-shrink-0" />
                    <span>Akwa Ibom State</span>
                  </div>

                  {listing.features && (
                    <div className="flex items-center gap-4 mb-4 text-xs text-slate-600 font-bold">
                      {listing.features.beds && (
                        <div className="flex items-center gap-1"><BedDouble className="size-3.5 text-green-600" /> {listing.features.beds} beds</div>
                      )}
                      {listing.features.baths && (
                        <div className="flex items-center gap-1"><Bath className="size-3.5 text-orange-500" /> {listing.features.baths} baths</div>
                      )}
                      {listing.features.area && (
                        <div className="flex items-center gap-1"><Maximize className="size-3.5 text-blue-500" /> {listing.features.area}</div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={() => toast({ title: 'Coming Soon!', description: 'Full property details will be available shortly.' })}
                    className="w-full mt-auto rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-md shadow-green-500/20 gap-2"
                  >
                    View Details <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Building2 className="size-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No properties found for your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
