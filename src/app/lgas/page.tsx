'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Building2, MapPin, Search, PhoneCall, Users, 
  Sparkles, Layers, Landmark, ArrowRight, ShieldCheck, 
  ShoppingBag, Waves, Navigation
} from 'lucide-react';
import { AKWA_IBOM_LGAS, LGAInfo } from '@/lib/lga-data';

export default function LGAsExplorerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<'ALL' | 'Uyo (North-East)' | 'Ikot Ekpene (North-West)' | 'Eket (South)'>('ALL');
  const [selectedLGA, setSelectedLGA] = useState<LGAInfo | null>(null);

  const filteredLGAs = AKWA_IBOM_LGAS.filter(lga => {
    const matchesDistrict = selectedDistrict === 'ALL' || lga.senatorialDistrict === selectedDistrict;
    const matchesSearch = 
      lga.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lga.headquarters.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lga.notableLandmarks.some(lm => lm.toLowerCase().includes(searchQuery.toLowerCase())) ||
      lga.keyResources.some(r => r.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDistrict && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Landmark className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">31 LGAs of Akwa Ibom</h1>
                  <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase px-2">State Directory</Badge>
                </div>
                <p className="text-xs md:text-sm text-slate-400">
                  Explore local councils, economic resources, headquarters, and emergency hotlines across all 3 Senatorial Districts
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/map">
              <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:text-white text-xs h-9">
                <Navigation className="size-3.5 mr-1.5" />
                View on Map
              </Button>
            </Link>
          </div>
        </div>

        {/* Senatorial District Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setSelectedDistrict(selectedDistrict === 'Uyo (North-East)' ? 'ALL' : 'Uyo (North-East)')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedDistrict === 'Uyo (North-East)'
                ? 'bg-emerald-950/60 border-emerald-500/50 shadow-lg shadow-emerald-950/40'
                : 'bg-slate-900/80 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-none font-bold text-[10px]">Uyo Senatorial District</Badge>
              <span className="text-xs font-bold text-slate-400">9 LGAs</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-2">Akwa Ibom North-East</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">Capital territory, ICT innovation, golf tourism, and administrative center.</p>
          </button>

          <button
            onClick={() => setSelectedDistrict(selectedDistrict === 'Ikot Ekpene (North-West)' ? 'ALL' : 'Ikot Ekpene (North-West)')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedDistrict === 'Ikot Ekpene (North-West)'
                ? 'bg-orange-950/60 border-orange-500/50 shadow-lg shadow-orange-950/40'
                : 'bg-slate-900/80 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge className="bg-orange-500/20 text-orange-300 border-none font-bold text-[10px]">Ikot Ekpene Senatorial District</Badge>
              <span className="text-xs font-bold text-slate-400">10 LGAs</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-2">Akwa Ibom North-West</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">The Raffia City, Annangland heritage, rice food basket, and tertiary education.</p>
          </button>

          <button
            onClick={() => setSelectedDistrict(selectedDistrict === 'Eket (South)' ? 'ALL' : 'Eket (South)')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedDistrict === 'Eket (South)'
                ? 'bg-blue-950/60 border-blue-500/50 shadow-lg shadow-blue-950/40'
                : 'bg-slate-900/80 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <Badge className="bg-blue-500/20 text-blue-300 border-none font-bold text-[10px]">Eket Senatorial District</Badge>
              <span className="text-xs font-bold text-slate-400">12 LGAs</span>
            </div>
            <h3 className="text-sm font-bold text-white mt-2">Akwa Ibom South</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">Oil & gas terminals, Ibom Deep Seaport, Ibeno beach, and maritime trade.</p>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by LGA name, headquarters, landmark, or mineral resource..."
              className="bg-slate-900 border-white/10 pl-10 text-xs h-10 text-white placeholder:text-slate-500 rounded-xl"
            />
          </div>
          {selectedDistrict !== 'ALL' && (
            <Button
              onClick={() => setSelectedDistrict('ALL')}
              variant="ghost"
              className="text-xs text-slate-400 hover:text-white shrink-0"
            >
              Reset District Filter
            </Button>
          )}
        </div>

        {/* LGA Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLGAs.map(lga => (
            <Card
              key={lga.id}
              className="bg-slate-900/80 border-white/10 hover:border-emerald-500/40 transition-all hover:shadow-xl group cursor-pointer"
              onClick={() => setSelectedLGA(lga)}
            >
              <CardHeader className="pb-3 border-b border-white/5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge variant="outline" className="text-[10px] border-white/10 text-slate-400 mb-1">
                      {lga.senatorialDistrict}
                    </Badge>
                    <CardTitle className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {lga.name}
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-emerald-400 shrink-0" />
                      HQ: <strong>{lga.headquarters}</strong>
                    </CardDescription>
                  </div>
                  <div className="p-2 rounded-xl bg-white/5 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                    <Building2 className="size-4" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-3.5 space-y-3 text-xs">
                <p className="text-slate-300 line-clamp-2 leading-relaxed">{lga.description}</p>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Key Economic Resources:</div>
                  <div className="flex flex-wrap gap-1">
                    {lga.keyResources.slice(0, 3).map(res => (
                      <span key={res} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] font-medium border border-white/5">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Top Landmarks:</div>
                  <div className="text-slate-300 text-[11px] line-clamp-1">
                    {lga.notableLandmarks.slice(0, 2).join(' • ')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Users className="size-3 text-slate-500" />
                    Pop: {lga.populationEstimate}
                  </span>
                  <a
                    href={`tel:${lga.emergencyContact}`}
                    onClick={e => e.stopPropagation()}
                    className="text-emerald-400 font-semibold hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <PhoneCall className="size-3" />
                    Emergency Hotline
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected LGA Detail Modal Preview */}
        {selectedLGA && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                <div>
                  <Badge className="bg-emerald-600/20 text-emerald-400 text-[10px] font-bold border-none">
                    {selectedLGA.senatorialDistrict}
                  </Badge>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedLGA.name} LGA</h2>
                  <p className="text-xs text-slate-400">Headquarters: {selectedLGA.headquarters}</p>
                </div>
                <button
                  onClick={() => setSelectedLGA(null)}
                  className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Profile Overview</h4>
                  <p className="leading-relaxed">{selectedLGA.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-950 border border-white/5">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Population</span>
                    <strong className="text-white text-sm">{selectedLGA.populationEstimate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Primary Dialect</span>
                    <strong className="text-emerald-400 text-sm">{selectedLGA.dialects.join(', ')}</strong>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Notable Landmarks</h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {selectedLGA.notableLandmarks.map(lm => (
                      <li key={lm}>{lm}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Major Traditional Markets</h4>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {selectedLGA.majorMarkets.map(mkt => (
                      <li key={mkt}>{mkt}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-1">Key Natural & Economic Assets</h4>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {selectedLGA.keyResources.map(res => (
                      <Badge key={res} variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                        {res}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex gap-2">
                <a href={`tel:${selectedLGA.emergencyContact}`} className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10 rounded-xl">
                    <PhoneCall className="size-4 mr-1.5" />
                    Call LGA Emergency Dispatch
                  </Button>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
