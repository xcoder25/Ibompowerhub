
'use client';
import { useState } from 'react';
import { GoogleMap } from '@/components/google-map';
import { MapNavigator } from '@/components/map-navigator';
import { useLoadScript } from '@react-google-maps/api';

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
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
    preventGoogleFontsLoading: true,
  });

  if (!isLoaded) {
    return (
        <div className="flex-1 flex items-center justify-center h-full bg-muted-foreground/10">
            <p className="text-muted-foreground">Loading Map...</p>
        </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col relative">
      <GoogleMap origin={origin} destination={destination} directions={directions} />
      <div className="absolute top-0 left-0 right-0 z-10 p-4 w-full h-full pointer-events-none">
        <div className='pointer-events-auto'>
            <MapNavigator
              origin={origin}
              destination={destination}
              directions={directions}
              setOrigin={setOrigin}
              setDestination={setDestination}
              setDirections={setDirections}
              travelMode={travelMode}
              setTravelMode={setTravelMode}
            />
        </div>
      </div>
    </div>
  );
}
