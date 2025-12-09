
'use client';
import { GoogleMap as GoogleMapApi, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
import { type MapLocation } from '@/app/map/page';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 4.97,
  lng: 8.34
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapId: 'e918999f89995826', // A style for a cleaner look
};

type GoogleMapProps = {
    origin: MapLocation | null;
    destination: MapLocation | null;
    directions: google.maps.DirectionsResult | null;
}

export function GoogleMap({ origin, destination, directions }: GoogleMapProps) {
  return (
      <GoogleMapApi
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
      >
        {origin && !directions && <MarkerF position={origin} />}
        {destination && !directions && <MarkerF position={destination} />}
        {directions && (
            <DirectionsRenderer 
                directions={directions} 
                options={{
                    suppressMarkers: false,
                    polylineOptions: {
                        strokeColor: 'hsl(var(--primary))',
                        strokeWeight: 6,
                        strokeOpacity: 0.8,
                    }
                }}
            />
        )}
      </GoogleMapApi>
  )
}
