
'use client';
import { GoogleMap as GoogleMapApi, LoadScript, MarkerF, DirectionsRenderer } from '@react-google-maps/api';
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
};

type GoogleMapProps = {
    origin: MapLocation | null;
    destination: MapLocation | null;
    directions: google.maps.DirectionsResult | null;
}

export function GoogleMap({ origin, destination, directions }: GoogleMapProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <div className="flex items-center justify-center h-full bg-muted-foreground/10">
                <p className="text-muted-foreground">Google Maps API key is missing.</p>
            </div>
        )
    }
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={['places']}
    >
      <GoogleMapApi
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
      >
        {origin && <MarkerF position={origin} />}
        {destination && <MarkerF position={destination} />}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMapApi>
    </LoadScript>
  )
}
