'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Waves, AlertTriangle, ShieldCheck, ArrowUpRight, 
  Droplets, Activity, Gauge, MapPin, RefreshCw 
} from 'lucide-react';
import { FLOOD_SENSORS, FloodSensor } from '@/lib/floodsense-data';

export function FloodSensorWidget() {
  const [sensors, setSensors] = useState<FloodSensor[]>(FLOOD_SENSORS);
  const [selectedSensorIndex, setSelectedSensorIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const activeSensor = sensors[selectedSensorIndex];
  const highRiskCount = sensors.filter(s => s.status === 'WARNING' || s.status === 'CRITICAL').length;
  const advisoryCount = sensors.filter(s => s.status === 'ADVISORY').length;

  const simulateRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSensors(prev => prev.map(s => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const newLevel = Math.max(10, Math.min(s.maxThresholdCm + 20, s.waterLevelCm + delta));
        return {
          ...s,
          waterLevelCm: newLevel,
          lastReadingTime: 'Just now'
        };
      }));
      setIsRefreshing(false);
    }, 600);
  };

  const getStatusBadge = (status: FloodSensor['status']) => {
    switch (status) {
      case 'SAFE':
        return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">NORMAL (SAFE)</Badge>;
      case 'ADVISORY':
        return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">ELEVATED</Badge>;
      case 'WARNING':
        return <Badge className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold">WARNING</Badge>;
      case 'CRITICAL':
        return <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold animate-pulse">CRITICAL OVERFLOW</Badge>;
    }
  };

  const percentage = Math.min(100, Math.round((activeSensor.waterLevelCm / activeSensor.maxThresholdCm) * 100));

  return (
    <Card className="border-blue-500/20 bg-gradient-to-br from-blue-950/30 via-slate-900/60 to-slate-950 backdrop-blur-xl shadow-lg relative overflow-hidden text-slate-100">
      {/* Background water wave glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Waves className="size-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold text-white tracking-tight">FloodSense AKS</CardTitle>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
              </div>
              <p className="text-xs text-slate-400">Live IoT Waterway & Drainage Telemetry</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={simulateRefresh} 
            className="size-8 text-slate-400 hover:text-white"
            disabled={isRefreshing}
          >
            <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Quick status summary strip */}
        <div className="grid grid-cols-3 gap-2 text-center p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
          <div>
            <div className="text-slate-400 font-medium">Monitored Stations</div>
            <div className="text-sm font-bold text-white mt-0.5">{sensors.length} Nodes</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">Alerts Active</div>
            <div className="text-sm font-bold text-amber-400 mt-0.5">{advisoryCount + highRiskCount} Corridors</div>
          </div>
          <div>
            <div className="text-slate-400 font-medium">State Basin Status</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">Normal Flow</div>
          </div>
        </div>

        {/* Sensor selector tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {sensors.slice(0, 5).map((sensor, idx) => (
            <button
              key={sensor.id}
              onClick={() => setSelectedSensorIndex(idx)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedSensorIndex === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {sensor.lga} • {sensor.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Selected Sensor Telemetry Box */}
        <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/20 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                <MapPin className="size-3.5 text-blue-400 shrink-0" />
                {activeSensor.name}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{activeSensor.location} ({activeSensor.lga} LGA)</div>
            </div>
            {getStatusBadge(activeSensor.status)}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-300">Water Depth: <strong className="text-white">{activeSensor.waterLevelCm} cm</strong></span>
              <span className="text-slate-400">Threshold: {activeSensor.maxThresholdCm} cm ({percentage}%)</span>
            </div>
            <Progress value={percentage} className="h-2 bg-slate-800" />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-slate-300">
            <div className="flex items-center gap-1.5">
              <Activity className="size-3.5 text-blue-400" />
              <span>Flow: <strong>{activeSensor.flowVelocityMs} m/s</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              <span>Drainage Clear: <strong>{activeSensor.drainageHealthPercent}%</strong></span>
            </div>
          </div>
        </div>

        {/* Link to Full FloodSense Dashboard */}
        <Link href="/floodsense" className="block">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs py-2 h-auto rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/30">
            Open Full FloodSense AKS & Radar
            <ArrowUpRight className="size-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
