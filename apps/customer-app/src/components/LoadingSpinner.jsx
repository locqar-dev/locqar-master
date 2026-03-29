import React from "react";
import { T } from "../theme/themes";

export default function LoadingSpinner({ size = 40, color, style }) {
  const spinnerColor = color || T.accent;

  return (
    <div
      className="spin"
      style={{
        width: size,
        height: size,
        border: `${size / 10}px solid ${T.fill}`,
        borderTopColor: spinnerColor,
        borderRadius: '50%',
        ...style
      }}
    />
  );
}

export function LoadingDots({ size = 8, color, gap = 6 }) {
  const dotColor = color || T.accent;

  return (
    <div className="flex items-center" style={{ gap }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="loading-dot"
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: dotColor,
            animationDelay: `${i * 0.15}s`
          }}
        />
      ))}
    </div>
  );
}

export function LoadingPulse({ size = 40, color }) {
  const pulseColor = color || T.accent;

  return (
    <div
      className="pulse"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: pulseColor + '40',
        position: 'relative'
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: size / 4,
          borderRadius: '50%',
          background: pulseColor
        }}
      />
    </div>
  );
}

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div
      className="fu fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background: T.bg,
        zIndex: 9999
      }}
    >
      <LoadingSpinner size={48} />
      {message && (
        <p
          style={{
            marginTop: 16,
            fontSize: 14,
            fontWeight: 600,
            color: T.sec
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export function InlineLoader({ size = 16, message }) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size={size} />
      {message && (
        <span style={{ fontSize: 13, color: T.sec }}>{message}</span>
      )}
    </div>
  );
}
