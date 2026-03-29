import React, { useState, useEffect, useRef, useCallback } from "react";
import { T, ff, hf, mf } from "../theme/themes";
import { initLockers } from "../data/mockData";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import Divider from "../components/Divider";
import SectionHeader from "../components/SectionHeader";
import { usePullRefresh, PullIndicator } from "../components/PullRefresh";
import { SkeletonList } from "../components/Skeleton";
import QRCode from "../utils/qrcode";
import NotificationPrompt from "../components/NotificationPrompt";
import { NotificationManager } from "../utils/notifications";
import { ArrowRight, Bell, MapPin, ChevronDown, Search, X, Check, Copy, Zap, ChevronRight } from "../components/Icons";

export default function Home(props) {
  var [copiedAddr, setCopiedAddr] = useState(false);
  var [showAddrQR, setShowAddrQR] = useState(false);
  var [editAddr, setEditAddr] = useState(false);
  var selLocker = props.prefLocker || 0;
  var setSelLocker = props.onPrefLockerChange || function () { };
  var [lockerSearch, setLockerSearch] = useState('');
  var [scrollY, setScrollY] = useState(0);
  var scrollRef = useRef(null);
  var addrMap = [
    { locker: 'Osu Mall', street: '+233-55-208-2521', city: 'Osu', state: 'Accra', zip: 'ACC-LQ203' },
    { locker: 'Accra Mall', street: '+233-55-208-2521', city: 'Tetteh Quarshie', state: 'Accra', zip: 'ACC-LQ410' },
    { locker: 'Shell Airport', street: '+233-55-208-2521', city: 'Airport Residential', state: 'Accra', zip: 'ACC-LQ305' },
    { locker: 'Junction Mall', street: '+233-55-208-2521', city: 'Nungua', state: 'Accra', zip: 'ACC-LQ518' },
    { locker: 'Circle Hub', street: '+233-55-208-2521', city: 'Kwame Nkrumah Circle', state: 'Accra', zip: 'ACC-LQ127' },
    { locker: 'West Hills Mall', street: '+233-55-208-2521', city: 'Weija', state: 'Accra', zip: 'ACC-LQ602' }
  ];
  var curAddr = addrMap[selLocker];
  var ptr = usePullRefresh(function () { });
  var gr = function () { var h = new Date().getHours(); return h < 5 ? 'Late night' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 21 ? 'Good evening' : 'Good night'; };
  var grEmoji = function () { var h = new Date().getHours(); return h < 5 ? '\u{1F319}' : h < 12 ? '\u{2600}\u{FE0F}' : h < 17 ? '\u{1F324}\u{FE0F}' : h < 21 ? '\u{1F305}' : '\u{1F303}'; };
  var handleCopy = function () { var txt = curAddr.street + ', ' + curAddr.city + ', ' + curAddr.state + ' ' + curAddr.zip; if (navigator.clipboard) navigator.clipboard.writeText(txt); setCopiedAddr(true); setTimeout(function () { setCopiedAddr(false); }, 2000); };
  var activePkgs = props.pkgs.filter(function (p) { return p.status !== 'Delivered'; });
  var nav = props.onNav;
  var [homeLoading, setHomeLoading] = useState(true);
  var [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(function () { var t = setTimeout(function () { setHomeLoading(false); }, 450); return function () { clearTimeout(t); }; }, []);

  // Show notification prompt after initial load
  useEffect(function () {
    var t = setTimeout(function () {
      if (NotificationManager.isSupported() &&
          !NotificationManager.isEnabled() &&
          !NotificationManager.hasUserDismissedPrompt()) {
        setShowNotificationPrompt(true);
      }
    }, 2000); // Delay 2 seconds after page load
    return function () { clearTimeout(t); };
  }, []);

  var handleScroll = useCallback(function (e) { setScrollY(e.target.scrollTop); }, []);

  return (
    <div className="pb-24 min-h-screen overflow-y-auto noscroll" style={{ background: T.bg }} ref={ptr.containerRef} onScroll={handleScroll} onTouchStart={ptr.onTouchStart} onTouchMove={ptr.onTouchMove} onTouchEnd={ptr.onTouchEnd}>
      <StatusBar />
      <PullIndicator pullY={ptr.pullY} refreshing={ptr.refreshing} />
      <Toast show={copiedAddr} emoji={'\u{1F4CB}'} text="Address copied!" />
      {showNotificationPrompt && (
        <NotificationPrompt
          onClose={function () { setShowNotificationPrompt(false); }}
          onComplete={function () { setShowNotificationPrompt(false); }}
        />
      )}

      <div className="fu" style={{ padding: '8px 20px 20px', transform: 'translateY(' + Math.min(scrollY * -0.15, 0) + 'px)', opacity: Math.max(1 - scrollY / 200, 0.7), transition: 'opacity .1s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.sec, fontFamily: ff, letterSpacing: '0.02em', textTransform: 'uppercase' }}>{grEmoji()} {gr()}</p>
            <h1 style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: ff, marginTop: 4, color: T.text, lineHeight: 1 }}>{props.user.name.split(' ')[0]}{'\u{1F44B}'}</h1>
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={function () { nav('notifs'); }} className="tap" style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.card, border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
              <Bell width={22} height={22} style={{ color: T.text }} />
            </button>
            <span className="glow" style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, background: T.accent, color: '#fff', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2.5px solid ' + T.bg, boxShadow: '0 4px 12px rgba(225,29,72,0.4)', pointerEvents: 'none' }}>3</span>
          </div>
        </div>
        <div className="flex gap-3" style={{ marginTop: 24 }}>
          {[{ e: '\u{1F4E6}', v: activePkgs.length, l: 'Active', s: 'activity', c: T.blue }, { e: '\u{1F4B0}', v: '245', l: 'Wallet', s: 'wallet', c: T.ok, prefix: 'GH\u20B5' }, { e: '\u{2B50}', v: '750', l: 'Points', s: 'rewards', c: T.purple }].map(function (st, si) {
            return (
              <button key={si} onClick={function () { nav(st.s); }} className="tap flex-1" style={{ borderRadius: 18, padding: '14px 12px', background: T.card, border: '1.5px solid ' + T.border, textAlign: 'center', boxShadow: T.shadow }}>
                <p style={{ fontSize: 18, fontWeight: 900, fontFamily: mf, color: T.text, letterSpacing: '-0.04em' }}>{st.prefix}{st.v}</p>
                <div className="flex items-center justify-center gap-1.5" style={{ marginTop: 4 }}>
                  <span style={{ fontSize: 12 }}>{st.e}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: T.sec, fontFamily: ff, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{st.l}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fu d1" style={{ padding: '0 20px 20px' }}>
        <button onClick={function () { nav('send'); }} className="tap" style={{ width: '100%', borderRadius: 28, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16, background: T.gradient, boxShadow: T.shadowLg, position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '70px', background: 'rgba(255,255,255,0.06)', filter: 'blur(20px)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: 20, width: 100, height: 100, borderRadius: '50px', background: 'rgba(225,29,72,0.1)', filter: 'blur(30px)' }} />
          <div style={{ width: 56, height: 56, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', position: 'relative', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2)' }}>{'\u{1F4E4}'}</div>
          <div className="flex-1 text-left" style={{ position: 'relative' }}>
            <p style={{ color: '#fff', fontWeight: 900, fontSize: 18, fontFamily: ff, letterSpacing: '-0.02em' }}>Send Package</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontFamily: ff, marginTop: 4, fontWeight: 500 }}>Drop off at any locker</p>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.15)', position: 'relative' }}><ArrowRight style={{ width: 20, height: 20, color: '#fff', strokeWidth: 3 }} /></div>
        </button>
      </div>

      <Divider />

      {activePkgs.length > 0 && (
        <div>
          <SectionHeader title="Active Activities" action="See all" onAction={function () { nav('activity'); }} />
          <div style={{ padding: '0 20px 16px' }}>
            {homeLoading ? <SkeletonList count={2} /> : activePkgs.slice(0, 2).map(function (p, i) {
              var isReady = p.status === 'Ready';
              return (
                <button key={p.id} onClick={function () { nav('pkg-detail', p); }} className={'w-full text-left tap fu d' + (i + 2)} style={{ borderRadius: 24, padding: 18, background: T.card, marginBottom: 12, border: '1.5px solid ' + (isReady ? T.ok + '40' : T.border), boxShadow: isReady ? '0 8px 24px rgba(16,185,129,0.12)' : T.shadow, transition: 'all .3s' }}>
                  <div className="flex items-center gap-4">
                    <div style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: isReady ? T.okBg : T.fill, border: '1px solid ' + (isReady ? T.ok + '20' : T.border) }}>{isReady ? '\u2705' : '\u{1F69A}'}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                        <h3 className="truncate" style={{ fontWeight: 800, fontSize: 15, fontFamily: ff, letterSpacing: '-0.01em', color: T.text }}>{p.name}</h3>
                        <span className="flex-shrink-0 flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 20, marginLeft: 8, background: isReady ? T.okBg : T.fill, color: isReady ? T.okDark : T.sec, fontFamily: ff, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{isReady && <span className="breathe" style={{ width: 6, height: 6, borderRadius: 3, background: T.ok, display: 'inline-block' }} />}{p.status}</span>
                      </div>
                      <p className="truncate" style={{ fontSize: 12, color: T.sec, fontFamily: mf, letterSpacing: '0.02em', fontWeight: 600 }}>{'-> ' + p.toPhone}</p>
                      <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: T.fill, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 3, width: isReady ? '100%' : '55%', background: isReady ? T.gradientSuccess : T.gradientAccent, transition: 'width 1s cubic-bezier(0.32, 0.72, 0, 1)' }} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <Divider />
        </div>
      )}

      <SectionHeader title="Your Mailing Address" />
      <div style={{ padding: '0 20px 20px' }}>
        <div className="fu d3" style={{ borderRadius: 24, padding: 20, background: T.card, border: '1.5px solid ' + T.border, boxShadow: T.shadowLg }}>
          <button onClick={function () { setEditAddr(!editAddr); }} className="tap flex items-center gap-3 w-full" style={{ borderRadius: 16, padding: '12px 14px', background: editAddr ? T.text : T.fill, border: '1.5px solid ' + (editAddr ? T.text : T.border), marginBottom: 16, transition: 'all .3s cubic-bezier(0.32, 0.72, 0, 1)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: editAddr ? 'rgba(255,255,255,0.1)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + (editAddr ? 'rgba(255,255,255,0.1)' : T.border) }}>
              <MapPin style={{ width: 16, height: 16, color: editAddr ? '#fff' : T.accent }} />
            </div>
            <div className="flex-1 text-left">
              <p style={{ fontSize: 10, fontWeight: 800, color: editAddr ? 'rgba(255,255,255,0.6)' : T.muted, letterSpacing: '0.06em', fontFamily: ff, textTransform: 'uppercase' }}>Preferred Locker</p>
              <p style={{ fontSize: 14, fontWeight: 800, color: editAddr ? '#fff' : T.text, fontFamily: ff, marginTop: 1 }}>{curAddr.locker}</p>
            </div>
            <ChevronDown style={{ width: 16, height: 16, color: editAddr ? 'rgba(255,255,255,0.6)' : T.muted, transform: editAddr ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
          </button>
          {editAddr && (
            <div className="fu" style={{ marginBottom: 12, borderRadius: 14, border: '1.5px solid ' + T.border, overflow: 'hidden' }}>
              <div style={{ padding: 8, borderBottom: '1px solid ' + T.fill }}>
                <div className="flex items-center gap-2.5" style={{ borderRadius: 10, padding: '8px 12px', background: T.fill, border: '1px solid ' + T.border }}>
                  <Search style={{ width: 14, height: 14, color: T.muted, flexShrink: 0 }} />
                  <input type="text" value={lockerSearch} onChange={function (e) { setLockerSearch(e.target.value); }} placeholder="Search lockers..." className="flex-1" autoFocus style={{ background: 'transparent', fontSize: 13, fontWeight: 500, fontFamily: ff }} />
                  {lockerSearch && <button onClick={function () { setLockerSearch(''); }} className="tap" style={{ width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.border }}><X style={{ width: 9, height: 9, color: T.sec }} /></button>}
                </div>
              </div>
              <div className="noscroll" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {(lockerSearch ? addrMap.filter(function (a) { var q = lockerSearch.toLowerCase(); return a.locker.toLowerCase().indexOf(q) >= 0 || a.city.toLowerCase().indexOf(q) >= 0 || a.zip.toLowerCase().indexOf(q) >= 0; }) : addrMap).map(function (a, i) {
                  var origIdx = addrMap.indexOf(a);
                  var sel = selLocker === origIdx;
                  var lk = initLockers[origIdx];
                  return (
                    <button key={origIdx} onClick={function () { setSelLocker(origIdx); setEditAddr(false); setLockerSearch(''); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', background: sel ? T.fill : '#fff', borderBottom: i < addrMap.length - 1 ? '1px solid ' + T.fill : 'none' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: sel ? T.okBg : T.fill, border: '1px solid ' + (sel ? T.ok + '33' : T.border) }}>{lk ? lk.emoji : '\u{1F4E6}'}</div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="truncate" style={{ fontWeight: 700, fontSize: 13, fontFamily: ff }}>{a.locker}</p>
                        <p className="truncate" style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>{a.city} \u00B7 {a.zip}</p>
                      </div>
                      {sel && <div style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 3 }} /></div>}
                      {!sel && lk && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6, background: T.okBg, color: T.okDark, fontFamily: ff, flexShrink: 0 }}>{lk.dist} km</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 12, background: T.fill, borderRadius: 14, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 6, borderBottom: '1px solid ' + T.border + '80', marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', fontFamily: ff, width: 60, flexShrink: 0 }}>STREET</span>
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: mf, letterSpacing: '0.02em', flex: 1 }}>{curAddr.street}</span>
              <button onClick={handleCopy} className="tap" style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: copiedAddr ? T.okBg : '#fff', border: '1px solid ' + (copiedAddr ? T.ok + '33' : T.border), transition: 'all .2s', flexShrink: 0 }}>
                {copiedAddr ? <Check style={{ width: 13, height: 13, color: T.ok }} /> : <Copy style={{ width: 13, height: 13, color: T.sec }} />}
              </button>
            </div>
            {[{ label: 'CITY', value: curAddr.city, mono: false }, { label: 'STATE', value: curAddr.state, mono: false }, { label: 'ZIP CODE', value: curAddr.zip, mono: true }].map(function (f, i) {
              return (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '3px 0' }}><span style={{ fontSize: 9, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', fontFamily: ff, width: 60, flexShrink: 0 }}>{f.label}</span><span style={{ fontSize: 14, fontWeight: 700, fontFamily: f.mono ? mf : ff, letterSpacing: f.mono ? '0.02em' : '-0.01em' }}>{f.value}</span></div>);
            })}
          </div>
          <div style={{ borderTop: '1px solid ' + T.border, paddingTop: 14 }}>
            <button onClick={function () { setShowAddrQR(!showAddrQR); }} className="tap flex items-center justify-between w-full" style={{ marginBottom: showAddrQR ? 14 : 0 }}>
              <div className="flex items-center gap-2"><Zap style={{ width: 13, height: 13, color: T.accent }} /><span style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: ff }}>Share via QR Code</span></div>
              <ChevronDown style={{ width: 14, height: 14, color: T.muted, transform: showAddrQR ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {showAddrQR && (
              <div className="fu flex flex-col items-center" style={{ padding: '4px 0' }}>
                <QRCode data={curAddr.street + '-' + curAddr.city + '-' + curAddr.state + '-' + curAddr.zip} size={140} radius={18} padding={14} />
                <p style={{ fontSize: 11, color: T.sec, marginTop: 10, fontFamily: ff, textAlign: 'center' }}>Scan to send a package to this address</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Divider />

      <SectionHeader title="Services" />
      <div style={{ padding: '0 20px 20px' }}>
        <div className="flex gap-2.5 overflow-x-auto noscroll">
          {[{ e: '\u{1F4E4}', l: 'Send', s: 'send', bg: T.accentBg, c: T.accent }, { e: '\u{1F4E5}', l: 'Receive', s: 'receive', bg: T.okBg, c: T.okDark }, { e: '\u{1F4F2}', l: 'Call', s: 'call-pkg', bg: T.purpleBg, c: T.purple }, { e: '\u{1F5C4}\u{FE0F}', l: 'Storage', s: 'storage', bg: T.warnBg, c: T.warn }].map(function (a, i) {
            return (
              <button key={i} onClick={function () { nav(a.s); }} className="tap fu flex-1 flex-shrink-0" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 8px', borderRadius: 18, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, minWidth: 76, animationDelay: (0.18 + i * 0.05) + 's' }}>
                <div style={{ width: 46, height: 46, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21, background: a.bg, border: '1px solid ' + a.c + '15', boxShadow: '0 2px 8px ' + a.c + '12' }}>{a.e}</div>
                <p style={{ fontSize: 12, fontWeight: 700, fontFamily: ff, color: T.text }}>{a.l}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <div className="fu d5" style={{ borderRadius: 22, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg, #1F2937 0%, #111827 40%, #030712 100%)', boxShadow: '0 8px 28px rgba(0,0,0,0.3)' }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -10, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ padding: '22px 20px', position: 'relative' }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', fontFamily: ff }}>LIMITED OFFER</span>
              <div style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.15)', fontSize: 10, fontWeight: 800, color: '#fff', fontFamily: ff }}>NEW</div>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: ff, letterSpacing: '-0.02em', lineHeight: '1.3', marginBottom: 6 }}>First 3 deliveries free!</h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: ff, lineHeight: '1.5', marginBottom: 16 }}>New users enjoy zero locker fees on their first 3 sends. No promo code needed.</p>
            <div className="flex gap-3">
              <button onClick={function () { nav('send'); }} className="tap" style={{ padding: '11px 22px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: '#fff', color: T.accent, fontFamily: ff, display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>Send Now<ArrowRight style={{ width: 14, height: 14 }} /></button>
              <button onClick={function () { nav(props.currentPlan ? 'manage-sub' : 'subscribe'); }} className="tap" style={{ padding: '11px 18px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'rgba(255,255,255,0.15)', color: '#fff', fontFamily: ff, border: '1px solid rgba(255,255,255,0.2)' }}>{props.currentPlan ? 'Manage Plan' : 'Student Storage'}</button>
            </div>
          </div>
          <div className="flex justify-center gap-2" style={{ paddingBottom: 14 }}>
            <div style={{ width: 18, height: 4, borderRadius: 2, background: '#fff' }} />
            <div style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
            <div style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <button onClick={function () { nav('referral'); }} className="tap fu d6" style={{ width: '100%', borderRadius: 20, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(135deg, ' + T.purpleBg + ' 0%, ' + T.accentBg + ' 100%)', border: '1.5px solid ' + T.purple + '15', boxShadow: '0 4px 16px rgba(139,92,246,0.08)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ width: 44, height: 44, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: '#fff', border: '1px solid ' + T.purple + '12', boxShadow: '0 2px 8px rgba(139,92,246,0.1)', position: 'relative' }}>{'\u{1F381}'}</div>
          <div className="flex-1 text-left" style={{ position: 'relative' }}>
            <p style={{ fontWeight: 700, fontSize: 14, fontFamily: ff, letterSpacing: '-0.01em' }}>Invite friends, earn rewards</p>
            <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2 }}>Get 25 pts for each friend who joins</p>
          </div>
          <ChevronRight style={{ width: 16, height: 16, color: T.purple, position: 'relative' }} />
        </button>
      </div>

      <button onClick={function () { nav('support'); }} className="tap fixed" style={{ bottom: 80, right: 16, width: 52, height: 52, borderRadius: 26, background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.2), 0 2px 6px rgba(0,0,0,0.1)', zIndex: 40, border: '2px solid rgba(255,255,255,0.08)' }}>
        <span style={{ fontSize: 21 }}>{'\u{1F4AC}'}</span>
      </button>
    </div>
  );
}
