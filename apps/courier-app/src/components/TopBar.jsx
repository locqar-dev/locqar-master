import React from 'react';
import { ArrowLeft } from './Icons';

const ff = "'Inter', system-ui, -apple-system, sans-serif";
const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";

const TopBar = ({ title, sub, onBack, right, T }) => (
  <div
    style={{
      padding: '10px 20px 12px',
      background: T.card,
      borderBottom: `1px solid ${T.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      backdropFilter: 'blur(10px)',
      animation: 'slideDown 0.3s ease-out',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {onBack && (
        <button
          onClick={onBack}
          className="press tap"
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: T.card,
            border: `1.5px solid ${T.border}`,
            boxShadow: T.shadow,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: T.text,
            flexShrink: 0,
          }}
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
        </button>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          className="truncate"
          style={{
            fontSize: 20,
            fontWeight: 800,
            margin: 0,
            letterSpacing: '-0.03em',
            fontFamily: hf,
            color: T.text,
          }}
        >
          {title}
        </h1>
        {sub && (
          <p style={{ fontSize: 12, color: T.sec, margin: '1px 0 0', fontFamily: ff, fontWeight: 500 }}>{sub}</p>
        )}
      </div>
      {right && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {right}
        </div>
      )}
    </div>
  </div>
);

export default TopBar;
