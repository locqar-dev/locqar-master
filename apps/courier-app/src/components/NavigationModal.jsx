import React, { useState } from 'react';
import { Navigation } from './Icons';

export const openNavigation = (name, addr, lat, lng, app = 'google') => {
  if (app === 'waze' && lat && lng) window.open(`https://waze.com/ul?ll=${lat},${lng}&navigate=yes`, '_blank');
  else if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
  else window.open('https://www.google.com/maps/search/' + encodeURIComponent(name + ' ' + addr), '_blank');
};

const NavigationButton = ({ name, addr, lat, lng, compact, T }) => {
  const [show, setShow] = useState(false);
  if (compact) return <button onClick={() => openNavigation(name, addr, lat, lng)} className="tap" style={{ height: 32, padding: '0 10px', borderRadius: 8, border: `1px solid ${T.border}`, background: T.bg, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, color: T.sec }}><Navigation size={12} />Navigate</button>;
  return <div style={{ position: 'relative' }}>
    <button onClick={() => setShow(!show)} className="tap" style={{ flex: 1, height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: T.text }}><Navigation size={16} />Navigate</button>
    {show && <div style={{ position: 'absolute', top: 48, left: 0, right: 0, zIndex: 20, borderRadius: 12, background: T.card, border: `1px solid ${T.border}`, boxShadow: T.shadowMd, overflow: 'hidden' }}>
      <button onClick={() => { openNavigation(name, addr, lat, lng, 'google'); setShow(false) }} className="tap" style={{ width: '100%', padding: '12px 14px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, borderBottom: `1px solid ${T.border}` }}>
        <span style={{ fontSize: 16 }}>{'\uD83D\uDDFA\uFE0F'}</span>Google Maps
      </button>
      <button onClick={() => { openNavigation(name, addr, lat, lng, 'waze'); setShow(false) }} className="tap" style={{ width: '100%', padding: '12px 14px', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
        <span style={{ fontSize: 16 }}>{'\uD83E\uDDED'}</span>Waze
      </button>
    </div>}
  </div>;
};

export default NavigationButton;
