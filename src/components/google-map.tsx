
'use client';
import { GoogleMap as GoogleMapApi, MarkerF, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { type MapLocation } from '@/app/map/page';
import { useState } from 'react';

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
    places: google.maps.places.PlaceResult[] | null;
    setMap: (map: google.maps.Map | null) => void;
}

export function GoogleMap({ origin, destination, directions, places, setMap }: GoogleMapProps) {
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);

  return (
      <GoogleMapApi
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        options={mapOptions}
        onLoad={setMap}
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
        
        {places?.map((place, index) => (
            place.geometry?.location && (
                <MarkerF 
                    key={place.place_id || index} 
                    position={place.geometry.location} 
                    onClick={() => setSelectedPlace(place)}
                />
            )
        ))}

        {selectedPlace && selectedPlace.geometry?.location && (
            <InfoWindow
                position={selectedPlace.geometry.location}
                onCloseClick={() => setSelectedPlace(null)}
            >
                <div>
                    <p className='font-bold'>{selectedPlace.name}</p>
                    <p>{selectedPlace.formatted_address}</p>
                </div>
            </InfoWindow>
        )}

      </GoogleMapApi>
  )
}
