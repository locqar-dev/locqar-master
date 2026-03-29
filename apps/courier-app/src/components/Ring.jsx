import React from 'react';

const Ring = ({ pct, sz = 56, sw = 5, color, children, T }) => {
  const ringColor = color || T.green;
  const r = (sz - sw) / 2;
  const ci = r * 2 * Math.PI;
  const o = ci - (pct / 100) * ci;

  return (
    <div
      style={{
        position: 'relative',
        width: sz,
        height: sz,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        style={{
          transform: 'rotate(-90deg)',
          filter: `drop-shadow(0 4px 12px ${ringColor}25)`,
        }}
        width={sz}
        height={sz}
      >
        <circle
          cx={sz / 2}
          cy={sz / 2}
          r={r}
          fill="none"
          stroke={T.fill}
          strokeWidth={sw}
        />
        <circle
          cx={sz / 2}
          cy={sz / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={sw}
          strokeDasharray={ci}
          strokeDashoffset={o}
          strokeLinecap="round"
          style={{
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: pct === 100 ? '20px' : 'inherit',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Ring;
