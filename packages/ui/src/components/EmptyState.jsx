import React from 'react';
import { useResolvedTheme } from '../theme/ThemeContext.js';

export default function EmptyState({ emoji, icon, title, desc, action, onAction, theme: propTheme }) {
  var T = useResolvedTheme(propTheme);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 40px' }}>
      <div style={{
        width: 88, height: 88, borderRadius: 30,
        background: T.fill,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        border: '1.5px solid ' + T.border,
      }}>
        {icon ? React.createElement(icon, { size: 36, style: { color: T.secondary } }) : <span style={{ fontSize: 40 }}>{emoji}</span>}
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em', fontFamily: T.font, color: T.text }}>{title}</h2>
      <p style={{ fontSize: 13, lineHeight: '1.7', color: T.secondary, maxWidth: 250, marginBottom: action ? 28 : 0, fontFamily: T.font }}>{desc}</p>
      {action && (
        <button onClick={onAction} style={{
          padding: '12px 28px', borderRadius: 16, fontWeight: 700, fontSize: 14,
          color: '#fff', background: T.accent, border: 'none', cursor: 'pointer',
          fontFamily: T.font, boxShadow: T.shadowMd,
        }}>{action}</button>
      )}
    </div>
  );
}
