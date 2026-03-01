'use client';

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap as GoogleMapApi, MarkerF, InfoWindow } from '@react-google-maps/api';
import { getLiveTrackingService, type LiveLocation } from '@/lib/live-tracking';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 5.03, // Uyo coordinates
  lng: 7.92
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapId: 'e918999f89995826',
};

interface LiveTrackingMapProps {
  orderId: string;
  destination?: { lat: number; lng: number };
  onLocationUpdate?: (location: LiveLocation | null) => void;
}

export function LiveTrackingMap({ orderId, destination, onLocationUpdate }: LiveTrackingMapProps) {
  const { toast } = useToast();
  const firestore = useFirestore();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [driverLocation, setDriverLocation] = useState<LiveLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const liveTrackingService = firestore ? getLiveTrackingService(firestore) : null;

  // Subscribe to location updates
  useEffect(() => {
    if (!liveTrackingService) return;

    const unsubscribe = liveTrackingService.subscribeToLocation(orderId, (location: LiveLocation | null) => {
      setDriverLocation(location);
      onLocationUpdate?.(location);
      setIsLoading(false);

      if (!location) {
        setError('Driver location sharing is not active');
      } else {
        setError(null);
      }
    });

    // Set a timeout for initial load
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError('Unable to load driver location. Please check your connection.');
      }
    }, 10000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [orderId, onLocationUpdate, isLoading, liveTrackingService]);

  // Center map on driver location when it updates
  useEffect(() => {
    if (map && driverLocation) {
      map.panTo({
        lat: driverLocation.latitude,
        lng: driverLocation.longitude,
      });
    }
  }, [map, driverLocation]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    // The subscription will automatically retry
  }, []);

  const driverPosition = driverLocation ? {
    lat: driverLocation.latitude,
    lng: driverLocation.longitude,
  } : null;

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading driver location...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center gap-4 p-4">
            <MapPin className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium">Location Unavailable</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={handleRetry} size="sm" variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}

      <GoogleMapApi
        mapContainerStyle={containerStyle}
        center={driverPosition || center}
        zoom={driverPosition ? 16 : 13}
        options={mapOptions}
        onLoad={setMap}
      >
        {driverPosition && (
          <MarkerF
            position={driverPosition}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="4"/>
                  <circle cx="20" cy="20" r="8" fill="white"/>
                  <circle cx="20" cy="20" r="4" fill="#3b82f6"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
            }}
          >
            <InfoWindow>
              <div className="p-2">
                <p className="font-semibold">Driver Location</p>
                <p className="text-sm text-muted-foreground">
                  Last updated: {driverLocation?.timestamp ? new Date(driverLocation.timestamp).toLocaleTimeString() : 'Unknown'}
                </p>
                {driverLocation?.accuracy && (
                  <p className="text-xs text-muted-foreground">
                    Accuracy: ±{driverLocation.accuracy.toFixed(0)}m
                  </p>
                )}
              </div>
            </InfoWindow>
          </MarkerF>
        )}

        {destination && (
          <MarkerF
            position={destination}
            icon={{
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 2C11.58 2 8 5.58 8 10c0 7.17 6.42 14.74 7.09 15.57.29.35.71.35 1 0C17.58 24.74 24 17.17 24 10c0-4.42-3.58-8-8-8z" fill="#ef4444"/>
                  <circle cx="16" cy="10" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
              anchor: new google.maps.Point(16, 16),
            }}
          >
            <InfoWindow>
              <div className="p-2">
                <p className="font-semibold">Destination</p>
              </div>
            </InfoWindow>
          </MarkerF>
        )}
      </GoogleMapApi>
    </div>
  );
}