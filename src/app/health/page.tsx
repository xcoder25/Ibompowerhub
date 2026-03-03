'use client';

import { Card, CardContent } from '@/components/ui/card';
import { healthFacilities } from '@/lib/data';
import { HeartPulse, Phone, Clock, MapPin, ChevronRight, Search, Star, Stethoscope, Pill, Activity } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const facilityTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  hospital: HeartPulse,
  clinic: Stethoscope,
  pharmacy: Pill,
  default: Activity,
};

const stats = [
  { label: 'Health Facilities', value: '200+', icon: HeartPulse },
  { label: 'Registered Doctors', value: '1,500+', icon: Stethoscope },
  { label: 'LGAs Covered', value: '31', icon: MapPin },
  { label: 'Average Rating', value: '4.7★', icon: Star },
];

export default function HealthPage() {
  const [search, setSearch] = useState('');

  const filtered = healthFacilities.filter(
    (f) =>
      !search ||
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.type?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-green-300/20 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/15 blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4 text-red-700 text-xs font-bold uppercase tracking-widest">
            <HeartPulse className="h-3.5 w-3.5" />
            AKS Health Services
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-3">
            Your Health,{' '}
            <span className="bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
              Our Priority.
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">
            Find hospitals, clinics, and pharmacies across all 31 LGAs of Akwa Ibom State.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="size-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                <Icon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-8 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search hospitals, clinics, pharmacies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur border border-white/90 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 shadow-sm transition-all"
          />
        </div>

        {/* Facility Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((facility) => {
            const image = PlaceHolderImages.find((img) => img.id === facility.imageId);
            const typeKey = facility.type?.toLowerCase() || 'default';
            const TypeIcon = facilityTypeIcons[typeKey] || facilityTypeIcons.default;

            return (
              <div
                key={facility.id}
                className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden">
                  {image ? (
                    <Image
                      src={image.imageUrl}
                      alt={facility.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                      <HeartPulse className="size-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur border border-white/30 rounded-full px-3 py-1 text-white text-xs font-bold">
                      <TypeIcon className="size-3" />
                      {facility.type || 'Health Facility'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-black text-slate-900 text-lg mb-1 truncate">{facility.name}</h3>

                  <div className="space-y-1.5 mb-4">
                    {facility.hours && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="size-3.5 text-green-600 flex-shrink-0" />
                        <span>{facility.hours}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="size-3.5 text-orange-500 flex-shrink-0" />
                      <span>Akwa Ibom State</span>
                    </div>
                  </div>

                  <a href={`tel:${facility.phone}`}>
                    <Button className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-lg shadow-green-500/20 gap-2 group-hover:shadow-green-500/30 transition-all">
                      <Phone className="size-4" />
                      Call Now
                      <ChevronRight className="size-4 ml-auto" />
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <HeartPulse className="size-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No facilities found for &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
