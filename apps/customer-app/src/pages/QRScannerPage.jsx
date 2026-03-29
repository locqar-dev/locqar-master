import React, { useState, useEffect } from "react";
import { T, ff } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import { ArrowLeft } from "../components/Icons";

export default function QRScannerPage(props) {
  var [scanning, setScanning] = useState(true);
  var [result, setResult] = useState(null);

  useEffect(function () {
    if (scanning) {
      var t = setTimeout(function () {
        setScanning(false);
        setResult({ type: 'locker', code: 'LQ-ACC-0512', location: 'Osu Mall', locker: '#12' });
      }, 3000);
      return function () { clearTimeout(t); };
    }
  }, [scanning]);

  return (
    <div className="min-h-screen" style={{ background: '#000', position: 'relative' }}>
      <StatusBar />
      {/* Top bar */}
      <div className="flex items-center justify-between" style={{ padding: '8px 20px', position: 'relative', zIndex: 2 }}>
        <button onClick={props.onBack} className="tap" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft style={{ width: 18, height: 18, color: '#fff' }} />
        </button>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: ff }}>Scan QR Code</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Scanner viewport */}
      <div style={{ position: 'relative', margin: '40px 20px', aspectRatio: '1', borderRadius: 28, overflow: 'hidden', background: '#111' }}>
        {/* Simulated camera view */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}>
          {/* Scan animation */}
          {scanning && <div style={{ position: 'absolute', left: '10%', right: '10%', height: 3, background: 'linear-gradient(90deg, transparent, ' + T.accent + ', transparent)', top: '50%', animation: 'float 2s ease-in-out infinite', boxShadow: '0 0 20px ' + T.accent + '66' }} />}
        </div>

        {/* Corner markers */}
        {[{ top: 20, left: 20 }, { top: 20, right: 20 }, { bottom: 20, left: 20 }, { bottom: 20, right: 20 }].map(function (pos, i) {
          return <div key={i} style={Object.assign({ position: 'absolute', width: 28, height: 28 }, pos)}>
            <div style={{ position: 'absolute', top: 0, left: i % 2 === 0 ? 0 : 'auto', right: i % 2 !== 0 ? 0 : 'auto', width: 28, height: 3, background: scanning ? T.accent : T.ok, borderRadius: 2, transition: 'background .3s' }} />
            <div style={{ position: 'absolute', top: i < 2 ? 0 : 'auto', bottom: i >= 2 ? 0 : 'auto', left: i % 2 === 0 ? 0 : 'auto', right: i % 2 !== 0 ? 0 : 'auto', width: 3, height: 28, background: scanning ? T.accent : T.ok, borderRadius: 2, transition: 'background .3s' }} />
          </div>;
        })}

        {/* Status text */}
        <div style={{ position: 'absolute', bottom: 30, left: 0, right: 0, textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: scanning ? 'rgba(255,255,255,0.7)' : T.ok, fontFamily: ff }}>
            {scanning ? 'Point camera at QR code...' : '\u2713 Code detected!'}
          </p>
        </div>
      </div>

      {/* Instructions or result */}
      <div style={{ padding: '0 20px' }}>
        {!result ? (
          <div className="text-center" style={{ padding: '16px 0' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontFamily: ff, lineHeight: '1.6' }}>
              Scan a LocQar locker QR code to pick up or drop off a package
            </p>
          </div>
        ) : (
          <div className="fu" style={{ borderRadius: 22, padding: 20, background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center gap-4" style={{ marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: T.ok + '22' }}>🏪</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', fontFamily: ff }}>{result.location}</p>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontFamily: ff, marginTop: 2 }}>Locker {result.locker} · {result.code}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={function () { setScanning(true); setResult(null); }} className="tap flex-1" style={{ padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: 'rgba(255,255,255,0.08)', color: '#fff', fontFamily: ff, border: '1px solid rgba(255,255,255,0.1)' }}>Scan Again</button>
              <button onClick={function () { if (props.onBack) props.onBack(); }} className="tap flex-1" style={{ padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: T.ok, color: '#fff', fontFamily: ff, boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>Open Locker</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
