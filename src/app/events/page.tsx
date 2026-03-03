'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Calendar, MapPin, ChevronRight, Clock, Ticket, Users, Star, PartyPopper } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventsPage() {
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;
    const q = query(collection(firestore, 'events'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventList: any[] = [];
      snapshot.forEach((doc) => {
        eventList.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventList);
      setIsLoadingEvents(false);
    });
    return () => unsubscribe();
  }, [firestore]);

  const formatDate = (date: any) =>
    date?.toDate ? date.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) : date;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-orange-50/20 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] rounded-full bg-orange-300/20 blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-green-300/15 blur-[130px]" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 md:p-10 max-w-7xl mx-auto">

        {/* Header */}
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white p-8 md:p-12 mb-10 shadow-2xl shadow-green-900/30">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />
          <div className="absolute right-0 top-0 w-72 h-72 rounded-full bg-orange-400/20 blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 mb-5 text-white text-xs font-bold uppercase tracking-widest">
              <PartyPopper className="h-3.5 w-3.5 text-orange-300" />
              AKS Community Events
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">
              Events &{' '}
              <span className="bg-gradient-to-r from-orange-300 to-amber-300 bg-clip-text text-transparent">
                Community
              </span>
            </h1>
            <p className="text-white/75 max-w-xl">
              Discover festivals, government announcements, cultural events, and community gatherings across Akwa Ibom State.
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: Calendar, label: 'This Month', value: '12+' },
            { icon: MapPin, label: 'Locations', value: '31 LGAs' },
            { icon: Users, label: 'Attendees', value: '50K+' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-white/70 backdrop-blur-md border border-white/80 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
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

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoadingEvents ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white/70 rounded-3xl overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <PartyPopper className="size-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-bold text-lg">No events scheduled</p>
              <p className="text-slate-400 text-sm">Check back soon for upcoming community events.</p>
            </div>
          ) : (
            events.map((event) => {
              const image = PlaceHolderImages.find((img) => img.id === event.imageId);
              return (
                <div
                  key={event.id}
                  className="group bg-white/80 backdrop-blur-md border border-white/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {image && (
                    <div className="relative aspect-video w-full overflow-hidden">
                      <Image
                        src={image.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          {formatDate(event.date)}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-black text-slate-900 text-base mb-2 leading-tight">{event.title}</h3>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin className="size-3.5 text-orange-500 flex-shrink-0" />
                        <span className="truncate">{event.location || 'Akwa Ibom State'}</span>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{event.description}</p>
                    )}
                    <Button
                      onClick={() => toast({ title: 'Coming Soon!', description: `Full details for "${event.title}" will be available shortly.` })}
                      className="w-full rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold shadow-md shadow-green-500/20 gap-2"
                    >
                      <Ticket className="size-4" />
                      View Details
                      <ChevronRight className="size-4 ml-auto" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
