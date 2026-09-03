'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Waves, AlertTriangle, ShieldCheck, PhoneCall, MapPin, 
  Droplets, Activity, RefreshCw, Send, CheckCircle2, 
  Compass, ArrowUpRight, CloudRain, Flame, LifeBuoy, Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  FLOOD_SENSORS, COMMUNITY_FLOOD_REPORTS, SAFE_ZONES, FLOOD_HOTLINES,
  FloodSensor, FloodReport 
} from '@/lib/floodsense-data';
import { AKWA_IBOM_LGAS } from '@/lib/lga-data';

export default function FloodSensePage() {
  const { toast } = useToast();
  const [sensors, setSensors] = useState<FloodSensor[]>(FLOOD_SENSORS);
  const [reports, setReports] = useState<FloodReport[]>(COMMUNITY_FLOOD_REPORTS);
  const [selectedLgaFilter, setSelectedLgaFilter] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New citizen report form state
  const [reporterName, setReporterName] = useState('');
  const [reportLga, setReportLga] = useState('Uyo');
  const [reportLocation, setReportLocation] = useState('');
  const [reportSeverity, setReportSeverity] = useState<'Minor' | 'Moderate' | 'Severe' | 'Submerged'>('Moderate');
  const [reportDepth, setReportDepth] = useState('');
  const [passableVehicle, setPassableVehicle] = useState(true);
  const [passableFoot, setPassableFoot] = useState(false);
  const [drainageBlocked, setDrainageBlocked] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Drainage clearance dispatch request
  const [drainageLga, setDrainageLga] = useState('Uyo');
  const [drainageStreet, setDrainageStreet] = useState('');
  const [drainageDetails, setDrainageDetails] = useState('');
  const [isRequestingDrainage, setIsRequestingDrainage] = useState(false);

  const simulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSensors(prev => prev.map(s => {
        const delta = Math.floor(Math.random() * 9) - 4;
        const newLevel = Math.max(10, Math.min(s.maxThresholdCm + 25, s.waterLevelCm + delta));
        return {
          ...s,
          waterLevelCm: newLevel,
          lastReadingTime: 'Just now'
        };
      }));
      setIsRefreshing(false);
      toast({
        title: "Telemetry Refreshed",
        description: "IoT water level and drainage station metrics have been updated."
      });
    }, 600);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportLocation) {
      toast({
        title: "Missing Information",
        description: "Please specify the exact location or street name.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newReport: FloodReport = {
        id: `RPT-${Date.now().toString().slice(-4)}`,
        reporterName: reporterName.trim() || 'Anonymous Resident',
        lga: reportLga,
        location: reportLocation,
        severity: reportSeverity,
        waterDepthDescription: reportDepth || `${reportSeverity} water logging reported on roadway.`,
        passableByVehicle: passableVehicle,
        passableByFoot: passableFoot,
        timestamp: 'Just now',
        upvotes: 1,
        drainageBlocked
      };

      setReports(prev => [newReport, ...prev]);
      setIsSubmitting(false);
      setReportLocation('');
      setReportDepth('');
      toast({
        title: "Flood Report Logged & Broadcasted",
        description: "Your report is now live on the Akwa Ibom community radar and flagged for SEMA AKS."
      });
    }, 700);
  };

  const handleDrainageRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drainageStreet) {
      toast({
        title: "Street Required",
        description: "Please enter the street or junction where the drain is blocked.",
        variant: "destructive"
      });
      return;
    }

    setIsRequestingDrainage(true);
    setTimeout(() => {
      setIsRequestingDrainage(false);
      setDrainageStreet('');
      setDrainageDetails('');
      toast({
        title: "Drainage Clearance Ticket Issued",
        description: `Ticket #AKSWMA-${Math.floor(1000 + Math.random() * 9000)} dispatched to AKSWMA Rapid Response Unit.`
      });
    }, 800);
  };

  const filteredSensors = selectedLgaFilter === 'ALL' 
    ? sensors 
    : sensors.filter(s => s.lga.toLowerCase().includes(selectedLgaFilter.toLowerCase()));

  const filteredSafeZones = selectedLgaFilter === 'ALL'
    ? SAFE_ZONES
    : SAFE_ZONES.filter(z => z.lga.toLowerCase() === selectedLgaFilter.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Waves className="size-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">FloodSense AKS</h1>
                  <Badge className="bg-blue-500 text-white font-black text-[10px] uppercase px-2">Live Radar</Badge>
                </div>
                <p className="text-xs md:text-sm text-slate-400">
                  Akwa Ibom Real-Time Water Level Telemetry, Flood Early Warning & Drainage Response Network
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={simulateRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="border-blue-500/30 bg-blue-950/40 text-blue-300 hover:bg-blue-900/50 hover:text-white text-xs h-9"
            >
              <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Telemetry
            </Button>
            <Link href="/alerts">
              <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:text-white text-xs h-9">
                View All Alerts
              </Button>
            </Link>
          </div>
        </div>

        {/* State Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-slate-900/70 border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400">
                <Activity className="size-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Monitored Basins</div>
                <div className="text-lg md:text-xl font-bold text-white">8 Stations</div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/70 border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Safe Waterway Flow</div>
                <div className="text-lg md:text-xl font-bold text-emerald-400">87.5% Safe</div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/70 border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Active Advisories</div>
                <div className="text-lg md:text-xl font-bold text-amber-400">2 Corridors</div>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/70 border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400">
                <Compass className="size-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Verified Safe Havens</div>
                <div className="text-lg md:text-xl font-bold text-purple-400">5 High Grounds</div>
              </div>
            </div>
          </Card>
        </div>

        {/* SEMA Hotline Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 via-slate-900/80 to-slate-900 border border-red-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <LifeBuoy className="size-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">State Emergency Flood Response Hotline</div>
              <p className="text-xs text-slate-400">SEMA AKS & Fire Rescue Direct Response Unit</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href="tel:08030001122">
              <Button size="sm" className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl h-8">
                <PhoneCall className="size-3.5 mr-1.5" />
                Call SEMA: 0803 000 1122
              </Button>
            </a>
            <a href="tel:112">
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-300 hover:bg-red-950/40 text-xs font-bold rounded-xl h-8">
                Dial 112
              </Button>
            </a>
          </div>
        </div>

        {/* LGA Filter Bar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Filter By LGA:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'Uyo', 'Itu', 'Eket', 'Oron', 'Ibeno', 'Ikot Abasi'].map(lga => (
              <button
                key={lga}
                onClick={() => setSelectedLgaFilter(lga)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedLgaFilter === lga
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                {lga === 'ALL' ? 'All 31 LGAs' : lga}
              </button>
            ))}
          </div>
        </div>

        {/* Section 1: Live IoT Water-Level Station Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Live Waterway & Basin Sensors</h2>
              <p className="text-xs text-slate-400">Automated flood telemetry stations along critical catchments</p>
            </div>
            <span className="text-xs text-slate-500">{filteredSensors.length} Stations Active</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSensors.map(sensor => {
              const pct = Math.min(100, Math.round((sensor.waterLevelCm / sensor.maxThresholdCm) * 100));
              const isWarning = sensor.status === 'WARNING' || sensor.status === 'CRITICAL';
              const isAdvisory = sensor.status === 'ADVISORY';

              return (
                <Card 
                  key={sensor.id} 
                  className={`bg-slate-900/80 border transition-all ${
                    isWarning 
                      ? 'border-orange-500/50 shadow-lg shadow-orange-950/30' 
                      : isAdvisory 
                      ? 'border-amber-500/30' 
                      : 'border-white/10 hover:border-blue-500/30'
                  }`}
                >
                  <CardContent className="p-4 space-y-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">{sensor.lga} LGA</div>
                        <h3 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{sensor.name}</h3>
                        <p className="text-xs text-slate-400 line-clamp-1 flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3 text-slate-500 shrink-0" />
                          {sensor.location}
                        </p>
                      </div>
                      <Badge 
                        className={`text-[10px] font-black uppercase shrink-0 ${
                          sensor.status === 'SAFE' 
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : sensor.status === 'ADVISORY'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : sensor.status === 'WARNING'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                        }`}
                      >
                        {sensor.status}
                      </Badge>
                    </div>

                    {/* Progress Level Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">Water Depth: <strong className="text-white">{sensor.waterLevelCm} cm</strong></span>
                        <span className="text-slate-400 font-mono text-[11px]">{pct}% / {sensor.maxThresholdCm} cm</span>
                      </div>
                      <Progress 
                        value={pct} 
                        className={`h-2 bg-slate-800 ${
                          isWarning ? '[&>div]:bg-orange-500' : isAdvisory ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'
                        }`} 
                      />
                    </div>

                    {/* Metrics grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5 text-slate-300">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Flow Velocity</span>
                        <span className="font-semibold">{sensor.flowVelocityMs} m/s ({sensor.riskTrend})</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Drainage Clearance</span>
                        <span className="font-semibold text-emerald-400">{sensor.drainageHealthPercent}% Clear</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Section 2: Citizen Reporting & Rapid Drainage Dispatch in 2 columns */}
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Column 1: Citizen Flood Reporter Form */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="bg-slate-900/80 border-white/10">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                    <CloudRain className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">Report Street Flooding</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Alert other motorists and prompt emergency municipal action
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">Your Name (Optional)</Label>
                      <Input
                        value={reporterName}
                        onChange={e => setReporterName(e.target.value)}
                        placeholder="e.g. Edidiong Bassey"
                        className="bg-slate-950 border-white/10 text-xs h-9 text-white placeholder:text-slate-600"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">LGA *</Label>
                      <Select value={reportLga} onValueChange={setReportLga}>
                        <SelectTrigger className="bg-slate-950 border-white/10 text-xs h-9 text-white">
                          <SelectValue placeholder="Select LGA" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-60">
                          {AKWA_IBOM_LGAS.map(lga => (
                            <SelectItem key={lga.id} value={lga.name}>{lga.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Exact Location / Street Landmark *</Label>
                    <Input
                      value={reportLocation}
                      onChange={e => setReportLocation(e.target.value)}
                      placeholder="e.g. Abak Road underpass by Flyover, Uyo"
                      className="bg-slate-950 border-white/10 text-xs h-9 text-white placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">Severity Level</Label>
                      <Select value={reportSeverity} onValueChange={(val: any) => setReportSeverity(val)}>
                        <SelectTrigger className="bg-slate-950 border-white/10 text-xs h-9 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          <SelectItem value="Minor">Minor (Puddles / Flowing)</SelectItem>
                          <SelectItem value="Moderate">Moderate (Ankle to Shin Deep)</SelectItem>
                          <SelectItem value="Severe">Severe (Knee Deep / Cars Stalled)</SelectItem>
                          <SelectItem value="Submerged">Submerged (Waist Deep / Impassable)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs text-slate-300">Water Depth Description</Label>
                      <Input
                        value={reportDepth}
                        onChange={e => setReportDepth(e.target.value)}
                        placeholder="e.g. 30cm high, cars turning back"
                        className="bg-slate-950 border-white/10 text-xs h-9 text-white placeholder:text-slate-600"
                      />
                    </div>
                  </div>

                  {/* Passability toggles */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPassableVehicle(!passableVehicle)}
                      className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                        passableVehicle ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-white/10 text-slate-500'
                      }`}
                    >
                      <span className="text-sm">🚗</span>
                      <span>{passableVehicle ? 'Vehicle Passable' : 'No Vehicles'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPassableFoot(!passableFoot)}
                      className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                        passableFoot ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-white/10 text-slate-500'
                      }`}
                    >
                      <span className="text-sm">🚶</span>
                      <span>{passableFoot ? 'Foot Passable' : 'No Walking'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDrainageBlocked(!drainageBlocked)}
                      className={`p-2.5 rounded-xl border font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                        drainageBlocked ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-slate-950 border-white/10 text-slate-500'
                      }`}
                    >
                      <span className="text-sm">🚫</span>
                      <span>{drainageBlocked ? 'Blocked Drain' : 'Drain Clear'}</span>
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-10 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/30"
                  >
                    <Send className="size-4" />
                    {isSubmitting ? 'Submitting to State Radar...' : 'Broadcast Flood Alert to Community'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Community Reports Feed */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Waves className="size-4 text-blue-400" />
                Recent Verified Citizen Reports ({reports.length})
              </h3>

              <div className="space-y-2.5">
                {reports.map(report => (
                  <div key={report.id} className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] border-blue-500/30 text-blue-400 font-bold">
                          {report.lga}
                        </Badge>
                        <span className="text-xs font-bold text-white">{report.location}</span>
                      </div>
                      <p className="text-xs text-slate-300">{report.waterDepthDescription}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                        <span>Reported by {report.reporterName}</span>
                        <span>•</span>
                        <span>{report.timestamp}</span>
                      </div>
                    </div>
                    <Badge className={`text-[10px] font-bold shrink-0 ${
                      report.severity === 'Severe' || report.severity === 'Submerged'
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    }`}>
                      {report.severity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Drainage Clearance Dispatch & Safe Zones */}
          <div className="lg:col-span-5 space-y-6">
            {/* Drainage Clearance Dispatch */}
            <Card className="bg-slate-900/80 border-white/10">
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base text-white">AKSWMA Drainage Clearing</CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Request de-silting of clogged gutters & drains
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleDrainageRequest} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">LGA *</Label>
                    <Select value={drainageLga} onValueChange={setDrainageLga}>
                      <SelectTrigger className="bg-slate-950 border-white/10 text-xs h-9 text-white">
                        <SelectValue placeholder="Select LGA" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-white max-h-60">
                        {AKWA_IBOM_LGAS.map(lga => (
                          <SelectItem key={lga.id} value={lga.name}>{lga.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Street / Junction Name *</Label>
                    <Input
                      value={drainageStreet}
                      onChange={e => setDrainageStreet(e.target.value)}
                      placeholder="e.g. Aka Road by Champion Junction"
                      className="bg-slate-950 border-white/10 text-xs h-9 text-white placeholder:text-slate-600"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-slate-300">Blockage Description</Label>
                    <Textarea
                      value={drainageDetails}
                      onChange={e => setDrainageDetails(e.target.value)}
                      placeholder="e.g. Silt buildup and plastic waste blocking drain culvert."
                      className="bg-slate-950 border-white/10 text-xs min-h-[70px] text-white placeholder:text-slate-600 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isRequestingDrainage}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="size-4" />
                    {isRequestingDrainage ? 'Dispatching...' : 'Submit Drainage Clearance Ticket'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* High-Ground Safe Zones */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Compass className="size-4 text-purple-400" />
                  Emergency Safe Havens & Shelters
                </h3>
                <span className="text-xs text-slate-500">{filteredSafeZones.length} Designated</span>
              </div>

              <div className="space-y-2.5">
                {filteredSafeZones.map(zone => (
                  <div key={zone.id} className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-bold text-purple-400">{zone.type}</div>
                        <h4 className="text-sm font-bold text-white mt-0.5">{zone.name}</h4>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <MapPin className="size-3 text-slate-500 shrink-0" />
                          {zone.address} ({zone.lga} LGA)
                        </p>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border-none shrink-0">
                        OPEN
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5 text-slate-400">
                      <span>Elevation: <strong className="text-white">{zone.elevationMeters}m</strong></span>
                      <span>Capacity: <strong className="text-white">{zone.capacity} persons</strong></span>
                      <a href={`tel:${zone.contactPhone}`} className="text-blue-400 font-semibold hover:underline flex items-center gap-1">
                        <PhoneCall className="size-3" />
                        {zone.contactPhone}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
