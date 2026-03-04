'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Filter, Search, ShieldAlert, CheckCircle2, AlertCircle, Clock, MapPin, Sparkles, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const issues = [
  { id: 1, issue: 'Broken Streetlight', location: 'Marian Rd', status: 'Reported', time: '2 hours ago', type: 'Infrastructure' },
  { id: 2, issue: 'Pothole Assessment', location: 'Etta Agbor', status: 'In Progress', time: '5 hours ago', type: 'Roads' },
  { id: 3, issue: 'Waste Collection Missed', location: '8 Miles', status: 'Resolved', time: '1 day ago', type: 'Sanitation' },
  { id: 4, issue: 'Traffic Light Malfunction', location: 'Highway Intersection', status: 'Reported', time: '3 hours ago', type: 'Transport' },
];

export default function IssuesPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-red-600/10 text-red-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              State Log
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              PUBLIC<span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">ISSUES</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Track and monitor the status of community-reported issues across the state infrastructure network.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-6 sm:grid-cols-3">
          <StatCard label="Total Reported" value="1,492" icon={<ShieldAlert className="text-red-500 size-6" />} />
          <StatCard label="In Active Progress" value="384" icon={<Clock className="text-orange-500 size-6" />} />
          <StatCard label="Resolved" value="95%" icon={<CheckCircle2 className="text-emerald-500 size-6" />} />
        </section>

        <section className="space-y-8">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-3 sm:p-4 rounded-2xl border border-white/20 shadow-sm flex flex-col md:flex-row gap-3 relative z-20">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search log records..."
                className="pl-12 h-12 bg-white/50 dark:bg-slate-800/50 border-none rounded-xl text-base font-medium shadow-inner placeholder:text-slate-400"
              />
            </div>
            <Button
              className="h-12 px-6 w-full md:w-auto rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-slate-100 font-bold shadow-sm transition-all active:scale-95"
            >
              <Filter className="mr-2 h-5 w-5" />
              Filters
            </Button>
          </div>

          <div className="grid gap-6">
            {issues.map((issue) => (
              <Card key={issue.id} className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-4 sm:p-6 rounded-2xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 group border border-white/20">
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center justify-between">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1">
                    <div className={`size-12 sm:size-14 rounded-xl flex items-center justify-center shrink-0 shadow-inner 
                            ${issue.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-500' :
                        issue.status === 'In Progress' ? 'bg-orange-500/10 text-orange-500' : 'bg-red-500/10 text-red-500'}`}>
                      {issue.status === 'Resolved' ? <CheckCircle2 className="size-8" /> :
                        issue.status === 'In Progress' ? <Clock className="size-8 animate-pulse" /> : <AlertTriangle className="size-8" />}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <Badge className={`border-none px-3 py-1 font-black uppercase text-[9px] tracking-widest ${issue.status === 'Resolved' ? 'bg-emerald-500 text-white' :
                          issue.status === 'In Progress' ? 'bg-orange-500 text-white' : 'bg-red-600 text-white'
                          }`}>
                          {issue.status}
                        </Badge>
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{issue.time}</span>
                      </div>
                      <h3 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white mb-2">{issue.issue}</h3>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                        <MapPin className="size-4" /> {issue.location} · {issue.type}
                      </div>
                    </div>
                  </div>
                  <Button className="shrink-0 h-10 md:h-12 w-full md:w-auto px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-slate-950 hover:text-white font-bold uppercase tracking-wider text-xs transition-colors">
                    View Dossier
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>
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
