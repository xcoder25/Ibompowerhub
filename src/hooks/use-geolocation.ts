import { useState, useCallback } from 'react';

type Location = {
  latitude: number;
  longitude: number;
};

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    // Set a timeout to handle cases where the user doesn't respond to the permission prompt
    const timeoutId = setTimeout(() => {
        setError('The request to get user location timed out. Please allow location access.');
    }, 10000); // 10 seconds timeout

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        clearTimeout(timeoutId);
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
      }
    );
  }, []);

  return { location, error, getLocation };
};
