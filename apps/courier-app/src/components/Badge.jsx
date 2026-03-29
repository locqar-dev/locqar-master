import React from 'react';

const Badge = ({ children, v = 'default', sm, animated, T }) => {
  const variants = {
    default: { bg: T.fill, color: T.sec, shadow: 'none' },
    success: { bg: T.greenBg, color: T.green, shadow: `0 4px 12px ${T.greenLight}40` },
    warning: { bg: T.amberBg, color: T.amber, shadow: `0 4px 12px ${T.amberLight}40` },
    danger: { bg: T.redBg, color: T.red, shadow: `0 4px 12px ${T.redLight}40` },
    info: { bg: T.blueBg, color: T.blue, shadow: `0 4px 12px ${T.blueLight}40` },
    surge: { bg: '#FFF4E6', color: '#E8590C', shadow: 'none' },
  };
  
  const style = variants[v] || variants.default;
  const baseSize = sm ? '10px' : '12px';
  const padding = sm ? '3px 8px' : '4px 10px';
  const borderRadius = sm ? '6px' : '8px';
  
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontSize: baseSize,
        padding,
        borderRadius,
        fontWeight: 700,
        letterSpacing: '0.02em',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        whiteSpace: 'nowrap',
        boxShadow: style.shadow,
        transition: 'all 0.2s ease',
        animation: animated ? 'badgePulse 1.5s ease-in-out infinite' : 'none',
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
