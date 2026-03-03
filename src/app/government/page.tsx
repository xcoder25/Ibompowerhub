
import { Button } from "@/components/ui/button";
import { GOVERNMENT_SERVICES } from "@/lib/government";
import {
  Check,
  CircleUser,
  FileText,
  Landmark,
  MessageSquareWarning,
  Shield,
  ChevronRight,
  ArrowRight,
  Building2,
  Zap,
  BadgeCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

const quickLinks = [
  { icon: CircleUser, label: "Link Your ID", desc: "Connect National ID or state credentials", color: "from-green-500 to-green-700", shadow: "shadow-green-500/25", href: "/kyc" },
  { icon: FileText, label: "Apply for Services", desc: "Permits, certificates & licenses", color: "from-orange-500 to-orange-600", shadow: "shadow-orange-500/25", href: "#services" },
  { icon: Check, label: "Track Application", desc: "Real-time application status", color: "from-emerald-500 to-emerald-700", shadow: "shadow-emerald-500/25", href: "#track" },
  { icon: Landmark, label: "Pay Taxes & Fees", desc: "Secure digital revenue platform", color: "from-amber-500 to-amber-600", shadow: "shadow-amber-500/25", href: "#payments" },
];

const stats = [
  { value: "31", label: "LGAs Served", icon: Building2 },
  { value: "4M+", label: "Citizens", icon: Users },
  { value: "200+", label: "Services", icon: Zap },
  { value: "100%", label: "Secure", icon: BadgeCheck },
];

export default function GovernmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/40 to-orange-50/20 relative overflow-hidden">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-green-300/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-12">

        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white p-8 md:p-14 shadow-2xl shadow-green-900/30">
          {/* Overlay pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-400/20 blur-3xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-6 text-white text-xs font-bold uppercase tracking-widest">
              <Shield className="h-3.5 w-3.5 text-orange-300" />
              ARISE Agenda — E-Government
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 leading-tight">
              E-Service Portal
              <br />
              <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                Akwa Ibom State
              </span>
            </h1>
            <p className="text-white/75 text-lg max-w-xl mb-8 leading-relaxed">
              Your one-stop digital gateway to all Akwa Ibom government services — fast, secure, and paperless.
            </p>
            <Button className="bg-orange-500 hover:bg-orange-400 text-white font-black rounded-2xl px-8 h-12 shadow-xl shadow-orange-500/30 gap-2">
              Get Started <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            >
              <div className="size-10 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                <Icon className="size-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Access Cards */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
            <Zap className="size-6 text-orange-500" />
            Quick Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map(({ icon: Icon, label, desc, color, shadow, href }) => (
              <Link key={label} href={href}>
                <div className="group bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                  <div className={`size-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg ${shadow} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <h3 className="font-black text-slate-900 mb-1">{label}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-bold text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ChevronRight className="size-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Service List */}
        <div id="services">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FileText className="size-6 text-green-700" />
              Available Services
            </h2>
            <span className="text-sm text-slate-500 font-medium">{GOVERNMENT_SERVICES.length} services</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {GOVERNMENT_SERVICES.map((service) => (
              <div
                key={service.name}
                className="group bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex items-center justify-between gap-4 hover:shadow-lg hover:border-green-200 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200 flex items-center justify-center flex-shrink-0 group-hover:from-green-100 group-hover:to-green-200 transition-colors">
                    <FileText className="size-5 text-green-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-slate-500">{service.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-md shadow-green-500/20 flex-shrink-0 gap-1"
                >
                  Apply <ChevronRight className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Track & Pay Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Track Application */}
          <div id="track" className="bg-white/70 backdrop-blur-md border border-white/80 rounded-3xl p-8 hover:shadow-xl transition-all">
            <div className="size-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-5">
              <Check className="size-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">Track Applications</h3>
            <p className="text-slate-500 mb-6 leading-relaxed">
              Check the real-time status of your permits, certificates, and licenses — anywhere, anytime.
            </p>
            <Button className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold shadow-md gap-2">
              Track Now <ChevronRight className="size-4" />
            </Button>
          </div>

          {/* Feedback */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/25 hover:shadow-2xl hover:shadow-orange-500/30 transition-all">
            <div className="size-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-5">
              <MessageSquareWarning className="size-7 text-white" />
            </div>
            <h3 className="text-xl font-black mb-2">Report an Issue</h3>
            <p className="text-white/80 mb-6 leading-relaxed">
              Submit complaints and service requests directly to relevant MDAs across Akwa Ibom State.
            </p>
            <Button className="rounded-xl bg-white text-orange-600 hover:bg-orange-50 font-bold shadow-md gap-2">
              <Link href="/report" className="flex items-center gap-2">
                Submit Report <ChevronRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Digital Payments */}
        <div id="payments" className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-green-900/30">
          <div className="absolute right-8 top-1/2 -translate-y-1/2 size-48 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="size-14 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-4">
                <Landmark className="size-7" />
              </div>
              <h3 className="text-2xl font-black mb-2">Digital Payments & Revenue</h3>
              <p className="text-white/70 max-w-lg leading-relaxed">
                Pay your state taxes, levies, and government fees securely through our Paystack-powered digital revenue platform.
              </p>
            </div>
            <Button className="rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black px-8 h-12 shadow-xl shadow-orange-500/30 gap-2 flex-shrink-0">
              Pay Taxes & Fees <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
