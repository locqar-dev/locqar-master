import React from 'react';
import { useResolvedTheme } from '../theme/ThemeContext.js';
import { ArrowLeft } from './Icons.jsx';

export default function PageHeader({ title, subtitle, onBack, right, theme: propTheme }) {
  var T = useResolvedTheme(propTheme);
  return (
    <div style={{ padding: '12px 20px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {onBack && (
          <button onClick={onBack} style={{
            width: 44, height: 44, borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: T.card, border: '1.5px solid ' + T.border,
            boxShadow: T.shadow, cursor: 'pointer',
          }}>
            <ArrowLeft style={{ width: 20, height: 20, color: T.text, strokeWidth: 2.5 }} />
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em',
            fontFamily: T.font, color: T.text, margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{title}</h1>
          {subtitle && (
            <p style={{
              fontSize: 12, color: T.secondary, marginTop: 1, fontFamily: T.font,
              fontWeight: 500, margin: '1px 0 0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{subtitle}</p>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}
