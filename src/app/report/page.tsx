'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLoading } from '@/context/loading-context';
import { AlertTriangle, Send, CheckCircle2, FileText, Building2, Zap, Droplets, Route, MapPin, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const reportCategories = [
  { value: 'works', label: 'Ministry of Works & Housing', icon: Building2 },
  { value: 'health', label: 'Ministry of Health', icon: CheckCircle2 },
  { value: 'education', label: 'Ministry of Education', icon: FileText },
  { value: 'transport', label: 'Ministry of Transport', icon: Route },
  { value: 'water', label: 'Ministry of Water (AKSG Water)', icon: Droplets },
  { value: 'power', label: 'Power Authority (AEDC)', icon: Zap },
];

const quickReports = [
  { label: 'Flooding', icon: Droplets, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { label: 'Power Outage', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { label: 'Road Damage', icon: Route, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { label: 'Public Safety', icon: AlertTriangle, color: 'text-red-600 bg-red-50 border-red-200' },
];

export default function ReportPage() {
  const { isLoading, setIsLoading } = useLoading();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
      toast({ title: '✅ Report Submitted', description: 'Thank you for helping improve Akwa Ibom State!' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-red-300/15 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-green-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-4 py-1.5 mb-4 text-red-800 text-xs font-bold uppercase tracking-widest">
            <AlertTriangle className="h-3.5 w-3.5" />
            Citizen Issue Reporting
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">
            Report an{' '}
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Issue
            </span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl">
            Found a problem? Submit a report directly to the relevant Ministry, Department, or Agency in Akwa Ibom State.
          </p>
        </div>

        {/* Quick Report Buttons */}
        <div className="mb-8">
          <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-3">Quick Report</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickReports.map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${color}`}
              >
                <Icon className="size-6" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Form */}
        {submitted ? (
          <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl p-10 shadow-sm text-center">
            <div className="size-20 rounded-3xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-500/25">
              <CheckCircle2 className="size-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Report Submitted!</h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Your report has been successfully submitted to the relevant agency. You will receive updates on the progress.
            </p>
            <div className="flex items-center gap-3 justify-center">
              <Button
                onClick={() => setSubmitted(false)}
                variant="outline"
                className="rounded-xl border-slate-200 font-bold"
              >
                Submit Another
              </Button>
              <Button className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold shadow-md gap-2">
                Track Report <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl p-8 shadow-sm space-y-6">
              {/* Ministry Select */}
              <div className="space-y-2">
                <Label className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Ministry / Department / Agency
                </Label>
                <Select required>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium">
                    <SelectValue placeholder="Select the relevant agency..." />
                  </SelectTrigger>
                  <SelectContent>
                    {reportCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="font-medium">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-orange-500" />
                  <Input
                    className="pl-11 h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium"
                    placeholder="e.g. Uyo, Eket, Ikot Ekpene..."
                  />
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Report Title
                </Label>
                <Input
                  id="title"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50/50 font-medium"
                  placeholder="Give your report a clear, descriptive title"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-slate-800 text-sm uppercase tracking-wide">
                  Description
                </Label>
                <Textarea
                  id="description"
                  className="rounded-xl border-slate-200 bg-slate-50/50 font-medium min-h-[140px]"
                  placeholder="Describe the issue in detail — what happened, when, and the impact on the community..."
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-slate-200 font-bold h-12 flex-1"
                  onClick={() => history.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-black shadow-lg shadow-green-500/20 h-12 flex-1 gap-2"
                >
                  {isLoading ? (
                    <><span className="animate-spin rounded-full size-4 border-2 border-white border-t-transparent" /> Submitting...</>
                  ) : (
                    <><Send className="size-4" /> Submit Report</>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-orange-50/70 border border-orange-200/60 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="size-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-orange-800 text-sm">For emergencies, call 112</p>
            <p className="text-orange-700/70 text-xs mt-0.5">Use this form only for non-emergency community issues. In case of immediate danger, please call emergency services.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
