'use client';
import { useState } from 'react';
import { GoogleMap } from '@/components/google-map';
import { MapNavigator } from '@/components/map-navigator';

export type MapLocation = {
  lat: number;
  lng: number;
  address: string;
};

export default function MapPage() {
  const [origin, setOrigin] = useState<MapLocation | null>(null);
  const [destination, setDestination] = useState<MapLocation | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  return (
    <div className="flex-1 flex flex-col relative">
      <GoogleMap origin={origin} destination={destination} directions={directions} />
      <div className="absolute top-0 left-0 right-0 z-10 p-4 w-full h-full pointer-events-none">
        <div className='pointer-events-auto'>
            <MapNavigator
            setOrigin={setOrigin}
            setDestination={setDestination}
            setDirections={setDirections}
            />
        </div>
      </div>
    </div>
  );
}
