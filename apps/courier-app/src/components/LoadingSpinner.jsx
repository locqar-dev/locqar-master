import React from 'react';
import { lightTheme } from '../theme/themes';

const T = lightTheme;

export default function LoadingSpinner({ size = 40, color, style }) {
  const spinnerColor = color || T.blue;

  return (
    <div
      className="sp"
      style={{
        width: size,
        height: size,
        border: `${Math.max(2, size / 10)}px solid ${T.fill}`,
        borderTopColor: spinnerColor,
        borderRadius: '50%',
        boxShadow: `0 0 12px ${spinnerColor}30`,
        ...style,
      }}
    />
  );
}

export function LoadingDots({ size = 8, color, gap = 6, T: ThemeT }) {
  const theme = ThemeT || lightTheme;
  const dotColor = color || theme.blue;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap,
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="dotPulse"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: dotColor,
            animation: `dotPulse 1.4s ease-in-out infinite`,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export function LoadingPulse({ size = 40, color, T: ThemeT }) {
  const theme = ThemeT || lightTheme;
  const pulseColor = color || theme.blue;

  return (
    <div
      className="pulse"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `${pulseColor}20`,
        position: 'relative',
        boxShadow: `0 0 24px ${pulseColor}25`,
        animation: 'avatarPulse 2s ease-in-out infinite',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: size / 4,
          borderRadius: '50%',
          background: pulseColor,
        }}
      />
    </div>
  );
}

export function PageLoader({ message = 'Loading...', T: ThemeT }) {
  const theme = ThemeT || lightTheme;

  return (
    <div
      className="fu"
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.bg,
        zIndex: 9999,
        animation: 'fadeUp 0.4s ease',
      }}
    >
      <LoadingSpinner size={48} />
      {message && (
        <p
          style={{
            marginTop: 20,
            fontSize: 14,
            fontWeight: 600,
            color: theme.sec,
            animation: 'fadeUp 0.6s ease 0.2s both',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export function InlineLoader({ size = 16, message, T: ThemeT }) {
  const theme = ThemeT || lightTheme;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <LoadingSpinner size={size} />
      {message && (
        <span style={{ fontSize: 13, color: theme.sec, fontWeight: 600 }}>{message}</span>
      )}
    </div>
  );
}

