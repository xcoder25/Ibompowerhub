'use client';

import { jobListings } from '@/lib/data';
import { Briefcase, MapPin, Search, ChevronRight, Clock, Users, TrendingUp, Award, Building2 } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const stats = [
  { label: 'Active Jobs', value: '1,200+', icon: Briefcase },
  { label: 'Companies', value: '300+', icon: Building2 },
  { label: 'Placements', value: '8,500+', icon: Award },
  { label: 'Applicants', value: '50K+', icon: Users },
];

const jobTypeColors: Record<string, string> = {
  'Full-time': 'bg-green-100 text-green-800 border-green-200',
  'Part-time': 'bg-orange-100 text-orange-700 border-orange-200',
  'Contract': 'bg-blue-100 text-blue-700 border-blue-200',
  'Remote': 'bg-purple-100 text-purple-700 border-purple-200',
};

export default function JobsPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const filtered = jobListings.filter(
    (j) => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-orange-300/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-green-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white p-8 md:p-12 mb-10 shadow-2xl shadow-orange-900/30">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-green-400/20 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5 text-white text-xs font-bold uppercase tracking-widest">
              <TrendingUp className="h-3.5 w-3.5" />
              AKS Job Board — ARISE Agenda
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3 leading-tight">
              Your Next Career,
              <br />
              <span className="bg-gradient-to-r from-green-200 to-white bg-clip-text text-transparent">
                Starts Here.
              </span>
            </h1>
            <p className="text-white/80 text-lg max-w-xl mb-8">
              Explore thousands of job opportunities across Akwa Ibom State — from government to private sector.
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

        {/* Search */}
        <div className="relative mb-8 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="search"
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/80 backdrop-blur border border-white/90 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400/50 shadow-sm"
          />
        </div>

        {/* Job Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((job) => {
            const image = PlaceHolderImages.find((img) => img.id === job.imageId);
            const badgeClass = jobTypeColors[job.type] || 'bg-slate-100 text-slate-700 border-slate-200';

            return (
              <div
                key={job.id}
                className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                {image && (
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={image.imageUrl}
                      alt={job.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="size-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-slate-900 truncate">{job.title}</h3>
                      <p className="text-sm text-slate-500">{job.company}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="size-3.5 text-orange-500 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <TrendingUp className="size-3.5 text-green-600 flex-shrink-0" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeClass}`}>
                      {job.type}
                    </span>
                  </div>

                  <Button
                    onClick={() => toast({ title: 'Application Sent! 🎉', description: `Your application for "${job.title}" has been submitted.` })}
                    className="w-full mt-auto rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-md shadow-orange-500/20 gap-2"
                  >
                    Apply Now
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <Briefcase className="size-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No jobs found for &quot;{search}&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
