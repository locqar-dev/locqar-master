import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import EmptyState from "../components/EmptyState";
import QRCode from "../utils/qrcode";
import { initLockers } from "../data/mockData";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Copy, Info, MapPin, Phone, Shield, Star, Zap } from "../components/Icons";

export default function CallPackagePage(props) {
  var [st, sS] = useState(1);
  var [selPkg, setSelPkg] = useState(null);
  var [delMethod, setDelMethod] = useState(null);
  var [addr, setAddr] = useState('');
  var [addrNote, setAddrNote] = useState('');
  var [selLocker, setSelLocker] = useState(null);
  var [timeSlot, setTimeSlot] = useState(null);
  var [confirmed, setConfirmed] = useState(false);
  var [showTrackQR, setShowTrackQR] = useState(true);
  var [codeCopied, setCodeCopied] = useState(false);
  var trackCode = 'CD-' + (400000 + Math.floor(Math.random() * 600000));

  // Packages currently in lockers (ready for pickup)
  var lockerPkgs = [
    { id: 'lp1', name: 'iPhone 15 Case', locker: 'Osu Mall', lockerNum: '#12', size: 'Small', since: '2 hours ago', from: 'Ama Mensah', emoji: '📱' },
    { id: 'lp2', name: 'Book Bundle', locker: 'Accra Mall', lockerNum: '#7', size: 'Medium', since: '1 day ago', from: 'Online Store', emoji: '📚' },
    { id: 'lp3', name: 'Headphones', locker: 'Circle Hub', lockerNum: '#19', size: 'Small', since: '3 hours ago', from: 'Kofi Boateng', emoji: '🎧' }
  ];

  var deliveryLockers = initLockers.slice(0, 4).map(function (l) { return { n: l.name, d: l.dist + ' km', a: l.avail, e: l.emoji, addr: l.addr }; });

  var timeSlots = [
    { id: 'asap', l: 'ASAP', d: '30-45 min', e: '⚡', price: 8, pop: true },
    { id: '1h', l: 'Within 1 hour', d: '45-60 min', e: '🕐', price: 6 },
    { id: '2h', l: 'Within 2 hours', d: '60-120 min', e: '🕑', price: 5 },
    { id: 'later', l: 'Later today', d: '3-5 hours', e: '🌤️', price: 4 }
  ];

  var selTime = timeSlots.find(function (t) { return t.id === timeSlot; });
  var basePrice = selTime ? selTime.price : 0;
  var sizeFee = selPkg ? (selPkg.size === 'Medium' ? 2 : selPkg.size === 'Large' ? 4 : 0) : 0;
  var totalPrice = basePrice + sizeFee;

  var canContinue = (st === 1 && selPkg) ||
    (st === 2 && delMethod && ((delMethod === 'door' && addr.trim().length >= 5) || (delMethod === 'locker' && selLocker))) ||
    (st === 3 && timeSlot);

  var goToPayment = function () {
    if (props.onNav) {
      props.onNav('payment', {
        amount: totalPrice + '',
        label: 'Call Package — ' + (selPkg ? selPkg.name : ''),
        icon: '📲',
        items: [
          { e: '📦', l: selPkg ? selPkg.name : 'Package', v: '' },
          { e: '🏪', l: 'From: ' + (selPkg ? selPkg.locker + ' ' + selPkg.lockerNum : ''), v: '' },
          { e: delMethod === 'door' ? '🏠' : '🏪', l: 'To: ' + (delMethod === 'door' ? addr : selLocker), v: '' },
          { e: '⏱️', l: selTime ? selTime.l : '', v: 'GH₵' + basePrice },
          sizeFee > 0 ? { e: '📦', l: 'Size fee (' + (selPkg ? selPkg.size : '') + ')', v: 'GH₵' + sizeFee } : null
        ].filter(Boolean),
        backTo: 'call-pkg',
        onSuccessNav: 'call-pkg-done',
        onSuccessData: {}
      });
    }
  };

  // Confirmation screen after payment
  if (st === 4 || props.confirmed) {
    return (
      <div className="min-h-screen" style={{ paddingBottom: 40, background: T.bg }}>
        <StatusBar />
        <Toast show={codeCopied} emoji="📋" text="Tracking code copied!" />
        <div style={{ padding: '8px 20px' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
            <button onClick={props.onBack} className="tap" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1px solid ' + T.border }}><ArrowLeft style={{ width: 18, height: 18 }} /></button>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: ff }}>Package Called</h1>
          </div>

          {/* Success banner */}
          <div className="fu" style={{ borderRadius: 20, padding: 20, background: T.purpleBg, border: '1.5px solid ' + T.purple + '22', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 44, marginBottom: 8 }}>📲</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: ff, marginBottom: 4 }}>On Its Way!</h2>
            <p style={{ fontSize: 13, color: T.purple, fontFamily: ff }}>A rider is picking up your package</p>
          </div>

          {/* Live status */}
          <div className="fu d1" style={{ borderRadius: 20, padding: 16, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <div className="breathe" style={{ width: 8, height: 8, borderRadius: 4, background: T.ok }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: T.okDark, fontFamily: ff }}>Live Tracking Active</span>
            </div>

            {/* Mini timeline */}
            {[
              { e: '📦', t: 'Rider heading to locker', tm: 'Now', done: true, active: true },
              { e: '🏪', t: 'Picking up from ' + (selPkg ? selPkg.locker : 'locker'), tm: '~10 min', done: false },
              { e: '🛵', t: 'En route to you', tm: '~20 min', done: false },
              { e: delMethod === 'door' ? '🏠' : '📍', t: delMethod === 'door' ? 'Delivered to your door' : 'Dropped at ' + (selLocker || 'locker'), tm: selTime ? selTime.d : '', done: false }
            ].map(function (s, i) {
              return (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div style={{ width: 30, height: 30, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: s.done ? (s.active ? T.okBg : T.fill) : '#FAFAFA', border: s.active ? '2px solid ' + T.ok : '1px solid ' + T.border, opacity: s.done ? 1 : 0.4 }}>{s.e}</div>
                    {i < 3 && <div style={{ width: 2, height: 14, margin: '2px 0', borderRadius: 1, background: s.done ? T.ok : T.border }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: 13, fontFamily: ff, opacity: s.done ? 1 : 0.4 }}>{s.t}</p>
                    <p style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>{s.tm}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tracking code */}
          <div className="fu d2" style={{ borderRadius: 20, padding: 16, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Shield style={{ width: 13, height: 13, color: T.purple }} /><p style={{ fontSize: 10, fontWeight: 700, color: T.purple, letterSpacing: '0.06em', fontFamily: ff }}>TRACKING CODE</p></div>
            <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
              <div className="flex-1" style={{ borderRadius: 14, padding: '13px 16px', fontSize: 24, fontWeight: 800, letterSpacing: '0.12em', background: T.fill, textAlign: 'center', fontFamily: mf, border: '1.5px solid ' + T.border }}>{trackCode}</div>
              <button onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(trackCode); setCodeCopied(true); setTimeout(function () { setCodeCopied(false); }, 2000); }} className="tap" style={{ width: 48, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: codeCopied ? T.okBg : T.fill, border: '1px solid ' + (codeCopied ? T.ok + '33' : T.border), transition: 'all .2s' }}>
                {codeCopied ? <Check style={{ width: 17, height: 17, color: T.ok }} /> : <Copy style={{ width: 17, height: 17, color: T.sec }} />}
              </button>
            </div>
            <button onClick={function () { setShowTrackQR(!showTrackQR); }} className="tap flex items-center justify-between w-full" style={{ borderRadius: 12, padding: '10px 12px', background: T.fill, border: '1px solid ' + T.border }}>
              <div className="flex items-center gap-2"><Zap style={{ width: 13, height: 13, color: T.purple }} /><span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: ff }}>Show QR Code</span></div>
              <ChevronDown style={{ width: 14, height: 14, color: T.muted, transform: showTrackQR ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {showTrackQR && (
              <div className="fu flex flex-col items-center" style={{ paddingTop: 14 }}>
                <QRCode data={trackCode} size={140} radius={18} padding={14} />
                <p style={{ fontSize: 11, color: T.sec, marginTop: 10, fontFamily: ff, textAlign: 'center' }}>Show to rider for confirmation</p>
              </div>
            )}
          </div>

          {/* Rider info */}
          <div className="fu d3" style={{ borderRadius: 20, padding: 16, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 10, fontFamily: ff }}>YOUR RIDER</p>
            <div className="flex items-center gap-3">
              <div style={{ width: 50, height: 50, borderRadius: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: T.fill, border: '2px solid ' + T.border }}>🛵</div>
              <div className="flex-1">
                <h3 style={{ fontWeight: 700, fontSize: 15, fontFamily: ff }}>Emmanuel K.</h3>
                <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                  <div className="flex items-center gap-0.5"><Star style={{ width: 11, height: 11, color: '#F59E0B', fill: '#F59E0B' }} /><span style={{ fontSize: 12, fontWeight: 600, fontFamily: ff }}>4.9</span></div>
                  <span style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>· 312 deliveries</span>
                </div>
              </div>
              <button className="tap" style={{ width: 42, height: 42, borderRadius: 21, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.okBg, border: '1px solid ' + T.ok + '22' }}><Phone style={{ width: 17, height: 17, color: T.okDark }} /></button>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={props.onBack} className="tap flex-1" style={{ padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: T.text, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: ff, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ paddingBottom: 110, background: T.bg }}>
      <StatusBar />
      <div style={{ padding: '8px 20px' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <button onClick={function () { st > 1 ? sS(st - 1) : props.onBack(); }} className="tap" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1px solid ' + T.border }}><ArrowLeft style={{ width: 18, height: 18 }} /></button>
          <div className="flex-1">
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: ff }}>Call Package</h1>
            <p style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>Request delivery from a locker to you</p>
          </div>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3].map(function (s) {
              return (
                <div key={s} className="flex items-center">
                  <div style={{ width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: s <= st ? T.purple : T.fill, color: s <= st ? '#fff' : T.muted, transition: 'all .25s', fontFamily: ff, border: s > st ? '1px solid ' + T.border : 'none' }}>{s}</div>
                  {s < 3 && <div style={{ width: 10, height: 2, borderRadius: 1, background: s < st ? T.purple : T.border, transition: 'all .25s' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Select package */}
        {st === 1 && (
          <div className="fu">
            <div className="flex items-center gap-2.5" style={{ borderRadius: 12, padding: '10px 12px', background: T.purpleBg, marginBottom: 16, border: '1px solid ' + T.purple + '22' }}>
              <Info style={{ width: 13, height: 13, flexShrink: 0, color: T.purple }} />
              <p style={{ fontSize: 12, color: T.purple, fontFamily: ff }}>Can't make it to the locker? We'll bring your package to you.</p>
            </div>

            <p style={{ fontSize: 14, fontWeight: 500, color: T.sec, marginBottom: 12, fontFamily: ff }}>Which package do you want delivered?</p>

            {lockerPkgs.length === 0 ? (
              <EmptyState emoji="📭" title="No packages in lockers" desc="You don't have any packages waiting in lockers right now." action="Send a Package" onAction={function () { props.onNav('send'); }} />
            ) : (
              lockerPkgs.map(function (p, i) {
                var sel = selPkg && selPkg.id === p.id;
                return (
                  <button key={p.id} onClick={function () { setSelPkg(sel ? null : p); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: sel ? T.purple : '#fff', color: sel ? '#fff' : T.text, transition: 'all .2s', marginBottom: 8, border: sel ? '2px solid ' + T.purple : '1.5px solid ' + T.border, boxShadow: sel ? '0 4px 16px rgba(139,92,246,0.2)' : T.shadow }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: sel ? 'rgba(255,255,255,0.15)' : T.fill, border: '1px solid ' + (sel ? 'rgba(255,255,255,0.1)' : T.border) }}>{p.emoji}</div>
                    <div className="flex-1 text-left min-w-0">
                      <h3 className="truncate" style={{ fontWeight: 700, fontSize: 14, fontFamily: ff }}>{p.name}</h3>
                      <p style={{ fontSize: 12, opacity: 0.6, fontFamily: ff }}>{p.locker} · Locker {p.lockerNum}</p>
                      <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
                        <span style={{ fontSize: 10, opacity: 0.5, fontFamily: ff }}>{p.size}</span>
                        <span style={{ fontSize: 10, opacity: 0.5, fontFamily: ff }}>From: {p.from}</span>
                        <span style={{ fontSize: 10, opacity: 0.5, fontFamily: ff }}>{p.since}</span>
                      </div>
                    </div>
                    <div style={{ width: 22, height: 22, borderRadius: 11, border: '2px solid ' + (sel ? '#fff' : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {sel && <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff' }} />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Step 2: Delivery destination */}
        {st === 2 && (
          <div className="fu">
            <p style={{ fontSize: 14, fontWeight: 500, color: T.sec, marginBottom: 14, fontFamily: ff }}>Where should we deliver it?</p>

            {/* Delivery method toggle */}
            <div className="flex gap-2" style={{ marginBottom: 16 }}>
              {[
                { id: 'door', e: '🏠', l: 'My Door', d: 'Home or office' },
                { id: 'locker', e: '🏪', l: 'Another Locker', d: 'Closer to you' }
              ].map(function (m) {
                var sel = delMethod === m.id;
                return (
                  <button key={m.id} onClick={function () { setDelMethod(m.id); }} className="tap flex-1" style={{ padding: 14, borderRadius: 16, background: sel ? T.text : '#fff', color: sel ? '#fff' : T.text, transition: 'all .2s', border: sel ? 'none' : '1.5px solid ' + T.border, boxShadow: sel ? '0 4px 14px rgba(0,0,0,0.15)' : T.shadow, textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{m.e}</div>
                    <p style={{ fontWeight: 700, fontSize: 13, fontFamily: ff }}>{m.l}</p>
                    <p style={{ fontSize: 10, opacity: 0.5, fontFamily: ff, marginTop: 1 }}>{m.d}</p>
                  </button>
                );
              })}
            </div>

            {/* Door delivery address */}
            {delMethod === 'door' && (
              <div className="fu">
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>DELIVERY ADDRESS</p>
                  <div style={{ borderRadius: 14, background: T.fill, border: '1.5px solid ' + (addr.trim().length >= 5 ? T.ok + '44' : T.border), transition: 'border .25s', overflow: 'hidden' }}>
                    <div className="flex items-center gap-3" style={{ padding: '12px 14px' }}>
                      <MapPin style={{ width: 16, height: 16, color: T.muted, flexShrink: 0 }} />
                      <input type="text" value={addr} onChange={function (e) { setAddr(e.target.value); }} placeholder="e.g. 15 Ring Road, Osu" className="flex-1" style={{ background: 'transparent', fontWeight: 600, fontSize: 14, fontFamily: ff }} autoFocus />
                    </div>
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>DELIVERY NOTE <span style={{ fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>(optional)</span></p>
                  <input type="text" value={addrNote} onChange={function (e) { setAddrNote(e.target.value); }} placeholder="e.g. Blue gate, 2nd floor, call on arrival" style={{ width: '100%', borderRadius: 14, padding: '12px 14px', background: T.fill, fontWeight: 500, fontSize: 13, fontFamily: ff, border: '1.5px solid ' + T.border }} />
                </div>
                {/* Saved addresses */}
                <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>SAVED ADDRESSES</p>
                {[
                  { e: '🏠', l: 'Home', d: '15 Ring Road, Osu' },
                  { e: '🏢', l: 'Office', d: '22 Independence Ave, Ridge' }
                ].map(function (a, i) {
                  var sel = addr === a.d;
                  return (
                    <button key={i} onClick={function () { setAddr(a.d); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 14, background: sel ? T.okBg : '#fff', border: '1.5px solid ' + (sel ? T.ok + '33' : T.border), marginBottom: 6, transition: 'all .2s' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: sel ? '#fff' : T.fill }}>{a.e}</div>
                      <div className="flex-1 text-left"><p style={{ fontWeight: 700, fontSize: 13, fontFamily: ff }}>{a.l}</p><p style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>{a.d}</p></div>
                      {sel && <div style={{ width: 18, height: 18, borderRadius: 9, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 3 }} /></div>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Locker-to-locker */}
            {delMethod === 'locker' && (
              <div className="fu">
                <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>CHOOSE DESTINATION LOCKER</p>
                {deliveryLockers.filter(function (l) { return selPkg ? l.n !== selPkg.locker : true; }).map(function (l, i) {
                  var sel = selLocker === l.n;
                  return (
                    <button key={i} onClick={function () { setSelLocker(l.n); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: sel ? T.text : '#fff', color: sel ? '#fff' : T.text, transition: 'all .2s', marginBottom: 8, border: sel ? 'none' : '1.5px solid ' + T.border, boxShadow: sel ? '0 4px 14px rgba(0,0,0,0.15)' : T.shadow }}>
                      <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: sel ? 'rgba(255,255,255,0.12)' : T.fill }}>{l.e}</div>
                      <div className="flex-1 text-left"><p style={{ fontWeight: 700, fontSize: 14, fontFamily: ff }}>{l.n}</p><p style={{ fontSize: 12, opacity: 0.5, fontFamily: ff }}>{l.addr} · {l.d}</p></div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 8, background: sel ? 'rgba(255,255,255,0.15)' : T.okBg, color: sel ? '#fff' : T.okDark, fontFamily: ff, flexShrink: 0 }}>{l.a + ' free'}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Time slot */}
        {st === 3 && (
          <div className="fu">
            {/* Route summary */}
            <div style={{ borderRadius: 16, padding: 14, background: T.fill, border: '1px solid ' + T.border, marginBottom: 16 }}>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: '#fff', border: '1px solid ' + T.border }}>🏪</div>
                  <div style={{ width: 2, height: 16, background: T.purple, margin: '2px 0', borderRadius: 1 }} />
                  <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, background: '#fff', border: '1px solid ' + T.border }}>{delMethod === 'door' ? '🏠' : '🏪'}</div>
                </div>
                <div className="flex-1">
                  <div style={{ marginBottom: 10 }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', fontFamily: ff }}>FROM</p>
                    <p style={{ fontWeight: 700, fontSize: 13, fontFamily: ff }}>{selPkg ? selPkg.locker + ' · Locker ' + selPkg.lockerNum : ''}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', fontFamily: ff }}>TO</p>
                    <p style={{ fontWeight: 700, fontSize: 13, fontFamily: ff }}>{delMethod === 'door' ? addr : selLocker}</p>
                  </div>
                </div>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: T.purpleBg, border: '1px solid ' + T.purple + '22', alignSelf: 'center' }}>{selPkg ? selPkg.emoji : '📦'}</div>
              </div>
            </div>

            <p style={{ fontSize: 14, fontWeight: 500, color: T.sec, marginBottom: 12, fontFamily: ff }}>When do you want it?</p>

            {timeSlots.map(function (t) {
              var sel = timeSlot === t.id;
              var totalP = t.price + sizeFee;
              return (
                <button key={t.id} onClick={function () { setTimeSlot(t.id); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: sel ? T.purple : '#fff', color: sel ? '#fff' : T.text, transition: 'all .2s', marginBottom: 8, border: sel ? '2px solid ' + T.purple : '1.5px solid ' + T.border, boxShadow: sel ? '0 4px 16px rgba(139,92,246,0.2)' : T.shadow, position: 'relative' }}>
                  {t.pop && <span style={{ position: 'absolute', top: -6, right: 12, fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: T.accent, color: '#fff', fontFamily: ff, letterSpacing: '0.04em' }}>FASTEST</span>}
                  <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: sel ? 'rgba(255,255,255,0.15)' : T.fill }}>{t.e}</div>
                  <div className="flex-1 text-left">
                    <p style={{ fontWeight: 700, fontSize: 14, fontFamily: ff }}>{t.l}</p>
                    <p style={{ fontSize: 12, opacity: 0.5, fontFamily: ff }}>Estimated: {t.d}</p>
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 16, fontFamily: mf }}>GH₵{totalP}</p>
                </button>
              );
            })}

            {sizeFee > 0 && (
              <div className="flex items-center gap-2 fi" style={{ borderRadius: 10, padding: '8px 12px', background: T.warnBg, border: '1px solid ' + T.warn + '22', marginTop: 4 }}>
                <Info style={{ width: 12, height: 12, color: T.warn }} />
                <p style={{ fontSize: 11, color: T.warn, fontFamily: ff }}>+GH₵{sizeFee} size fee for {selPkg ? selPkg.size.toLowerCase() : ''} package</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {st <= 3 && (
        <div className="glass fixed bottom-0 left-0 right-0" style={{ padding: 16, borderTop: '1px solid ' + T.border }}>
          {st === 3 && timeSlot ? (
            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>{selPkg ? selPkg.emoji : '📦'}</span>
                  <span className="truncate" style={{ fontSize: 12, color: T.sec, fontFamily: ff, maxWidth: 160 }}>{selPkg ? selPkg.name : ''} → {delMethod === 'door' ? 'Door' : selLocker}</span>
                </div>
                <span style={{ fontWeight: 800, fontSize: 18, fontFamily: mf }}>GH₵{totalPrice}</span>
              </div>
              <button onClick={goToPayment} className="tap" style={{ width: '100%', padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 15, color: '#fff', background: T.purple, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: ff, boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>Confirm & Pay</button>
            </div>
          ) : (
            <button onClick={function () { if (canContinue) sS(st + 1); }} className="tap" style={{ width: '100%', padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 15, background: canContinue ? T.text : T.fill, color: canContinue ? '#fff' : T.muted, transition: 'all .25s', fontFamily: ff, boxShadow: canContinue ? '0 4px 14px rgba(0,0,0,0.15)' : 'none', border: canContinue ? 'none' : '1px solid ' + T.border }}>Continue</button>
          )}
        </div>
      )}
    </div>
  );
}
