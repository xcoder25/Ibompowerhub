import { useState, useEffect, useCallback, useRef } from 'react';

type Location = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
};

type LiveLocationOptions = {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  updateInterval?: number; // Minimum time between updates in ms
};

export const useLiveLocation = (options: LiveLocationOptions = {}) => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 30000,
    updateInterval = 5000, // 5 seconds minimum
  } = options;

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return false;
    }

    if (isTracking) return true;

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const now = Date.now();
          if (now - lastUpdateRef.current >= updateInterval) {
            const newLocation: Location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: now,
            };
            setLocation(newLocation);
            setError(null);
            lastUpdateRef.current = now;
          }
        },
        (err) => {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              setError('You denied the request for Geolocation.');
              break;
            case err.POSITION_UNAVAILABLE:
              setError('Location information is unavailable.');
              break;
            case err.TIMEOUT:
              setError('The request to get user location timed out.');
              break;
            default:
              setError('An unknown error occurred.');
              break;
          }
          setIsTracking(false);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );

      watchIdRef.current = watchId;
      setIsTracking(true);
      setError(null);
      return true;
    } catch (err) {
      setError('Failed to start location tracking.');
      return false;
    }
  }, [isTracking, enableHighAccuracy, timeout, maximumAge, updateInterval]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: Location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        setLocation(newLocation);
        setError(null);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('You denied the request for Geolocation.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('The request to get user location timed out.');
            break;
          default:
            setError('An unknown error occurred.');
            break;
        }
      },
      { enableHighAccuracy, timeout, maximumAge }
    );
  }, [enableHighAccuracy, timeout, maximumAge]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    location,
    error,
    isTracking,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
};