
'use client';
import { GoogleMap as GoogleMapApi, LoadScript } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: 4.97,
  lng: 8.34
};

export function GoogleMap() {
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
    >
      <GoogleMapApi
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
      >
        { /* Child components, such as markers, info windows, etc. */ }
        <></>
      </GoogleMapApi>
    </LoadScript>
  )
}
