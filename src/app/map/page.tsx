
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

  if (!apiKey || apiKey === 'YOUR_API_KEY') {
    return (
      <div className="flex-1 flex items-center justify-center h-full bg-muted-foreground/10 p-4">
        <div className="max-w-md text-center">
          <h2 className="text-2xl font-bold mb-2">Google Maps API Key is Missing</h2>
          <p className="text-muted-foreground">
            To display the map, you need a valid Google Maps API key. Please create a key in the Google Cloud Console, enable the "Maps JavaScript API" and "Places API", and add it to a new file named <code className="bg-muted px-1.5 py-1 rounded-sm font-mono text-sm">.env.local</code> in the root of your project with the following content:
          </p>
          <pre className="mt-4 p-4 bg-muted rounded-md text-left text-sm overflow-x-auto">
            <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE</code>
          </pre>
          <p className="text-muted-foreground mt-4">
            After adding the key, please restart your development server.
          </p>
        </div>
      </div>
    );
  }

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
