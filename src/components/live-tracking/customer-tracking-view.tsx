'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LiveTrackingMap } from './live-tracking-map';
import { getLiveTrackingService, type LiveLocation } from '@/lib/live-tracking';
import { MapPin, Clock, Phone, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';

interface CustomerTrackingViewProps {
  orderId: string;
  destination?: { lat: number; lng: number; address?: string };
  driverInfo?: {
    name: string;
    phone?: string;
    vehicle?: string;
  };
  estimatedArrival?: Date;
}

export function CustomerTrackingView({
  orderId,
  destination,
  driverInfo,
  estimatedArrival
}: CustomerTrackingViewProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [driverLocation, setDriverLocation] = useState<LiveLocation | null>(null);
  const [isTrackingActive, setIsTrackingActive] = useState(false);

  const liveTrackingService = firestore ? getLiveTrackingService(firestore) : null;

  useEffect(() => {
    if (!liveTrackingService) return;

    const unsubscribe = liveTrackingService.subscribeToLocation(orderId, (location) => {
      setDriverLocation(location);
      setIsTrackingActive(!!location);
    });

    return unsubscribe;
  }, [orderId, liveTrackingService]);

  const handleContactDriver = () => {
    if (driverInfo?.phone) {
      window.open(`tel:${driverInfo.phone}`);
    } else {
      toast({
        title: 'Contact Information Unavailable',
        description: 'Driver contact information is not available at this time.',
      });
    }
  };

  const handleMessageDriver = () => {
    toast({
      title: 'Messaging Coming Soon',
      description: 'In-app messaging with drivers will be available soon.',
    });
  };

  const getStatusMessage = () => {
    if (!isTrackingActive) {
      return 'Waiting for driver to start sharing location...';
    }
    if (driverLocation) {
      return 'Driver location is being tracked in real-time';
    }
    return 'Tracking connection lost';
  };

  const getEstimatedTime = () => {
    if (!estimatedArrival) return null;
    const now = new Date();
    const diff = estimatedArrival.getTime() - now.getTime();
    if (diff <= 0) return 'Arriving now';
    const minutes = Math.ceil(diff / (1000 * 60));
    return `~${minutes} min away`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Live Tracking
            </span>
            <Badge variant={isTrackingActive ? 'default' : 'secondary'}>
              {isTrackingActive ? 'Active' : 'Inactive'}
            </Badge>
          </CardTitle>
          <CardDescription>{getStatusMessage()}</CardDescription>
        </CardHeader>
        <CardContent>
          <LiveTrackingMap
            orderId={orderId}
            destination={destination}
            onLocationUpdate={setDriverLocation}
          />
        </CardContent>
      </Card>

      {driverInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Driver</p>
                <p className="text-sm text-muted-foreground">{driverInfo.name}</p>
              </div>
              {driverInfo.vehicle && (
                <div>
                  <p className="text-sm font-medium">Vehicle</p>
                  <p className="text-sm text-muted-foreground">{driverInfo.vehicle}</p>
                </div>
              )}
            </div>

            {estimatedArrival && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Estimated Arrival</p>
                  <p className="text-sm text-muted-foreground">{getEstimatedTime()}</p>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleContactDriver} variant="outline" className="flex-1 gap-2">
                <Phone className="h-4 w-4" />
                Call Driver
              </Button>
              <Button onClick={handleMessageDriver} variant="outline" className="flex-1 gap-2">
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {destination?.address && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Destination
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{destination.address}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}