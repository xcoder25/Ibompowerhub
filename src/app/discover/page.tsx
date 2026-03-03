'use client';

import { ArrowRight, Building2, Calendar, Map, Search, ShoppingBag, Wrench, Compass, ChevronRight, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const features = [
    { title: 'AgroConnect', desc: 'Fresh produce from local farmers across AKS.', href: '/market', icon: ShoppingBag, grad: 'from-green-500 to-green-700' },
    { title: 'SkillsHub', desc: 'Find trusted local artisans and skilled professionals.', href: '/skills', icon: Wrench, grad: 'from-orange-500 to-orange-600' },
    { title: 'Community Events', desc: 'Discover festivals, government events, and gatherings.', href: '/events', icon: Calendar, grad: 'from-purple-500 to-purple-700' },
    { title: 'Business Directory', desc: 'Find local businesses, hotels, and services.', href: '/directory', icon: Building2, grad: 'from-blue-500 to-blue-700' },
];

const highlights = [
    { value: '200+', label: 'Businesses Listed', icon: Building2 },
    { value: '50+', label: 'Events Monthly', icon: Calendar },
    { value: '31', label: 'LGAs Covered', icon: Map },
    { value: '4.8★', label: 'User Rating', icon: Star },
];

export default function DiscoverPage() {
    const [search, setSearch] = useState('');
    const mapPreviewImage = PlaceHolderImages.find(i => i.id === 'map-preview');
    const featureImages = [
        PlaceHolderImages.find(i => i.id === 'agro-connect'),
        PlaceHolderImages.find(i => i.id === 'skills-hub'),
        PlaceHolderImages.find(i => i.id === 'event-carnival'),
        PlaceHolderImages.find(i => i.id === 'directory-hotel'),
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-green-300/20 blur-[130px]" />
                <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-orange-300/15 blur-[130px]" />
            </div>

            <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-12">

                {/* Hero */}
                <div className="text-center max-w-3xl mx-auto pt-4">
                    <div className="inline-flex items-center gap-2 bg-green-600/10 border border-green-600/20 rounded-full px-4 py-1.5 mb-5 text-green-800 text-xs font-bold uppercase tracking-widest">
                        <Compass className="h-3.5 w-3.5" />
                        Discover Akwa Ibom State
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4 leading-tight">
                        Explore{' '}
                        <span className="bg-gradient-to-r from-green-600 to-orange-500 bg-clip-text text-transparent">
                            Everything AKS
                        </span>
                    </h1>
                    <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">
                        From local markets and skilled artisans to community events, the live map, and essential services — all in one place.
                    </p>
                    <div className="relative max-w-lg mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="search"
                            placeholder="Search services, places, events..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-14 py-4 rounded-2xl bg-white/80 backdrop-blur border border-white/90 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 shadow-lg"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 size-9 rounded-xl bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-md hover:from-green-700 hover:to-green-800 transition-colors">
                            <ArrowRight className="size-4 text-white" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {highlights.map(({ value, label, icon: Icon }) => (
                        <div key={label} className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20 flex-shrink-0">
                                <Icon className="size-5 text-white" />
                            </div>
                            <div>
                                <p className="text-xl font-black text-slate-900">{value}</p>
                                <p className="text-xs text-slate-500 font-medium">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Feature Cards */}
                <div>
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                        <Zap className="size-6 text-orange-500" /> Featured Categories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((feature, idx) => {
                            const img = featureImages[idx];
                            return (
                                <Link key={feature.href} href={feature.href} className="block">
                                    <div className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                                        <div className="relative h-40 overflow-hidden">
                                            {img ? (
                                                <Image
                                                    src={img.imageUrl} alt={feature.title} fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className={`h-full bg-gradient-to-br ${feature.grad} flex items-center justify-center`}>
                                                    <feature.icon className="size-16 text-white/20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <div className="absolute bottom-3 left-3">
                                                <div className={`size-9 rounded-xl bg-gradient-to-br ${feature.grad} flex items-center justify-center shadow-lg`}>
                                                    <feature.icon className="size-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="font-black text-slate-900 mb-1">{feature.title}</h3>
                                            <p className="text-xs text-slate-500 flex-1">{feature.desc}</p>
                                            <div className="flex items-center gap-1 mt-3 text-xs font-bold text-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Explore <ChevronRight className="size-3" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Live Map Banner */}
                <div className="bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                            <div className="size-14 rounded-2xl bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg shadow-green-500/20 mb-5">
                                <Map className="size-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Interactive Live Map</h3>
                            <p className="text-slate-500 mb-6 leading-relaxed">
                                Visualize community alerts, government services, businesses, and points of interest across all 31 LGAs of Akwa Ibom State — in real-time.
                            </p>
                            <Link href="/map">
                                <Button className="w-fit rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-black shadow-lg shadow-green-500/20 gap-2">
                                    <Map className="size-4" /> Open Live Map <ArrowRight className="size-4" />
                                </Button>
                            </Link>
                        </div>
                        <div className="relative h-56 md:h-auto min-h-[200px] overflow-hidden">
                            {mapPreviewImage ? (
                                <Image src={mapPreviewImage.imageUrl} alt="Map Preview" fill className="object-cover" />
                            ) : (
                                <div className="h-full bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
                                    <Map className="size-24 text-white/10" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent hidden md:block" />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
