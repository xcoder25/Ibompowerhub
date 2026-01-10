
'use client';
import { useState } from 'react';
import { GoogleMap } from '@/components/google-map';
import { MapNavigator } from '@/components/map-navigator';
import { useLoadScript } from '@react-google-maps/api';
import { PlaceHolderImages } from '@/lib/placeholder-images';

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

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    libraries,
    preventGoogleFontsLoading: true,
  });

  if (!isLoaded) {
    return (
        <div className="flex-1 flex items-center justify-center bg-muted-foreground/10">
            <p className="text-muted-foreground">Loading Map...</p>
        </div>
    )
  }

  return (
    <div className='flex-1 grid grid-cols-1 md:grid-cols-3 h-full'>
        <div className='col-span-1 p-4 space-y-4 overflow-y-auto'>
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
        <div className="relative col-span-1 md:col-span-2 h-full">
             <GoogleMap 
                origin={origin} 
                destination={destination} 
                directions={directions}
                places={places} 
                setMap={setMap}
            />
        </div>
    </div>
  );
}
