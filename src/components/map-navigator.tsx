
'use client';
import { useRef, useState, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowRight, X, User, Car, Bus, Bot, Mic, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { type MapLocation } from '@/app/map/page';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getNavigationRoute } from '@/ai/flows/map-navigation-flow';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

type MapNavigatorProps = {
  origin: MapLocation | null;
  destination: MapLocation | null;
  directions: google.maps.DirectionsResult | null;
  setOrigin: (location: MapLocation | null) => void;
  setDestination: (location: MapLocation | null) => void;
  setDirections: (directions: google.maps.DirectionsResult | null) => void;
  travelMode: google.maps.TravelMode;
  setTravelMode: (mode: google.maps.TravelMode) => void;
};

export function MapNavigator({ origin, destination, directions, setOrigin, setDestination, setDirections, travelMode, setTravelMode }: MapNavigatorProps) {
  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const aiQueryRef = useRef<HTMLInputElement>(null);

  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [steps, setSteps] = useState<google.maps.DirectionsStep[]>([]);
  const [showSteps, setShowSteps] = useState(true);

  const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const [isListening, setIsListening] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { toast } = useToast();
  
  const speechRecognition = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            toast({ variant: 'destructive', title: 'Voice Error', description: 'Could not recognize speech. Please try again.' });
        };
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (aiQueryRef.current) {
                aiQueryRef.current.value = transcript;
                handleAiNavigation();
            }
        };
        speechRecognition.current = recognition;
    }
  }, [toast]);


  const calculateRoute = async (org: string, dest: string) => {
    if (!org || !dest) return;

    const directionsService = new google.maps.DirectionsService();
    try {
      const results = await directionsService.route({
        origin: org,
        destination: dest,
        travelMode: travelMode,
      });
      setDirections(results);
      setDistance(results.routes[0].legs[0].distance?.text ?? '');
      setDuration(results.routes[0].legs[0].duration?.text ?? '');
      setSteps(results.routes[0].legs[0].steps);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not calculate route.' });
      console.error(e);
    }
  };

  const handleAiNavigation = async () => {
    if (!aiQueryRef.current?.value) return;
    setAiLoading(true);

    try {
        const result = await getNavigationRoute({ query: aiQueryRef.current.value });
        const { origin: aiOrigin, destination: aiDestination } = result;

        if (originRef.current) originRef.current.value = aiOrigin;
        if (destinationRef.current) destinationRef.current.value = aiDestination;
        
        await calculateRoute(aiOrigin, aiDestination);
        
    } catch (error) {
        console.error("AI navigation error:", error);
        toast({ variant: 'destructive', title: 'AI Error', description: 'Could not understand the destination.' });
    } finally {
        setAiLoading(false);
    }
  };

  const clearRoute = () => {
    setDirections(null);
    setDistance('');
    setDuration('');
    setSteps([]);
    if (originRef.current) originRef.current.value = '';
    if (destinationRef.current) destinationRef.current.value = '';
    if(aiQueryRef.current) aiQueryRef.current.value = '';
    setOrigin(null);
    setDestination(null);
  };

  const onPlaceChanged = (setter: (location: MapLocation | null) => void, autocomplete: google.maps.places.Autocomplete | null, inputRef: React.RefObject<HTMLInputElement>) => {
    if (autocomplete && inputRef.current) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const location: MapLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          address: inputRef.current.value,
        };
        setter(location);
      }
    }
  };

  const startListening = () => {
      if (speechRecognition.current) {
          speechRecognition.current.start();
      } else {
          toast({ variant: 'destructive', title: 'Unsupported', description: 'Voice recognition is not supported in your browser.' });
      }
  };

  return (
    <div className='flex flex-col gap-4'>
        <Card glassy className="w-full">
            <CardHeader>
                <CardTitle className="font-headline flex items-center"><MapPin className="mr-2" /> CRS Navigator</CardTitle>
                <CardDescription>Find the best route anywhere in Cross River State.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="drive" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="drive"><Car className="mr-2"/>Drive</TabsTrigger>
                        <TabsTrigger value="transit"><Bus className="mr-2"/>Transit</TabsTrigger>
                        <TabsTrigger value="ai"><Bot className="mr-2"/>AI Nav</TabsTrigger>
                    </TabsList>
                    <TabsContent value="drive" className="space-y-4 pt-4">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Autocomplete onLoad={(ac) => setOriginAutocomplete(ac)} onPlaceChanged={() => onPlaceChanged(setOrigin, originAutocomplete, originRef)}>
                            <Input type="text" placeholder="Origin" ref={originRef} className="pl-10" />
                            </Autocomplete>
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Autocomplete onLoad={(ac) => setDestinationAutocomplete(ac)} onPlaceChanged={() => onPlaceChanged(setDestination, destinationAutocomplete, destinationRef)}>
                            <Input type="text" placeholder="Destination" ref={destinationRef} className="pl-10" />
                            </Autocomplete>
                        </div>
                        <Button onClick={() => calculateRoute(originRef.current?.value || '', destinationRef.current?.value || '')} className="w-full">
                            Get Directions <ArrowRight className="ml-2" />
                        </Button>
                    </TabsContent>
                    <TabsContent value="transit" className="pt-4 text-center text-muted-foreground">
                        <p>Transit directions are coming soon!</p>
                    </TabsContent>
                    <TabsContent value="ai" className="space-y-4 pt-4">
                        <div className="relative">
                            <Bot className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                            type="text"
                            placeholder="e.g., Directions to Tinapa from Watt Market"
                            ref={aiQueryRef}
                            className="pl-10"
                            onKeyDown={(e) => e.key === 'Enter' && handleAiNavigation()}
                            />
                            <Button size="icon" variant="ghost" onClick={startListening} disabled={isListening} className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8">
                               {isListening ? <Loader2 className='animate-spin'/> : <Mic />}
                            </Button>
                        </div>
                        <Button onClick={handleAiNavigation} className="w-full" disabled={aiLoading}>
                            {aiLoading && <Loader2 className="mr-2 animate-spin" />}
                            Find Route with AI <ArrowRight className="ml-2" />
                        </Button>
                    </TabsContent>
                </Tabs>
                {(distance || duration || steps.length > 0) && (
                    <div className="pt-4">
                        <Separator />
                    </div>
                )}
            </CardContent>
        </Card>

        {directions && (
        <Card glassy className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer" onClick={() => setShowSteps(s => !s)}>
                <div className='flex items-center gap-4'>
                    <div className='text-center'>
                        <p className='font-bold text-lg'>{distance}</p>
                        <p className='text-xs text-muted-foreground'>Distance</p>
                    </div>
                    <div className='h-8 w-px bg-border'></div>
                    <div className='text-center'>
                        <p className='font-bold text-lg'>{duration}</p>
                        <p className='text-xs text-muted-foreground'>Duration</p>
                    </div>
                </div>
                 <div className='flex items-center gap-2'>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); clearRoute(); }}>
                        <X />
                    </Button>
                    {showSteps ? <ChevronUp /> : <ChevronDown />}
                 </div>
            </CardHeader>
            {showSteps && (
                <CardContent>
                    <ScrollArea className="h-48">
                        <div className="space-y-4 pr-4">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3 text-sm">
                            <div className="flex-shrink-0 mt-1 size-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">{index + 1}</div>
                            <div className="flex-1">
                                <p dangerouslySetInnerHTML={{ __html: step.instructions || '' }} />
                                <p className="text-muted-foreground font-semibold">{step.distance?.text}</p>
                            </div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            )}
        </Card>
        )}
    </div>
  );
}
