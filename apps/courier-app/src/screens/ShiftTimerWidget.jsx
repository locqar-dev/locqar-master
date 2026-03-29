import React, { useState, useEffect } from 'react';
import { Clock } from '../components/Icons';

const ShiftTimer = ({ shiftState, onClockIn, onClockOut, onBreak, onResume, T }) => {
  const [elapsed, setElapsed] = useState('0:00');
  useEffect(() => {
    if (!shiftState?.isActive) return;
    const tick = () => {
      const start = new Date(shiftState.clockInTime);
      const breakMs = (shiftState.breaks || []).reduce((s, b) => s + (b.end ? new Date(b.end) - new Date(b.start) : 0), 0);
      const curBreak = shiftState.currentBreakStart ? Date.now() - new Date(shiftState.currentBreakStart).getTime() : 0;
      const ms = Date.now() - start.getTime() - breakMs - curBreak;
      const h = Math.floor(ms / 3600000); const m = Math.floor((ms % 3600000) / 60000);
      setElapsed(`${h}:${String(m).padStart(2, '0')}`);
    };
    tick(); const i = setInterval(tick, 30000); return () => clearInterval(i);
  }, [shiftState]);
  if (!shiftState?.isActive) return <button onClick={onClockIn} className="press" style={{ width: '100%', borderRadius: 16, height: 52, background: T.green, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#fff', fontWeight: 800, fontSize: 15, boxShadow: `0 8px 16px ${T.green}30`, letterSpacing: '-0.01em' }}>
    <Clock size={18} />Clock In
  </button>;
  return <div style={{ borderRadius: 16, padding: 16, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: shiftState.currentBreakStart ? T.amber : T.green }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: T.sec }}>{shiftState.currentBreakStart ? 'On Break' : 'Active Shift'}</span>
      </div>
      <span style={{ fontSize: 20, fontWeight: 700 }}>{elapsed}</span>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {shiftState.currentBreakStart ?
        <button onClick={onResume} className="tap" style={{ flex: 1, height: 36, borderRadius: 8, border: 'none', background: T.green, color: '#fff', fontWeight: 600, fontSize: 13 }}>Resume</button> :
        <button onClick={onBreak} className="tap" style={{ flex: 1, height: 36, borderRadius: 8, border: 'none', background: T.fill, color: T.text, fontWeight: 600, fontSize: 13 }}>Break</button>
      }
      <button onClick={onClockOut} className="tap" style={{ flex: 1, height: 36, borderRadius: 8, border: 'none', background: T.redBg, color: T.red, fontWeight: 600, fontSize: 13 }}>Clock Out</button>
    </div>
  </div>;
};

export default ShiftTimer;
