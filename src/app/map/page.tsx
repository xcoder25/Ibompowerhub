
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

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full">
        <div className='relative w-full h-64 md:h-full md:w-1/3 order-2 md:order-1 p-4 overflow-y-auto'>
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
        <div className="relative flex-1 h-full order-1 md:order-2">
            {!isLoaded ? (
                <div className="flex items-center justify-center h-full bg-muted-foreground/10">
                    <p className="text-muted-foreground">Loading Map...</p>
                </div>
            ) : (
                <GoogleMap origin={origin} destination={destination} directions={directions} />
            )}
      </div>
    </div>
  );
}
