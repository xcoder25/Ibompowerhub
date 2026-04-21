import { useState, useEffect } from 'react';

export interface DeviceOrientation {
  alpha: number | null; // Rotation around z-axis (heading)
  beta: number | null;  // Rotation around x-axis (tilt front-to-back)
  gamma: number | null; // Rotation around y-axis (tilt left-to-right)
  heading: number | null; // Compass heading in degrees (0-360)
}

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    alpha: null,
    beta: null,
    gamma: null,
    heading: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const requestPermission = async () => {
    // @ts-ignore - DeviceOrientationEvent.requestPermission is specific to iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        // @ts-ignore
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          return true;
        } else {
          setError('Permission denied');
          return false;
        }
      } catch (err) {
        setError('Permission focus failed');
        return false;
      }
    } else {
      // Browsers that don't require explicit permission (Android, older iOS)
      setPermissionGranted(true);
      return true;
    }
  };

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let heading = null;

      // @ts-ignore - webkitCompassHeading is specific to iOS
      if (event.webkitCompassHeading !== undefined) {
        // @ts-ignore
        heading = event.webkitCompassHeading;
      } else if (event.alpha !== null) {
        // Fallback for Android - alpha is 0 at start, not always true north
        heading = 360 - event.alpha;
      }

      setOrientation({
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        heading: heading,
      });
    };

    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [permissionGranted]);

  return { orientation, error, requestPermission };
};
