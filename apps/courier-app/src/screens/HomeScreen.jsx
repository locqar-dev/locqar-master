import React, { useState, useEffect, useRef } from 'react';
import StatusBar from '../components/StatusBar';
import Badge from '../components/Badge';
import { Skeleton } from '../components/Skeleton';
import { Bell, ChevronRight, Check, Navigation, Camera, MapPin, RefreshCw, Home } from '../components/Icons';
import { driver, lockersData } from '../data/mockData';
import ShiftTimer from './ShiftTimerWidget';
import VehicleCapacityCard from './VehicleCapacityWidget';

const sizeColor = (s, T) => s === 'S' ? [T.fill, T.muted] : s === 'M' ? [T.fill2, T.sec] : s === 'L' ? [T.border, T.text] : [T.text, T.bg];

const getGreeting = () => { const h = new Date().getHours(); if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening'; };

const useScreenLoad = (ms = 300) => { const [ok, setOk] = useState(false); useEffect(() => { const t = setTimeout(() => setOk(true), ms); return () => clearTimeout(t) }, []); return ok; };

const RATE_PER_PKG = 12.75;

const SizeIcon = ({ sz, big, sm, T }) => {
  const [bg, c] = sizeColor(sz, T);
  const size = big ? 56 : sm ? 32 : 44;
  return <div style={{ width: size, height: size, borderRadius: sm ? 8 : 12, background: bg, color: c, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: big ? 20 : sm ? 12 : 16, flexShrink: 0 }}>{sz}</div>;
};

const StopProgress = ({ current, total, doneP, totalP, T }) => (
  <div style={{ padding: '12px 20px', background: T.text }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>Stop {current} of {total}</span>
        <Badge v="default" sm T={T}>{doneP}/{totalP} pkgs</Badge>
      </div>
      <span style={{ color: 'rgba(255,255,255,.5)', fontSize: 12 }}>{totalP > 0 ? Math.round((doneP / totalP) * 100) : 0}%</span>
    </div>
    <div style={{ display: 'flex', gap: 4 }}>{Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,.15)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, transition: 'width .5s', width: i < current - 1 ? '100%' : i === current - 1 ? '50%' : '0%', background: i < current - 1 ? T.green : T.red }} />
      </div>
    ))}</div>
  </div>
);

/* SVG Pie Chart */
const PieChart = ({ slices, size = 120, hole = 0.55, T }) => {
  const r = size / 2, ir = r * hole; let cum = 0;
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    {slices.filter(s => s.value > 0).map((s, i) => {
      const total = slices.reduce((a, b) => a + b.value, 0);
      if (total === 0) return null;
      const pct = s.value / total; const startAngle = cum * 2 * Math.PI - Math.PI / 2; cum += pct; const endAngle = cum * 2 * Math.PI - Math.PI / 2;
      const largeArc = pct > 0.5 ? 1 : 0;
      const x1o = r + r * Math.cos(startAngle), y1o = r + r * Math.sin(startAngle);
      const x2o = r + r * Math.cos(endAngle), y2o = r + r * Math.sin(endAngle);
      const x1i = r + ir * Math.cos(endAngle), y1i = r + ir * Math.sin(endAngle);
      const x2i = r + ir * Math.cos(startAngle), y2i = r + ir * Math.sin(startAngle);
      if (pct >= 0.999) return <React.Fragment key={i}><circle cx={r} cy={r} r={r} fill={s.color} /><circle cx={r} cy={r} r={ir} fill={T.bg} /></React.Fragment>;
      return <path key={i} d={`M${x1o},${y1o} A${r},${r} 0 ${largeArc} 1 ${x2o},${y2o} L${x1i},${y1i} A${ir},${ir} 0 ${largeArc} 0 ${x2i},${y2i} Z`} fill={s.color} />;
    })}
    {slices.reduce((a, b) => a + b.value, 0) === 0 && <><circle cx={r} cy={r} r={r} fill={T.fill} /><circle cx={r} cy={r} r={ir} fill={T.bg} /></>}
  </svg>;
};

const HomeScreen = ({ dels, tasks, activeBlock, onNav, notifCount, onRefresh, shiftState, onClockIn, onClockOut, onBreak, onResume, vehicleConfig, T }) => {
  const [online, setOnline] = useState(!!activeBlock);
  const total = dels.length, done = dels.filter(d => d.status === 'delivered').length;
  const pct = total > 0 ? (done / total) * 100 : 0;
  const curIdx = lockersData.findIndex(l => dels.some(d => d.locker === l.name && d.status === 'pending'));
  const curStop = curIdx >= 0 ? curIdx + 1 : lockersData.length;

  const assigned = tasks.filter(t => t.tab === 'assigned').length;
  const accepted = tasks.filter(t => t.tab === 'accepted').length;
  const inTransit = tasks.filter(t => t.tab === 'in_transit_to_locker').length;
  const deposited = tasks.filter(t => t.tab === 'delivered_to_locker').length;
  const recall = tasks.filter(t => t.tab === 'recalled').length;
  const totalTasks = tasks.length;
  const dynamicEarn = deposited * RATE_PER_PKG;
  const delivering = accepted + inTransit;
  const pieSlices = [
    { label: 'Assigned', value: assigned, color: T.accentBg },
    { label: 'Delivering', value: delivering, color: T.accent },
    { label: 'Delivered', value: deposited, color: T.green },
    { label: 'Recall', value: recall, color: T.red },
  ];
  const loaded = useScreenLoad(300);

  /* Pull-to-refresh */
  const [refreshing, setRefreshing] = useState(false);
  const [pullY, setPullY] = useState(0);
  const touchStartY = useRef(0); const scrollEl = useRef(null);
  const onTouchStart = e => { if (scrollEl.current && scrollEl.current.scrollTop === 0) touchStartY.current = e.touches[0].clientY };
  const onTouchMove = e => { if (!touchStartY.current) return; const dy = e.touches[0].clientY - touchStartY.current; if (dy > 0 && dy < 120) setPullY(dy) };
  const onTouchEnd = () => { if (pullY > 60) { setRefreshing(true); onRefresh && onRefresh(); setTimeout(() => { setRefreshing(false); setPullY(0) }, 1000) } else { setPullY(0) }; touchStartY.current = 0 };

  /* Active block timer */
  const [blockTime, setBlockTime] = useState('');
  useEffect(() => {
    if (!activeBlock) return;
    const parseTime = (s) => { const [t, p] = s.split(' '); const [h, m] = t.split(':').map(Number); return (p === 'PM' && h !== 12 ? h + 12 : p === 'AM' && h === 12 ? 0 : h) * 60 + m };
    const endStr = activeBlock.time.split('\u2013')[1]?.trim() || activeBlock.time.split('-')[1]?.trim();
    if (!endStr) return;
    const tick = () => {
      const now = new Date(); const nowMin = now.getHours() * 60 + now.getMinutes();
      const endMin = parseTime(endStr); const diff = endMin - nowMin;
      if (diff <= 0) { setBlockTime('Ending soon'); return }
      setBlockTime(`${Math.floor(diff / 60)}h ${diff % 60}m left`);
    };
    tick(); const i = setInterval(tick, 30000); return () => clearInterval(i);
  }, [activeBlock]);

  return <div ref={scrollEl} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ minHeight: '100vh', background: T.bg, paddingBottom: 96 }}><StatusBar />
    {/* Pull-to-refresh indicator */}
    {pullY > 10 && <div style={{ display: 'flex', justifyContent: 'center', padding: `${Math.min(pullY / 2, 30)}px 0`, transition: pullY === 0 ? 'all .3s' : 'none' }}>
      <RefreshCw size={20} className={refreshing ? 'sp' : ''} style={{ color: T.sec, transform: `rotate(${pullY * 3}deg)`, transition: refreshing ? 'none' : 'transform .1s' }} />
    </div>}
    <div style={{ padding: '0 20px 12px' }}>
      {/* Premium Hero Card */}
      <div style={{
        borderRadius: 20, marginBottom: 16, overflow: 'hidden', position: 'relative',
        background: `linear-gradient(160deg, #000000 0%, #1C1C1E 100%)`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 24, background: 'rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                border: '2px solid rgba(255,255,255,0.25)',
                animation: shiftState?.isActive ? 'avatarPulse 2s ease-in-out infinite' : 'none',
              }}>{driver.avatar}</div>
              {shiftState?.isActive && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, borderRadius: 7, background: T.green, border: '2px solid #0f1928' }} />}
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: 0 }}>{getGreeting()}</p>
              <h1 style={{ fontSize: 19, fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.01em' }}>{driver.name.split(' ')[0]} {'\uD83D\uDC4B'}</h1>
            </div>
          </div>
          <button onClick={() => onNav('notifs')} className="tap" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', color: '#fff' }}>
            <Bell size={18} />
            {notifCount > 0 && <div style={{ position: 'absolute', top: 3, right: 3, width: 16, height: 16, borderRadius: 8, background: T.red, border: '2px solid #0f1928', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{notifCount > 9 ? '9+' : notifCount}</span></div>}
          </button>
        </div>

        <div style={{ padding: '14px 16px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: '0 0 2px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Earnings</p>
            <p style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>GH₵ {dynamicEarn.toFixed(2)}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '4px 0 0' }}>{deposited} pkgs deposited today</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            {activeBlock ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, justifyContent: 'flex-end', marginBottom: 3 }}>
                  <div style={{ width: 7, height: 7, borderRadius: 4, background: T.green }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Live Block</span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{activeBlock.area}</p>
                {blockTime && <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{blockTime}</span>}
              </div>
            ) : (
              <button onClick={() => onNav('schedule')} className="tap" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 14px', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                Find Block {'\u2192'}
              </button>
            )}
          </div>
        </div>

        {activeBlock && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{activeBlock.time}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>{activeBlock.pay}</span>
          </div>
        )}
      </div>

      {/* Shift Timer + Vehicle Capacity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        <ShiftTimer shiftState={shiftState} onClockIn={onClockIn} onClockOut={onClockOut} onBreak={onBreak} onResume={onResume} T={T} />
        <VehicleCapacityCard tasks={tasks} vehicleConfig={vehicleConfig} T={T} />
      </div>
    </div>

    {/* Package Dashboard */}
    <div style={{ padding: '0 20px 16px' }}>
      {!loaded ? <div style={{ borderRadius: 16, padding: 20, background: T.card }}>
        <Skeleton w={140} h={14} r={6} T={T} /><div style={{ marginTop: 8 }}><Skeleton w={100} h={28} r={8} T={T} /></div>
        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}><Skeleton w={110} h={110} r={55} T={T} /><div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}><Skeleton h={14} T={T} /><Skeleton h={14} T={T} /><Skeleton h={14} T={T} /><Skeleton h={14} T={T} /></div></div>
      </div>
        : <div className="fu" style={{ borderRadius: 20, padding: 20, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Package Overview</p>
              <p style={{ fontSize: 26, fontWeight: 800, margin: '2px 0 0', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '-0.02em' }}>{totalTasks} <span style={{ fontSize: 14, fontWeight: 500, color: T.sec, fontFamily: "'Inter', sans-serif" }}>pkgs</span></p>
            </div>
            <button onClick={() => onNav('tasks')} className="tap" style={{ fontSize: 12, fontWeight: 700, color: T.sec, background: T.fill, border: 'none', padding: '6px 12px', borderRadius: 10 }}>View All</button>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <PieChart slices={pieSlices} size={100} hole={0.6} T={T} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{totalTasks}</div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
              {pieSlices.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: T.sec, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            {assigned > 0 && <button onClick={() => onNav('tasks')} className="tap press" style={{ flex: 1, height: 44, borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 13, background: T.accentGradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 4px 12px ${T.accent}40` }}><Camera size={14} />Scan ({assigned})</button>}
            <button onClick={() => onNav('homeDelivery')} className="tap" style={{ flex: 1, height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.card, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: T.shadow }}><Home size={14} />Home Del.</button>
            <button onClick={() => onNav('lockers')} className="tap" style={{ flex: 1, height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.card, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: T.shadow }}><MapPin size={14} />Lockers</button>
          </div>
        </div>}
    </div>

    {activeBlock && <StopProgress current={curStop} total={lockersData.length} doneP={done} totalP={total} T={T} />}

    {activeBlock && <div style={{ padding: '16px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontWeight: 800, fontSize: 16, margin: 0, fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", letterSpacing: '-0.025em' }}>Itinerary</h2>
          <Badge v="success" sm T={T}><Navigation size={10} />Optimized</Badge>
        </div>
        <button onClick={() => onNav('itinerary')} className="tap" style={{ border: 'none', background: T.fill, borderRadius: 10, padding: '5px 12px', fontSize: 12, fontWeight: 700, color: T.sec }}>All Stops</button>
      </div>
      {lockersData.map((l, i) => {
        const sd = dels.filter(d => d.locker === l.name); const dn = sd.filter(d => d.status === 'delivered').length; const allD = dn === sd.length; const isA = i === curIdx;
        return <button key={l.id} onClick={() => onNav(isA ? 'stop' : 'itinerary', isA ? { locker: l, stopNum: i + 1 } : null)} className={`press fu d${Math.min(i + 1, 6)}`} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', background: isA ? T.fill2 : T.card, border: `1.5px solid ${isA ? T.border : T.border}`, padding: '12px 14px', borderRadius: 16, marginBottom: 8, boxShadow: isA ? T.shadowMd : T.shadow }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, background: allD ? T.gradientSuccess : isA ? T.accentGradient : T.fill, flexShrink: 0, color: allD ? '#fff' : isA ? '#fff' : T.sec }}>{allD ? <Check size={14} /> : i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 700, fontSize: 14, margin: 0, textDecoration: allD ? 'line-through' : 'none', color: allD ? T.muted : T.text }}>{l.name}</p>
            <p style={{ fontSize: 12, color: T.sec, margin: '2px 0 0', fontWeight: 500 }}>{l.dist} · {l.eta}</p>
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: allD ? T.green : T.sec, fontFamily: "'JetBrains Mono', monospace" }}>{dn}/{sd.length}</div>
        </button>;
      })}
    </div>}

    {!activeBlock && <div style={{ padding: '0 20px', textAlign: 'center', paddingTop: 32, paddingBottom: 16 }}>
      <div style={{ margin: '0 auto 16px', width: 56, height: 56, borderRadius: 18, background: T.fill, border: `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.shadow }}><span style={{ fontSize: 26 }}>{'\uD83D\uDCC5\uFE0F'}</span></div>
      <p style={{ fontWeight: 800, margin: '0 0 4px', fontSize: 16, fontFamily: "'Space Grotesk', 'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>No active block</p>
      <p style={{ fontSize: 14, color: T.sec, margin: 0, fontWeight: 500 }}>Pick a delivery block to start</p>
    </div>}
  </div>;
};

export { SizeIcon, StopProgress, sizeColor, getGreeting, useScreenLoad, RATE_PER_PKG, PieChart };
export default HomeScreen;
