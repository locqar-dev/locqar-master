import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import QRCode from "../utils/qrcode";
import { contacts, initLockers } from "../data/mockData";
import PhotoUpload from "../components/PhotoUpload";
import { ArrowLeft, ArrowRight, Check, X, Users, ChevronDown, Shield, Zap, Copy, Clock, Info, Navigation, MapPin, Lock } from "../components/Icons";

// Mock registered users — phone (without +233 prefix) → profile
var registeredUsers = {
  '24 555 1234': { name: 'Ama Mensah', locker: 'Osu Mall', lockerCode: 'ACC-LQ203', emoji: '\u{1F469}\u{1F3FE}' },
  '20 888 5678': { name: 'Kofi Boateng', locker: 'Accra Mall', lockerCode: 'ACC-LQ410', emoji: '\u{1F468}\u{1F3FE}' },
  '55 222 9012': { name: 'Abena Owusu', locker: 'Shell Airport', lockerCode: 'ACC-LQ305', emoji: '\u{1F469}\u{1F3FE}\u{200D}\u{1F4BC}' },
};

function lookupRecipient(phone) {
  var norm = phone.replace(/\s/g, '');
  for (var k in registeredUsers) {
    if (k.replace(/\s/g, '') === norm) return registeredUsers[k];
  }
  return null;
}

export default function Send(props) {
  var sd = props.savedData || {};
  var hasSD = sd.toPhone || sd.sz || sd.pickupLk;
  var [st, sS] = useState(props.confirmed ? 4 : hasSD ? 3 : 1);
  var [toPhone, setToPhone] = useState(sd.toPhone || (props.prefill && props.prefill.contact ? props.prefill.contact.phone.replace('+233 ', '') : ''));
  var [toName, setToName] = useState(sd.toName || (props.prefill && props.prefill.contact ? props.prefill.contact.name : ''));
  var [sz, sSz] = useState(sd.sz || null);
  var [pickupLk, setPickupLk] = useState(sd.pickupLk || null);
  var [showContacts, setShowContacts] = useState(false);
  var [searchQ, setSearchQ] = useState('');
  var [sendSuccess, setSendSuccess] = useState(false);
  var [dropCode] = useState('LQ-' + (100000 + Math.floor(Math.random() * 900000)));
  var [codeCopied, setCodeCopied] = useState(false);
  var [showDropQR, setShowDropQR] = useState(true);
  var [scheduleMode, setScheduleMode] = useState(sd.scheduleMode || 'now');
  var [schedDate, setSchedDate] = useState(sd.schedDate || '');
  var [schedTime, setSchedTime] = useState(sd.schedTime || '');
  var [reqPayment, setReqPayment] = useState(sd.reqPayment || false);
  var [reqAmount, setReqAmount] = useState(sd.reqAmount || '');
  var [packagePhotos, setPackagePhotos] = useState(sd.packagePhotos || []);
  var szs = [{ id: 's', e: '\u{1F4C4}', l: 'Small', d: 'Documents, accessories' }, { id: 'm', e: '\u{1F4E6}', l: 'Medium', d: 'Shoes, electronics' }, { id: 'l', e: '\u{1F4E6}', l: 'Large', d: 'Clothing, bulky items' }];
  var lks = initLockers.slice(0, 3).map(function (l) { return { n: l.name, d: l.dist + ' km', a: l.avail, e: l.emoji, t: '~' + Math.round(parseFloat(l.dist) * 4) + ' min' }; });
  var filteredContacts = searchQ ? contacts.filter(function (c) { return c.name.toLowerCase().indexOf(searchQ.toLowerCase()) >= 0 || c.phone.indexOf(searchQ) >= 0; }) : contacts;
  var phoneValid = toPhone.replace(/\s/g, '').length >= 9;
  var recipient = phoneValid ? lookupRecipient(toPhone) : null;
  // For registered users, pickup locker is always their registered locker (auto-selected)
  var effectivePickupLk = recipient ? recipient.locker : pickupLk;
  var canContinue = (st === 1 && phoneValid) || (st === 2 && sz) || (st === 3 && effectivePickupLk);
  var selSzObj = szs.find(function (s) { return s.id === sz; });

  var goToPayment = function () {
    var payItems = [
      { e: '\u{1F4E6}', l: selSzObj ? selSzObj.l + ' package' : 'Package', v: 'GH\u20B515' },
      { e: '\u{1F4E5}', l: 'To: ' + (toName || '+233 ' + toPhone), v: '' },
      { e: '\u{1F4CD}', l: 'Pickup: ' + effectivePickupLk, v: '' },
    ];
    if (scheduleMode === 'later' && schedDate) payItems.push({ e: '\u{1F4C5}', l: 'Scheduled: ' + schedDate + (schedTime ? ' ' + schedTime : ''), v: '' });
    if (reqPayment && reqAmount) payItems.push({ e: '\u{1F4B8}', l: 'Collect from recipient', v: 'GH\u20B5' + reqAmount });
    if (props.onNav) {
      props.onNav('payment', {
        amount: '15',
        label: 'Send to ' + (toName || '+233 ' + toPhone),
        icon: '\u{1F4E4}',
        items: payItems,
        backTo: 'send',
        onSuccessNav: 'send',
        onSuccessData: { confirmed: true },
        sendData: { toPhone: toPhone, toName: toName, sz: sz, pickupLk: effectivePickupLk, scheduleMode: scheduleMode, schedDate: schedDate, schedTime: schedTime, reqPayment: reqPayment, reqAmount: reqAmount, packagePhotos: packagePhotos }
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ paddingBottom: st === 4 ? 40 : 100, background: T.bg }}>
      <StatusBar /><Toast show={sendSuccess} emoji={'\u{1F680}'} text="Package sent!" /><Toast show={codeCopied && !sendSuccess} emoji={'\u{1F4CB}'} text="Drop-off code copied!" />
      <div style={{ padding: '8px 20px' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <button onClick={function () { st > 1 && st < 4 ? sS(st - 1) : props.onBack(); }} className="tap" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1px solid ' + T.border }}><ArrowLeft style={{ width: 18, height: 18 }} /></button>
          <div className="flex-1"><h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: ff }}>{st === 4 ? 'Drop-off Details' : 'Send Package'}</h1></div>
          {st < 4 && <div className="flex items-center gap-0.5">
            {[1, 2, 3].map(function (s) {
              var done = s < st; var active = s === st; var pending = s > st;
              return (
                <div key={s} className="flex items-center">
                  <div style={{ width: 26, height: 26, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: done ? T.ok : active ? T.text : T.fill, color: done || active ? '#fff' : T.muted, transition: 'all .3s cubic-bezier(.2,.9,.3,1)', fontFamily: ff, border: pending ? '1.5px solid ' + T.border : 'none', boxShadow: active ? '0 2px 8px rgba(0,0,0,0.15)' : 'none' }}>{done ? <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} /> : s}</div>
                  {s < 3 && <div style={{ width: 12, height: 2, borderRadius: 1, background: s < st ? T.ok : T.border, transition: 'all .3s' }} />}
                </div>
              );
            })}
          </div>}
        </div>

        {st === 1 && (
          <div className="fu">
            <p style={{ fontSize: 14, fontWeight: 500, color: T.sec, marginBottom: 14, fontFamily: ff }}>Who are you sending to?</p>
            {contacts.filter(function (c) { return c.recent; }).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: T.muted, letterSpacing: '0.1em', marginBottom: 8, fontFamily: ff }}>SEND AGAIN</p>
                <div className="flex gap-3 overflow-x-auto noscroll">
                  {contacts.filter(function (c) { return c.recent; }).map(function (c, i) {
                    var isActive = toPhone === c.phone.replace('+233 ', '');
                    return (
                      <button key={i} onClick={function () { setToPhone(c.phone.replace('+233 ', '')); setToName(c.name); }} className="flex flex-col items-center gap-2 tap flex-shrink-0">
                        <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: isActive ? T.ok + '15' : T.fill, border: '1.5px solid ' + (isActive ? T.ok : T.border), transition: 'all .2s' }}>{c.emoji}</div>
                        <span className="truncate text-center" style={{ fontSize: 10, fontWeight: 600, width: 52, fontFamily: ff, color: isActive ? T.okDark : T.text }}>{c.name.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div style={{ borderRadius: 14, background: T.fill, overflow: 'hidden', marginBottom: 10, border: '1.5px solid ' + (phoneValid ? T.ok + '44' : T.border), transition: 'border .25s' }}>
              <div className="flex items-center gap-3" style={{ padding: '11px 14px' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.sec, fontFamily: ff }}>{'\u{1F1EC}\u{1F1ED}'} +233</span>
                <input type="tel" value={toPhone} onChange={function (e) { setToPhone(e.target.value); setToName(''); }} placeholder="24 000 0000" className="flex-1" style={{ background: 'transparent', fontWeight: 600, fontSize: 18, fontFamily: ff }} autoFocus />
                {toPhone && <button onClick={function () { setToPhone(''); setToName(''); }} className="tap" style={{ width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.border }}><X style={{ width: 11, height: 11, color: T.sec }} /></button>}
              </div>
            </div>
            {recipient ? (
              <div className="fu" style={{ borderRadius: 14, padding: '12px 14px', background: T.okBg, marginBottom: 10, border: '1px solid ' + T.ok + '30' }}>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 22 }}>{recipient.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 13, fontWeight: 800, color: T.okDark, fontFamily: ff }}>{recipient.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: T.ok, color: '#fff', fontFamily: ff }}>REGISTERED</span>
                    </div>
                    <div className="flex items-center gap-1.5" style={{ marginTop: 3 }}>
                      <MapPin style={{ width: 11, height: 11, color: T.okDark }} />
                      <span style={{ fontSize: 12, color: T.okDark, fontFamily: ff }}>{recipient.locker} · <span style={{ fontFamily: mf, fontWeight: 600 }}>{recipient.lockerCode}</span></span>
                    </div>
                  </div>
                  <Check style={{ width: 16, height: 16, color: T.ok, flexShrink: 0 }} />
                </div>
              </div>
            ) : toName ? (
              <div className="flex items-center gap-2 fi" style={{ borderRadius: 10, padding: '8px 12px', background: T.okBg, marginBottom: 10, border: '1px solid ' + T.ok + '22' }}><div style={{ width: 16, height: 16, borderRadius: 8, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 3 }} /></div><span style={{ fontSize: 13, fontWeight: 600, color: T.okDark, fontFamily: ff }}>{toName}</span></div>
            ) : null}
            <button onClick={function () { setShowContacts(!showContacts); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderRadius: 14, background: '#fff', border: '1.5px solid ' + T.border }}>
              <Users style={{ width: 15, height: 15, color: T.sec }} /><span className="flex-1 text-left" style={{ fontWeight: 600, fontSize: 13, fontFamily: ff }}>Choose from contacts</span>
              <ChevronDown style={{ width: 14, height: 14, color: T.muted, transform: showContacts ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {showContacts && (
              <div style={{ borderRadius: 14, overflow: 'hidden', marginTop: 6, background: '#fff', border: '1.5px solid ' + T.border, animation: 'fadeUp .2s cubic-bezier(.2,.9,.3,1)' }}>
                <div style={{ padding: 8 }}><input value={searchQ} onChange={function (e) { setSearchQ(e.target.value); }} placeholder="Search..." style={{ width: '100%', background: T.fill, borderRadius: 10, padding: '9px 12px', fontSize: 13, fontFamily: ff, border: '1px solid ' + T.border }} /></div>
                <div className="noscroll" style={{ maxHeight: 200, overflowY: 'auto' }}>
                  {filteredContacts.length === 0 ? <div style={{ padding: '20px 0', textAlign: 'center' }}><p style={{ fontSize: 13, color: T.sec, fontFamily: ff }}>No contacts found</p></div> :
                    filteredContacts.map(function (c, i) {
                      return (
                        <button key={i} onClick={function () { setToPhone(c.phone.replace('+233 ', '')); setToName(c.name); setShowContacts(false); setSearchQ(''); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#fff', borderBottom: i < filteredContacts.length - 1 ? '1px solid ' + T.fill : 'none' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: T.fill, border: '1px solid ' + T.border }}>{c.emoji}</div>
                          <div className="flex-1 text-left"><p style={{ fontWeight: 600, fontSize: 13, fontFamily: ff }}>{c.name}</p><p style={{ fontSize: 11, color: T.sec, fontFamily: mf }}>{c.phone}</p></div>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {st === 2 && (
          <div className="fu">
            <p style={{ fontSize: 14, fontWeight: 500, color: T.sec, marginBottom: 14, fontFamily: ff }}>What size package?</p>
            {szs.map(function (s) {
              var sel = sz === s.id;
              return (
                <button key={s.id} onClick={function () { sSz(s.id); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: sel ? T.text : '#fff', color: sel ? '#fff' : T.text, transition: 'all .2s', marginBottom: 8, border: sel ? 'none' : '1.5px solid ' + T.border, boxShadow: sel ? '0 4px 14px rgba(0,0,0,0.15)' : T.shadow }}>
                  <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: sel ? 'rgba(255,255,255,0.12)' : T.fill }}>{s.e}</div>
                  <div className="flex-1 text-left"><p style={{ fontWeight: 700, fontSize: 14, fontFamily: ff }}>{s.l}</p><p style={{ fontSize: 12, opacity: 0.5, fontFamily: ff }}>{s.d}</p></div>
                </button>
              );
            })}
            <PhotoUpload photos={packagePhotos} onPhotosChange={setPackagePhotos} maxPhotos={3} />
          </div>
        )}

        {st === 3 && (
          <div className="fu">
            <p style={{ fontSize: 14, fontWeight: 500, color: T.sec, marginBottom: 4, fontFamily: ff }}>Where should the recipient pick up?</p>
            <p style={{ fontSize: 12, color: T.muted, fontFamily: ff, marginBottom: 14 }}>The pickup locker determines the delivery route and price.</p>

            {recipient ? (
              /* Registered user — pickup locker auto-set from their profile */
              <>
                <div className="flex items-center gap-2.5" style={{ borderRadius: 12, padding: '10px 12px', background: T.okBg, marginBottom: 14, border: '1px solid ' + T.ok + '28' }}>
                  <MapPin style={{ width: 13, height: 13, flexShrink: 0, color: T.okDark }} />
                  <p style={{ fontSize: 12, color: T.okDark, fontFamily: ff }}>
                    Pickup locker auto-set from <span style={{ fontWeight: 700 }}>{recipient.name}</span>'s registered address.
                  </p>
                </div>
                <div className="flex items-center gap-3" style={{ padding: '14px 16px', borderRadius: 16, background: T.okBg, border: '1.5px solid ' + T.ok + '33' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: '#fff', border: '1px solid ' + T.ok + '22', flexShrink: 0 }}>🏪</div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontWeight: 700, fontSize: 15, fontFamily: ff, color: T.okDark }}>{recipient.locker}</p>
                    <p style={{ fontSize: 11, fontFamily: mf, fontWeight: 600, color: T.okDark, opacity: 0.7, marginTop: 2 }}>{recipient.lockerCode}</p>
                  </div>
                  <Lock style={{ width: 14, height: 14, color: T.okDark, flexShrink: 0 }} />
                </div>
              </>
            ) : (
              /* Unregistered — manual selection */
              <>
                <div className="flex items-center gap-2.5" style={{ borderRadius: 12, padding: '10px 12px', background: T.warnBg, marginBottom: 14, border: '1px solid ' + T.warn + '22' }}>
                  <Info style={{ width: 13, height: 13, flexShrink: 0, color: T.warn }} />
                  <p style={{ fontSize: 12, color: T.warn, fontFamily: ff }}>Recipient is not registered. Select which locker they will collect from.</p>
                </div>
                {lks.map(function (l, i) {
                  var sel = pickupLk === l.n;
                  return (
                    <button key={i} onClick={function () { setPickupLk(l.n); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: sel ? T.accent : '#fff', color: sel ? '#fff' : T.text, transition: 'all .2s', marginBottom: 8, border: sel ? 'none' : '1.5px solid ' + T.border, boxShadow: sel ? '0 4px 14px ' + T.accent + '33' : T.shadow }}>
                      <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: sel ? 'rgba(255,255,255,0.12)' : T.fill }}>{l.e}</div>
                      <div className="flex-1 text-left"><p style={{ fontWeight: 700, fontSize: 14, fontFamily: ff }}>{l.n}</p><p style={{ fontSize: 12, opacity: 0.5, fontFamily: ff }}>{l.d + ' · ' + l.t}</p></div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 8px', borderRadius: 8, background: sel ? 'rgba(255,255,255,0.15)' : T.okBg, color: sel ? '#fff' : T.okDark, fontFamily: ff }}>{l.a + ' free'}</span>
                    </button>
                  );
                })}
              </>
            )}

            {/* Delivery scheduling */}
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>WHEN TO SEND</p>
              <div className="flex gap-2" style={{ marginBottom: scheduleMode === 'later' ? 10 : 0 }}>
                <button onClick={function () { setScheduleMode('now'); }} className="tap flex-1" style={{ padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 13, background: scheduleMode === 'now' ? T.text : '#fff', color: scheduleMode === 'now' ? '#fff' : T.text, fontFamily: ff, border: scheduleMode === 'now' ? 'none' : '1.5px solid ' + T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: scheduleMode === 'now' ? '0 4px 12px rgba(0,0,0,0.12)' : T.shadow }}><Zap style={{ width: 14, height: 14 }} />Now</button>
                <button onClick={function () { setScheduleMode('later'); }} className="tap flex-1" style={{ padding: '12px 0', borderRadius: 12, fontWeight: 700, fontSize: 13, background: scheduleMode === 'later' ? T.text : '#fff', color: scheduleMode === 'later' ? '#fff' : T.text, fontFamily: ff, border: scheduleMode === 'later' ? 'none' : '1.5px solid ' + T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: scheduleMode === 'later' ? '0 4px 12px rgba(0,0,0,0.12)' : T.shadow }}><Clock style={{ width: 14, height: 14 }} />Schedule</button>
              </div>
              {scheduleMode === 'later' && (
                <div style={{ borderRadius: 14, padding: 14, background: T.fill, border: '1.5px solid ' + T.border, animation: 'fadeUp .2s cubic-bezier(.2,.9,.3,1)' }}>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', marginBottom: 6, fontFamily: ff }}>DATE</p>
                      <input type="date" value={schedDate} onChange={function (e) { setSchedDate(e.target.value); }} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontWeight: 600, fontSize: 13, fontFamily: ff, background: '#fff', border: '1.5px solid ' + T.border }} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', marginBottom: 6, fontFamily: ff }}>TIME</p>
                      <input type="time" value={schedTime} onChange={function (e) { setSchedTime(e.target.value); }} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, fontWeight: 600, fontSize: 13, fontFamily: ff, background: '#fff', border: '1.5px solid ' + T.border }} />
                    </div>
                  </div>
                  {schedDate && <div className="flex items-center gap-2 fi" style={{ marginTop: 8 }}><Clock style={{ width: 12, height: 12, color: T.blue }} /><p style={{ fontSize: 11, color: T.blue, fontFamily: ff }}>Drop-off code will activate on {schedDate}{schedTime ? ' at ' + schedTime : ''}</p></div>}
                </div>
              )}
            </div>

            {/* Request payment before pickup */}
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>COLLECT PAYMENT</p>
              <button onClick={function () { setReqPayment(!reqPayment); if (reqPayment) setReqAmount(''); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, background: reqPayment ? T.okBg : '#fff', border: '1.5px solid ' + (reqPayment ? T.ok + '33' : T.border), transition: 'all .2s' }}>
                <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: reqPayment ? '#fff' : T.fill }}>{'\u{1F4B8}'}</div>
                <div className="flex-1 text-left">
                  <p style={{ fontWeight: 700, fontSize: 14, fontFamily: ff }}>Request payment before pickup</p>
                  <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2 }}>Recipient pays you before they can collect</p>
                </div>
                <div style={{ width: 46, height: 26, borderRadius: 13, padding: 2, background: reqPayment ? T.ok : T.border, transition: 'background .2s', flexShrink: 0 }}><div style={{ width: 22, height: 22, borderRadius: 11, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', marginLeft: reqPayment ? 20 : 0, transition: 'margin .2s' }} /></div>
              </button>
              {reqPayment && (
                <div style={{ marginTop: 10, borderRadius: 14, padding: 14, background: T.fill, border: '1.5px solid ' + T.border, animation: 'fadeUp .2s cubic-bezier(.2,.9,.3,1)' }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', marginBottom: 8, fontFamily: ff }}>AMOUNT TO COLLECT</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1" style={{ borderRadius: 12, overflow: 'hidden', border: '1.5px solid ' + (reqAmount && parseFloat(reqAmount) > 0 ? T.ok + '44' : T.border), background: '#fff', transition: 'border .25s' }}>
                      <div className="flex items-center gap-2" style={{ padding: '12px 14px' }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: T.sec, fontFamily: ff }}>GH{'\u20B5'}</span>
                        <input type="number" value={reqAmount} onChange={function (e) { setReqAmount(e.target.value); }} placeholder="0.00" style={{ flex: 1, background: 'transparent', fontWeight: 800, fontSize: 22, fontFamily: mf, letterSpacing: '-0.02em' }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ marginTop: 8 }}>
                    {[5, 10, 20, 50].map(function (a) {
                      return <button key={a} onClick={function () { setReqAmount(a + ''); }} className="tap" style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontWeight: 700, fontSize: 12, background: reqAmount === a + '' ? T.ok : '#fff', color: reqAmount === a + '' ? '#fff' : T.text, fontFamily: ff, border: reqAmount === a + '' ? 'none' : '1px solid ' + T.border, transition: 'all .15s' }}>{'GH\u20B5' + a}</button>;
                    })}
                  </div>
                  <div className="flex items-start gap-2" style={{ marginTop: 10, padding: '8px 10px', borderRadius: 10, background: T.warnBg, border: '1px solid ' + T.warn + '22' }}>
                    <Info style={{ width: 12, height: 12, color: T.warn, flexShrink: 0, marginTop: 2 }} />
                    <p style={{ fontSize: 11, color: T.warn, fontFamily: ff, lineHeight: '1.5' }}>Recipient must pay GH{'\u20B5'}{reqAmount || '0'} via MoMo or card before the locker code is released. Funds go to your wallet.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {st === 4 && (
          <div className="fu">
            {/* Success banner */}
            <div style={{ borderRadius: 22, padding: 24, background: 'linear-gradient(135deg, ' + T.okBg + ' 0%, #D1FAE5 100%)', border: '1.5px solid ' + T.ok + '22', marginBottom: 16, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -15, width: 80, height: 80, borderRadius: '50%', background: T.ok + '08' }} />
              <div className="pop" style={{ fontSize: 44, marginBottom: 10 }}>{'\u{1F389}'}</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', fontFamily: ff, marginBottom: 6 }}>Package Confirmed!</h2>
              <p style={{ fontSize: 13, color: T.okDark, fontFamily: ff }}>Drop off at any LocQar locker near you</p>
            </div>

            {/* Payment request notice */}
            {reqPayment && reqAmount && (
              <div style={{ borderRadius: 18, padding: 16, background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', border: '1.5px solid ' + T.warn + '22', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -15, right: -10, width: 50, height: 50, borderRadius: '50%', background: T.warn + '08' }} />
                <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: '#fff', boxShadow: '0 2px 6px ' + T.warn + '15' }}>{'\u{1F4B8}'}</div>
                  <div>
                    <p style={{ fontWeight: 800, fontSize: 14, fontFamily: ff, color: T.text }}>Payment Required</p>
                    <p style={{ fontSize: 11, color: T.warn, fontFamily: ff }}>Before recipient can pick up</p>
                  </div>
                </div>
                <div style={{ borderRadius: 12, padding: '12px 14px', background: '#fff', border: '1px solid ' + T.warn + '22' }}>
                  <div className="flex items-center justify-between">
                    <span style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>Amount to collect</span>
                    <span style={{ fontSize: 20, fontWeight: 800, fontFamily: mf, color: T.text }}>GH{'\u20B5'}{reqAmount}</span>
                  </div>
                  <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, marginTop: 6 }}>Recipient ({toName || '+233 ' + toPhone}) will receive an SMS to pay before the locker code is released.</p>
                </div>
              </div>
            )}

            {/* Drop-off code */}
            <div style={{ borderRadius: 20, padding: 16, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}><Shield style={{ width: 13, height: 13, color: T.accent }} /><p style={{ fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: '0.06em', fontFamily: ff }}>DROP-OFF CODE</p></div>
              <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
                <div className="flex-1" style={{ borderRadius: 14, padding: '14px 16px', fontSize: 26, fontWeight: 800, letterSpacing: '0.15em', background: T.fill, textAlign: 'center', fontFamily: mf, border: '1.5px solid ' + T.border }}>{dropCode}</div>
                <button onClick={function () { if (navigator.clipboard) navigator.clipboard.writeText(dropCode); setCodeCopied(true); setTimeout(function () { setCodeCopied(false); }, 2000); }} className="tap" style={{ width: 50, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: codeCopied ? T.okBg : T.fill, border: '1px solid ' + (codeCopied ? T.ok + '33' : T.border), transition: 'all .2s' }}>{codeCopied ? <Check style={{ width: 18, height: 18, color: T.ok }} /> : <Copy style={{ width: 18, height: 18, color: T.sec }} />}</button>
              </div>
              <button onClick={function () { setShowDropQR(!showDropQR); }} className="tap flex items-center justify-between w-full" style={{ borderRadius: 12, padding: '10px 12px', background: T.fill, border: '1px solid ' + T.border }}>
                <div className="flex items-center gap-2"><Zap style={{ width: 13, height: 13, color: T.accent }} /><span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: ff }}>Locker QR Code</span></div>
                <ChevronDown style={{ width: 14, height: 14, color: T.muted, transform: showDropQR ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
              </button>
              {showDropQR && (
                <div className="fu flex flex-col items-center" style={{ paddingTop: 14 }}>
                  <QRCode data={dropCode} size={160} radius={18} padding={16} />
                  <p style={{ fontSize: 11, color: T.sec, marginTop: 10, fontFamily: ff, textAlign: 'center' }}>Scan at any LocQar locker to drop off</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{ borderRadius: 20, padding: 16, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
              <h3 style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, fontFamily: ff, letterSpacing: '-0.01em' }}>Delivery Summary</h3>
              {[
                { icon: '\u{1F9D1}', label: 'Recipient', value: toName || ('+233 ' + toPhone), mono: !toName },
                { icon: '\u{1F4CD}', label: 'Pickup Locker', value: effectivePickupLk + (recipient ? ' (auto)' : '') },
                { icon: '\u{1F4E6}', label: 'Size', value: (szs.find(function (s) { return s.id === sz; }) || {}).l || '' },
                scheduleMode === 'later' && schedDate ? { icon: '\u{1F4C5}', label: 'Scheduled', value: schedDate + (schedTime ? ' at ' + schedTime : '') } : null,
                reqPayment && reqAmount ? { icon: '\u{1F4B8}', label: 'Collect on Pickup', value: 'GH\u20B5' + reqAmount, mono: true } : null,
                { icon: '\u{1F4B0}', label: 'Total', value: 'GH\u20B515', mono: true }
              ].filter(Boolean).map(function (r, i) {
                return <div key={i} className="flex items-center gap-3" style={{ borderRadius: 12, padding: '10px 12px', background: T.fill, marginBottom: 6 }}><span style={{ fontSize: 14 }}>{r.icon}</span><div className="flex-1"><p style={{ fontSize: 10, color: T.sec, fontFamily: ff, letterSpacing: '0.04em' }}>{r.label.toUpperCase()}</p><p style={{ fontWeight: 600, fontSize: 13, fontFamily: r.mono ? mf : ff }}>{r.value}</p></div></div>;
              })}
            </div>

            {/* Instructions */}
            <div style={{ borderRadius: 20, padding: 16, background: T.blueBg, border: '1px solid ' + T.blue + '22', marginBottom: 12 }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Info style={{ width: 13, height: 13, color: T.blue }} /><p style={{ fontSize: 10, fontWeight: 700, color: T.blue, letterSpacing: '0.06em', fontFamily: ff }}>HOW TO DROP OFF</p></div>
              {[
                { n: '1', t: 'Go to any LocQar locker near you' },
                { n: '2', t: 'Scan the QR code or enter the code above' },
                { n: '3', t: 'Place your package inside & close the door' },
                { n: '4', t: 'Recipient will be notified via SMS to collect at ' + (effectivePickupLk || 'their locker') }
              ].map(function (s, i) {
                return (
                  <div key={i} className="flex items-start gap-3" style={{ marginBottom: i < 3 ? 8 : 0 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, background: T.blue, color: '#fff', flexShrink: 0, marginTop: 1, fontFamily: ff }}>{s.n}</div>
                    <p style={{ fontSize: 13, color: T.blue, fontFamily: ff, lineHeight: '1.5' }}>{s.t}</p>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button onClick={function () { props.onBack(); }} className="tap flex-1" style={{ padding: '14px 0', borderRadius: 16, fontWeight: 700, fontSize: 14, background: T.gradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: ff, boxShadow: T.shadowMd }}><Navigation style={{ width: 16, height: 16 }} />Find a Locker</button>
              <button onClick={function () { props.onBack(); }} className="tap" style={{ padding: '14px 22px', borderRadius: 16, fontWeight: 700, fontSize: 14, background: '#fff', color: T.text, fontFamily: ff, border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>Done</button>
            </div>
          </div>
        )}
      </div>
      {st < 4 && <div className="glass fixed bottom-0 left-0 right-0" style={{ padding: 16, borderTop: '1px solid ' + T.border }}>
        {st === 3 && canContinue ? (
          <div>
            <div className="flex items-center justify-between" style={{ marginBottom: 12, padding: '10px 14px', background: T.fill, borderRadius: 12 }}>
              <span style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>To <span style={{ fontWeight: 700, color: T.text, fontFamily: mf }}>{'+233 ' + toPhone}</span></span>
              <span style={{ fontWeight: 800, fontSize: 20, fontFamily: mf, letterSpacing: '-0.02em' }}>GH&#x20B5;15</span>
            </div>
            <button onClick={goToPayment} className="tap" style={{ width: '100%', padding: '14px 0', borderRadius: 16, fontWeight: 700, fontSize: 15, color: '#fff', background: T.gradientAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: ff, boxShadow: '0 6px 20px rgba(225,29,72,0.25)' }}>Confirm & Pay<ArrowRight style={{ width: 16, height: 16 }} /></button>
          </div>
        ) : (
          <button onClick={function () { if (canContinue) sS(st + 1); }} className="tap" style={{ width: '100%', padding: '14px 0', borderRadius: 16, fontWeight: 700, fontSize: 15, background: canContinue ? T.text : T.fill, color: canContinue ? '#fff' : T.muted, transition: 'all .3s cubic-bezier(.2,.9,.3,1)', fontFamily: ff, boxShadow: canContinue ? '0 6px 20px rgba(0,0,0,0.15)' : 'none', border: canContinue ? 'none' : '1.5px solid ' + T.border }}>Continue</button>
        )}
      </div>}
    </div>
  );
}
