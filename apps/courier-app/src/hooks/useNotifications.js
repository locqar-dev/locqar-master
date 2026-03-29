import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Custom hook for push notifications and alerts
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [sound, setSound] = useState(true);
  const [vibration, setVibration] = useState(true);
  const timeoutsRef = useRef({});

  // Add notification
  const addNotification = useCallback(
    (message, type = 'info', duration = 4000, action = null) => {
      const id = Date.now();
      const notification = {
        id,
        message,
        type, // 'info', 'success', 'warning', 'danger', 'urgent'
        timestamp: new Date(),
        action,
      };

      setNotifications((prev) => [notification, ...prev]);

      // Auto-remove after duration
      if (duration > 0) {
        timeoutsRef.current[id] = setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      // Play sound if enabled
      if (sound) {
        playNotificationSound(type);
      }

      // Vibrate if enabled
      if (vibration) {
        triggerVibration(type);
      }

      return id;
    },
    [sound, vibration]
  );

  // Remove notification
  const removeNotification = useCallback((id) => {
    if (timeoutsRef.current[id]) {
      clearTimeout(timeoutsRef.current[id]);
      delete timeoutsRef.current[id];
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAll = useCallback(() => {
    Object.values(timeoutsRef.current).forEach(clearTimeout);
    timeoutsRef.current = {};
    setNotifications([]);
  }, []);

  // Play notification sound
  const playNotificationSound = (type) => {
    const frequencies = {
      info: 800,
      success: 1000,
      warning: 600,
      danger: 400,
      urgent: 300,
    };

    try {
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequencies[type] || 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio API not available
    }
  };

  // Trigger haptic feedback
  const triggerVibration = (type) => {
    const patterns = {
      info: [50],
      success: [50, 50, 50],
      warning: [100, 50, 100],
      danger: [200, 100, 200],
      urgent: [50, 50, 50, 50, 100, 50, 100],
    };

    try {
      if (navigator.vibrate) {
        navigator.vibrate(patterns[type] || patterns.info);
      }
    } catch (e) {
      // Vibration not available
    }
  };

  // Push notification (browser notification API)
  const sendPushNotification = async (title, options = {}) => {
    if (!('Notification' in window)) {
      addNotification('Notifications not supported', 'warning');
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          ...options,
        });
      } catch (e) {
        addNotification('Failed to send notification', 'danger');
      }
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, options);
        }
      });
    }
  };

  useEffect(() => {
    return () => {
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    sendPushNotification,
    sound,
    setSound,
    vibration,
    setVibration,
  };
};

/**
 * Custom hook for real-time location updates
 */
export const useLocationUpdates = (interval = 5000) => {
  const [locations, setLocations] = useState([]);
  const [tracking, setTracking] = useState(false);
  const intervalRef = useRef(null);

  const startTracking = (callback) => {
    setTracking(true);

    const updateLocation = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude, accuracy } = position.coords;
        const location = {
          latitude,
          longitude,
          accuracy,
          timestamp: Date.now(),
        };

        setLocations((prev) => [...prev, location]);
        callback?.(location);
      } catch (error) {
        console.error('Location update error:', error);
      }
    };

    updateLocation(); // Initial call
    intervalRef.current = setInterval(updateLocation, interval);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTracking(false);
  };

  useEffect(() => {
    return () => stopTracking();
  }, []);

  return {
    locations,
    tracking,
    startTracking,
    stopTracking,
  };
};

export default useNotifications;
