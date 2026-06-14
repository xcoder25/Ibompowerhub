'use client';
import { GoogleMap as GoogleMapApi, MarkerF, DirectionsRenderer, InfoWindow } from '@react-google-maps/api';
import { type MapLocation, type MapReport } from '@/app/map/page';
import { useState, useMemo } from 'react';
import { MapPin } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '100%'
};

const center = {
    lat: 5.038963,
    lng: 7.909470
};

// Custom premium map style - Dark Mode + Clean labels
const silverStyle: google.maps.MapTypeStyle[] = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{ color: "#9ca5b3" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{ color: "#f3d19c" }],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{ color: "#2f3948" }],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];

type GoogleMapProps = {
    origin: MapLocation | null;
    destination: MapLocation | null;
    directions: google.maps.DirectionsResult | null;
    places: google.maps.places.PlaceResult[] | null;
    reports?: MapReport[];
    setMap: (map: google.maps.Map | null) => void;
}

export function GoogleMap({ origin, destination, directions, places, reports = [], setMap }: GoogleMapProps) {
    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
    const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);

    const mapOptions = useMemo(() => ({
        disableDefaultUI: true,
        zoomControl: false, // Handled by custom UI
        styles: silverStyle,
        gestureHandling: 'greedy',
    }), []);

    return (
        <GoogleMapApi
            mapContainerStyle={containerStyle}
            center={center}
            zoom={13}
            options={mapOptions}
            onLoad={setMap}
        >
            {origin && !directions && (
                <MarkerF
                    position={origin}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: '#FFFFFF',
                        fillOpacity: 1,
                        strokeWeight: 4,
                        strokeColor: '#3b82f6',
                        scale: 6,
                    }}
                />
            )}

            {destination && !directions && (
                <MarkerF
                    position={destination}
                    icon={{
                        path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                        fillColor: '#ef4444',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#FFFFFF',
                        scale: 5,
                    }}
                />
            )}

            {directions && (
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        suppressMarkers: false,
                        polylineOptions: {
                            strokeColor: '#22c55e',
                            strokeWeight: 8,
                            strokeOpacity: 0.9,
                        },
                        markerOptions: {
                            opacity: 1,
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
                        icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            scaledSize: new google.maps.Size(32, 32)
                        }}
                    />
                )
            ))}

            {reports?.map((report) => (
                <MarkerF
                    key={report.id}
                    position={{ lat: report.latitude, lng: report.longitude }}
                    onClick={() => setSelectedReport(report)}
                    icon={{
                        path: google.maps.SymbolPath.CIRCLE,
                        fillColor: report.status === 'resolved' ? '#22c55e' : report.status === 'in-progress' ? '#f59e0b' : '#ef4444',
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: '#FFFFFF',
                        scale: 8,
                    }}
                />
            ))}

            {selectedPlace && selectedPlace.geometry?.location && (
                <InfoWindow
                    position={selectedPlace.geometry.location}
                    onCloseClick={() => setSelectedPlace(null)}
                >
                    <div className="p-2 min-w-[150px]">
                        <p className='font-black text-sm uppercase tracking-tight'>{selectedPlace.name}</p>
                        <p className='text-[10px] text-muted-foreground mt-1 leading-tight'>{selectedPlace.formatted_address}</p>
                    </div>
                </InfoWindow>
            )}

            {selectedReport && (
                <InfoWindow
                    position={{ lat: selectedReport.latitude, lng: selectedReport.longitude }}
                    onCloseClick={() => setSelectedReport(null)}
                >
                    <div className="p-2 min-w-[200px] text-slate-900 dark:text-slate-900">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                selectedReport.status === 'resolved' 
                                    ? 'bg-emerald-100 text-emerald-700' 
                                    : selectedReport.status === 'in-progress' 
                                    ? 'bg-amber-100 text-amber-700' 
                                    : 'bg-red-100 text-red-700'
                            }`}>
                                {selectedReport.status}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-slate-400">#{selectedReport.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h4 className="font-black text-xs text-slate-950 leading-tight mb-1">{selectedReport.title}</h4>
                        <p className="text-[10px] text-slate-600 leading-snug mb-2 line-clamp-3">{selectedReport.description}</p>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <MapPin className="size-3 text-red-500 shrink-0" />
                            <span className="truncate">{selectedReport.location}</span>
                        </div>
                    </div>
                </InfoWindow>
            )}

        </GoogleMapApi>
    )
}
