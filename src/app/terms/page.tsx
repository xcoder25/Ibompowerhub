'use client';

import Link from 'next/link';
import { ArrowLeft, FileCheck, Scale, AlertCircle, Zap, Plane, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function TermsOfServicePage() {
  const lastUpdated = "September 5, 2026";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 font-bold text-slate-700 hover:text-green-700">
              <ArrowLeft className="size-4" />
              Back to Hub
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="text-xs font-bold text-slate-600 hover:text-green-700 underline">
              Privacy Policy
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Scale className="size-3.5" />
              Terms of Service
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-green-950 to-slate-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
            <FileCheck className="size-3.5" /> User Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            Terms of Service
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
            Please read these Terms of Service carefully before utilizing Ibom Power Hub for electricity vending, flight reservations, civic reporting, and wallet transfers.
          </p>
          <p className="text-xs text-emerald-300/80 mt-4 font-mono">
            Effective Date: {lastUpdated} • Version 1.0.0
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        <Card className="border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6 text-sm text-slate-600 leading-relaxed space-y-4">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Scale className="size-5 text-green-700" /> Acceptance of Terms
            </h2>
            <p>
              By accessing, installing, or executing financial transactions on the Ibom Power Hub platform (available via web, Android APK, and iOS package), you agree to comply with and be bound by these terms. If you do not accept these terms, you must refrain from using the application.
            </p>
          </CardContent>
        </Card>

        {/* Section 1: Power Vending */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <Zap className="size-4" /> Section 1
          </div>
          <h2 className="text-xl font-bold text-slate-900">1. Electricity Token Vending & Utility Terms</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              Ibom Power Hub operates as an authorized vending switch interface interacting with Port Harcourt Electricity Distribution Company (PHED) and independent generation networks across Akwa Ibom State.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Meter Validation:</strong> You are responsible for inputting the correct 11 or 13-digit STS meter number. Vended tokens generated for incorrectly entered meter numbers are non-reversible under standard NERC utility guidelines.</li>
              <li><strong>Offline Vault Guarantee:</strong> Once a 20-digit STS token is generated, it is automatically cached in your device’s Offline Zero-Data Vault for input at the physical keypad even during total telecom blackouts.</li>
              <li><strong>Tariff & VAT:</strong> Value Added Tax (7.5%) and regulatory band rates apply to all energy purchases as mandated by the Nigerian Electricity Regulatory Commission (NERC).</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Flights */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <Plane className="size-4" /> Section 2
          </div>
          <h2 className="text-xl font-bold text-slate-900">2. Ibom Air Ticketing & Gate Procedures</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              Flight schedules, bookings, and digital boarding passes are governed by civil aviation laws and Ibom Air’s passenger charter:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Check-in & Gate Arrival:</strong> Boarding gates at Victor Attah International Airport (QUO), Murtala Muhammed Airport (LOS), and Nnamdi Azikiwe Airport (ABV) close 30 minutes prior to scheduled departure.</li>
              <li><strong>Digital Boarding Pass:</strong> Boarding pass QR codes saved to your Offline Vault are valid for terminal gate scanning when presented with a matching government-issued photo ID (NIN, Driver’s License, or International Passport).</li>
              <li><strong>Cancellations & Rescheduling:</strong> Flight modifications are subject to airline fare conditions and seat availability.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Civic Reporting & FloodSense */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <AlertCircle className="size-4" /> Section 3
          </div>
          <h2 className="text-xl font-bold text-slate-900">3. FloodSense & Civic Incident Reporting</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              Users submitting environmental reports, culvert blockages, flood depths, or utility faults agree to provide truthful and authentic observations:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Submitting fraudulent emergency reports or misleading hazard alerts is strictly prohibited and subject to civil penalties.</li>
              <li>Images uploaded to the civic reporting feed grant the State Government and municipal maintenance units license to review and dispatch rapid-response teams.</li>
            </ul>
          </div>
        </section>

        {/* Section 4: Wallet & Peer Transfers */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <ShieldAlert className="size-4" /> Section 4
          </div>
          <h2 className="text-xl font-bold text-slate-900">4. Wallet & Peer Transfers (AirSend)</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              All stored-value wallet accounts in Ibom Power Hub must belong to authenticated individuals:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You are exclusively responsible for maintaining the confidentiality of your device and login credentials.</li>
              <li>AirSend near-field transfers executed between active sessions are immediate and irrevocable once confirmed by your authorization.</li>
            </ul>
          </div>
        </section>

        {/* Section 5: Jurisdiction */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">5. Governing Law & Jurisdiction</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            These Terms are governed by and construed in accordance with the laws of Akwa Ibom State and the Federal Republic of Nigeria. Any disputes arising shall be submitted to the exclusive jurisdiction of the state courts in Uyo, Akwa Ibom State.
          </p>
        </section>
      </main>
    </div>
  );
}
