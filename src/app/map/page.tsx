
'use client';
import { GoogleMap } from '@/components/google-map';
import NeighborhoodStatus from '@/components/neighborhood-status';

export default function MapPage() {

  return (
    <div className="flex-1 flex flex-col relative">
      <GoogleMap />
        <div className="absolute top-4 left-4 z-10">
          <NeighborhoodStatus />
        </div>
    </div>
  );
}
