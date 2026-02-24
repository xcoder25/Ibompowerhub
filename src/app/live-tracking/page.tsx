'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DriverLocationSharing } from '@/components/live-tracking/driver-location-sharing';
import { CustomerTrackingView } from '@/components/live-tracking/customer-tracking-view';
import { Badge } from '@/components/ui/badge';
import { MapPin, Truck, User } from 'lucide-react';

export default function LiveTrackingDemoPage() {
  const [orderId, setOrderId] = useState('demo-order-123');
  const [customOrderId, setCustomOrderId] = useState('');

  const demoDestination = {
    lat: 4.9757, // Calabar coordinates
    lng: 8.3417,
    address: 'Marina Resort, Calabar, Nigeria'
  };

  const demoDriverInfo = {
    name: 'John Driver',
    phone: '+2341234567890',
    vehicle: 'Toyota Camry (ABC-123-XY)'
  };

  const activeOrderId = customOrderId || orderId;

  return (
    <div className="flex-1 p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold tracking-tight">Live Order Tracking Demo</h1>
          <p className="text-muted-foreground mt-2">
            Experience real-time GPS tracking like a ride-hailing app
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Configuration</CardTitle>
            <CardDescription>
              Set up a demo order ID to test live tracking between driver and customer views
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="orderId"
                    value={customOrderId}
                    onChange={(e) => setCustomOrderId(e.target.value)}
                    placeholder="Enter custom order ID"
                  />
                  <Button
                    onClick={() => setCustomOrderId('')}
                    variant="outline"
                  >
                    Use Demo
                  </Button>
                </div>
              </div>
              <div className="flex items-end">
                <Badge variant="secondary" className="text-sm">
                  Active Order: {activeOrderId}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="customer" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customer" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Customer View
            </TabsTrigger>
            <TabsTrigger value="driver" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Driver View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Tracking Experience
                </CardTitle>
                <CardDescription>
                  This is what customers see - real-time driver location on the map
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerTrackingView
                  orderId={activeOrderId}
                  destination={demoDestination}
                  driverInfo={demoDriverInfo}
                  estimatedArrival={new Date(Date.now() + 15 * 60 * 1000)} // 15 minutes from now
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="driver" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Driver Location Sharing
                </CardTitle>
                <CardDescription>
                  This is what drivers use to share their GPS location in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DriverLocationSharing
                  orderId={activeOrderId}
                  onLocationUpdate={(location) => {
                    console.log('Driver location updated:', location);
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-green-600 dark:text-green-400">For Drivers:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Click "Start Sharing" to begin GPS tracking</li>
                      <li>• Location updates every 3 seconds automatically</li>
                      <li>• Works with normal mobile internet</li>
                      <li>• Caches locations offline and syncs when back online</li>
                      <li>• High accuracy GPS with location permission</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-blue-600 dark:text-blue-400">For Customers:</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Real-time map showing driver location</li>
                      <li>• Live updates as driver moves</li>
                      <li>• Estimated arrival time</li>
                      <li>• Driver contact information</li>
                      <li>• Destination marker on map</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Technical Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold">Real-time GPS</h3>
                <p className="text-sm text-muted-foreground">Continuous location tracking with high accuracy</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
                <h3 className="font-semibold">Firebase Backend</h3>
                <p className="text-sm text-muted-foreground">Real-time database for instant updates</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="h-8 w-8 mx-auto mb-2 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">OFF</span>
                </div>
                <h3 className="font-semibold">Offline Support</h3>
                <p className="text-sm text-muted-foreground">Cache locations offline, sync when online</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}