import React from 'react';

export const getPriMeta = (T) => ({
  urgent: {
    icon: '⚡',
    label: 'Urgent',
    color: T.red,
    bg: T.redBg,
    shadow: `0 4px 12px ${T.red}25`,
  },
  sameDay: {
    icon: '📅',
    label: 'Same Day',
    color: T.amber,
    bg: T.amberBg,
    shadow: `0 4px 12px ${T.amber}25`,
  },
  timeSensitive: {
    icon: '⏰',
    label: 'Time Sensitive',
    color: T.purple,
    bg: T.purpleBg,
    shadow: `0 4px 12px ${T.purple}25`,
  },
  normal: {
    icon: '',
    label: 'Standard',
    color: T.sec,
    bg: T.fill,
    shadow: 'none',
  },
});

export const priOrder = { urgent: 0, timeSensitive: 1, sameDay: 2, normal: 3 };

const PriorityBadge = ({ pri, deadline, sm, T }) => {
  const priMeta = getPriMeta(T);
  const m = priMeta[pri] || priMeta.normal;

  if (pri === 'normal') return null;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: sm ? '3px 8px' : '4px 10px',
        borderRadius: sm ? 6 : 8,
        fontSize: sm ? 10 : 12,
        fontWeight: 700,
        background: m.bg,
        color: m.color,
        whiteSpace: 'nowrap',
        boxShadow: m.shadow,
        border: `1px solid ${m.color}30`,
        letterSpacing: '0.02em',
        transition: 'all 0.2s ease',
        animation: pri === 'urgent' ? 'badgePulse 2s ease-in-out infinite' : 'none',
      }}
    >
      {m.icon && <span style={{ marginRight: 2 }}>{m.icon}</span>}
      {m.label}
      {deadline && (
        <>
          <span style={{ opacity: 0.5 }}>·</span>
          <span style={{ fontSize: sm ? 9 : 11, fontVariantNumeric: 'tabular-nums' }}>
            {deadline}
          </span>
        </>
      )}
    </span>
  );
};

export default PriorityBadge;
