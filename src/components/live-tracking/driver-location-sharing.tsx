'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Play, Square, Loader2 } from 'lucide-react';
import { useLiveLocation } from '@/hooks/use-live-location';
import { getLiveTrackingService } from '@/lib/live-tracking';
import { offlineLocationCache } from '@/lib/offline-location-cache';
import { useUser } from '@/firebase';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

interface DriverLocationSharingProps {
  orderId: string;
  onLocationUpdate?: (location: { latitude: number; longitude: number }) => void;
}

export function DriverLocationSharing({ orderId, onLocationUpdate }: DriverLocationSharingProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSharing, setIsSharing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const liveTrackingService = firestore ? getLiveTrackingService(firestore) : null;

  const {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
  } = useLiveLocation({
    enableHighAccuracy: true,
    updateInterval: 3000, // Update every 3 seconds
  });

  // Handle location updates
  useEffect(() => {
    if (location && isSharing && user && liveTrackingService) {
      const locationData = {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
      };

      // Try to update live location
      liveTrackingService.updateLocation(orderId, locationData).catch((err) => {
        console.warn('Failed to update live location (possibly offline):', err);
        // Cache for later sync
        offlineLocationCache.cacheLocation(orderId, locationData);
        toast({
          title: 'Offline Mode',
          description: 'Location updates are being cached and will sync when online.',
        });
      });

      setLastUpdate(new Date());
      onLocationUpdate?.({
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  }, [location, isSharing, user, orderId, onLocationUpdate, toast, liveTrackingService]);

  // Sync cached locations when back online
  useEffect(() => {
    if (isSharing && user && liveTrackingService) {
      const handleOnline = () => {
        if (offlineLocationCache.hasUnsyncedLocations(orderId)) {
          offlineLocationCache.syncCachedLocations(orderId, user.uid).then(() => {
            toast({
              title: 'Synced',
              description: 'Cached location updates have been synced.',
            });
          }).catch((err) => {
            console.error('Failed to sync cached locations:', err);
          });
        }
      };

      window.addEventListener('online', handleOnline);
      return () => window.removeEventListener('online', handleOnline);
    }
  }, [isSharing, user, orderId, toast, liveTrackingService]);

  const handleStartSharing = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'You must be logged in to share your location.',
      });
      return;
    }

    if (!liveTrackingService) {
      toast({
        variant: 'destructive',
        title: 'Service Unavailable',
        description: 'Location tracking service is not available.',
      });
      return;
    }

    if (!location) {
      toast({
        title: 'Getting Location',
        description: 'Please allow location access to start sharing.',
      });
    }

    const started = startTracking();
    if (started) {
      setIsSharing(true);

      // Initialize tracking document
      if (location) {
        try {
          await liveTrackingService.startSharingLocation(orderId, user.uid, {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            timestamp: location.timestamp,
          });
          toast({
            title: 'Location Sharing Started',
            description: 'Your location is now being shared with the customer.',
          });
        } catch (err) {
          console.error('Failed to start location sharing:', err);
          toast({
            variant: 'destructive',
            title: 'Failed to Start Sharing',
            description: 'Please try again.',
          });
          setIsSharing(false);
          stopTracking();
        }
      }
    }
  };

  const handleStopSharing = async () => {
    stopTracking();
    setIsSharing(false);

    if (liveTrackingService) {
      try {
        await liveTrackingService.stopSharingLocation(orderId);
        toast({
          title: 'Location Sharing Stopped',
          description: 'Your location is no longer being shared.',
        });
      } catch (err) {
        console.error('Failed to stop location sharing:', err);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location Sharing
        </CardTitle>
        <CardDescription>
          Share your live location with the customer for this order
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isSharing ? 'default' : 'secondary'}>
              {isSharing ? 'Sharing' : 'Not Sharing'}
            </Badge>
            {isTracking && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Tracking
              </div>
            )}
          </div>
          {lastUpdate && (
            <div className="text-sm text-muted-foreground">
              Last update: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
            {error}
          </div>
        )}

        {location && (
          <div className="text-sm text-muted-foreground">
            Current: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            {location.accuracy && ` (±${location.accuracy.toFixed(0)}m)`}
          </div>
        )}

        <div className="flex gap-2">
          {!isSharing ? (
            <Button onClick={handleStartSharing} className="flex-1 gap-2">
              <Play className="h-4 w-4" />
              Start Sharing
            </Button>
          ) : (
            <Button onClick={handleStopSharing} variant="destructive" className="flex-1 gap-2">
              <Square className="h-4 w-4" />
              Stop Sharing
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}