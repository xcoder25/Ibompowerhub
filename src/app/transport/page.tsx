'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowRight, Bus, Bot, MapPin, ChevronRight, Navigation, Clock, TrendingUp, Sparkles } from 'lucide-react';
import { popularRoutes, fareEstimates } from '@/lib/data';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getNavigationRoute } from '@/ai/flows/map-navigation-flow';
import { useLoading } from '@/context/loading-context';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-blue-300/15 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-green-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/20 rounded-full px-4 py-1.5 mb-4 text-green-800 text-xs font-bold uppercase tracking-widest">
            <Bus className="h-3.5 w-3.5" />
            AKS Transport Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
            Transport{' '}
            <span className="bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
              Guide
            </span>
          </h1>
          <p className="text-slate-500 text-lg">Estimate fares and explore popular routes across Akwa Ibom State.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {transportStats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
              <div className="size-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                <Icon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fare Estimator */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20">
              <Navigation className="size-6 text-white" />
            </div>
            <div>
              <h2 className="font-black text-slate-900 text-xl">Route Fare Estimator</h2>
              <p className="text-slate-500 text-sm">Enter origin and destination for an estimated fare</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-green-600" />
              <Input
                className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium"
                placeholder="Origin (e.g. Ibom Plaza)"
                value={origin}
                onChange={e => setOrigin(e.target.value)}
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-orange-500" />
              <Input
                className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium"
                placeholder="Destination (e.g. Itam Park)"
                value={destination}
                onChange={e => setDestination(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <Button
              onClick={handleEstimate}
              disabled={isLoading}
              className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-md gap-2 h-12 flex-1"
            >
              <Navigation className="size-4" />
              Estimate Fare
            </Button>
            <Button
              variant="outline"
              onClick={handleAiEstimate}
              disabled={isLoading}
              className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-50 font-bold gap-2 h-12 flex-1"
            >
              {isLoading ? (
                <span className="animate-spin rounded-full size-4 border-2 border-orange-500 border-t-transparent" />
              ) : (
                <Sparkles className="size-4" />
              )}
              AI Estimate
            </Button>
          </div>

          {estimatedFare && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-5">
              <p className="text-sm font-bold text-green-700 uppercase tracking-wider mb-1">Estimated Fare</p>
              <p className="text-4xl font-black text-green-800">{estimatedFare}</p>
              <p className="text-xs text-green-600 mt-1">Standard fare — actual fare may vary</p>
            </div>
          )}
        </div>

        {/* Popular Routes Table */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Bus className="size-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-xl">Local Fare Reference</h2>
                <p className="text-sm text-slate-500">Standard fares for popular routes within Uyo & Akwa Ibom</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">From</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">To</th>
                  <th className="text-right px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Fare</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {popularRoutes.map((route, index) => (
                  <tr key={index} className="hover:bg-green-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-green-500" />
                        <span className="font-bold text-slate-900">{route.from}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="size-2 rounded-full bg-orange-500" />
                        <span className="text-slate-700 font-medium">{route.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-green-700 text-base">{route.fare}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
