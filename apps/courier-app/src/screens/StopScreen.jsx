import React from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import SwipeConfirm from '../components/SwipeConfirm';
import { Navigation, Wifi, Battery, Package, Check, AlertTriangle } from '../components/Icons';
import { openNavigation } from '../components/NavigationModal';
import { lockersData } from '../data/mockData';
import { SizeIcon, sizeColor } from './HomeScreen';

const ff = "'Inter', system-ui, -apple-system, sans-serif";
const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";
const mf = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

const genCode = (pre, trk) => { let h = 0; for (let i = 0; i < trk.length; i++) h = ((h << 5) - h) + trk.charCodeAt(i); return pre + '-' + (Math.abs(h) % 9000 + 1000) };

const StopScreen = ({ locker, stopNum, dels, recalls = [], onBack, onNav, adjLockers, T }) => {
  const adjLocker = adjLockers?.find(l => l.name === locker.name) || locker;
  const pkgs = dels.filter(d => d.locker === locker.name);
  const pending = pkgs.filter(d => d.status === 'pending');
  const done = pkgs.filter(d => d.status === 'delivered');
  const allDone = pending.length === 0;
  const batPct = locker.bat ?? 100;
  const batColor = batPct < 15 ? T.red : batPct < 30 ? T.sec : T.green;
  const batBg = batPct < 15 ? T.redBg : batPct < 30 ? T.fill : T.greenBg;
  const progPct = pkgs.length > 0 ? (done.length / pkgs.length) * 100 : 0;
  const totalFree = Object.values(adjLocker.avail).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 120 }}>
      <StatusBar />
      <TopBar
        title={`Stop ${stopNum} of ${lockersData.length}`}
        sub={locker.name}
        onBack={onBack}
        T={T}
        right={
          <button
            onClick={() => openNavigation(locker.name, locker.addr, locker.lat, locker.lng)}
            className="tap press"
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: T.accentGradient, border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${T.accent}40`,
            }}
          >
            <Navigation size={18} style={{ color: '#fff' }} />
          </button>
        }
      />

      <div style={{ padding: '16px 20px 0' }}>

        {/* Progress bar */}
        <div className="fu" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 6, borderRadius: 3, background: T.fill2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: allDone ? T.gradientSuccess : T.accentGradient,
              width: `${progPct}%`, transition: 'width .5s ease',
            }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: allDone ? T.green : T.text, fontFamily: mf, flexShrink: 0 }}>
            {done.length}/{pkgs.length}
          </span>
        </div>

        {/* Status card: locker connectivity */}
        <div className="fu d1" style={{
          borderRadius: 16, padding: '14px 16px', background: T.card,
          border: `1.5px solid ${T.border}`, boxShadow: T.shadow,
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: T.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Wifi size={18} style={{ color: T.green }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: ff }}>Locker Status</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: T.green, margin: '2px 0 0', fontFamily: ff }}>Online</p>
          </div>
          <div style={{ width: 1, height: 36, background: T.border }} />
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: batBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Battery size={18} style={{ color: batColor }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: ff }}>Battery</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: batColor, margin: '2px 0 0', fontFamily: mf }}>{batPct}%</p>
          </div>
        </div>

        {/* Compartments */}
        <div className="fu d2" style={{
          borderRadius: 20, padding: 16, background: T.card,
          border: `1.5px solid ${T.border}`, boxShadow: T.shadow, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: ff }}>
              Compartments
            </p>
            <span style={{
              fontSize: 12, fontWeight: 700, color: T.sec,
              background: T.fill, borderRadius: 8, padding: '3px 8px', fontFamily: mf,
            }}>
              {totalFree} free
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {Object.entries(adjLocker.avail).map(([s, n]) => {
              const [bg, c] = sizeColor(s, T);
              return (
                <div key={s} style={{
                  borderRadius: 14, padding: '12px 8px', textAlign: 'center',
                  background: T.bg, border: `1.5px solid ${T.border}`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, margin: '0 auto 8px',
                    background: bg, color: c,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, fontFamily: ff,
                  }}>{s}</div>
                  <p style={{ fontSize: 20, fontWeight: 800, margin: 0, fontFamily: mf, color: T.text }}>{n}</p>
                  <p style={{ fontSize: 10, color: T.muted, margin: '2px 0 0', fontFamily: ff, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>free</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recall pickup alert */}
        {recalls.length > 0 && (
          <div className="fu d3" style={{
            borderRadius: 16, padding: '14px 16px', marginBottom: 14,
            background: T.redBg, border: `1.5px solid ${T.red}50`,
            boxShadow: `0 4px 12px ${T.red}15`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: recalls.length > 0 ? 10 : 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} style={{ color: '#fff' }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 800, color: T.red, margin: 0, fontFamily: ff }}>
                  Pick up {recalls.length} recalled package{recalls.length !== 1 ? 's' : ''} here
                </p>
                <p style={{ fontSize: 12, color: T.red, margin: 0, fontFamily: ff, opacity: 0.7 }}>Do not leave without collecting these</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recalls.map(rp => (
                <div key={rp.id} style={{
                  borderRadius: 12, padding: '10px 12px',
                  background: T.card, border: `1px solid ${T.red}30`,
                  display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <SizeIcon sz={rp.sz} sm T={T} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: 0, fontFamily: mf, letterSpacing: '-0.01em', color: T.text }} className="truncate">{rp.trk}</p>
                    <p style={{ fontSize: 11, color: T.sec, margin: 0, fontFamily: ff }}>→ {rp.returnDest || 'Warehouse'}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: T.muted, margin: 0, fontFamily: ff, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pick-up code</p>
                    <p style={{ fontSize: 15, fontWeight: 800, color: T.red, margin: 0, fontFamily: mf }}>{genCode('PKU', rp.trk)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending packages */}
        {pending.length > 0 && (
          <>
            <p className="fu d3" style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: ff }}>
              To Deposit ({pending.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {pending.map((p, i) => (
                <div
                  key={p.id}
                  className={`fu d${Math.min(i + 3, 6)}`}
                  style={{
                    borderRadius: 16, padding: '14px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: T.card,
                    border: `1.5px solid ${T.border}`,
                    boxShadow: T.shadow,
                  }}
                >
                  <SizeIcon sz={p.sz} T={T} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, fontFamily: mf, margin: 0, letterSpacing: '-0.01em' }} className="truncate">{p.trk}</p>
                    <p style={{ fontSize: 12, color: T.sec, margin: '2px 0 0', fontFamily: ff }}>{p.receiver}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Completed packages */}
        {done.length > 0 && (
          <>
            <p style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: ff }}>
              Completed ({done.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {done.map(p => (
                <div key={p.id} style={{
                  borderRadius: 14, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: T.greenBg, border: `1.5px solid ${T.green}30`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Check size={18} style={{ color: '#fff' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: 13, fontFamily: mf, margin: 0, color: T.greenDark, letterSpacing: '-0.01em' }} className="truncate">{p.trk}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: T.green, fontFamily: ff }}>Done</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom action */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: '16px 20px 24px',
        background: T.bg, borderTop: `1px solid ${T.border}`,
        backdropFilter: 'blur(10px)',
      }}>
        {allDone ? (
          <button
            onClick={onBack}
            className="press"
            style={{
              width: '100%', height: 56, borderRadius: 18, border: 'none',
              fontWeight: 800, fontSize: 17, fontFamily: hf,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: T.gradientSuccess, color: '#fff',
              boxShadow: `0 8px 24px ${T.green}40`,
              letterSpacing: '-0.02em',
            }}
          >
            <Check size={20} />
            Stop Complete
          </button>
        ) : (
          <SwipeConfirm
            label={`Swipe to start batch deposit (${pending.length})`}
            onConfirm={() => onNav('batch', { locker, stopNum })}
            icon={<Package size={20} />}
            T={T}
          />
        )}
      </div>
    </div>
  );
};

export default StopScreen;
