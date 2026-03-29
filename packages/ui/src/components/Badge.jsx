import React from 'react';
import { useResolvedTheme } from '../theme/ThemeContext.js';

var variantColors = function (T, v) {
  var m = {
    default: [T.fill, T.secondary],
    success: [T.successBg, T.success],
    warning: [T.warningBg, T.warning],
    danger: [T.dangerBg, T.danger],
    info: [T.infoBg, T.info],
  };
  return m[v] || m.default;
};

export default function Badge({ children, variant, sm, theme: propTheme }) {
  var T = useResolvedTheme(propTheme);
  var v = variant || 'default';
  var colors = variantColors(T, v);
  return (
    <span style={{
      background: colors[0],
      color: colors[1],
      fontSize: sm ? 10 : 12,
      padding: sm ? '2px 7px' : '4px 10px',
      borderRadius: 6,
      fontWeight: 700,
      letterSpacing: '0.02em',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}
