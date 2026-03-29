import React from 'react';
import { useResolvedTheme } from '../theme/ThemeContext.js';

export function Skeleton({ w, h, r, style, theme: propTheme }) {
  var T = useResolvedTheme(propTheme);
  return (
    <div style={Object.assign({
      width: w || '100%',
      height: h || 16,
      borderRadius: r || 12,
      background: 'linear-gradient(90deg, ' + T.fill + ' 25%, ' + T.fill2 + ' 50%, ' + T.fill + ' 75%)',
      backgroundSize: '200% 100%',
      animation: 'locqar-shimmer 1.5s ease infinite',
    }, style)} />
  );
}

export function SkeletonCard({ theme: propTheme }) {
  var T = useResolvedTheme(propTheme);
  return (
    <div style={{ padding: 20, borderRadius: 24, background: T.card, border: '1.5px solid ' + T.border }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <Skeleton w={48} h={48} r={16} theme={T} />
        <div style={{ flex: 1 }}>
          <Skeleton h={14} w="60%" theme={T} style={{ marginBottom: 8 }} />
          <Skeleton h={10} w="40%" theme={T} />
        </div>
      </div>
      <Skeleton h={40} theme={T} />
    </div>
  );
}

export function SkeletonList({ rows, theme: propTheme }) {
  var T = useResolvedTheme(propTheme);
  var count = rows || 4;
  return (
    <div style={{ padding: '0 20px' }}>
      {Array.from({ length: count }).map(function (_, i) {
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: '1px solid ' + T.fill }}>
            <Skeleton w={44} h={44} r={14} theme={T} />
            <div style={{ flex: 1 }}>
              <Skeleton h={13} w={120 + Math.random() * 80 + 'px'} theme={T} style={{ marginBottom: 8 }} />
              <Skeleton h={10} w="50%" theme={T} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Skeleton;
