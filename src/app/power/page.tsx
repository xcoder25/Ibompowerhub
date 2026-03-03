
import { powerSchedule } from '@/lib/data';
import { Power, Zap, ZapOff, AlertTriangle, CheckCircle2, Clock, MapPin, ChevronRight, Battery, BatteryFull } from 'lucide-react';

export default function PowerPage() {
  const onPercent = 42;
  const offPercent = 58;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-amber-300/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-green-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-4 text-amber-800 text-xs font-bold uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" />
            AKS Power Services
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
            Power{' '}
            <span className="bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
              Services
            </span>
          </h1>
          <p className="text-slate-500 text-lg">
            Real-time power status, outage schedules, and load shedding information for Akwa Ibom State.
          </p>
        </div>

        {/* Live Status Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white p-8 shadow-2xl shadow-green-900/30">
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="size-16 rounded-2xl bg-green-400/30 border border-green-300/40 flex items-center justify-center backdrop-blur">
                <Power className="size-8 text-green-200" />
              </div>
              <div>
                <p className="text-white/60 text-sm font-bold uppercase tracking-widest mb-1">Federal Housing, Group A</p>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-green-400/30 border border-green-300/40 text-green-200 text-sm font-bold px-3 py-1 rounded-full">
                    <CheckCircle2 className="size-4" /> Power is ON
                  </span>
                </div>
                <p className="text-white/60 text-sm mt-2 flex items-center gap-1.5">
                  <Clock className="size-4" /> Next outage in 4 hours
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Last Updated</p>
              <p className="text-white font-black text-lg">Just now</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Power ON */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20">
                <BatteryFull className="size-6 text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900">Today&apos;s Runtime</p>
                <p className="text-xs text-slate-500">Total hours with power</p>
              </div>
            </div>
            <p className="text-4xl font-black text-green-600 mb-2">10 hrs</p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all"
                style={{ width: `${onPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">{onPercent}% of the day</p>
          </div>

          {/* Power OFF */}
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
                <ZapOff className="size-6 text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900">Total Outage</p>
                <p className="text-xs text-slate-500">Hours without power</p>
              </div>
            </div>
            <p className="text-4xl font-black text-red-500 mb-2">14 hrs</p>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all"
                style={{ width: `${offPercent}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-medium">{offPercent}% of the day</p>
          </div>

          {/* Next Outage */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 shadow-xl shadow-orange-500/25 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <p className="font-black">Next Outage</p>
                <p className="text-white/70 text-xs">Scheduled maintenance</p>
              </div>
            </div>
            <p className="text-4xl font-black mb-1">4:00 PM</p>
            <p className="text-white/80 text-sm flex items-center gap-1.5">
              <Clock className="size-4" /> Duration: 6 hours
            </p>
            <p className="text-white/70 text-xs mt-2">Affecting Groups A, B, C</p>
          </div>
        </div>

        {/* Load Shedding Schedule */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Zap className="size-5 text-white" />
              </div>
              <div>
                <h2 className="font-black text-slate-900 text-xl">Load Shedding Schedule</h2>
                <p className="text-sm text-slate-500">Find out when to expect power in your area</p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Area</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Group</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 text-green-700"><CheckCircle2 className="size-3.5" /> Power ON</span>
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 text-red-600"><ZapOff className="size-3.5" /> Power OFF</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {powerSchedule.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-green-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-orange-500 flex-shrink-0" />
                        <span className="font-bold text-slate-900">{item.area}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                        Group {item.group}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-green-700 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="size-4" /> {item.in}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-red-600 font-bold flex items-center gap-1.5">
                        <ZapOff className="size-4" /> {item.out}
                      </span>
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
