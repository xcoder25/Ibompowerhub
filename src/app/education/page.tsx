'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { educationalInstitutions } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookOpen, Search, GraduationCap, MapPin, Users, Award, ChevronRight, Building2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const stats = [
  { label: 'Institutions', value: '500+', icon: Building2 },
  { label: 'Students', value: '2M+', icon: Users },
  { label: 'LGAs', value: '31', icon: MapPin },
  { label: 'Programs', value: '300+', icon: BookOpen },
];

const categories = ['All', 'University', 'Polytechnic', 'Secondary', 'Primary'];

export default function EducationPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = educationalInstitutions.filter((inst) => {
    const matchesSearch =
      !search ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.type?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' ||
      inst.type?.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-green-300/20 blur-[120px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/15 blur-[120px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Header Banner */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white p-8 md:p-12 mb-10 shadow-2xl shadow-green-900/30">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-orange-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5 text-white text-xs font-bold uppercase tracking-widest">
              <GraduationCap className="h-3.5 w-3.5 text-orange-300" />
              ARISE Agenda — Education
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
              Education Hub
              <br />
              <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                Akwa Ibom State
              </span>
            </h1>
            <p className="text-white/75 text-base max-w-xl">
              Find schools, universities, colleges, and educational resources across all 31 LGAs of Akwa Ibom State.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
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

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="search"
              placeholder="Search schools, universities, programs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur border border-white/90 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 shadow-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'bg-white/70 text-slate-600 border border-white/80 hover:bg-white hover:border-green-200'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Institution Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((inst) => {
            const image = PlaceHolderImages.find((img) => img.id === inst.imageId);
            return (
              <div
                key={inst.id}
                className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden">
                  {image ? (
                    <Image
                      src={image.imageUrl}
                      alt={inst.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                      <GraduationCap className="size-16 text-white/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur border border-white/30 rounded-full px-3 py-1 text-white text-xs font-bold">
                      <GraduationCap className="size-3" />
                      {inst.type || 'Institution'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-black text-slate-900 text-base mb-1 leading-tight">{inst.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                    <MapPin className="size-3.5 text-orange-500" />
                    <span>Akwa Ibom State</span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-md shadow-orange-500/20 gap-2"
                  >
                    <BookOpen className="size-4" />
                    View Details
                    <ChevronRight className="size-4 ml-auto" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <GraduationCap className="size-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No institutions found</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-orange-500/25">
          <Award className="size-12 text-white/90 mx-auto mb-4" />
          <h3 className="text-2xl font-black mb-2">Scholarships & Bursaries</h3>
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            Explore AKS government scholarships and bursary programs for students across Akwa Ibom State.
          </p>
          <Button className="bg-white text-orange-600 hover:bg-orange-50 font-black rounded-2xl px-8 h-12 shadow-lg gap-2">
            Explore Scholarships <ChevronRight className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
