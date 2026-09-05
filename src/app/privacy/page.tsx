'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, FileText, CheckCircle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
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
            <Link href="/terms" className="text-xs font-bold text-slate-600 hover:text-green-700 underline">
              Terms of Service
            </Link>
            <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
              <Shield className="size-3.5" />
              NDPR Compliant
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-green-900 via-emerald-800 to-slate-900 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-300 mb-4">
            <Lock className="size-3.5" /> Legal & Transparency
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            Privacy Policy
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base max-w-2xl leading-relaxed">
            Ibom Power Hub is committed to safeguarding your personal data, civic communications, and financial telemetry in accordance with the Nigeria Data Protection Act (NDPA 2023).
          </p>
          <p className="text-xs text-emerald-300/80 mt-4 font-mono">
            Last Updated: {lastUpdated} • Version 1.0.0
          </p>
        </div>
      </div>

      {/* Content Body */}
      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        {/* Quick Highlights Card */}
        <Card className="border-emerald-100 bg-emerald-50/40 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h2 className="text-base font-black text-emerald-950 mb-3 flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-600" /> Summary of Core Guarantees
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm text-emerald-900/90">
              <li className="flex items-start gap-2">
                <span className="font-black text-emerald-600">✓</span>
                <span>We never sell your phone number, meter details, or location history.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-emerald-600">✓</span>
                <span>All wallet transactions are secured with 256-bit TLS and HMAC SHA-512.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-emerald-600">✓</span>
                <span>Location telemetry for FloodSense and Transit is captured only with explicit consent.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-black text-emerald-600">✓</span>
                <span>You can export or request full deletion of your profile anytime.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Section 1 */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <Database className="size-4" /> Section 1
          </div>
          <h2 className="text-xl font-bold text-slate-900">1. Information We Collect</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-3">
            <p>
              When you use Ibom Power Hub, we collect information necessary to provide state-wide municipal utilities, flood telemetry, flight reservations, and peer transfers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account Credentials:</strong> Full name, verified mobile number, email address, and authentication tokens.</li>
              <li><strong>Utility & Meter Telemetry:</strong> STS prepaid/postpaid electricity meter numbers, tariff band, disco provider (PHED / Ibom Power), and purchase history.</li>
              <li><strong>Transit & Flood Geolocation:</strong> Precise GPS coordinates when actively submitting a flood report or viewing live urban transit corridors. Geolocation is never gathered covertly in the background.</li>
              <li><strong>Travel Information:</strong> Passenger legal names, national identifiers, booking references (PNR), and seat selections for Ibom Air reservations.</li>
              <li><strong>Camera & Photo Uploads:</strong> Photos optionally captured to document municipal civic issues (e.g., collapsed power poles, flooded culverts).</li>
            </ul>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <Eye className="size-4" /> Section 2
          </div>
          <h2 className="text-xl font-bold text-slate-900">2. How We Use Your Data</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>Your data is processed strictly for the following legal and operational objectives:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Vending Standard Transfer Specification (STS) 20-digit electricity recharge tokens and dispatching them via SMS and local storage vault.</li>
              <li>Issuing validated digital boarding passes and generating terminal gate QR codes for Ibom Air flights.</li>
              <li>Aggregating anonymous municipal flood hazard warnings for emergency responders at SEMA and Ministry of Environment.</li>
              <li>Facilitating near-field peer payment transfers (AirSend) between validated citizens.</li>
            </ul>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <Lock className="size-4" /> Section 3
          </div>
          <h2 className="text-xl font-bold text-slate-900">3. Financial Security & Payment Processing</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>
              Ibom Power Hub does not store raw credit/debit card PINs or CVV codes. All card processing is handled by licensed PCI-DSS Level 1 compliant payment gateways (Paystack / Central Bank of Nigeria authorized switches). 
            </p>
            <p>
              Webhook telemetry dispatched to our API is verified through cryptographic HMAC SHA-512 signatures to prevent duplicate billing or fraudulent credits.
            </p>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <Globe className="size-4" /> Section 4
          </div>
          <h2 className="text-xl font-bold text-slate-900">4. User Rights & Data Deletion</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-2">
            <p>
              Under the Nigeria Data Protection Act (NDPA), you maintain full sovereignty over your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Right to Rectification:</strong> Update your profile, notification channels, and registered meter numbers at any time in the app profile.</li>
              <li><strong>Right to Erasure (Account Deletion):</strong> You may request complete deletion of your profile, stored tokens, and transaction archives by emailing <span className="font-mono text-green-700">privacy@ibompowerhub.gov.ng</span>.</li>
              <li><strong>Local Device Storage:</strong> Offline Vault tokens and boarding passes stored locally in your device sandbox can be wiped immediately via the in-app cache clearing button.</li>
            </ul>
          </div>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-green-700 font-black text-sm uppercase tracking-wider">
            <FileText className="size-4" /> Section 5
          </div>
          <h2 className="text-xl font-bold text-slate-900">5. Contact Data Protection Officer (DPO)</h2>
          <div className="text-sm text-slate-600 leading-relaxed space-y-1">
            <p>For questions, privacy grievances, or regulatory inquiries, contact:</p>
            <p className="font-semibold text-slate-900">Office of the Data Protection Officer</p>
            <p>Ibom Power Hub & Smart City Directorate</p>
            <p>State Secretariat Complex, Uyo, Akwa Ibom State, Nigeria</p>
            <p className="text-green-700 font-medium">Email: privacy@ibompowerhub.gov.ng</p>
          </div>
        </section>
      </main>
    </div>
  );
}
