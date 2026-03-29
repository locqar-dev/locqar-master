import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import QRCode from "../utils/qrcode";
import { initLockers } from "../data/mockData";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, Info, MapPin, Navigation, Search, Shield, X, Zap } from "../components/Icons";

export default function ReceivePage(props) {
  var pref = props.prefLocker || initLockers[0];
  var saved = props.savedData || {};
  var [st, sS] = useState(props.confirmed ? 2 : 1);
  var [tracking, setTracking] = useState(saved.tracking || '');
  var [courier, setCourier] = useState(saved.courier || null);
  var [selLk, setSelLk] = useState(saved.selLk || pref);
  var [showLockerPicker, setShowLockerPicker] = useState(false);
  var [found, setFound] = useState(null);
  var [showPickupQR, setShowPickupQR] = useState(true);
  var [codeCopied, setCodeCopied] = useState(false);
  var pickupCode = 'LQ-' + (200000 + Math.floor(Math.random() * 800000));
  var rcvFee = 5;

  var couriers = [
    { id: 'dhl', e: '🟡', n: 'DHL', d: 'Express & Standard' },
    { id: 'fedex', e: '🟣', n: 'FedEx', d: 'International & Domestic' },
    { id: 'ups', e: '🟤', n: 'UPS', d: 'Ground & Air' },
    { id: 'gpost', e: '🔵', n: 'Ghana Post', d: 'Local delivery' },
    { id: 'other', e: '📦', n: 'Other', d: 'Any courier service' }
  ];

  var trackValid = tracking.replace(/\s/g, '').length >= 6;
  var canContinue = st === 1 && trackValid && courier;

  var goToPayment = function () {
    setFound({ name: courier ? couriers.find(function (c) { return c.id === courier; }).n + ' Package' : 'Package', tracking: tracking.toUpperCase(), status: 'In Transit', eta: 'Feb 8-10', from: 'Lagos, Nigeria' });
    if (props.onNav) {
      props.onNav('payment', {
        amount: rcvFee + '',
        label: 'Receive at ' + selLk.name,
        icon: '📥',
        items: [
          { e: '📦', l: 'Locker fee', v: 'GH₵' + rcvFee },
          { e: '📍', l: 'Pickup: ' + selLk.name, v: '' },
          { e: '🚚', l: 'Courier: ' + (courier ? couriers.find(function (c) { return c.id === courier; }).n : ''), v: '' }
        ],
        backTo: 'receive',
        onSuccessNav: 'receive',
        onSuccessData: { confirmed: true },
        receiveData: { tracking: tracking, courier: courier, selLk: selLk }
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ paddingBottom: st === 2 ? 40 : 100, background: T.bg }}>
      <StatusBar />
      <Toast show={codeCopied} emoji="📋" text="Pickup code copied!" />
      <div style={{ padding: '8px 20px' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <button onClick={function () { props.onBack(); }} className="tap" style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1.5px solid ' + T.border, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}><ArrowLeft style={{ width: 18, height: 18 }} /></button>
          <div className="flex-1"><h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: ff }}>{st === 2 ? 'Pickup Ready' : 'Receive Package'}</h1></div>
        </div>

        {/* Step 1: Tracking, Courier & Locker */}
        {st === 1 && (
          <div className="fu">
            <p style={{ fontSize: 14, fontWeight: 500, color: T.sec, marginBottom: 14, fontFamily: ff }}>Enter your courier tracking details</p>

            {/* Pickup location with change option */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>PICKUP LOCATION</p>
              <button onClick={function () { setShowLockerPicker(!showLockerPicker); }} className="tap" style={{ width: '100%', borderRadius: 16, padding: 14, background: '#fff', border: '1.5px solid ' + T.ok + '22', display: 'flex', alignItems: 'center', gap: 12, transition: 'all .2s' }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: T.okBg }}>{selLk.emoji}</div>
                <div className="flex-1 text-left">
                  <h3 style={{ fontWeight: 700, fontSize: 14, fontFamily: ff }}>{selLk.name}</h3>
                  <p style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>{selLk.addr} · {selLk.dist} km</p>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, fontFamily: ff, padding: '4px 10px', borderRadius: 8, background: T.accentBg }}>{showLockerPicker ? 'Close' : 'Change'}</span>
              </button>
              {showLockerPicker && (
                <div className="fu" style={{ marginTop: 8, borderRadius: 14, border: '1.5px solid ' + T.border, overflow: 'hidden' }}>
                  {initLockers.map(function (l, i) {
                    var isSel = selLk.id === l.id;
                    return (
                      <button key={l.id} onClick={function () { setSelLk(l); setShowLockerPicker(false); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: isSel ? T.okBg : '#fff', borderBottom: i < initLockers.length - 1 ? '1px solid ' + T.fill : 'none' }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: isSel ? '#fff' : T.fill }}>{l.emoji}</div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="truncate" style={{ fontWeight: 700, fontSize: 13, fontFamily: ff }}>{l.name}</p>
                          <p className="truncate" style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>{l.addr} · {l.dist} km</p>
                        </div>
                        {isSel && <div style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 3 }} /></div>}
                        {!isSel && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: T.okBg, color: T.okDark, fontFamily: ff, flexShrink: 0 }}>{l.avail} free</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tracking number */}
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>TRACKING NUMBER</p>
              <div style={{ borderRadius: 14, background: T.fill, overflow: 'hidden', border: '1.5px solid ' + (trackValid ? T.ok + '44' : T.border), transition: 'border .25s' }}>
                <div className="flex items-center gap-3" style={{ padding: '11px 14px' }}>
                  <Search style={{ width: 16, height: 16, color: T.muted, flexShrink: 0 }} />
                  <input type="text" value={tracking} onChange={function (e) { setTracking(e.target.value); }} placeholder="e.g. DHL1234567890" className="flex-1" style={{ background: 'transparent', fontWeight: 600, fontSize: 16, fontFamily: mf, letterSpacing: '0.02em' }} />
                  {tracking && <button onClick={function () { setTracking(''); }} className="tap" style={{ width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.border }}><X style={{ width: 11, height: 11, color: T.sec }} /></button>}
                </div>
              </div>
              {trackValid && <div className="flex items-center gap-2 fi" style={{ marginTop: 8, padding: '0 2px' }}><div style={{ width: 16, height: 16, borderRadius: 8, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 3 }} /></div><p style={{ fontSize: 12, fontWeight: 600, color: T.okDark, fontFamily: ff }}>Valid tracking format</p></div>}
            </div>

            {/* Courier selection */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>COURIER SERVICE</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {couriers.map(function (c) {
                  var sel = courier === c.id;
                  return (
                    <button key={c.id} onClick={function () { setCourier(c.id); }} className="tap" style={{ padding: 12, borderRadius: 14, background: sel ? T.text : '#fff', color: sel ? '#fff' : T.text, transition: 'all .2s', border: sel ? 'none' : '1.5px solid ' + T.border, boxShadow: sel ? '0 4px 14px rgba(0,0,0,0.15)' : T.shadow, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: sel ? 'rgba(255,255,255,0.12)' : T.fill }}>{c.e}</div>
                      <div><p style={{ fontWeight: 700, fontSize: 13, fontFamily: ff }}>{c.n}</p><p style={{ fontSize: 10, opacity: 0.5, fontFamily: ff }}>{c.d}</p></div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tip */}
            <div className="flex items-center gap-2.5" style={{ borderRadius: 12, padding: '10px 12px', background: T.blueBg, marginTop: 16, border: '1px solid ' + T.blue + '22' }}>
              <Info style={{ width: 13, height: 13, flexShrink: 0, color: T.blue }} /><p style={{ fontSize: 12, color: T.blue, fontFamily: ff }}>Your courier will deliver to your chosen LocQar locker instead of a home address.</p>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation with pickup code (after payment) */}
        {st === 2 && (
          <div className="fu">
            {/* Success banner */}
            <div style={{ borderRadius: 22, padding: 24, background: 'linear-gradient(135deg, ' + T.okBg + ' 0%, #D1FAE5 100%)', border: '1.5px solid ' + T.ok + '22', marginBottom: 16, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -15, width: 80, height: 80, borderRadius: '50%', background: T.ok + '08' }} />
              <div className="pop" style={{ fontSize: 44, marginBottom: 10 }}>📥</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: ff, marginBottom: 6 }}>Pickup Registered!</h2>
              <p style={{ fontSize: 13, color: T.okDark, fontFamily: ff }}>We'll notify you when the package arrives</p>
            </div>

            {/* Pickup code */}
            <div style={{ borderRadius: 20, padding: 16, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}><Shield style={{ width: 13, height: 13, color: T.purple }} /><p style={{ fontSize: 10, fontWeight: 700, color: T.purple, letterSpacing: '0.06em', fontFamily: ff }}>PICKUP CODE</p></div>
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <div className="flex-1" style={{ borderRadius: 14, padding: '14px 16px', fontSize: 26, fontWeight: 800, letterSpacing: '0.15em', background: T.fill, textAlign: 'center', fontFamily: mf, border: '1.5px solid ' + T.border }}>{pickupCode}</div>
                <button onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(pickupCode); setCodeCopied(true); setTimeout(function () { setCodeCopied(false); }, 2000); }} className="tap" style={{ width: 50, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: codeCopied ? T.okBg : T.fill, border: '1px solid ' + (codeCopied ? T.ok + '33' : T.border), transition: 'all .2s' }}>{codeCopied ? <Check style={{ width: 18, height: 18, color: T.ok }} /> : <Copy style={{ width: 18, height: 18, color: T.sec }} />}</button>
              </div>
              <button onClick={function () { setShowPickupQR(!showPickupQR); }} className="tap flex items-center justify-between w-full" style={{ borderRadius: 12, padding: '10px 12px', background: T.fill, border: '1px solid ' + T.border }}>
                <div className="flex items-center gap-2"><Zap style={{ width: 13, height: 13, color: T.purple }} /><span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: ff }}>Locker QR Code</span></div>
                <ChevronDown style={{ width: 14, height: 14, color: T.muted, transform: showPickupQR ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {showPickupQR && (
                <div className="fu flex flex-col items-center" style={{ paddingTop: 14 }}>
                  <QRCode data={pickupCode} size={160} radius={18} padding={16} />
                  <p style={{ fontSize: 11, color: T.sec, marginTop: 10, fontFamily: ff, textAlign: 'center' }}>Scan at the locker to collect your package</p>
                </div>
              )}
            </div>

            {/* Pickup summary */}
            <div style={{ borderRadius: 20, padding: 16, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
              <h3 style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, fontFamily: ff }}>Pickup Summary</h3>
              {[
                { icon: '📍', label: 'Pickup Location', value: selLk.name },
                { icon: '📦', label: 'Tracking', value: tracking.toUpperCase() || 'N/A', mono: true },
                { icon: '🚚', label: 'Courier', value: courier ? couriers.find(function (c) { return c.id === courier; }).n : 'N/A' },
                { icon: '💰', label: 'Locker Fee', value: 'GH₵' + rcvFee, mono: true }
              ].map(function (r, i) {
                return <div key={i} className="flex items-center gap-3" style={{ borderRadius: 12, padding: '10px 12px', background: T.fill, marginBottom: 6 }}><span style={{ fontSize: 14 }}>{r.icon}</span><div className="flex-1"><p style={{ fontSize: 10, color: T.sec, fontFamily: ff, letterSpacing: '0.04em' }}>{r.label.toUpperCase()}</p><p style={{ fontWeight: 600, fontSize: 13, fontFamily: r.mono ? mf : ff }}>{r.value}</p></div></div>;
              })}
            </div>

            {/* Locker address to share with courier */}
            <div style={{ borderRadius: 20, padding: 16, background: T.warnBg, border: '1px solid ' + T.warn + '22', marginBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><MapPin style={{ width: 13, height: 13, color: T.warn }} /><p style={{ fontSize: 10, fontWeight: 700, color: T.warn, letterSpacing: '0.06em', fontFamily: ff }}>DELIVERY ADDRESS FOR COURIER</p></div>
              <div style={{ borderRadius: 12, padding: 12, background: '#fff', border: '1px solid ' + T.warn + '22' }}>
                <p style={{ fontSize: 14, fontWeight: 700, fontFamily: ff, marginBottom: 2 }}>LocQar — {selLk.name}</p>
                <p style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>{selLk.addr}</p>
                <p style={{ fontSize: 11, color: T.warn, fontFamily: mf, marginTop: 4 }}>Ref: {pickupCode}</p>
              </div>
              <p style={{ fontSize: 11, color: T.warn, marginTop: 8, fontFamily: ff }}>Share this address with your courier as the delivery destination.</p>
            </div>

            {/* How it works */}
            <div style={{ borderRadius: 20, padding: 16, background: T.purpleBg, border: '1px solid ' + T.purple + '22', marginBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Info style={{ width: 13, height: 13, color: T.purple }} /><p style={{ fontSize: 10, fontWeight: 700, color: T.purple, letterSpacing: '0.06em', fontFamily: ff }}>WHAT HAPPENS NEXT</p></div>
              {[
                { n: '1', t: 'Share the locker address with your courier' },
                { n: '2', t: 'Courier delivers to the LocQar locker' },
                { n: '3', t: 'You get an SMS when your package arrives' },
                { n: '4', t: 'Go to the locker and scan/enter your code' }
              ].map(function (s, i) {
                return (
                  <div key={i} className="flex items-start gap-3" style={{ marginBottom: i < 3 ? 8 : 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, background: T.purple, color: '#fff', flexShrink: 0, marginTop: 1, fontFamily: ff }}>{s.n}</div>
                    <p style={{ fontSize: 13, color: T.purple, fontFamily: ff, lineHeight: '1.5' }}>{s.t}</p>
                  </div>
                );
              })}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button onClick={function () { props.onBack(); }} className="tap flex-1" style={{ padding: '14px 0', borderRadius: 16, fontWeight: 700, fontSize: 14, background: T.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: ff, boxShadow: T.shadowMd }}><Navigation style={{ width: 16, height: 16 }} />Get Directions</button>
              <button onClick={function () { props.onBack(); }} className="tap" style={{ padding: '14px 22px', borderRadius: 16, fontWeight: 700, fontSize: 14, background: '#fff', color: T.text, fontFamily: ff, border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>Done</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {st === 1 && <div className="glass fixed bottom-0 left-0 right-0" style={{ padding: 16, borderTop: '1px solid ' + T.border }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12, padding: '10px 14px', background: T.fill, borderRadius: 12 }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 28, height: 28, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: T.okBg }}>{selLk.emoji}</div>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: ff, color: T.sec }}>Pickup at <span style={{ color: T.text, fontWeight: 700 }}>{selLk.name}</span></span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, fontFamily: mf, letterSpacing: '-0.02em' }}>GH₵{rcvFee}</span>
        </div>
        <button onClick={function () { if (canContinue) goToPayment(); }} className="tap" style={{ width: '100%', padding: '14px 0', borderRadius: 16, fontWeight: 700, fontSize: 15, background: canContinue ? T.gradientAccent : T.fill, color: canContinue ? '#fff' : T.muted, transition: 'all .3s cubic-bezier(.2,.9,.3,1)', fontFamily: ff, boxShadow: canContinue ? '0 6px 20px rgba(225,29,72,0.25)' : 'none', border: canContinue ? 'none' : '1.5px solid ' + T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>Confirm & Pay{canContinue && <ArrowRight style={{ width: 16, height: 16 }} />}</button>
      </div>}
    </div>
  );
}
