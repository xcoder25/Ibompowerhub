'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle, Send, CheckCircle2, FileText, Building2, Zap,
  Droplets, Route, MapPin, Target, Clock, ChevronRight, Loader2,
  BarChart2, ListChecks, RefreshCw, CircleDot
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useUser } from '@/firebase';
import {
  collection, addDoc, serverTimestamp,
  query, where, orderBy, onSnapshot, doc, Timestamp
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const reportCategories = [
  { value: 'works', label: 'Ministry of Works & Housing', icon: Building2 },
  { value: 'health', label: 'Ministry of Health', icon: CheckCircle2 },
  { value: 'education', label: 'Ministry of Education', icon: FileText },
  { value: 'transport', label: 'Ministry of Transport', icon: Route },
  { value: 'water', label: 'Ministry of Water (AKSG Water)', icon: Droplets },
  { value: 'power', label: 'Power Authority (AEDC)', icon: Zap },
];

const quickReports = [
  { label: 'Flooding', icon: Droplets, color: 'text-blue-500 hover:bg-blue-500/10' },
  { label: 'Power Outage', icon: Zap, color: 'text-amber-500 hover:bg-amber-500/10' },
  { label: 'Road Damage', icon: Route, color: 'text-orange-500 hover:bg-orange-500/10' },
  { label: 'Public Safety', icon: AlertTriangle, color: 'text-red-500 hover:bg-red-500/10' },
];

const STATUS_STEPS = [
  { key: 'submitted', label: 'Submitted', color: 'text-slate-500', bg: 'bg-slate-100' },
  { key: 'acknowledged', label: 'Acknowledged', color: 'text-blue-600', bg: 'bg-blue-100' },
  { key: 'in-progress', label: 'In Progress', color: 'text-orange-600', bg: 'bg-orange-100' },
  { key: 'resolved', label: 'Resolved', color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

type Report = {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  status: string;
  createdAt: any;
  referenceId: string;
};

function StatusBadge({ status }: { status: string }) {
  const step = STATUS_STEPS.find((s) => s.key === status) || STATUS_STEPS[0];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${step.bg} ${step.color}`}>
      <CircleDot className="size-2.5" />
      {step.label}
    </span>
  );
}

function StatusTimeline({ status }: { status: string }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-1 mt-3">
      {STATUS_STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center">
          <div className={`size-2.5 rounded-full transition-all ${i <= currentIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          {i < STATUS_STEPS.length - 1 && (
            <div className={`h-0.5 w-6 sm:w-8 mx-0.5 transition-all ${i < currentIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
        {STATUS_STEPS.find(s => s.key === status)?.label}
      </span>
    </div>
  );
}

export default function ReportPage() {
  const { toast } = useToast();
  const firestore = useFirestore();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastRef, setLastRef] = useState('');

  const [ministry, setMinistry] = useState('');
  const [location, setLocation] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [quickType, setQuickType] = useState('');

  const [myReports, setMyReports] = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  // Load user's own reports in real-time
  useEffect(() => {
    if (!firestore || !user) return;
    const q = query(
      collection(firestore, 'reports'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const list: Report[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Report));
      setMyReports(list);
      setReportsLoading(false);
    });
    return () => unsub();
  }, [firestore, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user || isSubmitting) return;

    setIsSubmitting(true);
    const refId = `AK-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    let lat = 4.9057;
    let lng = 7.8739;
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch (err) {
      // slightly randomize so multiple submissions don't overlap exactly
      lat = 4.9057 + (Math.random() - 0.5) * 0.04;
      lng = 7.8739 + (Math.random() - 0.5) * 0.04;
    }

    try {
      await addDoc(collection(firestore, 'reports'), {
        title: title || quickType,
        description,
        location,
        category: ministry || quickType.toLowerCase(),
        status: 'submitted',
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userEmail: user.email,
        referenceId: refId,
        type: quickType || 'general',
        upvotes: 0,
        commentsCount: 0,
        time: serverTimestamp(),
        createdAt: serverTimestamp(),
        latitude: lat,
        longitude: lng,
      });

      setLastRef(refId);
      setSubmitted(true);
      toast({ title: '✅ Report Submitted', description: `Reference: #${refId}` });
    } catch (err: any) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Submission Failed', description: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setMinistry('');
    setLocation('');
    setTitle('');
    setDescription('');
    setQuickType('');
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 relative overflow-hidden mesh-gradient">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none z-0" />

      <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-8 relative z-10 animate-in fade-in duration-1000 max-w-5xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-4 max-w-2xl">
            <Badge className="bg-red-600/10 text-red-600 border-none px-4 py-1.5 rounded-full font-black uppercase text-[10px] tracking-widest">
              Incident Reporting
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-slate-950 dark:text-white leading-none">
              REPORT<span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">ISSUE</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
              Submit civic disruptions to the relevant ministry. Track status in real-time.
            </p>
          </div>
        </div>

        <Tabs defaultValue="submit" className="space-y-6">
          <TabsList className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl border border-white/30 p-1 h-auto">
            <TabsTrigger value="submit" className="rounded-lg font-bold text-sm gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Send className="size-4" /> Submit Report
            </TabsTrigger>
            <TabsTrigger value="track" className="rounded-lg font-bold text-sm gap-2 data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <ListChecks className="size-4" />
              My Reports
              {myReports.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ml-1">
                  {myReports.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Submit Tab */}
          <TabsContent value="submit" className="space-y-6">
            {/* Quick Report Buttons */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 px-2">Rapid Classification</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {quickReports.map(({ label, icon: Icon, color }) => (
                  <button
                    key={label}
                    onClick={() => setQuickType(label)}
                    className={`flex flex-col items-center justify-center gap-3 p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border-2 shadow-sm font-bold text-xs sm:text-sm uppercase tracking-wider transition-all hover:-translate-y-1 hover:shadow-md ${color} ${quickType === label ? 'border-current scale-95 shadow-inner' : 'border-transparent'}`}
                  >
                    <div className="size-10 sm:size-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner">
                      <Icon className="size-5 sm:size-6" />
                    </div>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form */}
            {submitted ? (
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-8 md:p-10 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-24 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-6">
                  <div className="size-20 sm:size-24 rounded-3xl bg-emerald-500 flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="size-10 sm:size-12 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-950 dark:text-white mb-3 tracking-tighter">Transmission Successful</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base sm:text-lg">
                      Your report has been submitted. Reference ID{' '}
                      <span className="font-black text-emerald-500">#{lastRef}</span>
                    </p>
                    <p className="text-sm text-slate-400 mt-2">Track status in real-time under the &quot;My Reports&quot; tab.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 justify-center pt-4">
                    <Button
                      onClick={resetForm}
                      className="h-12 px-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-950 dark:text-white hover:bg-slate-200 font-bold uppercase tracking-wider text-xs"
                    >
                      Log New Incident
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-10">
                <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />

                  <div className="space-y-3 relative z-10">
                    <Label className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Target Ministry / Agency</Label>
                    <Select onValueChange={setMinistry} value={ministry}>
                      <SelectTrigger className="h-12 rounded-xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-base shadow-inner focus:ring-red-500 px-4">
                        <SelectValue placeholder="Select destination jurisdiction..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-none shadow-lg font-bold bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl">
                        {reportCategories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value} className="h-10 cursor-pointer">
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <Label className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Location</Label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 size-6 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                        <MapPin className="size-3 text-red-500" />
                      </div>
                      <Input
                        className="pl-12 h-12 rounded-xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-base shadow-inner focus-visible:ring-red-500"
                        placeholder="e.g. Wellington Bassey Way, Uyo..."
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <Label className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Incident Title</Label>
                    <Input
                      className="h-14 px-6 rounded-2xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-lg shadow-inner focus-visible:ring-red-500"
                      placeholder={quickType ? `${quickType} at...` : 'Give a concise summary (e.g. Major Flooding on Abak Rd)'}
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3 relative z-10">
                    <Label className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em]">Description</Label>
                    <Textarea
                      className="p-6 rounded-3xl border-none bg-white/80 dark:bg-slate-800/80 font-bold text-base shadow-inner min-h-[160px] resize-none focus-visible:ring-red-500"
                      placeholder="Describe the issue in detail. Include time of observation and severity..."
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 relative z-10">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl font-bold h-12 px-6 uppercase tracking-wider text-sm"
                      onClick={() => history.back()}
                    >
                      Abort
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md h-12 flex-1 px-6 gap-2 uppercase tracking-wider text-sm active:scale-[0.98] transition-all"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="size-4 animate-spin" /> Transmitting...</>
                      ) : (
                        <><Send className="size-4" /> Relay Intelligence</>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Emergency note */}
            <div className="bg-red-500/5 dark:bg-red-900/10 border border-red-500/20 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row items-center gap-4 shadow-sm backdrop-blur-sm">
              <div className="size-12 shrink-0 bg-red-600 flex items-center justify-center rounded-xl shadow">
                <AlertTriangle className="size-6 text-white animate-pulse" />
              </div>
              <div className="text-center md:text-left">
                <p className="font-black text-red-600 text-lg tracking-tight mb-1">Code Red / Critical Emergencies</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm sm:text-base">
                  Do not use this portal for immediate life-threatening events. Dial{' '}
                  <span className="font-black bg-red-100 dark:bg-red-900/50 text-red-600 px-2 py-0.5 rounded">112</span>{' '}
                  for rapid response.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* My Reports Tab */}
          <TabsContent value="track" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">My Submitted Reports</h2>
              <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live updates
              </span>
            </div>

            {reportsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white/60 rounded-2xl p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            ) : myReports.length === 0 ? (
              <div className="text-center py-16 bg-white/40 rounded-3xl border border-white/50 backdrop-blur-sm">
                <ListChecks className="size-14 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-bold text-lg">No reports yet</p>
                <p className="text-slate-500 text-sm mt-1">Your submitted reports will appear here with live status tracking.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/40 rounded-2xl p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <StatusBadge status={report.status} />
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{report.referenceId}</span>
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">{report.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {report.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {report.createdAt?.toDate
                              ? formatDistanceToNow(report.createdAt.toDate(), { addSuffix: true })
                              : 'recently'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Pipeline */}
                    <StatusTimeline status={report.status} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
