import React, { useState, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import SwipeConfirm from '../components/SwipeConfirm';
import Badge from '../components/Badge';
import { ArrowLeft, Package, CheckCircle, Check } from '../components/Icons';
import { SizeIcon, sizeColor } from './HomeScreen';

const ff = "'Inter', system-ui, -apple-system, sans-serif";
const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";
const mf = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

// Corner bracket scanner frame
const ScanFrame = ({ T }) => {
  const bLen = 24, bW = 3, r = 10, color = T.blue;
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} viewBox="0 0 200 200">
      {/* Top-left */}
      <path d={`M ${bLen} 8 L ${r} 8 Q 8 8 8 ${r} L 8 ${bLen}`} fill="none" stroke={color} strokeWidth={bW} strokeLinecap="round" />
      {/* Top-right */}
      <path d={`M ${200 - bLen} 8 L ${200 - r} 8 Q ${200 - 8} 8 ${200 - 8} ${r} L ${200 - 8} ${bLen}`} fill="none" stroke={color} strokeWidth={bW} strokeLinecap="round" />
      {/* Bottom-left */}
      <path d={`M 8 ${200 - bLen} L 8 ${200 - r} Q 8 ${200 - 8} ${r} ${200 - 8} L ${bLen} ${200 - 8}`} fill="none" stroke={color} strokeWidth={bW} strokeLinecap="round" />
      {/* Bottom-right */}
      <path d={`M ${200 - 8} ${200 - bLen} L ${200 - 8} ${200 - r} Q ${200 - 8} ${200 - 8} ${200 - r} ${200 - 8} L ${200 - bLen} ${200 - 8}`} fill="none" stroke={color} strokeWidth={bW} strokeLinecap="round" />
    </svg>
  );
};

const BatchDepositScreen = ({ locker, stopNum, dels, onBack, onDeposit, T }) => {
  const pkgs = dels.filter(d => d.locker === locker.name);
  const pending = pkgs.filter(d => d.status === 'pending');
  const done = pkgs.filter(d => d.status === 'delivered');
  const allDone = pending.length === 0;
  const currentPkg = pending[0] || null;
  const [phase, setPhase] = useState('idle');
  const [comp, setComp] = useState(null);
  const [justDeposited, setJustDeposited] = useState(null);
  const [batchCount, setBatchCount] = useState(0);
  const totalHere = pkgs.length;

  useEffect(() => {
    if (phase === 'deposited') {
      const timer = setTimeout(() => {
        setJustDeposited(null);
        if (pending.length > 0) { setPhase('idle'); setComp(null); }
        else { setPhase('allDone'); }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase, pending.length]);

  const startScan = () => setPhase('scanning');
  const handleScan = () => {
    setComp(Math.floor(Math.random() * 20) + 1);
    setPhase('assigning');
    setTimeout(() => setPhase('opening'), 800);
    setTimeout(() => setPhase('place'), 2000);
  };
  const confirmDeposit = () => {
    if (!currentPkg) return;
    setJustDeposited(currentPkg);
    setBatchCount(p => p + 1);
    setPhase('deposited');
    onDeposit(currentPkg.id);
  };
  const progPct = totalHere > 0 ? (done.length / totalHere) * 100 : 0;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Header */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <button
            onClick={onBack}
            className="tap press"
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: T.card, border: `1.5px solid ${T.border}`,
              boxShadow: T.shadow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: T.text, flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, fontFamily: hf, letterSpacing: '-0.03em', color: T.text }}>Batch Deposit</h1>
            <p style={{ fontSize: 13, color: T.sec, margin: 0, fontFamily: ff }}>{locker.name}{' \u00B7 '}Stop {stopNum}</p>
          </div>
          {/* Package counter pill */}
          <div style={{
            background: T.gradient, borderRadius: 14, padding: '8px 14px',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}>
            <Package size={14} style={{ color: '#fff' }} />
            <span key={batchCount} className="cup" style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: mf }}>{done.length}</span>
            <span style={{ color: 'rgba(255,255,255,.35)', fontWeight: 600, fontSize: 14, fontFamily: mf }}>/{totalHere}</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ height: 6, borderRadius: 3, background: T.fill2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              background: allDone ? T.gradientSuccess : T.gradientBlue,
              width: `${progPct}%`, transition: 'width .6s ease',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}>
            <span style={{ fontSize: 11, color: T.muted, fontFamily: ff, fontWeight: 600 }}>{done.length} deposited</span>
            <span style={{ fontSize: 11, color: T.muted, fontFamily: ff, fontWeight: 600 }}>{pending.length} remaining</span>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 24px' }}>

        {/* ALL DONE */}
        {(allDone || phase === 'allDone') && (
          <div className="si" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{
              width: 88, height: 88, borderRadius: 44,
              background: T.gradientSuccess,
              margin: '0 auto 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 12px 32px ${T.green}40`,
            }}>
              <svg width={44} height={44} viewBox="0 0 40 40">
                <circle cx={20} cy={20} r={18} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                <path d="M12 20l6 6 10-12" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} style={{ animation: 'checkAnim .5s ease forwards' }} />
              </svg>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', fontFamily: hf, letterSpacing: '-0.03em', color: T.text }}>All Deposited!</h2>
            <p style={{ fontSize: 14, color: T.sec, margin: '0 0 4px', fontFamily: ff }}>{totalHere} package{totalHere !== 1 ? 's' : ''} deposited at {locker.name}</p>
            <p style={{ fontSize: 13, color: T.muted, margin: '0 0 28px', fontFamily: ff }}>Customers have been notified via SMS</p>
            <button
              onClick={onBack}
              className="press"
              style={{
                width: '100%', height: 56, borderRadius: 18, border: 'none',
                fontWeight: 800, fontSize: 17, fontFamily: hf, letterSpacing: '-0.02em',
                background: T.gradientSuccess, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `0 8px 24px ${T.green}40`,
              }}
            >
              <Check size={20} />
              Continue Route
            </button>
          </div>
        )}

        {/* IDLE — current package */}
        {phase === 'idle' && currentPkg && (
          <div className="fu" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{
              borderRadius: 20, padding: '16px 16px',
              background: T.card,
              border: `1.5px solid ${currentPkg.pri === 'urgent' ? T.red + '60' : T.border}`,
              boxShadow: currentPkg.pri === 'urgent' ? `0 8px 24px ${T.red}15` : T.shadowMd,
              marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
            }}>
              <SizeIcon sz={currentPkg.sz} big T={T} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <p style={{ fontWeight: 700, fontFamily: mf, fontSize: 15, margin: 0, letterSpacing: '-0.01em' }} className="truncate">{currentPkg.trk}</p>
                  {currentPkg.pri === 'urgent' && <Badge v="danger" sm T={T}>&#9889; Urgent</Badge>}
                </div>
                <p style={{ fontSize: 13, color: T.sec, margin: 0, fontFamily: ff }}>{currentPkg.sz} compartment{' \u00B7 '}{currentPkg.weight}</p>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ff }}>NEXT</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: T.blue, margin: '2px 0 0', fontFamily: mf }}>#{pending.indexOf(currentPkg) + 1}</p>
              </div>
            </div>

            {/* Up next queue */}
            {pending.length > 1 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ff }}>
                  UP NEXT — {pending.length - 1} more
                </p>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {pending.slice(1, 6).map((p) => {
                    const [bg, c] = sizeColor(p.sz, T);
                    return (
                      <div key={p.id} style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: T.card, borderRadius: 10, padding: '5px 10px',
                        border: `1.5px solid ${T.border}`,
                      }}>
                        <div style={{
                          width: 20, height: 20, borderRadius: 5,
                          background: bg, color: c,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 700, fontFamily: ff,
                        }}>{p.sz}</div>
                        <span style={{ fontSize: 11, fontFamily: mf, color: T.sec }}>{p.trk.slice(-4)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button
              onClick={startScan}
              className="press"
              style={{
                width: '100%', height: 56, borderRadius: 18, border: 'none',
                fontWeight: 800, fontSize: 17, fontFamily: hf, letterSpacing: '-0.02em',
                background: T.gradientBlue, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                boxShadow: `0 8px 24px ${T.blue}40`,
              }}
            >
              <Package size={22} />
              Scan Package
            </button>
          </div>
        )}

        {/* SCANNING */}
        {phase === 'scanning' && (
          <div className="si" style={{ textAlign: 'center', width: '100%' }}>
            <div style={{
              width: 200, height: 200, borderRadius: 20,
              background: T.fill2,
              margin: '0 auto 24px',
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* Scan line */}
              <div className="scan-line" style={{
                position: 'absolute', left: 12, right: 12, height: 2,
                background: `linear-gradient(90deg, transparent, ${T.blue}, transparent)`,
                borderRadius: 1,
                boxShadow: `0 0 8px ${T.blue}80`,
                zIndex: 2,
              }} />
              {/* Corner brackets */}
              <ScanFrame T={T} />
              {/* Center icon */}
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: T.blueBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Package size={28} style={{ color: T.blue }} />
              </div>
            </div>
            <p style={{ fontWeight: 800, fontSize: 18, margin: '0 0 6px', fontFamily: hf, color: T.text, letterSpacing: '-0.025em' }}>
              Scan {currentPkg?.trk}
            </p>
            <p style={{ fontSize: 14, color: T.sec, margin: '0 0 24px', fontFamily: ff }}>
              Align the barcode within the frame
            </p>
            {/* In a real app this fires automatically — simulate tap for demo */}
            <button
              onClick={handleScan}
              className="press"
              style={{
                width: '100%', height: 52, borderRadius: 16, border: `1.5px solid ${T.border}`,
                fontWeight: 700, fontSize: 16, fontFamily: ff,
                background: T.card, color: T.sec,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: T.shadow,
              }}
            >
              Barcode detected — tap to proceed
            </button>
          </div>
        )}

        {/* ASSIGNING */}
        {phase === 'assigning' && (
          <div className="si" style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 20,
              background: T.blueBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <div className="sp" style={{
                width: 40, height: 40, borderRadius: 20,
                border: `3px solid ${T.blueBg}`,
                borderTopColor: T.blue,
              }} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 18, margin: '0 0 6px', fontFamily: hf, color: T.text, letterSpacing: '-0.025em' }}>
              Assigning Compartment
            </p>
            <p style={{ fontSize: 14, color: T.sec, fontFamily: ff }}>
              Finding best fit for {currentPkg?.sz} size
            </p>
          </div>
        )}

        {/* OPENING */}
        {phase === 'opening' && (
          <div className="si" style={{ textAlign: 'center' }}>
            <div className="float" style={{
              width: 80, height: 80, borderRadius: 20,
              background: T.gradientAmber,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: `0 12px 32px ${T.amber}40`,
            }}>
              <span style={{ fontSize: 36 }}>&#128274;</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: 20, margin: '0 0 6px', fontFamily: hf, color: T.text, letterSpacing: '-0.03em' }}>
              Opening #{comp}
            </p>
            <p style={{ fontSize: 14, color: T.sec, fontFamily: ff }}>Unlocking compartment...</p>
          </div>
        )}

        {/* PLACE */}
        {phase === 'place' && (
          <div className="si" style={{ textAlign: 'center', width: '100%' }}>
            {/* Big compartment number */}
            <div style={{
              borderRadius: 24, padding: '24px 20px',
              background: T.card,
              border: `1.5px solid ${T.green}50`,
              boxShadow: `0 12px 40px ${T.green}15`,
              marginBottom: 24,
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: T.green, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: ff }}>
                COMPARTMENT
              </p>
              <p style={{ fontSize: 72, fontWeight: 800, margin: 0, fontFamily: mf, color: T.green, lineHeight: 1 }}>
                #{comp}
              </p>
              <div style={{ height: 1, background: T.border, width: '60%', margin: '16px 0' }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: 0, fontFamily: ff }}>
                Locker is open!
              </p>
              <p style={{ fontSize: 13, color: T.sec, margin: '4px 0 0', fontFamily: ff }}>
                Place <strong style={{ fontFamily: mf }}>{currentPkg?.trk}</strong> inside, then close the door
              </p>
            </div>
            <SwipeConfirm
              label="Swipe to confirm deposit"
              onConfirm={confirmDeposit}
              color={T.green}
              icon={<CheckCircle size={20} />}
              T={T}
            />
          </div>
        )}

        {/* DEPOSITED flash */}
        {phase === 'deposited' && justDeposited && (
          <div className="si" style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 40,
              background: T.gradientSuccess,
              margin: '0 auto 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 12px 32px ${T.green}40`,
            }}>
              <Check size={32} style={{ color: '#fff' }} />
            </div>
            <p style={{ fontWeight: 800, fontSize: 18, margin: '0 0 6px', fontFamily: hf, color: T.text, letterSpacing: '-0.025em' }}>
              Deposited!
            </p>
            <p style={{ fontSize: 13, color: T.sec, margin: 0, fontFamily: mf }}>{justDeposited.trk}</p>
            <p style={{ fontSize: 13, color: T.muted, margin: '4px 0 0', fontFamily: ff }}>
              {pending.length > 0 ? 'Loading next package...' : 'All done at this stop!'}
            </p>
          </div>
        )}
      </div>

      {/* Deposited this session tray */}
      {done.length > 0 && phase !== 'allDone' && !allDone && (
        <div style={{ padding: '12px 20px 20px', borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ff }}>
            Deposited this session
          </p>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="no-sb">
            {done.map(p => (
              <div key={p.id} style={{
                flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                background: T.greenBg, borderRadius: 10, padding: '6px 10px',
                border: `1.5px solid ${T.green}40`,
              }}>
                <Check size={11} style={{ color: T.green }} />
                <span style={{ fontSize: 12, fontFamily: mf, fontWeight: 600, color: T.green }}>{p.trk.slice(-4)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDepositScreen;
