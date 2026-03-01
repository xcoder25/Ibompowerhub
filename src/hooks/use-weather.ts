'use client';

import { useState, useEffect } from 'react';

type WeatherData = {
    temperature: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    city: string;
};

// Major towns/cities in Akwa Ibom State with their coordinates
const AKS_CITIES = [
    { name: 'Uyo', lat: 5.0377, lon: 7.9128 },
    { name: 'Eket', lat: 4.6427, lon: 7.9244 },
    { name: 'Ikot Ekpene', lat: 5.1811, lon: 7.7131 },
    { name: 'Oron', lat: 4.8281, lon: 8.2372 },
    { name: 'Abak', lat: 5.0069, lon: 7.7817 },
    { name: 'Ikot Abasi', lat: 4.5680, lon: 7.5563 },
    { name: 'Etinan', lat: 4.8467, lon: 7.8553 },
    { name: 'Itu', lat: 5.2050, lon: 7.9900 },
    { name: 'Essien Udim', lat: 5.2500, lon: 7.6500 },
    { name: 'Nsit Ubium', lat: 4.9167, lon: 7.9000 },
    { name: 'Uruan', lat: 5.0500, lon: 8.0500 },
    { name: 'Ibeno', lat: 4.5667, lon: 7.9833 },
    { name: 'Mkpat Enin', lat: 4.7167, lon: 7.7333 },
    { name: 'Eastern Obolo', lat: 4.5167, lon: 7.8500 },
    { name: 'Onna', lat: 4.7000, lon: 7.8667 },
];

// Default: Uyo
const DEFAULT_CITY = AKS_CITIES[0];

/**
 * Calculate distance between two coordinates (Haversine formula) in km
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Find the nearest AKS city to the given coordinates
 */
function findNearestCity(lat: number, lon: number) {
    let nearest = DEFAULT_CITY;
    let minDist = Infinity;

    for (const city of AKS_CITIES) {
        const dist = getDistanceKm(lat, lon, city.lat, city.lon);
        if (dist < minDist) {
            minDist = dist;
            nearest = city;
        }
    }

    return nearest;
}

/**
 * Fetch weather from Open-Meteo (free, no API key)
 */
async function fetchWeather(lat: number, lon: number): Promise<Omit<WeatherData, 'city'>> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch failed');

    const data = await res.json();
    const current = data.current;

    return {
        temperature: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        windSpeed: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code,
    };
}

export function useWeather() {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function init() {
            try {
                // Try to get user's location
                let city = DEFAULT_CITY;

                if ('geolocation' in navigator) {
                    try {
                        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
                            navigator.geolocation.getCurrentPosition(resolve, reject, {
                                timeout: 8000,
                                enableHighAccuracy: false,
                                maximumAge: 5 * 60 * 1000, // cache for 5 min
                            })
                        );
                        city = findNearestCity(pos.coords.latitude, pos.coords.longitude);
                    } catch {
                        // Geolocation failed — fall back to Uyo
                        console.log('Geolocation unavailable, defaulting to Uyo');
                    }
                }

                const data = await fetchWeather(city.lat, city.lon);
                if (!cancelled) {
                    setWeather({ ...data, city: city.name });
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setError('Could not load weather');
                    setLoading(false);
                }
            }
        }

        init();

        // Refresh weather every 15 minutes
        const interval = setInterval(() => {
            init();
        }, 15 * 60 * 1000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, []);

    return { weather, loading, error };
}

/**
 * Maps WMO weather codes to a description + icon hint
 */
export function getWeatherDescription(code: number): { label: string; icon: 'sun' | 'cloud' | 'rain' | 'storm' | 'fog' } {
    if (code === 0) return { label: 'Clear sky', icon: 'sun' };
    if (code <= 3) return { label: 'Partly cloudy', icon: 'cloud' };
    if (code <= 49) return { label: 'Foggy', icon: 'fog' };
    if (code <= 59) return { label: 'Drizzle', icon: 'rain' };
    if (code <= 69) return { label: 'Rain', icon: 'rain' };
    if (code <= 79) return { label: 'Snow', icon: 'cloud' };
    if (code <= 84) return { label: 'Rain showers', icon: 'rain' };
    if (code <= 94) return { label: 'Snow showers', icon: 'cloud' };
    if (code <= 99) return { label: 'Thunderstorm', icon: 'storm' };
    return { label: 'Unknown', icon: 'cloud' };
}
