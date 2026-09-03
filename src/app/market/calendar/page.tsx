'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar as CalendarIcon, ShoppingBag, TrendingUp, TrendingDown, 
  Minus, MapPin, Clock, Users, Sparkles, ArrowUpRight, Search, 
  ShoppingBasket, Store
} from 'lucide-react';
import { 
  TRADITIONAL_MARKETS, COMMODITY_PRICES, TRADITIONAL_CYCLE_DAYS, 
  getTodaysTraditionalCycle, TraditionalMarket, CommodityPrice 
} from '@/lib/market-calendar-data';

export default function MarketCalendarPage() {
  const { currentDay, todayMarkets } = getTodaysTraditionalCycle();
  const [selectedCycleIndex, setSelectedCycleIndex] = useState<number>(currentDay.index);
  const [commoditySearch, setCommoditySearch] = useState('');

  const selectedDayInfo = TRADITIONAL_CYCLE_DAYS[selectedCycleIndex];
  const marketsForSelectedDay = TRADITIONAL_MARKETS.filter(
    m => m.cycleDayIndex === selectedCycleIndex || m.isDailyPartial
  );

  const filteredCommodities = COMMODITY_PRICES.filter(cmd => 
    cmd.item.toLowerCase().includes(commoditySearch.toLowerCase()) ||
    cmd.localName.toLowerCase().includes(commoditySearch.toLowerCase()) ||
    cmd.topMarketLocation.toLowerCase().includes(commoditySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Store className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Akwa Ibom Market Calendar</h1>
                  <Badge className="bg-amber-600 text-white font-black text-[10px] uppercase px-2">8-Day Native Cycle</Badge>
                </div>
                <p className="text-xs md:text-sm text-slate-400">
                  Traditional 8-day rotation (Urua cycle), market days across all LGAs, and live staple commodity price tracker
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/market">
              <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:text-white text-xs h-9">
                <ShoppingBasket className="size-3.5 mr-1.5 text-amber-400" />
                AgroConnect Store
              </Button>
            </Link>
          </div>
        </div>

        {/* Today's Traditional Cycle Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-emerald-950/40 border border-amber-500/30 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                Today's Traditional Akwa Ibom Market Day
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-1">
                {currentDay.name} ({currentDay.meaning})
              </h2>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1">
              Active Trade Day
            </Badge>
          </div>

          <p className="text-xs text-slate-300">
            Major open markets trading today: <strong className="text-white">{todayMarkets.map(m => m.name.split(' ')[0]).join(', ')}</strong>. Fresh supplies of seafood, palm produce, and garri arriving daily.
          </p>
        </div>

        {/* 8-Day Cycle Navigation Buttons */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Explore 8-Day Rotation Cycle:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {TRADITIONAL_CYCLE_DAYS.map((day) => {
              const isToday = day.index === currentDay.index;
              const isSelected = day.index === selectedCycleIndex;

              return (
                <button
                  key={day.index}
                  onClick={() => setSelectedCycleIndex(day.index)}
                  className={`p-3 rounded-2xl border text-center transition-all relative ${
                    isSelected
                      ? 'bg-amber-600 text-white font-bold border-amber-400 shadow-lg shadow-amber-950/50'
                      : isToday
                      ? 'bg-slate-900 border-amber-500/50 text-amber-300 hover:bg-slate-800'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {isToday && (
                    <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 text-[8px] bg-amber-500 text-slate-950 rounded-full font-black uppercase">
                      Today
                    </span>
                  )}
                  <div className="text-xs font-bold">{day.name}</div>
                  <div className="text-[10px] opacity-75 mt-0.5">Day {day.index + 1}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Markets for Selected Day */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">
                Markets on {selectedDayInfo.name} ({marketsForSelectedDay.length})
              </h3>
              <p className="text-xs text-slate-400">{selectedDayInfo.meaning}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketsForSelectedDay.map(mkt => (
              <Card key={mkt.id} className="bg-slate-900/80 border-white/10 hover:border-amber-500/30 transition-all">
                <CardHeader className="pb-3 border-b border-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-400 font-bold mb-1">
                        {mkt.cycleDayName} Day
                      </Badge>
                      <CardTitle className="text-base font-bold text-white">{mkt.name}</CardTitle>
                      <CardDescription className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 text-slate-500 shrink-0" />
                        {mkt.location} ({mkt.lga})
                      </CardDescription>
                    </div>
                    <Badge className={`text-[10px] font-bold shrink-0 ${
                      mkt.crowdLevel === 'Very High' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {mkt.crowdLevel} Traffic
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-3.5 space-y-3 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">Specialty Produce:</span>
                    <div className="flex flex-wrap gap-1">
                      {mkt.specialtyProduce.map(prod => (
                        <span key={prod} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 text-[10px] border border-white/5">
                          {prod}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3 text-slate-500" />
                      {mkt.tradingHours}
                    </span>
                    {mkt.isDailyPartial && (
                      <span className="text-emerald-400 font-medium">Daily Operations</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Section 2: Live Commodity Price Index */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="size-5 text-emerald-400" />
                Akwa Ibom Staple Commodity Price Index
              </h3>
              <p className="text-xs text-slate-400">
                Verified wholesale and retail pricing benchmarked across Urua Itam, Akpan Andem, Oron Beach, and Urua Anwa
              </p>
            </div>

            <div className="w-full sm:w-64">
              <Input
                value={commoditySearch}
                onChange={e => setCommoditySearch(e.target.value)}
                placeholder="Search food item or market..."
                className="bg-slate-900 border-white/10 text-xs h-9 text-white placeholder:text-slate-500 rounded-xl"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCommodities.map(cmd => {
              const isUp = cmd.priceTrend === 'UP';
              const isDown = cmd.priceTrend === 'DOWN';

              return (
                <Card key={cmd.id} className="bg-slate-900/80 border-white/10 hover:border-emerald-500/30 transition-all">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{cmd.item}</h4>
                        <div className="text-xs text-emerald-400 font-medium italic mt-0.5">{cmd.localName}</div>
                      </div>
                      <Badge className={`text-[10px] font-bold flex items-center gap-1 ${
                        isUp 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                          : isDown 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {isUp && <TrendingUp className="size-3" />}
                        {isDown && <TrendingDown className="size-3" />}
                        {!isUp && !isDown && <Minus className="size-3" />}
                        {cmd.priceTrend}
                      </Badge>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-400">{cmd.unit}</span>
                        <span className="text-lg font-black text-white">₦{cmd.currentAvgPriceNgn.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between">
                        <span>Prev week: ₦{cmd.prevWeekPriceNgn.toLocaleString()}</span>
                        <span>Updated {cmd.lastUpdated}</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="size-3 text-amber-400 shrink-0" />
                      <span>Best price at: <strong className="text-slate-200">{cmd.topMarketLocation}</strong></span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
