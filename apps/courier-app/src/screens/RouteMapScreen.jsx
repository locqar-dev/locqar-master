import React, { useState, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { MapPin, Navigation, Clock, Zap, ChevronRight } from '../components/Icons';
import { useGPS, calculateDistance, optimizeRoute } from '../hooks/useGPS';
import { lockersData } from '../data/mockData';

const RouteMapScreen = ({ dels, activeBlock, onBack, onSelectLocker, T }) => {
  const { location, tracking, startTracking, stopTracking, error } = useGPS();
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [selectedLocker, setSelectedLocker] = useState(null);
  const [eta, setEta] = useState(null);

  // Start GPS tracking when screen loads
  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  // Calculate optimized route
  useEffect(() => {
    if (location && activeBlock) {
      const blockLockers = lockersData.filter(
        (l) =>
          dels.some(
            (d) => d.locker === l.name && d.status === 'pending'
          )
      );

      const optimized = optimizeRoute(location, blockLockers);
      setOptimizedRoute(optimized);

      if (optimized.length > 0) {
        const distToNext = optimized[0].distance || 0;
        const eta = Math.ceil(distToNext / 0.05); // Assumes 3km/min average
        setEta(eta);
      }
    }
  }, [location, activeBlock, dels]);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}>
      <StatusBar T={T} />
      <TopBar title="Route Map" onBack={onBack} T={T} />

      {/* Current Location & Status */}
      {location && (
        <div style={{ padding: '16px 20px' }}>
          <div
            style={{
              background: T.gradientBlue,
              borderRadius: 12,
              padding: 16,
              color: '#fff',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <MapPin size={16} />
              <span style={{ fontWeight: 600, fontSize: 12 }}>Your Location</span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'rgba(255,255,255,0.2)',
                  padding: '3px 8px',
                  borderRadius: 6,
                }}
              >
                {tracking ? '🟢 Live' : 'Off'}
              </span>
            </div>
            <p style={{ margin: '0 0 8px', fontSize: 13 }}>
              {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
            </p>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.8 }}>
              Accuracy: ±{location.accuracy ? location.accuracy.toFixed(0) : '?'}m
            </p>
          </div>

          {error && (
            <div
              style={{
                background: T.redBg,
                color: T.red,
                padding: 12,
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </div>
          )}
        </div>
      )}

      {/* Optimized Route Summary */}
      {optimizedRoute.length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: T.text }}>
              Optimized Route
            </h3>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.green,
                background: T.greenBg,
                padding: '3px 10px',
                borderRadius: 6,
              }}
            >
              {optimizedRoute.length} stops
            </span>
          </div>

          {/* ETA Card */}
          {eta && (
            <div
              style={{
                background: T.card,
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                padding: 12,
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: T.amberBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.amber,
                  fontSize: 18,
                }}
              >
                ⏱️
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, color: T.sec }}>Est. Time to Route</p>
                <p style={{ margin: '2px 0 0', fontSize: 16, fontWeight: 700, color: T.text }}>
                  {eta} mins
                </p>
              </div>
              <Navigation size={20} style={{ color: T.blue }} />
            </div>
          )}
        </div>
      )}

      {/* Route List */}
      <div style={{ padding: '0 20px' }}>
        {optimizedRoute.map((locker, idx) => {
          const stopCount = dels.filter((d) => d.locker === locker.name).length;
          const distToThis = idx === 0 ? locker.distance : 0.2;

          return (
            <div
              key={idx}
              onClick={() => {
                setSelectedLocker(locker);
                onSelectLocker?.(locker);
              }}
              style={{
                background: selectedLocker?.name === locker.name ? T.fill : T.card,
                border:
                  selectedLocker?.name === locker.name
                    ? `2px solid ${T.blue}`
                    : `1.5px solid ${T.border}`,
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="tap"
            >
              {/* Stop Number */}
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: T.blueBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.blue,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                {idx + 1}
              </div>

              {/* Locker Info */}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.text }}>
                  {locker.name}
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 12,
                    color: T.sec,
                  }}
                >
                  {stopCount} package{stopCount !== 1 ? 's' : ''} • {distToThis.toFixed(1)} km away
                </p>
              </div>

              {/* Distance Badge */}
              <div style={{ textAlign: 'right' }}>
                <div
                  style={{
                    background: T.greenBg,
                    color: T.green,
                    padding: '4px 10px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  {(locker.distance * 60).toFixed(0)}m
                </div>
                <ChevronRight size={16} style={{ color: T.muted }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Placeholder */}
      <div
        style={{
          margin: '20px',
          height: 200,
          background: `linear-gradient(135deg, ${T.fill}, ${T.fill2})`,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
          {/* Animated map background */}
          <div
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              border: `2px solid ${T.blue}`,
              top: -50,
              right: -50,
              animation: 'float 4s ease-in-out infinite',
            }}
          />
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <MapPin size={28} style={{ color: T.blue, marginBottom: 8 }} />
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.sec }}>
            Map integration ready
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: T.muted }}>
            Integrate your map provider (Google Maps, Mapbox)
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteMapScreen;
