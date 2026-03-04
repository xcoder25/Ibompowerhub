'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverLocationSharing } from '@/components/live-tracking/driver-location-sharing';
import { CustomerTrackingView } from '@/components/live-tracking/customer-tracking-view';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, User, Navigation2, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

export default function LiveTrackingDemoPage() {
  const [orderId, setOrderId] = useState('demo-order-123');
  const [customOrderId, setCustomOrderId] = useState('');

  const demoDestination = {
    lat: 4.9757, // Calabar coordinates
    lng: 8.3417,
    address: 'Marina Resort, Calabar, Nigeria'
  };

  const demoDriverInfo = {
    name: 'John Driver',
    phone: '+2341234567890',
    vehicle: 'Toyota Camry (ABC-123-XY)'
  };

  const activeOrderId = customOrderId || orderId;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      {/* Cinematic Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 md:space-y-12 relative z-10 animate-in fade-in duration-1000">

        {/* Dynamic Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-emerald-600/10 text-emerald-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Mobility Diagnostics
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-5xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              LIVE<span className="bg-gradient-to-r from-emerald-500 to-blue-500 bg-clip-text text-transparent">TRACKING</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed">
              Experience pinpoint global positioning synchronization for real-time asset tracking.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-8">
            <Card className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-5 sm:p-6 rounded-2xl border border-white/20">
              <CardHeader className="px-0 pt-0">
                <Badge className="w-fit bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-black uppercase text-[10px] tracking-widest mb-4">
                  Diagnostics
                </Badge>
                <CardTitle className="text-2xl font-black tracking-tight mb-2">Simulation Config</CardTitle>
                <CardDescription className="text-slate-500 font-medium text-sm">
                  Initialize a test link ID to observe latency-free GPS telemetrics.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="orderId" className="text-xs font-black uppercase tracking-widest text-slate-400">Target Session ID</Label>
                  <div className="flex gap-2">
                    <Input
                      id="orderId"
                      value={customOrderId}
                      onChange={(e) => setCustomOrderId(e.target.value)}
                      placeholder="Enter Link ID"
                      className="h-12 bg-white/50 dark:bg-slate-800/50 border-none rounded-xl shadow-inner text-base font-bold"
                    />
                    <Button
                      onClick={() => setCustomOrderId('')}
                      variant="ghost"
                      className="h-12 px-4 sm:px-6 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                  <CheckCircle2 className="size-5 text-emerald-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-white">Active Link:</span>
                  <span className="text-sm font-black text-emerald-500 truncate">{activeOrderId}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <StatCard label="Latency" value="~15ms" icon={<Activity className="text-emerald-500 size-6" />} />
              <StatCard label="Protocol" value="WSS/GPS" icon={<Navigation2 className="text-blue-500 size-6" />} />
            </div>
          </div>

          <div className="lg:col-span-8">
            <Tabs defaultValue="customer" className="space-y-8">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 rounded-xl shadow-sm">
                <TabsTrigger value="customer" className="h-12 rounded-lg font-bold text-sm tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-emerald-600 transition-all">
                  <User className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Client View
                </TabsTrigger>
                <TabsTrigger value="driver" className="h-12 rounded-lg font-bold text-sm tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all">
                  <Truck className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> Transmitter
                </TabsTrigger>
              </TabsList>

              <TabsContent value="customer" className="mt-0">
                <Card className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden rounded-2xl border border-white/20">
                  <div className="p-5 sm:p-6 pb-4 border-b border-white/10 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <MapPin className="size-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-950 dark:text-white">Asset Tracker</h3>
                        <p className="text-sm text-slate-500 font-medium">Real-time geospatial overlay</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">Receiving Data</Badge>
                  </div>
                  <div className="p-4 sm:p-8 bg-slate-100/50 dark:bg-slate-950/50">
                    <CustomerTrackingView
                      orderId={activeOrderId}
                      destination={demoDestination}
                      driverInfo={demoDriverInfo}
                      estimatedArrival={new Date(Date.now() + 15 * 60 * 1000)}
                    />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="driver" className="mt-0">
                <Card className="border-none shadow-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl overflow-hidden rounded-2xl border border-white/20">
                  <div className="p-5 sm:p-6 pb-4 border-b border-white/10 dark:border-slate-800/50 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Navigation2 className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-950 dark:text-white">Telemetry Transmitter</h3>
                        <p className="text-sm text-slate-500 font-medium">Location broadcast module</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 border-none font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full">Transmitter Ready</Badge>
                  </div>
                  <div className="p-4 sm:p-8 bg-slate-100/50 dark:bg-slate-950/50">
                    <DriverLocationSharing
                      orderId={activeOrderId}
                      onLocationUpdate={(location) => {
                        console.log('Driver location updated:', location);
                      }}
                    />
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

      </div>
    </main>
  );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl p-4 sm:p-5 rounded-2xl flex items-center gap-4 border border-white/20 shadow-sm">
      <div className="size-12 rounded-xl bg-white dark:bg-slate-800 shadow-inner flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-xl font-black text-slate-950 dark:text-white tracking-tighter leading-none mb-1">{value}</p>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}