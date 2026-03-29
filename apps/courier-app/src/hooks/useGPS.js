import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for GPS tracking and geolocation
 */
export const useGPS = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [tracking, setTracking] = useState(false);
  const watchIdRef = useRef(null);

  // Start tracking location
  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setTracking(true);
    setError(null);

    // Get initial position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ latitude, longitude, accuracy, timestamp: Date.now() });
      },
      (err) => {
        setError(err.message);
        setTracking(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch position changes
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ latitude, longitude, accuracy, timestamp: Date.now() });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Stop tracking
  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  useEffect(() => {
    return () => stopTracking();
  }, []);

  return {
    location,
    error,
    tracking,
    startTracking,
    stopTracking,
  };
};

/**
 * Calculate distance between two coordinates (in km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
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
};

/**
 * Calculate bearing (direction) between two coordinates
 */
export const calculateBearing = (lat1, lon1, lat2, lon2) => {
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const bearing = Math.atan2(y, x);
  return ((bearing * 180) / Math.PI + 360) % 360;
};

/**
 * Optimize route between multiple lockers (nearest neighbor algorithm)
 */
export const optimizeRoute = (currentLocation, lockers) => {
  if (!currentLocation || !lockers.length) return [];

  const visited = new Set();
  const optimized = [];
  let current = currentLocation;

  while (visited.size < lockers.length) {
    let nearest = null;
    let nearestDistance = Infinity;

    for (let i = 0; i < lockers.length; i++) {
      if (visited.has(i)) continue;

      const distance = calculateDistance(
        current.latitude,
        current.longitude,
        lockers[i].latitude,
        lockers[i].longitude
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = i;
      }
    }

    if (nearest !== null) {
      visited.add(nearest);
      optimized.push({
        ...lockers[nearest],
        distance: nearestDistance,
      });
      current = lockers[nearest];
    }
  }

  return optimized;
};

export default useGPS;
