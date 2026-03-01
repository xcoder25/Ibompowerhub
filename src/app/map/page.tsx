'use client';

import { useState } from 'react';
import { GoogleMap } from '@/components/google-map';
import { MapNavigator } from '@/components/map-navigator';
import { useLoadScript } from '@react-google-maps/api';
import { MapPin, Navigation, Search, Menu, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export type MapLocation = {
  lat: number;
  lng: number;
  address: string;
};

const libraries: ('places')[] = ['places'];

export default function MapPage() {
  const [origin, setOrigin] = useState<MapLocation | null>(null);
  const [destination, setDestination] = useState<MapLocation | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode>('DRIVING' as google.maps.TravelMode);
  const [places, setPlaces] = useState<google.maps.places.PlaceResult[] | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const isMobile = useIsMobile();

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
    preventGoogleFontsLoading: true,
  });

  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background">
        <div className="relative w-24 h-24 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <MapPin className="absolute inset-0 m-auto h-8 w-8 text-primary animate-bounce" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Initializing CRS Maps...</p>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Search/Navigator Container - Overlay for Mobile, Sidebar for Desktop */}
      {!isMobile ? (
        <div className="absolute top-6 left-6 z-20 w-[400px] max-h-[calc(100vh-80px)] pointer-events-none drop-shadow-2xl">
          <div className="pointer-events-auto">
            <MapNavigator
              origin={origin}
              destination={destination}
              directions={directions}
              setOrigin={setOrigin}
              setDestination={setDestination}
              setDirections={setDirections}
              travelMode={travelMode}
              setTravelMode={setTravelMode}
              setPlaces={setPlaces}
              map={map}
            />
          </div>
        </div>
      ) : (
        <div className="absolute top-4 inset-x-4 z-20 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 bg-background/95 backdrop-blur-md rounded-2xl border border-border/50 shadow-xl px-4 py-2 flex items-center gap-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-medium"
                placeholder="Search Cross River State..."
                readOnly
                onClick={() => {/* Trigger AI search focus */ }}
              />
              <div className="h-6 w-px bg-border/50" />
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <Navigation className="h-4 w-4 text-primary" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="rounded-t-[32px] h-[85vh] p-0 overflow-hidden border-t-0">
                  <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-2" />
                  <SheetHeader className="px-6 py-2">
                    <SheetTitle className="sr-only">Route Planner</SheetTitle>
                  </SheetHeader>
                  <div className="p-4 h-full overflow-y-auto pb-24">
                    <MapNavigator
                      origin={origin}
                      destination={destination}
                      directions={directions}
                      setOrigin={setOrigin}
                      setDestination={setDestination}
                      setDirections={setDirections}
                      travelMode={travelMode}
                      setTravelMode={setTravelMode}
                      setPlaces={setPlaces}
                      map={map}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Quick Filter Pill - Mobile Only */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {['Hospitals', 'Parks', 'Schools', 'Hotels'].map((cat) => (
              <Button key={cat} variant="secondary" size="sm" className="bg-background/90 backdrop-blur-md rounded-full shadow-md border-border/50 text-[10px] font-bold h-7 shrink-0 px-3 uppercase tracking-wider">
                {cat}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Map Surface */}
      <div className="absolute inset-0">
        <GoogleMap
          origin={origin}
          destination={destination}
          directions={directions}
          places={places}
          setMap={setMap}
        />
      </div>

      {/* Map Controls Floating Action Buttons */}
      <div className="absolute bottom-28 md:bottom-10 right-4 z-10 flex flex-col gap-3">
        <Button variant="secondary" size="icon" className="rounded-2xl shadow-xl border border-border/50 bg-background/95 backdrop-blur-md h-12 w-12 hover:bg-background active:scale-95 transition-all">
          <Filter className="h-5 w-5 text-primary" />
        </Button>
        <Button variant="primary" size="icon" className="rounded-2xl shadow-2xl h-14 w-14 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center">
          <Navigation className="h-6 w-6" />
        </Button>
      </div>

      {/* Branding Plate - Top Right Desktop */}
      {!isMobile && (
        <div className="absolute top-6 right-6 z-10 bg-background/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70">Live Navigation</span>
          </div>
        </div>
      )}
    </div>
  );
}
