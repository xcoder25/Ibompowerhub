import Link from 'next/link';
import Image from 'next/image';
import { services } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  ArrowRight, Zap, Building2, HeartPulse, GraduationCap, ShoppingBag,
  Shield, Plane, Droplets, Trash2, Globe, Search, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const serviceIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  government: Building2, health: HeartPulse, education: GraduationCap,
  market: ShoppingBag, safety: Shield, flights: Plane, water: Droplets,
  waste: Trash2, power: Zap,
};

const statsRow = [
  { value: '200+', label: 'Services Available' },
  { value: '31', label: 'LGAs Covered' },
  { value: '10K+', label: 'Active Users' },
  { value: '99.9%', label: 'Uptime' },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-green-300/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white p-8 md:p-14 mb-10 shadow-2xl shadow-green-900/30">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5 text-white text-xs font-bold uppercase tracking-widest">
              <Zap className="h-3.5 w-3.5 text-orange-300" />
              ARISE Agenda Digital Services
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
              All Services.
              <br />
              <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                One Platform.
              </span>
            </h1>
            <p className="text-white/75 text-lg max-w-xl mb-8">
              Access all Akwa Ibom State government, community, and digital services — fast, secure, and always available.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl">
              {statsRow.map(({ value, label }) => (
                <div key={label} className="bg-white/10 border border-white/20 rounded-2xl p-4 text-center backdrop-blur-sm">
                  <p className="text-2xl font-black text-orange-300">{value}</p>
                  <p className="text-white/60 text-xs font-medium">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const image = PlaceHolderImages.find((img) => img.id === service.iconId);
            const serviceKey = service.href?.replace('/', '') || '';
            const ServiceIcon = serviceIconMap[serviceKey] || Globe;

            return (
              <Link key={service.id} href={service.href}>
                <div className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                  {/* Image or Icon Banner */}
                  <div className="relative h-40 overflow-hidden">
                    {image ? (
                      <Image
                        src={image.imageUrl}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
                        <ServiceIcon className="size-16 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/30">
                        <ServiceIcon className="size-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-slate-900 text-lg mb-1">{service.name}</h3>
                    <p className="text-sm text-slate-500 flex-1 mb-4 leading-relaxed">{service.description}</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-green-700 group-hover:gap-3 transition-all">
                      Explore Service <ChevronRight className="size-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-orange-500/25">
          <Globe className="size-12 text-white/90 mx-auto mb-4" />
          <h3 className="text-2xl font-black mb-2">Can&apos;t Find a Service?</h3>
          <p className="text-white/80 mb-6 max-w-sm mx-auto">
            Contact the AKS digital services helpdesk or report a missing service.
          </p>
          <Link href="/report">
            <Button className="bg-white text-orange-600 hover:bg-orange-50 font-black rounded-2xl px-8 h-12 shadow-lg gap-2">
              Contact Us <ArrowRight className="size-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
