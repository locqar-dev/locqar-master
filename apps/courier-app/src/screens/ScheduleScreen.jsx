import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import Badge from '../components/Badge';
import SwipeConfirm from '../components/SwipeConfirm';
import { MapPin, ArrowLeft, ArrowRight, Check } from '../components/Icons';
import { availableBlocks } from '../data/mockData';

const ScheduleScreen = ({ onBack, onAccept, T }) => {
  const [filter, setFilter] = useState('all');
  const [swipeId, setSwipeId] = useState(null);
  const [accepted, setAccepted] = useState(null);
  const [dayOffset, setDayOffset] = useState(0);
  const selDate = new Date(); selDate.setDate(selDate.getDate() + dayOffset);
  const dayLabel = dayOffset === 0 ? 'Today' : dayOffset === 1 ? 'Tomorrow' : selDate.toLocaleDateString('en-GB', { weekday: 'long' });
  const filtered = availableBlocks.filter(b => filter === 'all' || (filter === 'surge' && b.surge));
  const doAccept = (b) => { setAccepted(b.id); setTimeout(() => { setSwipeId(null); onAccept(b) }, 1000) };
  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}><StatusBar />
    <TopBar title="Available Blocks" sub="Pick your delivery shift" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[{ id: 'all', l: 'All Blocks' }, { id: 'surge', l: '\u26A1 Surge Pay' }].map(f =>
          <button key={f.id} onClick={() => setFilter(f.id)} className="tap" style={{ height: 32, padding: '0 14px', borderRadius: 16, border: 'none', fontSize: 14, fontWeight: 600, background: filter === f.id ? T.text : T.fill, color: filter === f.id ? '#fff' : T.text }}>{f.l}</button>
        )}
      </div>
      {/* Date picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, background: T.fill, borderRadius: 12, padding: '8px 12px' }}>
        <button onClick={() => dayOffset > 0 && setDayOffset(dayOffset - 1)} className="tap" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: dayOffset > 0 ? T.card : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: dayOffset > 0 ? 1 : .3 }}><ArrowLeft size={16} /></button>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{dayLabel}</span>
          <span style={{ fontSize: 13, color: T.sec, marginLeft: 6 }}>{selDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        </div>
        <button onClick={() => dayOffset < 6 && setDayOffset(dayOffset + 1)} className="tap" style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: dayOffset < 6 ? T.card : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: dayOffset < 6 ? 1 : .3 }}><ArrowRight size={16} /></button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((b, i) => (
          <div key={b.id} className="fu" style={{
            borderRadius: 16, background: T.card, overflow: 'hidden',
            border: accepted === b.id ? `2px solid ${T.green}` : b.surge ? `1.5px solid ${T.accent}` : `1.5px solid ${T.border}`,
            boxShadow: T.shadow,
            animationDelay: `${i * 0.08}s`, display: 'flex',
          }}>
            <div style={{ width: 4, flexShrink: 0, background: accepted === b.id ? T.green : b.surge ? T.accent : T.fill2 }} />
            <div style={{ flex: 1, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 15, fontWeight: 700 }}>{b.time}</span>{b.surge && <Badge v="surge" sm T={T}>{'\u26A1'} Surge</Badge>}</div>
                <span style={{ fontSize: 17, fontWeight: 800, color: T.text }}>{b.pay}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 12 }}><MapPin size={13} style={{ color: T.sec }} /><span style={{ fontSize: 13, color: T.sec }}>{b.area}</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                {[{ l: 'Duration', v: b.type }, { l: 'Stops', v: b.stops }, { l: 'Distance', v: b.dist }].map((s, j) =>
                  <div key={j} style={{ borderRadius: 10, padding: '8px 6px', textAlign: 'center', background: T.bg }}><p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{s.l}</p><p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{s.v}</p></div>
                )}
              </div>
              {accepted === b.id ? (
                <div style={{ height: 48, borderRadius: 12, background: T.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Check size={18} style={{ color: T.green }} /><span style={{ fontWeight: 700, fontSize: 14, color: T.green }}>Block Accepted!</span></div>
              ) : swipeId === b.id ? (
                <SwipeConfirm label="Swipe to accept" onConfirm={() => doAccept(b)} color={T.accent} icon={<Check size={20} />} T={T} />
              ) : (
                <button onClick={() => setSwipeId(b.id)} className="press" style={{ width: '100%', height: 48, borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer', background: T.accentGradient, color: '#fff' }}>Accept Block</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>;
};

export default ScheduleScreen;
