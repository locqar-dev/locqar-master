import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import Badge from '../components/Badge';
import NavigationButton from '../components/NavigationModal';
import { Check } from '../components/Icons';
import { lockersData } from '../data/mockData';
import { SizeIcon, StopProgress, sizeColor } from './HomeScreen';

const optimizeRoute = (lockers, tasks, mode = 'distance') => {
  if (mode === 'distance') return [...lockers].sort((a, b) => a.distKm - b.distKm);
  if (mode === 'packages') return [...lockers].sort((a, b) => {
    const aCount = tasks.filter(t => t.locker === a.name && (t.tab === 'accepted' || t.tab === 'in_transit_to_locker')).length;
    const bCount = tasks.filter(t => t.locker === b.name && (t.tab === 'accepted' || t.tab === 'in_transit_to_locker')).length;
    return bCount - aCount;
  });
  return [...lockers].sort((a, b) => a.distKm - b.distKm);
};

const ItineraryScreen = ({ dels, tasks, onBack, onNav, T }) => {
  const [routeMode, setRouteMode] = useState('distance');
  const sortedLockers = optimizeRoute(lockersData, tasks, routeMode);
  const curIdx = sortedLockers.findIndex(l => dels.some(d => d.locker === l.name && d.status === 'pending'));
  const done = dels.filter(d => d.status === 'delivered').length;
  const totalDist = sortedLockers.reduce((s, l) => s + l.distKm, 0);
  const totalEta = sortedLockers.reduce((s, l) => s + parseInt(l.eta), 0);

  const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";
  const ff = "'Inter', system-ui, -apple-system, sans-serif";
  const mf = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}><StatusBar />
    <TopBar title="Itinerary" onBack={onBack} T={T} />
    <StopProgress current={curIdx >= 0 ? curIdx + 1 : sortedLockers.length} total={sortedLockers.length} doneP={done} totalP={dels.length} T={T} />
    <div style={{ padding: '12px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: ff }}>{'\uD83D\uDCCD'} {totalDist.toFixed(1)} km</span>
          <span style={{ color: T.border }}>{'\u00B7'}</span>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: ff }}>{'\uD83D\uDD50'} ~{totalEta} min</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {[{ id: 'distance', l: 'Nearest First' }, { id: 'packages', l: 'Most Packages' }].map(m => (
          <button key={m.id} onClick={() => setRouteMode(m.id)} className="tap" style={{ flex: 1, height: 32, borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, fontFamily: ff, background: routeMode === m.id ? T.accent : T.fill, color: routeMode === m.id ? '#fff' : T.sec }}>{m.l}</button>
        ))}
      </div>
    </div>
    <div style={{ padding: '0 20px' }}>
      {sortedLockers.map((l, i) => {
        const sd = dels.filter(d => d.locker === l.name);
        const dn = sd.filter(d => d.status === 'delivered').length;
        const allD = dn === sd.length && sd.length > 0;
        const isA = i === curIdx;
        return <div key={l.id} className="fu" style={{ marginBottom: 16, animationDelay: `${i * 0.08}s` }}>
          <button onClick={() => onNav('stop', { locker: l, stopNum: i + 1 })} className="press" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'none', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: mf, background: allD ? T.green : isA ? T.accentGradient : T.fill2, boxShadow: isA ? `0 4px 12px ${T.accent}40` : 'none' }}>
                {allD ? <Check size={18} /> : <span style={{ color: isA ? '#fff' : T.sec }}>{i + 1}</span>}
              </div>
              {i < sortedLockers.length - 1 && <div style={{ width: 2, height: 24, marginTop: 4, background: allD ? T.green : T.border }} />}
            </div>
            <div style={{ flex: 1, borderRadius: 16, padding: 16, background: T.card, border: `1.5px solid ${isA ? T.accent : allD ? T.green : T.border}`, boxShadow: isA ? `0 0 0 3px ${T.accent}15, ${T.shadow}` : T.shadow }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, margin: 0, fontFamily: hf, letterSpacing: '-0.02em', color: allD ? T.muted : T.text, textDecoration: allD ? 'line-through' : 'none' }}>{l.name}</p>
                  <p style={{ fontSize: 12, color: T.sec, margin: '2px 0 0', fontFamily: ff }}>{l.addr}</p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: allD ? T.green : isA ? T.accent : T.text, fontFamily: mf, flexShrink: 0, marginLeft: 12 }}>{dn}/{sd.length}</span>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>📍 {l.dist}</span>
                <span style={{ color: T.border }}>·</span>
                <span style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>🕐 {l.eta}</span>
              </div>
              <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: T.fill2, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 2, width: `${sd.length > 0 ? (dn / sd.length) * 100 : 0}%`, background: allD ? T.gradientSuccess : T.accentGradient, transition: 'width .5s' }} />
              </div>
            </div>
          </button>
          {isA && <div style={{ marginLeft: 52, marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {sd.map(p => (
              <div key={p.id} style={{ borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, background: p.status === 'delivered' ? T.greenBg : T.card, border: `1.5px solid ${p.status === 'delivered' ? T.green : T.border}` }}>
                <SizeIcon sz={p.sz} T={T} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontFamily: mf, fontWeight: 700, margin: 0, letterSpacing: '-0.01em', color: T.text }}>{p.trk}</p>
                  <p style={{ fontSize: 12, color: T.sec, margin: 0, fontFamily: ff }}>{p.receiver}</p>
                </div>
                {p.status === 'delivered'
                  ? <Check size={16} style={{ color: T.green, flexShrink: 0 }} />
                  : <Badge v="default" sm T={T}>Pending</Badge>}
              </div>
            ))}
            <NavigationButton name={l.name} addr={l.addr} lat={l.lat} lng={l.lng} T={T} />
          </div>}
        </div>;
      })}
    </div>
  </div>;
};

export default ItineraryScreen;
