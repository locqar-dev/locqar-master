import React, { useState, useRef } from 'react';
import { ChevronRight, ArrowRight, Check } from './Icons';

const SwipeConfirm = ({ label, onConfirm, color, icon, T }) => {
  const swipeColor = color || T.red;
  const trackRef = useRef(null);
  const [posX, setPosX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const startXRef = useRef(0);
  const THUMB = 52;

  const getMax = () =>
    trackRef.current
      ? trackRef.current.offsetWidth - THUMB - 16
      : 240;

  const handleStart = (cx) => {
    if (confirmed) return;
    setDragging(true);
    startXRef.current = cx - posX;
  };

  const handleMove = (cx) => {
    if (!dragging || confirmed) return;
    setPosX(Math.max(0, Math.min(cx - startXRef.current, getMax())));
  };

  const handleEnd = () => {
    if (!dragging || confirmed) return;
    setDragging(false);

    if (posX / getMax() >= 0.72) {
      setPosX(getMax());
      setConfirmed(true);

      try {
        navigator.vibrate && navigator.vibrate([30, 50, 30]);
      } catch (e) {
        // Vibration API not available
      }

      setTimeout(() => {
        onConfirm();
        setConfirmed(false);
        setPosX(0);
      }, 600);
    } else {
      setPosX(0);
    }
  };

  const pct = getMax() > 0 ? posX / getMax() : 0;

  return (
    <div
      ref={trackRef}
      style={{
        position: 'relative',
        height: 64,
        borderRadius: 16,
        overflow: 'hidden',
        background: confirmed ? T.green : T.fill,
        transition: confirmed ? 'background 0.3s ease' : 'none',
        userSelect: 'none',
        touchAction: 'none',
        border: confirmed ? 'none' : `1.5px solid ${T.border}`,
        boxShadow: confirmed
          ? `0 8px 24px ${T.green}30`
          : dragging
          ? `0 4px 12px ${swipeColor}20`
          : 'none',
        cursor: 'grab',
      }}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      {/* Background fill that grows as you swipe */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 14,
          background: `linear-gradient(90deg, ${swipeColor}20 0%, ${swipeColor}05 100%)`,
          opacity: pct * 1.5,
          transition: dragging ? 'none' : 'opacity 0.3s ease',
        }}
      />

      {/* Center text label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontWeight: 600,
            fontSize: 14,
            color: confirmed ? '#fff' : T.sec,
            opacity: confirmed ? 1 : Math.max(0.4, 1 - pct * 0.6),
            transition: 'all 0.3s ease',
            letterSpacing: '0.02em',
          }}
        >
          {confirmed ? '✓ Confirmed!' : label}
        </span>
      </div>

      {/* Chevron hint on right side */}
      {!confirmed && (
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            gap: 2,
            pointerEvents: 'none',
            opacity: Math.max(0, 0.4 - pct * 0.5),
            transition: 'opacity 0.2s ease',
          }}
        >
          <ChevronRight
            size={14}
            style={{
              color: swipeColor,
              opacity: 0.5,
              animation: dragging ? 'none' : 'slideRight 0.8s ease-in-out infinite',
            }}
          />
          <ChevronRight
            size={14}
            style={{
              color: swipeColor,
              opacity: 0.3,
              animation: dragging ? 'none' : 'slideRight 0.8s ease-in-out 0.15s infinite',
            }}
          />
        </div>
      )}

      {/* Thumb/slider button */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          width: THUMB,
          height: THUMB,
          borderRadius: 12,
          background: confirmed
            ? '#fff'
            : `linear-gradient(135deg, ${swipeColor}, ${swipeColor}DD)`,
          color: confirmed ? T.green : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          transform: `translateX(${posX}px)`,
          transition: dragging
            ? 'none'
            : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.3, 1)',
          boxShadow: confirmed
            ? '0 4px 12px rgba(0,0,0,0.1)'
            : `0 4px 12px ${swipeColor}30`,
          fontWeight: 700,
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      >
        {confirmed ? (
          <Check size={24} strokeWidth={3} />
        ) : icon ? (
          icon
        ) : (
          <ArrowRight size={22} strokeWidth={2.5} />
        )}
      </div>
    </div>
  );
};

export default SwipeConfirm;
