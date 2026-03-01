'use client';
import { useRef, useState, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, ArrowRight, X, User, Car, Bus, Bot, Mic, ChevronDown, ChevronUp, History, Navigation2, Search } from 'lucide-react';
import { type MapLocation } from '@/app/map/page';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getNavigationRoute } from '@/ai/flows/map-navigation-flow';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { findPlace } from '@/ai/flows/find-place-flow';
import { useLoading } from '@/context/loading-context';
import { cn } from '@/lib/utils';

type MapNavigatorProps = {
    origin: MapLocation | null;
    destination: MapLocation | null;
    directions: google.maps.DirectionsResult | null;
    setOrigin: (location: MapLocation | null) => void;
    setDestination: (location: MapLocation | null) => void;
    setDirections: (directions: google.maps.DirectionsResult | null) => void;
    travelMode: google.maps.TravelMode;
    setTravelMode: (mode: google.maps.TravelMode) => void;
    setPlaces: (places: google.maps.places.PlaceResult[] | null) => void;
    map: google.maps.Map | null;
};

export function MapNavigator({
    origin,
    destination,
    directions,
    setOrigin,
    setDestination,
    setDirections,
    travelMode,
    setTravelMode,
    setPlaces,
    map
}: MapNavigatorProps) {
    const originRef = useRef<HTMLInputElement>(null);
    const destinationRef = useRef<HTMLInputElement>(null);
    const aiQueryRef = useRef<HTMLInputElement>(null);
    const findPlaceQueryRef = useRef<HTMLInputElement>(null);

    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [steps, setSteps] = useState<google.maps.DirectionsStep[]>([]);
    const [showSteps, setShowSteps] = useState(true);

    const [originAutocomplete, setOriginAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [destinationAutocomplete, setDestinationAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

    const [isListening, setIsListening] = useState(false);
    const { toast } = useToast();
    const { isLoading, setIsLoading } = useLoading();

    const speechRecognition = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
            // @ts-ignore
            const recognition = new webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                toast({ variant: 'destructive', title: 'Voice Error', description: 'Could not recognize speech. Please try again.' });
            };
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (findPlaceQueryRef.current) {
                    findPlaceQueryRef.current.value = transcript;
                    handleFindPlace();
                }
            };
            speechRecognition.current = recognition;
        }
    }, [toast]);


    const calculateRoute = async (org: string, dest: string) => {
        if (!org || !dest) return;
        setPlaces(null);
        setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindPlace = async () => {
        const queryStr = findPlaceQueryRef.current?.value;
        if (!queryStr || !map) return;
        setIsLoading(true);
        setDirections(null);

        try {
            const result = await findPlace({ query: queryStr });
            const request = {
                query: `${result.placeType} in Calabar`,
                fields: ['name', 'geometry', 'formatted_address', 'place_id'],
            };
            const service = new google.maps.places.PlacesService(map);
            service.findPlaceFromQuery(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                    setPlaces(results);
                    const bounds = new google.maps.LatLngBounds();
                    results.forEach(place => {
                        if (place.geometry?.location) {
                            bounds.extend(place.geometry.location);
                        }
                    });
                    map.fitBounds(bounds);

                    toast({
                        title: `Found ${result.placeType}s`,
                        description: 'Showing results on the map.'
                    })
                } else {
                    toast({ variant: 'destructive', title: 'Not Found', description: `Could not find any ${result.placeType}s.` });
                }
            });

        } catch (error) {
            console.error("AI find place error:", error);
            toast({ variant: 'destructive', title: 'AI Error', description: 'Could not understand the place.' });
        } finally {
            setIsLoading(false);
        }
    };

    const clearRoute = () => {
        setDirections(null);
        setDistance('');
        setDuration('');
        setSteps([]);
        if (originRef.current) originRef.current.value = '';
        if (destinationRef.current) destinationRef.current.value = '';
        if (aiQueryRef.current) aiQueryRef.current.value = '';
        if (findPlaceQueryRef.current) findPlaceQueryRef.current.value = '';
        setOrigin(null);
        setDestination(null);
        setPlaces(null);
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
        <div className='flex flex-col gap-4 max-w-full overflow-hidden'>
            <Card className="w-full border-none shadow-none md:shadow-2xl md:border md:bg-background/95 md:backdrop-blur-md rounded-[32px] overflow-hidden">
                <CardContent className="p-0">
                    <Tabs defaultValue="find" className="w-full">
                        <div className="bg-muted/30 p-1.5 mx-4 mt-4 rounded-2xl">
                            <TabsList className="grid w-full grid-cols-3 bg-transparent h-10">
                                <TabsTrigger value="find" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold gap-2">
                                    <Search className="h-3.5 w-3.5" />Find
                                </TabsTrigger>
                                <TabsTrigger value="drive" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold gap-2">
                                    <Navigation2 className="h-3.5 w-3.5" />Route
                                </TabsTrigger>
                                <TabsTrigger value="transit" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm text-xs font-bold gap-2">
                                    <Bus className="h-3.5 w-3.5" />Transit
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6">
                            <TabsContent value="find" className="space-y-6 mt-0">
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                            <Bot className="h-5 w-5 text-primary animate-pulse" />
                                        </div>
                                        <Input
                                            type="text"
                                            placeholder="e.g., find nearest hospital"
                                            ref={findPlaceQueryRef}
                                            className="h-14 pl-12 pr-12 rounded-2xl border-none bg-muted/50 focus-visible:ring-primary/30 text-base font-medium transition-all"
                                            onKeyDown={(e) => e.key === 'Enter' && handleFindPlace()}
                                        />
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={startListening}
                                            disabled={isListening || isLoading}
                                            className={cn(
                                                "absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl transition-all",
                                                isListening ? "bg-red-500 text-white animate-pulse" : "hover:bg-muted"
                                            )}
                                        >
                                            <Mic className="h-5 w-5" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button onClick={handleFindPlace} className="flex-1 h-12 rounded-2xl font-bold text-sm bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" disabled={isLoading}>
                                            {isLoading ? "Searching..." : "Find Places"}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80 px-1">Recent Searches</h4>
                                    <div className="space-y-1">
                                        {['Calabar Mall', 'Marina Resort', 'U.J. Esuene Stadium'].map((place) => (
                                            <button key={place} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/50 transition-colors text-left">
                                                <div className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                                    <History className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <span className="text-sm font-semibold">{place}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="drive" className="space-y-6 mt-0">
                                <div className="space-y-3 relative">
                                    <div className="absolute left-[26px] top-7 bottom-7 w-0.5 bg-gradient-to-b from-primary to-primary/30 opacity-20" />

                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                                            <div className="w-2.5 h-2.5 rounded-full border-2 border-primary bg-background" />
                                        </div>
                                        <Autocomplete onLoad={(ac) => setOriginAutocomplete(ac)} onPlaceChanged={() => onPlaceChanged(setOrigin, originAutocomplete, originRef)}>
                                            <Input type="text" placeholder="Your current location" ref={originRef} className="h-14 pl-12 rounded-2xl border-none bg-muted/50 focus-visible:ring-primary/30" />
                                        </Autocomplete>
                                    </div>

                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5">
                                            <MapPin className="h-5 w-5 text-primary" />
                                        </div>
                                        <Autocomplete onLoad={(ac) => setDestinationAutocomplete(ac)} onPlaceChanged={() => onPlaceChanged(setDestination, destinationAutocomplete, destinationRef)}>
                                            <Input type="text" placeholder="Where to?" ref={destinationRef} className="h-14 pl-12 rounded-2xl border-none bg-muted/50 focus-visible:ring-primary/30" />
                                        </Autocomplete>
                                    </div>

                                    <Button onClick={() => calculateRoute(originRef.current?.value || '', destinationRef.current?.value || '')} className="w-full h-14 rounded-2xl font-bold shadow-xl shadow-primary/20" disabled={isLoading}>
                                        {isLoading ? "Calculating..." : "Preview Route"}
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="transit" className="mt-0 py-12 text-center">
                                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                    <Bus className="h-8 w-8" />
                                </div>
                                <h3 className="text-sm font-bold">Public Transit Coming Soon</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto leading-relaxed">We're mapping Calabar's taxi and bus routes to serve you better.</p>
                            </TabsContent>
                        </div>
                    </Tabs>
                </CardContent>
            </Card>

            {directions && (
                <Card className="w-full border-none shadow-2xl md:bg-background/95 md:backdrop-blur-md rounded-[32px] overflow-hidden animate-in slide-in-from-bottom duration-500">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className='flex items-center gap-6'>
                                <div>
                                    <p className='text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1'>Time</p>
                                    <p className='font-black text-2xl text-primary'>{duration}</p>
                                </div>
                                <div className='h-10 w-px bg-border/50'></div>
                                <div>
                                    <p className='text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1'>Distance</p>
                                    <p className='font-black text-2xl'>{distance}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={clearRoute}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Instructions</h4>
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-black" onClick={() => setShowSteps(!showSteps)}>
                                    {showSteps ? "Hide" : "Show"} Steps {showSteps ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                                </Button>
                            </div>

                            {showSteps && (
                                <ScrollArea className="h-64 -mx-2 px-2">
                                    <div className="space-y-1">
                                        {steps.map((step, index) => (
                                            <div key={index} className="flex gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-colors">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="size-6 flex items-center justify-center rounded-lg bg-primary/10 text-primary text-[10px] font-black">{index + 1}</div>
                                                    {index < steps.length - 1 && <div className="w-0.5 flex-1 bg-border/50" />}
                                                </div>
                                                <div className="flex-1 pb-2">
                                                    <p className="text-sm font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: step.instructions || '' }} />
                                                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{step.distance?.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}

                            <Button className="w-full h-14 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-black shadow-xl shadow-green-500/20 gap-2">
                                <Navigation2 className="h-5 w-5 fill-current" />
                                START NAVIGATION
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
