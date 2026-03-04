'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bus, Bot, MapPin, ChevronRight, Navigation, Clock, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import { popularRoutes, fareEstimates } from '@/lib/data';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getNavigationRoute } from '@/ai/flows/map-navigation-flow';
import { useLoading } from '@/context/loading-context';
import { Badge } from '@/components/ui/badge';

const transportStats = [
  { label: 'Active Routes', value: '120+', icon: Navigation },
  { label: 'Avg Fare', value: '₦200', icon: TrendingUp },
  { label: 'LGAs', value: '31', icon: MapPin },
  { label: 'Daily Trips', value: '5K+', icon: Bus },
];

export default function TransportPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [estimatedFare, setEstimatedFare] = useState<string | null>(null);
  const { toast } = useToast();
  const { isLoading, setIsLoading } = useLoading();

  const handleEstimate = () => {
    if (!origin || !destination) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter both origin and destination.' });
      return;
    }
    const key = `${origin.toLowerCase()}-${destination.toLowerCase()}`;
    const fare = fareEstimates[key];
    if (fare) {
      setEstimatedFare(fare);
    } else {
      setEstimatedFare(null);
      toast({ title: 'No Standard Fare Found', description: 'This route may not have a standard fare. Check with the driver.' });
    }
  };

  const handleAiEstimate = async () => {
    if (!origin && !destination) {
      toast({ variant: 'destructive', title: 'Missing Information', description: 'Please enter a route to get a fare estimate.' });
      return;
    }
    setIsLoading(true);
    setEstimatedFare(null);
    try {
      const result = await getNavigationRoute({ query: `from ${origin} to ${destination}` });
      const key = `${result.origin.toLowerCase()}-${result.destination.toLowerCase()}`;
      const fare = fareEstimates[key];
      if (fare) {
        setEstimatedFare(fare);
        setOrigin(result.origin);
        setDestination(result.destination);
      } else {
        toast({ title: 'No Standard Fare Found', description: 'The AI could not find a standard fare for this route.' });
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not understand the route.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000 max-w-6xl">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-emerald-600/10 text-emerald-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Mobility Diagnostics
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              TRANSPORT<span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">GUIDE</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Estimate fares and explore officially recognized daily transit lines across the state.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {transportStats.map(({ label, value, icon: Icon }) => (
            <StatCard key={label} label={label} value={value} icon={<Icon className="size-6 text-emerald-500" />} />
          ))}
        </section>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Fare Estimator */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-5 sm:p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-16 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center gap-4 border-b border-black/5 dark:border-white/10 pb-4">
                  <div className="size-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                    <Navigation className="size-5 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white tracking-tight">Fare Estimator</h2>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Route Calculator</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 size-6 bg-emerald-100 dark:bg-emerald-900/30 rounded flex items-center justify-center">
                        <MapPin className="size-3 text-emerald-600" />
                      </div>
                      <Input
                        className="h-12 pl-12 rounded-xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-base shadow-inner focus-visible:ring-emerald-500"
                        placeholder="Origin (e.g. Ibom Plaza)"
                        value={origin}
                        onChange={e => setOrigin(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 size-6 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                        <MapPin className="size-3 text-blue-600" />
                      </div>
                      <Input
                        className="h-12 pl-12 rounded-xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-base shadow-inner focus-visible:ring-blue-500"
                        placeholder="Destination (e.g. Itam Park)"
                        value={destination}
                        onChange={e => setDestination(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col xl:flex-row gap-3 pt-2">
                    <Button
                      onClick={handleEstimate}
                      disabled={isLoading}
                      className="h-12 flex-1 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white font-bold uppercase text-[10px] tracking-widest shadow-md transition-all"
                    >
                      <Navigation className="mr-2 size-4" /> Calculate Standard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleAiEstimate}
                      disabled={isLoading}
                      className="h-12 flex-1 rounded-xl border-none bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-bold uppercase text-[10px] tracking-widest shadow-inner hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                    >
                      {isLoading ? (
                        <span className="animate-spin rounded-full size-4 border-2 border-emerald-500 border-t-transparent mr-2" />
                      ) : (
                        <Sparkles className="mr-2 size-4" />
                      )}
                      AI Assist
                    </Button>
                  </div>

                  {estimatedFare && (
                    <div className="mt-6 bg-emerald-500 rounded-2xl p-6 text-white shadow-lg animate-in slide-in-from-bottom-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100 mb-1">Standard Reference</p>
                      <p className="text-4xl font-black mb-1 tracking-tighter">{estimatedFare}</p>
                      <p className="text-[10px] font-bold text-emerald-200 flex items-center gap-1.5 uppercase tracking-widest">
                        <AlertCircle className="size-4" /> Actual May Vary
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Popular Routes Table */}
          <div className="lg:col-span-7">
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl overflow-hidden shadow-sm h-full">
              <div className="p-6 sm:p-8 border-b border-white/10 dark:border-slate-800/50 flex items-center gap-4">
                <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center shadow-inner">
                  <Bus className="size-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight">Active Corridors</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Metropolitan Connections</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-950/50 border-b border-white/10 dark:border-slate-800/50">
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[40%]">Departure Node</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider w-[40%]">Arrival Node</th>
                      <th className="text-right px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Estimate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {popularRoutes.map((route, index) => (
                      <tr key={index} className="hover:bg-white/50 dark:hover:bg-slate-950/50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-150 transition-transform" />
                            <span className="font-bold text-base text-slate-950 dark:text-white tracking-tight">{route.from}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="size-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] group-hover:scale-150 transition-transform" />
                            <span className="font-medium text-slate-500 dark:text-slate-400">{route.to}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white font-bold text-sm px-3 py-1.5 border-none shadow-inner">
                            {route.fare}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-white/20 shadow-sm hover:-translate-y-1 transition-transform">
      <div className="size-12 rounded-xl bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-slate-950 dark:text-white tracking-tighter leading-none mb-1">{value}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
