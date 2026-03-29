import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import QRCode from "../utils/qrcode";
import { initLockers } from "../data/mockData";
import { ArrowLeft, Check, Shield, Zap, Copy, ChevronDown, MapPin, Clock, Star, Navigation, AlertTriangle } from "../components/Icons";
import { calcOverage, lockerStatus, fmtHours, FREE_HOURS, OVERAGE_RATE } from "../utils/storageUtils";

// Mock active storage sessions
var mockActive = [
  { id: 'LS-847291', locker: 'Accra Mall', size: 'Medium', emoji: '\u{1F4E6}', hoursInLocker: 26.3, base: 5 },
  { id: 'LS-612047', locker: 'Osu Mall', size: 'Small', emoji: '\u{1F4C4}', hoursInLocker: 9.8, base: 5 },
  { id: 'LS-993821', locker: 'West Hills Mall', size: 'Large', emoji: '\u{1F9F3}', hoursInLocker: 23.4, base: 5 },
];

export default function StoragePage(props) {
  var ssd = props.savedData || {};
  var hasSSD = ssd.sz || ssd.lk;
  var [tab, setTab] = useState('active');
  var [st, sS] = useState(props.confirmed ? 3 : hasSSD ? 2 : 1);
  var [sz, sSz] = useState(ssd.sz || null);
  var [lk, sLk] = useState(ssd.lk || null);
  var [confirmed, setConfirmed] = useState(false);
  var [showStorageQR, setShowStorageQR] = useState(true);
  var [codeCopied, setCodeCopied] = useState(false);
  var storageCode = 'LS-' + (300000 + Math.floor(Math.random() * 700000));

  var szs = [
    { id: 's', e: '\u{1F4C4}', l: 'Small', d: 'Documents, keys', w: '30\u00D720\u00D715 cm', p: 5, ovr: 2 },
    { id: 'm', e: '\u{1F4E6}', l: 'Medium', d: 'Laptop, bag', w: '45\u00D735\u00D730 cm', p: 5, ovr: 2 },
    { id: 'l', e: '\u{1F9F3}', l: 'Large', d: 'Suitcase', w: '60\u00D745\u00D740 cm', p: 5, ovr: 2 },
    { id: 'xl', e: '\u{1F4E6}', l: 'XL Locker', d: 'Multiple bags', w: '80\u00D755\u00D750 cm', p: 12, ovr: 5 },
  ];

  var lks = initLockers.slice(0, 4).map(function (l) { return { n: l.name, d: l.dist + ' km', a: l.avail, e: l.emoji, addr: l.addr, hours: l.hours, rating: l.rating }; });

  var selSz = szs.find(function (s) { return s.id === sz; });
  var canContinue = (st === 1 && sz) || (st === 2 && lk);
  var inBooking = tab === 'book';

  return (
    <div className="min-h-screen" style={{ paddingBottom: inBooking && st < 3 ? 120 : 40, background: T.bg }}>
      <StatusBar />
      <Toast show={confirmed} emoji={'\u{1F5C4}\u{FE0F}'} text="Storage reserved!" />
      <Toast show={codeCopied && !confirmed} emoji={'\u{1F4CB}'} text="Storage code copied!" />

      <div style={{ padding: '8px 20px' }}>
        {/* Header */}
        <div className="flex items-center gap-3" style={{ marginBottom: 20 }}>
          <button
            onClick={function () { inBooking && st > 1 && st < 3 ? sS(st - 1) : inBooking && st === 1 ? setTab('active') : props.onBack(); }}
            className="tap"
            style={{ width: 44, height: 44, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1.5px solid ' + T.border }}
          >
            <ArrowLeft style={{ width: 18, height: 18, color: T.text }} />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: ff, color: T.text }}>Storage</h1>
            <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, fontWeight: 600 }}>
              {!inBooking ? 'Your active lockers' : st === 1 ? 'Choose size' : st === 2 ? 'Select location' : 'Reservation details'}
            </p>
          </div>
          {inBooking && st < 3 && (
            <div className="flex items-center gap-1">
              {[1, 2].map(function (s) {
                return <div key={s} style={{ width: 8, height: 8, borderRadius: 4, background: s === st ? T.accent : T.fill, border: s === st ? 'none' : '1.5px solid ' + T.border, transition: 'all .3s' }} />;
              })}
            </div>
          )}
        </div>

        {/* Tab bar — only when not in mid-booking */}
        {(!inBooking || st === 1) && st !== 3 && (
          <div className="flex" style={{ borderRadius: 14, background: T.fill, padding: 4, gap: 2, marginBottom: 24 }}>
            {[{ id: 'active', l: 'Active (' + mockActive.length + ')' }, { id: 'book', l: 'New Booking' }].map(function (t) {
              var sel = tab === t.id;
              return (
                <button key={t.id} onClick={function () { setTab(t.id); if (t.id === 'book') sS(1); }} className="tap flex-1" style={{ padding: '9px 0', borderRadius: 11, fontWeight: 700, fontSize: 13, fontFamily: ff, background: sel ? T.card : 'transparent', color: sel ? T.text : T.muted, border: sel ? '1px solid ' + T.border : 'none', boxShadow: sel ? T.shadow : 'none', transition: 'all .2s' }}>
                  {t.l}
                </button>
              );
            })}
          </div>
        )}

        {/* ── ACTIVE TAB ── */}
        {tab === 'active' && (
          <div className="fu space-y-3">
            {mockActive.map(function (item) {
              var overage = calcOverage(item.hoursInLocker);
              var isOver = item.hoursInLocker > FREE_HOURS;
              var isWarning = item.hoursInLocker >= FREE_HOURS - 2 && !isOver;
              var pct = Math.min(item.hoursInLocker / FREE_HOURS, 1);
              var remaining = Math.max(0, FREE_HOURS - item.hoursInLocker);
              var statusColor = isOver ? T.red : isWarning ? T.warn : T.ok;
              var statusBg = isOver ? T.redBg : isWarning ? T.warnBg : T.okBg;

              return (
                <div key={item.id} style={{ borderRadius: 22, background: T.card, border: '1.5px solid ' + (isOver ? T.red + '30' : T.border), boxShadow: T.shadow, overflow: 'hidden' }}>
                  {/* Top row */}
                  <div className="flex items-center gap-3" style={{ padding: '16px 18px 14px' }}>
                    <div style={{ width: 46, height: 46, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: T.fill, border: '1.5px solid ' + T.border, flexShrink: 0 }}>
                      {item.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p style={{ fontWeight: 800, fontSize: 14, fontFamily: ff, color: T.text }}>{item.size} · {item.locker}</p>
                      </div>
                      <p style={{ fontSize: 11, fontFamily: mf, color: T.muted, marginTop: 2, letterSpacing: '0.04em' }}>{item.id}</p>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 8, background: statusBg, color: statusColor, fontFamily: ff, flexShrink: 0 }}>
                      {isOver ? 'OVERDUE' : isWarning ? 'EXPIRING' : 'ACTIVE'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ padding: '0 18px 14px' }}>
                    <div style={{ height: 5, borderRadius: 99, background: T.fill, overflow: 'hidden', marginBottom: 8 }}>
                      <div style={{ height: '100%', borderRadius: 99, width: (pct * 100) + '%', background: isOver ? T.red : isWarning ? T.warn : T.ok, transition: 'width .4s' }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 11, color: T.muted, fontFamily: ff }}>
                        <Clock style={{ width: 10, height: 10, display: 'inline', marginRight: 4 }} />
                        {fmtHours(item.hoursInLocker)} elapsed
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: statusColor, fontFamily: ff }}>
                        {isOver ? '+' + fmtHours(item.hoursInLocker - FREE_HOURS) + ' over' : fmtHours(remaining) + ' left'}
                      </span>
                    </div>
                  </div>

                  {/* Overage warning */}
                  {isOver && (
                    <div className="flex items-center gap-2" style={{ margin: '0 18px 14px', padding: '10px 14px', borderRadius: 12, background: T.redBg, border: '1px solid ' + T.red + '25' }}>
                      <AlertTriangle style={{ width: 14, height: 14, color: T.red, flexShrink: 0 }} />
                      <p style={{ fontSize: 12, fontWeight: 600, color: T.red, fontFamily: ff }}>
                        Overage: <span style={{ fontFamily: mf, fontWeight: 800 }}>GH₵{overage.toFixed(2)}</span>
                        <span style={{ opacity: 0.75 }}> (GH₵{OVERAGE_RATE}/hr × {Math.ceil(item.hoursInLocker - FREE_HOURS)} hrs)</span>
                      </p>
                    </div>
                  )}

                  {isWarning && (
                    <div className="flex items-center gap-2" style={{ margin: '0 18px 14px', padding: '10px 14px', borderRadius: 12, background: T.warnBg, border: '1px solid ' + T.warn + '25' }}>
                      <AlertTriangle style={{ width: 14, height: 14, color: T.warn, flexShrink: 0 }} />
                      <p style={{ fontSize: 12, fontWeight: 600, color: T.warn, fontFamily: ff }}>Collect soon to avoid extra charges</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between" style={{ padding: '12px 18px', borderTop: '1px solid ' + T.fill }}>
                    <div>
                      <p style={{ fontSize: 10, color: T.muted, fontFamily: ff }}>Base paid</p>
                      <p style={{ fontSize: 15, fontWeight: 800, fontFamily: mf, color: T.text }}>GH₵{item.base.toFixed(2)}</p>
                    </div>
                    {isOver && (
                      <div style={{ textAlign: 'right', marginRight: 12 }}>
                        <p style={{ fontSize: 10, color: T.muted, fontFamily: ff }}>Owed on pickup</p>
                        <p style={{ fontSize: 15, fontWeight: 800, fontFamily: mf, color: T.red }}>GH₵{overage.toFixed(2)}</p>
                      </div>
                    )}
                    <button className="tap flex items-center gap-2" style={{ padding: '10px 18px', borderRadius: 12, background: isOver ? T.red : T.text, fontWeight: 800, fontSize: 13, color: '#fff', fontFamily: ff, boxShadow: isOver ? '0 4px 12px ' + T.red + '33' : '0 4px 12px rgba(0,0,0,0.15)' }}>
                      {isOver ? 'Pay & Collect' : 'View Code'}
                    </button>
                  </div>
                </div>
              );
            })}

            <button onClick={function () { setTab('book'); sS(1); }} className="tap flex items-center justify-center gap-2 w-full" style={{ padding: '14px 0', borderRadius: 16, fontWeight: 700, fontSize: 14, background: T.fill, color: T.text, border: '1.5px dashed ' + T.border, fontFamily: ff, marginTop: 4 }}>
              <span style={{ fontSize: 16 }}>＋</span> Book New Storage
            </button>
          </div>
        )}

        {/* ── STEP 1: Choose size ── */}
        {tab === 'book' && st === 1 && (
          <div className="fu space-y-5">
            {/* Policy banner */}
            <div style={{ borderRadius: 16, padding: '14px 16px', background: T.blueBg, border: '1px solid ' + T.blue + '25' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: T.blue, fontFamily: ff, marginBottom: 3 }}>First {FREE_HOURS} hours included</p>
              <p style={{ fontSize: 12, color: T.blue, opacity: 0.75, fontFamily: ff, lineHeight: 1.5 }}>If your items stay beyond {FREE_HOURS} hrs, <span style={{ fontFamily: mf, fontWeight: 700 }}>GH₵{OVERAGE_RATE}/hr</span> is charged and due at pickup.</p>
            </div>

            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: T.muted, letterSpacing: '0.06em', marginBottom: 16, fontFamily: ff, textTransform: 'uppercase' }}>CHOOSE SIZE</p>
              <div className="grid grid-cols-2 gap-3">
                {szs.map(function (s) {
                  var sel = sz === s.id;
                  return (
                    <button key={s.id} onClick={function () { sSz(s.id); }} className="tap text-left relative overflow-hidden" style={{ padding: 16, borderRadius: 24, background: sel ? T.text : '#fff', color: sel ? '#fff' : T.text, border: '1.5px solid ' + (sel ? T.text : T.border), transition: 'all .25s', boxShadow: sel ? T.shadowMd : T.shadow }}>
                      <div style={{ fontSize: 24, marginBottom: 12 }}>{s.e}</div>
                      <p style={{ fontWeight: 800, fontSize: 15, fontFamily: ff }}>{s.l}</p>
                      <p style={{ fontSize: 11, opacity: 0.6, fontFamily: ff, marginTop: 2 }}>{s.w}</p>
                      <div style={{ marginTop: 12 }}>
                        <p style={{ fontWeight: 900, fontSize: 16, fontFamily: mf }}>GH{'\u20B5'}{s.p}</p>
                        <p style={{ fontSize: 10, opacity: 0.55, fontFamily: ff, marginTop: 2 }}>24 hrs · then GH{'\u20B5'}{s.ovr}/hr</p>
                      </div>
                      {sel && <div className="pop" style={{ position: 'absolute', top: 12, right: 12, width: 22, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: Pick locker ── */}
        {tab === 'book' && st === 2 && (
          <div className="fu">
            {/* Summary pill */}
            <div className="flex items-center justify-between" style={{ borderRadius: 16, padding: '12px 16px', background: T.fill, border: '1.5px solid ' + T.border, marginBottom: 20 }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: 22 }}>{selSz ? selSz.e : '\u{1F4E6}'}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: 14, fontFamily: ff, color: T.text }}>{selSz ? selSz.l : ''}</p>
                  <p style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>24 hrs included</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 900, fontSize: 20, fontFamily: mf, color: T.text }}>GH{'\u20B5'}{selSz ? selSz.p : 0}</p>
                <p style={{ fontSize: 10, color: T.muted, fontFamily: ff }}>then GH{'\u20B5'}{selSz ? selSz.ovr : 0}/hr</p>
              </div>
            </div>

            <p style={{ fontSize: 12, fontWeight: 800, color: T.muted, letterSpacing: '0.06em', marginBottom: 16, fontFamily: ff, textTransform: 'uppercase' }}>PICK A LOCKER</p>
            <div className="space-y-3">
              {lks.map(function (l, i) {
                var sel = lk === l.n;
                return (
                  <button key={i} onClick={function () { sLk(l.n); }} className="tap flex items-center gap-4" style={{ width: '100%', padding: '16px 20px', borderRadius: 24, background: sel ? T.text : '#fff', color: sel ? '#fff' : T.text, transition: 'all .25s', border: '1.5px solid ' + (sel ? T.text : T.border), boxShadow: sel ? T.shadowLg : T.shadow }}>
                    <div style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: sel ? 'rgba(255,255,255,0.12)' : T.fill }}>{l.e}</div>
                    <div className="flex-1 text-left min-w-0">
                      <p style={{ fontWeight: 800, fontSize: 16, fontFamily: ff, letterSpacing: '-0.01em' }}>{l.n}</p>
                      <p className="truncate" style={{ fontSize: 12, opacity: 0.6, fontFamily: ff, marginTop: 2 }}>{l.addr}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1" style={{ fontSize: 11 }}><MapPin style={{ width: 10, height: 10 }} />{l.d}</span>
                        <span className="flex items-center gap-1" style={{ fontSize: 11 }}><Clock style={{ width: 10, height: 10 }} />{l.hours}</span>
                        <span className="flex items-center gap-1" style={{ fontSize: 11, fontWeight: 700, color: '#F59E0B' }}><Star style={{ width: 10, height: 10, fill: '#F59E0B' }} />{l.rating}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 10, background: sel ? 'rgba(255,255,255,0.2)' : T.okBg, color: sel ? '#fff' : T.okDark, fontFamily: ff }}>{l.a} Free</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 3: Confirmed ── */}
        {tab === 'book' && st === 3 && (
          <div className="fu space-y-6">
            <div className="glass p-8 text-center" style={{ borderRadius: 32, background: 'linear-gradient(135deg, ' + T.warnBg + ', #FFFBEB)', border: '2.5px solid #fff', boxShadow: T.shadowLg }}>
              <div className="pop" style={{ fontSize: 52, marginBottom: 12 }}>{'\u{1F5C4}\u{FE0F}'}</div>
              <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: ff, color: T.text }}>Locker Reserved</h2>
              <p style={{ fontSize: 13, color: T.sec, fontFamily: ff, fontWeight: 600, marginTop: 4 }}>Ready for your drop-off</p>
            </div>

            {/* 24hr policy reminder */}
            <div style={{ borderRadius: 16, padding: '14px 16px', background: T.blueBg, border: '1px solid ' + T.blue + '25' }}>
              <div className="flex items-start gap-3">
                <Clock style={{ width: 16, height: 16, color: T.blue, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: T.blue, fontFamily: ff, marginBottom: 3 }}>24-hour window starts on drop-off</p>
                  <p style={{ fontSize: 12, color: T.blue, opacity: 0.75, fontFamily: ff, lineHeight: 1.5 }}>
                    After 24 hrs, <span style={{ fontFamily: mf, fontWeight: 700 }}>GH{'\u20B5'}{selSz ? selSz.ovr : 0}/hr</span> is added to your balance and due at pickup.
                  </p>
                </div>
              </div>
            </div>

            {/* Code card */}
            <div className="glass p-6" style={{ borderRadius: 28, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
              <div className="flex items-center gap-2 mb-4">
                <Shield style={{ width: 14, height: 14, color: T.warn }} />
                <p style={{ fontSize: 11, fontWeight: 900, color: T.warn, letterSpacing: '0.08em', fontFamily: ff, textTransform: 'uppercase' }}>Reservation Code</p>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 glass" style={{ padding: '16px 20px', borderRadius: 20, fontSize: 28, fontWeight: 900, letterSpacing: '0.2em', background: T.fill, textAlign: 'center', fontFamily: mf, color: T.text, border: '1.5px solid ' + T.border }}>{storageCode}</div>
                <button onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(storageCode); setCodeCopied(true); setTimeout(function () { setCodeCopied(false); }, 2000); }} className="tap" style={{ width: 64, height: 68, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: codeCopied ? T.okBg : T.fill, border: '1.5px solid ' + (codeCopied ? T.ok + '33' : T.border), transition: 'all .2s' }}>
                  {codeCopied ? <Check style={{ width: 22, height: 22, color: T.ok }} /> : <Copy style={{ width: 22, height: 22, color: T.sec }} />}
                </button>
              </div>
              <button onClick={function () { setShowStorageQR(!showStorageQR); }} className="tap flex items-center justify-between w-full glass" style={{ borderRadius: 16, padding: '12px 16px', background: T.fill, border: '1px solid ' + T.border }}>
                <div className="flex items-center gap-2"><Zap style={{ width: 14, height: 14, color: T.warn }} /><span style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: ff }}>Show QR Code</span></div>
                <ChevronDown style={{ width: 16, height: 16, color: T.muted, transform: showStorageQR ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {showStorageQR && (
                <div className="fu flex flex-col items-center pt-6">
                  <div className="glass p-4" style={{ borderRadius: 24, background: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
                    <QRCode data={storageCode} size={180} radius={22} padding={12} />
                  </div>
                  <p style={{ fontSize: 12, color: T.sec, marginTop: 16, fontFamily: ff, fontWeight: 600, textAlign: 'center' }}>Scan at the locker to begin storage</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="glass p-6 space-y-4" style={{ borderRadius: 28, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
              <h3 style={{ fontWeight: 900, fontSize: 16, fontFamily: ff, color: T.text }}>Storage Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: '\u{1F5C4}\u{FE0F}', label: 'Size', value: selSz ? selSz.l : '' },
                  { icon: '\u{1F4CD}', label: 'Locker', value: lk },
                  { icon: '\u{1F4B0}', label: 'Paid now', value: 'GH\u20B5' + (selSz ? selSz.p : 0), mono: true },
                  { icon: '\u23F1\uFE0F', label: 'Overage rate', value: 'GH\u20B5' + (selSz ? selSz.ovr : 0) + '/hr', mono: true },
                ].map(function (r, i) {
                  return (
                    <div key={i} className="glass" style={{ padding: '12px 14px', borderRadius: 20, background: T.fill }}>
                      <p style={{ fontSize: 9, fontWeight: 900, color: T.muted, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>{r.label}</p>
                      <div className="flex items-center gap-2">
                        <span style={{ fontSize: 14 }}>{r.icon}</span>
                        <p style={{ fontWeight: 800, fontSize: 13, fontFamily: r.mono ? mf : ff, color: T.text }}>{r.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={function () { props.onBack(); }} className="tap flex-1" style={{ padding: '16px 0', borderRadius: 20, fontWeight: 900, fontSize: 15, background: T.text, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: ff, boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}><Navigation style={{ width: 18, height: 18 }} />Navigate</button>
              <button onClick={function () { props.onBack(); }} className="tap" style={{ padding: '16px 24px', borderRadius: 20, fontWeight: 800, fontSize: 15, background: '#fff', color: T.text, fontFamily: ff, border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>Done</button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {tab === 'book' && st < 3 && (
        <div className="glass fixed bottom-0 left-0 right-0 p-5 pb-8" style={{ borderTop: '1.5px solid ' + T.border, zIndex: 10 }}>
          {st === 2 && lk ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="pop" style={{ width: 40, height: 40, borderRadius: 12, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{selSz ? selSz.e : '\u{1F4E6}'}</div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{selSz ? selSz.l : ''} · {lk}</p>
                    <p style={{ fontSize: 11, color: T.sec, fontWeight: 600 }}>24 hrs · then GH{'\u20B5'}{selSz ? selSz.ovr : 0}/hr</p>
                  </div>
                </div>
                <p style={{ fontWeight: 900, fontSize: 22, fontFamily: mf, color: T.text }}>GH{'\u20B5'}{selSz ? selSz.p : 0}</p>
              </div>
              <button onClick={function () {
                if (props.onNav) {
                  props.onNav('payment', {
                    amount: selSz ? selSz.p : 0,
                    label: 'Storage Rental',
                    icon: '\u{1F5C4}\u{FE0F}',
                    items: [
                      { e: '\u{1F5C4}\u{FE0F}', l: (selSz ? selSz.l : 'Locker') + ' Size', v: 'GH\u20B5' + (selSz ? selSz.p : 0) },
                      { e: '\u23F1\uFE0F', l: 'Includes 24 hrs', v: '' },
                      { e: '\u{1F4CD}', l: 'Location: ' + lk, v: '' },
                    ],
                    backTo: 'storage', onSuccessNav: 'storage', onSuccessData: { confirmed: true },
                    storageData: { sz: sz, lk: lk }
                  });
                }
              }} className="tap" style={{ width: '100%', padding: '18px 0', borderRadius: 22, fontWeight: 900, fontSize: 16, color: '#fff', background: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontFamily: ff, boxShadow: '0 12px 24px ' + T.accent + '44', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Reserve & Pay</button>
            </div>
          ) : (
            <button onClick={function () { if (canContinue) sS(2); }} className="tap" style={{ width: '100%', padding: '18px 0', borderRadius: 22, fontWeight: 900, fontSize: 16, background: canContinue ? T.text : T.fill, color: canContinue ? '#fff' : T.muted, transition: 'all .3s', fontFamily: ff, boxShadow: canContinue ? '0 10px 20px rgba(0,0,0,0.15)' : 'none', border: canContinue ? 'none' : '1.5px solid ' + T.border, textTransform: 'uppercase', letterSpacing: '0.02em' }}>Continue</button>
          )}
        </div>
      )}
    </div>
  );
}
