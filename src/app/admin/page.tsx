
'use client';

import React from 'react';
import {
    Users,
    Wallet,
    AlertTriangle,
    CheckCircle,
    TrendingUp,
    Activity,
    ShieldCheck,
    ShieldAlert,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    MoreVertical,
    ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminDashboard() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'users'), limit(50)) : null
        , [firestore]);
    const { data: users = [] } = useCollection<any>(usersQuery);

    const reportsQuery = useMemoFirebase(() =>
        firestore ? query(collection(firestore, 'reports'), orderBy('time', 'desc'), limit(10)) : null
        , [firestore]);
    const { data: reports = [] } = useCollection<any>(reportsQuery);

    const stats = [
        { label: 'Total Citizens', value: '12,458', icon: Users, trend: '+12%', color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Platform Revenue', value: '₦4,285,000', icon: Wallet, trend: '+8%', color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Active Reports', value: '42', icon: AlertTriangle, trend: '-5%', color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Verification Rate', value: '94.2%', icon: ShieldCheck, trend: '+2%', color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200/60">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-headline">Admin Control Center</h1>
                    <p className="text-slate-500 font-medium">Monitoring Akwa Ibom State's Digital Ecosystem — ARISE Agenda Hub</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="rounded-xl border-slate-200">
                        <FileText className="mr-2 h-4 w-4" /> Export Data
                    </Button>
                    <Button className="rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                        System Status: Operational <CheckCircle className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-shadow cursor-default">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className={`flex items-center text-xs font-bold ${stat.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'} px-2 py-1 rounded-full`}>
                                    {stat.trend} {stat.trend.startsWith('+') ? <ArrowUpRight className="h-3 w-3 ml-0.5" /> : <ArrowDownRight className="h-3 w-3 ml-0.5" />}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Recent Activity & Management */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900 font-headline">Recent Citizens</CardTitle>
                                <CardDescription>Managing the latest account registrations</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative hidden md:block">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input className="pl-9 pr-4 py-1.5 text-sm rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/10 placeholder:text-slate-400 w-48" placeholder="Search..." />
                                </div>
                                <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/50">
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Name</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {users.length > 0 ? users.slice(0, 8).map((user, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                            {user.name?.charAt(0) || 'C'}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 truncate">{user.name || 'Citizen'}</p>
                                                            <p className="text-xs text-slate-500 truncate">{user.email || 'No email'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="outline" className="rounded-lg text-[10px] uppercase font-bold text-slate-600 bg-slate-50 border-slate-200">
                                                        {user.role || 'Resident'}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-green-600">
                                                        <div className="size-1.5 rounded-full bg-current"></div>
                                                        <span className="text-xs font-bold uppercase">Online</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-medium text-slate-500">
                                                    2 hours ago
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 h-8 w-8 rounded-lg"><MoreVertical className="h-4 w-4" /></Button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No recent citizen data found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                        <div className="p-4 bg-slate-50/30 border-t border-slate-100 text-center">
                            <Button variant="ghost" className="text-blue-600 text-xs font-bold hover:bg-blue-50">View All Citizens <ExternalLink className="ml-2 h-3 w-3" /></Button>
                        </div>
                    </Card>
                </div>

                {/* Right: Real-time Reports & Alerts */}
                <div className="space-y-8">
                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-900 text-white">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold font-headline">Live Reports</CardTitle>
                                <Badge className="bg-red-500 hover:bg-red-600 border-none font-bold">LIVE</Badge>
                            </div>
                            <CardDescription className="text-slate-400">Real-time alerts from the community</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="space-y-4">
                                {reports.length > 0 ? reports.slice(0, 5).map((report, idx) => (
                                    <div key={idx} className="group relative p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-all cursor-pointer">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                <AlertTriangle className="size-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-bold text-white truncate">{report.type}</p>
                                                    <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">2M AGO</span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                                    {report.description}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">UYO metropolis</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-12 text-slate-600 space-y-2">
                                        <Activity className="size-8 mx-auto opacity-20" />
                                        <p className="text-sm italic">No active reports at this moment</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <div className="p-4 bg-slate-950/30 text-center">
                            <Button variant="ghost" className="text-slate-400 text-xs font-bold hover:text-white hover:bg-white/5">Open Command Center →</Button>
                        </div>
                    </Card>

                    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-xl font-bold text-slate-900 font-headline">Security Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-0 space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50/50 border border-green-100">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Wallet Encryption</p>
                                        <p className="text-xs text-slate-500">Active & Monitored</p>
                                    </div>
                                </div>
                                <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50/50 border border-green-100">
                                <div className="flex items-center gap-3">
                                    <ShieldCheck className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">KYC Verification Gate</p>
                                        <p className="text-xs text-slate-500">Processing Stream</p>
                                    </div>
                                </div>
                                <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                                <div className="flex items-center gap-3">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">Server Performance</p>
                                        <p className="text-xs text-slate-500">99.9% Uptime (AKS Region)</p>
                                    </div>
                                </div>
                                <div className="size-2 rounded-full bg-blue-500 animate-pulse"></div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
