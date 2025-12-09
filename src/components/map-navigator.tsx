
'use client';
import { useRef, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowRight, X, User, Car } from 'lucide-react';
import { type MapLocation } from '@/app/map/page';

type MapNavigatorProps = {
  setOrigin: (location: MapLocation | null) => void;
  setDestination: (location: MapLocation | null) => void;
  setDirections: (directions: google.maps.DirectionsResult | null) => void;
};

export function MapNavigator({ setOrigin, setDestination, setDirections }: MapNavigatorProps) {
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');

  const calculateRoute = async () => {
    if (!originRef.current?.value || !destinationRef.current?.value) {
      return;
    }
    const directionsService = new google.maps.DirectionsService();
    const results = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      travelMode: google.maps.TravelMode.DRIVING,
    });
    setDirections(results);
    setDistance(results.routes[0].legs[0].distance?.text ?? '');
    setDuration(results.routes[0].legs[0].duration?.text ?? '');
  };

  const clearRoute = () => {
    setDirections(null);
    setDistance('');
    setDuration('');
    if (originRef.current) originRef.current.value = '';
    if (destinationRef.current) destinationRef.current.value = '';
    setOrigin(null);
    setDestination(null);
  };

  const onPlaceChanged = (setter: (location: MapLocation | null) => void, autocomplete: google.maps.places.Autocomplete | null) => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if(place.geometry?.location) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: place.formatted_address || '',
        };
        setter(location);
      }
    } else {
      console.log('Autocomplete is not loaded yet!');
    }
  };

  const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  return (
    <Card glassy className="max-w-md w-full">
      <CardHeader>
        <CardTitle className="font-headline flex items-center"><MapPin className="mr-2" /> CRS Navigator</CardTitle>
        <CardDescription>Find the best route anywhere in Cross River State.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Autocomplete
                onLoad={(autocomplete) => setOriginAutocomplete(autocomplete)}
                onPlaceChanged={() => onPlaceChanged(setOrigin, originAutocomplete)}
            >
              <Input
                type="text"
                placeholder="Origin"
                ref={originRef}
                className="pl-10"
              />
            </Autocomplete>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Autocomplete
                onLoad={(autocomplete) => setDestinationAutocomplete(autocomplete)}
                onPlaceChanged={() => onPlaceChanged(setDestination, destinationAutocomplete)}
            >
              <Input
                type="text"
                placeholder="Destination"
                ref={destinationRef}
                className="pl-10"
              />
            </Autocomplete>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={calculateRoute} className="w-full">
            Get Directions <ArrowRight className="ml-2" />
          </Button>
          <Button onClick={clearRoute} variant="outline" className="w-full sm:w-auto" size="icon" aria-label='Clear Route'>
            <X />
          </Button>
        </div>

        {distance && duration && (
            <div className='flex justify-around items-center p-3 rounded-lg bg-muted/50 text-center'>
                <div>
                    <p className='font-bold text-lg'>{distance}</p>
                    <p className='text-xs text-muted-foreground'>Distance</p>
                </div>
                 <div className='h-8 w-px bg-border'></div>
                <div>
                    <p className='font-bold text-lg'>{duration}</p>
                    <p className='text-xs text-muted-foreground'>Duration</p>
                </div>
                 <div className='h-8 w-px bg-border'></div>
                 <div>
                    <Car className='size-6 text-primary'/>
                 </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}

