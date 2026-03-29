import React, { useEffect } from 'react';
import { useResolvedTheme } from '../theme/ThemeContext.js';

export default function Toast({ show, text, emoji, type, variant, onDismiss, duration, theme: propTheme }) {
  var T = useResolvedTheme(propTheme);

  useEffect(function () {
    if (show && onDismiss) {
      var t = setTimeout(onDismiss, duration || 3000);
      return function () { clearTimeout(t); };
    }
  }, [show, onDismiss, duration]);

  if (!show) return null;

  var isError = type === 'error';
  var bg = isError ? T.dangerBg : T.successBg;
  var c = isError ? T.danger : T.success;
  var v = variant || 'pill';

  if (v === 'bar') {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '12px 20px',
        background: bg, borderBottom: '1px solid ' + T.border,
        display: 'flex', alignItems: 'center', gap: 10,
        animation: 'locqar-toast .4s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        {emoji && <span style={{ fontSize: 18 }}>{emoji}</span>}
        <span style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: T.font }}>{text}</span>
      </div>
    );
  }

  // Default: pill variant
  return (
    <div style={{
      position: 'fixed', left: 16, right: 16, top: 60, zIndex: 100,
      display: 'flex', justifyContent: 'center', pointerEvents: 'none',
      animation: 'locqar-toast .4s cubic-bezier(0.32, 0.72, 0, 1)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 24px', borderRadius: 100,
        background: T.card, border: '1px solid ' + T.border,
        boxShadow: T.shadowLg,
      }}>
        {emoji && <span style={{ fontSize: 18 }}>{emoji}</span>}
        <span style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: T.font }}>{text}</span>
      </div>
    </div>
  );
}
