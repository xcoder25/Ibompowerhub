'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/context/loading-context';
import { AlertTriangle, Send, CheckCircle2, FileText, Building2, Zap, Droplets, Route, MapPin, ChevronRight, Target } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

const reportCategories = [
  { value: 'works', label: 'Ministry of Works & Housing', icon: Building2 },
  { value: 'health', label: 'Ministry of Health', icon: CheckCircle2 },
  { value: 'education', label: 'Ministry of Education', icon: FileText },
  { value: 'transport', label: 'Ministry of Transport', icon: Route },
  { value: 'water', label: 'Ministry of Water (AKSG Water)', icon: Droplets },
  { value: 'power', label: 'Power Authority (AEDC)', icon: Zap },
];

const quickReports = [
  { label: 'Flooding', icon: Droplets, color: 'text-blue-500 hover:bg-blue-500/10' },
  { label: 'Power Outage', icon: Zap, color: 'text-amber-500 hover:bg-amber-500/10' },
  { label: 'Road Damage', icon: Route, color: 'text-orange-500 hover:bg-orange-500/10' },
  { label: 'Public Safety', icon: AlertTriangle, color: 'text-red-500 hover:bg-red-500/10' },
];

export default function ReportPage() {
  const { isLoading, setIsLoading } = useLoading();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast({ title: '✅ Trajectory Logged', description: 'Your intelligence report has been submitted.' });
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000 max-w-5xl">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-red-600/10 text-red-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Incident Reporting
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              REPORT<span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">ISSUE</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Submit critical anomalies or civic disruptions directly to the relevant Ministry, Department, or Agency.
            </p>
          </div>
        </div>

        {/* Quick Report Buttons */}
        <div className="mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 p-2">Rapid Classification</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickReports.map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                className={`flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 shadow-sm font-bold text-xs sm:text-sm uppercase tracking-wider transition-all hover:-translate-y-1 hover:shadow-md ${color}`}
              >
                <div className="size-10 sm:size-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                  <Icon className="size-5 sm:size-6" />
                </div>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        {submitted ? (
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-6">
              <div className="size-20 sm:size-24 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto shadow-lg animate-bounce-slow">
                <CheckCircle2 className="size-10 sm:size-12 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-950 dark:text-white mb-3 tracking-tighter">Transmission Successful</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base sm:text-lg">
                  Your intelligence dossier has been verified and relayed to response teams. Reference ID <span className="font-black text-emerald-500">#AK-992-B</span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-6">
                <Button
                  onClick={() => setSubmitted(false)}
                  className="h-12 px-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-bold uppercase tracking-wider text-xs"
                >
                  Log New Incident
                </Button>
                <Button className="h-12 px-8 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-red-600 hover:text-white font-bold uppercase tracking-wider text-xs shadow-md active:scale-95 transition-all">
                  Track Resolution <Target className="ml-2 size-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />

              {/* Ministry Select */}
              <div className="space-y-3 relative z-10">
                <Label className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
                  Target Command (Ministry / Agency)
                </Label>
                <Select required>
                  <SelectTrigger className="h-12 rounded-xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-base shadow-inner focus:ring-red-500 px-4">
                    <SelectValue placeholder="Select destination jurisdiction..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-lg font-bold bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
                    {reportCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="h-10 cursor-pointer focus:bg-slate-100 dark:focus:bg-slate-700">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-3 relative z-10">
                <Label className="font-black text-slate-400 text-[10px] uppercase tracking-widest">
                  Geospatial Coordinates
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 size-6 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                    <MapPin className="size-3 text-red-500" />
                  </div>
                  <Input
                    className="pl-12 h-12 rounded-xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-base shadow-inner focus-visible:ring-red-500"
                    placeholder="e.g. Wellington Bassey Way, Uyo..."
                    required
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-4 relative z-10">
                <Label htmlFor="title" className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">
                  Incident Designation
                </Label>
                <Input
                  id="title"
                  className="h-16 px-6 rounded-2xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-lg shadow-inner focus-visible:ring-red-500"
                  placeholder="Give a concise summary code (e.g. Major Flooding on Abak Rd)"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-4 relative z-10">
                <Label htmlFor="description" className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">
                  Comprehensive Dossier
                </Label>
                <Textarea
                  id="description"
                  className="p-6 rounded-3xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-lg shadow-inner min-h-[200px] resize-none focus-visible:ring-red-500"
                  placeholder="Provide tactical intelligence on the anomaly. Include time of observation and severity scale..."
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 relative z-10">
                <Button
                  type="button"
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 font-bold h-12 px-6 uppercase tracking-wider text-sm transition-all"
                  onClick={() => history.back()}
                >
                  Abort
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md h-12 flex-1 px-6 gap-2 uppercase tracking-wider text-sm active:scale-[0.98] transition-all"
                >
                  {isLoading ? (
                    <><span className="animate-spin rounded-full size-4 border-2 border-white border-t-transparent" /> Transmitting...</>
                  ) : (
                    <><Send className="size-4" /> Relay Intelligence</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-red-500/5 dark:bg-red-900/10 border border-red-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center gap-4 shadow-sm relative overflow-hidden backdrop-blur-sm">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <AlertTriangle className="size-32" />
          </div>
          <div className="size-12 shrink-0 bg-red-600 flex items-center justify-center rounded-xl shadow relative z-10">
            <AlertTriangle className="size-6 text-white animate-pulse" />
          </div>
          <div className="relative z-10 text-center md:text-left">
            <p className="font-black text-red-600 text-lg tracking-tight mb-1">Code Red / Critical Emergencies</p>
            <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl text-sm sm:text-base">Do not use this portal for immediate life-threatening events. Initiate protocol <span className="font-black bg-red-100 dark:bg-red-900/50 text-red-600 px-2 py-0.5 rounded">112</span> for rapid response.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
