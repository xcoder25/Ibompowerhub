'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Leaf, Building2, Shield, GraduationCap, 
  HeartPulse, CheckCircle2, Clock, MapPin, Layers, 
  ArrowUpRight, Users, MessageSquare 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AriseProject {
  id: string;
  title: string;
  pillar: 'Agriculture' | 'Rural Dev' | 'Infrastructure' | 'Security' | 'Education' | 'Healthcare';
  lga: string;
  location: string;
  description: string;
  status: 'In Progress' | 'Completed' | 'Commenced' | 'Commissioned';
  completionPercent: number;
  expectedCompletion: string;
  contractor: string;
  beneficiariesCount: string;
}

const ARISE_PILLARS = [
  { id: 'ALL', name: 'All Pillars', icon: Layers },
  { id: 'Agriculture', name: 'A - Agricultural Revolution', icon: Leaf, color: 'text-emerald-400' },
  { id: 'Rural Dev', name: 'R - Rural Development', icon: Building2, color: 'text-amber-400' },
  { id: 'Infrastructure', name: 'I - Infrastructure Expansion', icon: Layers, color: 'text-blue-400' },
  { id: 'Security', name: 'S - Security Management', icon: Shield, color: 'text-purple-400' },
  { id: 'Education', name: 'E - Educational Advancement', icon: GraduationCap, color: 'text-teal-400' },
];

const ARISE_PROJECTS: AriseProject[] = [
  {
    id: 'PRJ-001',
    title: 'ARISE Park Tourism & Leisure City',
    pillar: 'Infrastructure',
    lga: 'Uyo',
    location: 'Enen Atai / Udo Udoma Corridor, Uyo',
    description: 'Transforming the historic ravine into a world-class eco-tourism destination with artificial lakes, amphitheater, botanical parks, and resort amenities.',
    status: 'In Progress',
    completionPercent: 72,
    expectedCompletion: 'Q4 2026',
    contractor: 'Hensek Integrated Services / State Works',
    beneficiariesCount: 'State-wide & Global Tourists',
  },
  {
    id: 'PRJ-002',
    title: 'Ibom Model Community Primary Schools',
    pillar: 'Education',
    lga: 'Ibesikpo Asutan & All 31 LGAs',
    location: 'Etoi, Afaha, Ikot Akpaden & Selected Wards',
    description: 'Ultra-modern solar-powered smart primary schools equipped with digital laboratories, teacher quarters, sports arenas, and free pupil feeding.',
    status: 'In Progress',
    completionPercent: 85,
    expectedCompletion: 'Phase 1 Complete, Phase 2 Ongoing',
    contractor: 'Universal Basic Education Board (SUBEB AKS)',
    beneficiariesCount: '50,000+ School Children',
  },
  {
    id: 'PRJ-003',
    title: 'Bulk Rice & Cassava Processing Cooperative Depot',
    pillar: 'Agriculture',
    lga: 'Ini & Nsit Ubium',
    location: 'Odoro Ikpe / Ikot Edibon',
    description: 'Establishing state-of-the-art milling, destoning, and bulk bagging facilities to reduce food prices and achieve self-sufficiency.',
    status: 'Commissioned',
    completionPercent: 100,
    expectedCompletion: 'Fully Operational',
    contractor: 'Ministry of Agriculture & Ibom-LED',
    beneficiariesCount: '15,000+ Local Farmers',
  },
  {
    id: 'PRJ-004',
    title: 'Ibom Community Watch (ICW) Security Deployment',
    pillar: 'Security',
    lga: 'State-Wide (31 LGAs)',
    location: 'All 31 Local Government Council Patrol Units',
    description: 'Deployment of 5,000 trained grassroots intelligence and community security officers equipped with patrol vans and direct police links.',
    status: 'Commissioned',
    completionPercent: 100,
    expectedCompletion: 'Active Patrol',
    contractor: 'Ministry of Internal Security',
    beneficiariesCount: '7.9 Million AKS Residents',
  },
  {
    id: 'PRJ-005',
    title: 'Model Primary Healthcare Center Revitalization',
    pillar: 'Healthcare',
    lga: 'Eket, Ikot Ekpene, Oron',
    location: 'Selected Wards Across 3 Senatorial Districts',
    description: 'Upgrading 31 Primary Healthcare Centers with 24-hour solar power, staff quarters, diagnostic ultrasound, and telemedicine kits.',
    status: 'In Progress',
    completionPercent: 68,
    expectedCompletion: 'Q3 2026',
    contractor: 'Akwa Ibom State Primary Healthcare Agency',
    beneficiariesCount: 'Rural Mothers & Families',
  },
  {
    id: 'PRJ-006',
    title: 'Dual Carriage Ring Road 3 Expansion',
    pillar: 'Infrastructure',
    lga: 'Uyo',
    location: 'Oron Road to Nwaniba Road Linkage',
    description: 'High-capacity 8-lane expressway connecting Oron road directly to Nwaniba and airport corridors, with solar lighting and storm drainage.',
    status: 'Completed',
    completionPercent: 100,
    expectedCompletion: 'Completed',
    contractor: 'Julius Berger / Hensek',
    beneficiariesCount: '100,000+ Daily Commuters',
  },
];

export default function AriseTrackerPage() {
  const { toast } = useToast();
  const [selectedPillar, setSelectedPillar] = useState('ALL');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackLga, setFeedbackLga] = useState('Uyo');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  const filteredProjects = selectedPillar === 'ALL'
    ? ARISE_PROJECTS
    : ARISE_PROJECTS.filter(p => p.pillar === selectedPillar || (selectedPillar === 'Education' && p.pillar === 'Healthcare'));

  const handleFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText) return;

    setIsSendingFeedback(true);
    setTimeout(() => {
      setIsSendingFeedback(false);
      setFeedbackText('');
      toast({
        title: "Citizen Feedback Logged",
        description: "Your submission has been forwarded to the State Project Monitoring & Evaluation Office."
      });
    }, 700);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">ARISE Agenda Monitor</h1>
                  <Badge className="bg-emerald-600 text-white font-black text-[10px] uppercase px-2">Public Works</Badge>
                </div>
                <p className="text-xs md:text-sm text-slate-400">
                  Track state infrastructure, agricultural revolution, model schools, and security projects across Akwa Ibom
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/government">
              <Button variant="outline" className="border-white/10 bg-white/5 text-slate-300 hover:text-white text-xs h-9">
                State Ministries & MDAs
              </Button>
            </Link>
          </div>
        </div>

        {/* ARISE Pillars Filter Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {ARISE_PILLARS.map(p => {
            const Icon = p.icon;
            const isSelected = selectedPillar === p.id;

            return (
              <button
                key={p.id}
                onClick={() => setSelectedPillar(p.id)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-lg shadow-emerald-950/40'
                    : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className="size-4" />
                  <span className="text-xs font-bold line-clamp-1">{p.name.split(' - ')[0]}</span>
                </div>
                <div className="text-[10px] opacity-80 mt-1 line-clamp-1">
                  {p.name.includes('-') ? p.name.split(' - ')[1] : 'All Projects'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredProjects.map(project => {
            const isCompleted = project.status === 'Completed' || project.status === 'Commissioned';

            return (
              <Card key={project.id} className="bg-slate-900/80 border-white/10 hover:border-emerald-500/30 transition-all space-y-3">
                <CardHeader className="pb-2 border-b border-white/5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400 font-bold">
                          {project.pillar}
                        </Badge>
                        <span className="text-[11px] text-slate-500">{project.lga} LGA</span>
                      </div>
                      <CardTitle className="text-base font-bold text-white">{project.title}</CardTitle>
                      <CardDescription className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 text-slate-500 shrink-0" />
                        {project.location}
                      </CardDescription>
                    </div>
                    <Badge className={`text-[10px] font-bold shrink-0 ${
                      isCompleted ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    }`}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs">
                  <p className="text-slate-300 leading-relaxed">{project.description}</p>

                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-950 border border-white/5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Execution Progress</span>
                      <span className="text-emerald-400">{project.completionPercent}%</span>
                    </div>
                    <Progress value={project.completionPercent} className="h-2 bg-slate-800" />
                    <div className="text-[10px] text-slate-500 flex justify-between pt-1">
                      <span>Agency: {project.contractor}</span>
                      <span>Target: {project.expectedCompletion}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <span className="flex items-center gap-1">
                      <Users className="size-3 text-slate-500" />
                      Beneficiaries: <strong className="text-slate-200">{project.beneficiariesCount}</strong>
                    </span>
                    <span className="text-emerald-400 font-medium">Verified by AKS M&E</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Citizen Project Feedback Form */}
        <Card className="bg-slate-900/80 border-white/10">
          <CardHeader className="pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <CardTitle className="text-base text-white">Citizen Feedback & Project Inspection</CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Report on the status of ongoing roads, schools, or health centers in your community
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleFeedback} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Your Local Government Area (LGA)</label>
                  <input
                    value={feedbackLga}
                    onChange={e => setFeedbackLga(e.target.value)}
                    placeholder="e.g. Uyo, Itu, Eket, Oron..."
                    className="w-full bg-slate-950 border border-white/10 text-xs h-9 px-3 rounded-xl text-white placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300">Project Name or Road Corridor</label>
                  <input
                    placeholder="e.g. Model Primary School Afaha, Ring Road 3..."
                    className="w-full bg-slate-950 border border-white/10 text-xs h-9 px-3 rounded-xl text-white placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-300">Your Observation / Community Report</label>
                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Share details on progress, road quality, or if contractors are on site..."
                  className="w-full bg-slate-950 border border-white/10 text-xs min-h-[70px] p-3 rounded-xl text-white placeholder:text-slate-600 resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSendingFeedback}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9 rounded-xl"
              >
                <CheckCircle2 className="size-4 mr-1.5" />
                {isSendingFeedback ? 'Logging Report...' : 'Submit Citizen Inspection Report'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
