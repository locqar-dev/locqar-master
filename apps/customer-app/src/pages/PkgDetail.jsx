import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import QRCode from "../utils/qrcode";
import ShareButton from "../components/ShareButton";
import { Shield, Copy, Check, Zap, ChevronDown, Navigation, Star, ExternalLink, AlertTriangle, Clock } from "../components/Icons";
import { calcOverage, lockerStatus, fmtHours, FREE_HOURS } from "../utils/storageUtils";

export default function PkgDetail(props) {
  var pkg = props.pkg;
  var [showCopied, setShowCopied] = useState(false);
  var [showCodeQR, setShowCodeQR] = useState(false);
  var [showDropQR, setShowDropQR] = useState(false);
  var [dropCopied, setDropCopied] = useState(false);
  var code = 'LQ-847291'; // pickup code (mock)
  var overage = calcOverage(pkg.hoursInLocker);
  var lstatus = pkg.status === 'Ready' ? lockerStatus(pkg.hoursInLocker) : null;
  var hCp = function () { if (navigator.clipboard) navigator.clipboard.writeText(code); setShowCopied(true); setTimeout(function () { setShowCopied(false); }, 2000); };
  var hDropCp = function () { if (navigator.clipboard && pkg.dropCode) navigator.clipboard.writeText(pkg.dropCode); setDropCopied(true); setTimeout(function () { setDropCopied(false); }, 2000); };
  var tl = [
    { e: '\u{1F4E6}', t: 'Order placed', tm: 'Feb 3, 10:30 AM', d: true },
    { e: '\u{2705}', t: 'Confirmed', tm: 'Feb 3, 10:32 AM', d: true },
    { e: '\u{1F69A}', t: 'In transit', tm: 'Feb 4, 2:15 PM', d: pkg.status !== 'Pending' },
    { e: '\u{1F4CD}', t: 'At locker', tm: pkg.status === 'Ready' ? 'Feb 5, 9:00 AM' : 'Pending', d: pkg.status === 'Ready' || pkg.status === 'Delivered' },
    { e: '\u{1F389}', t: 'Picked up', tm: pkg.status === 'Delivered' ? 'Feb 5, 11:30 AM' : 'Pending', d: pkg.status === 'Delivered' }
  ];
  var progress = pkg.status === 'Ready' ? 80 : pkg.status === 'Delivered' ? 100 : 50;
  return (
    <div className="min-h-screen" style={{ paddingBottom: pkg.status === 'Ready' || pkg.status === 'Delivered' ? 100 : 40, background: T.bg }}>
      <StatusBar /><Toast show={showCopied} emoji={'\u{1F4CB}'} text="Code copied!" />
      <PageHeader title="Package Details" onBack={props.onBack} />
      <div style={{ padding: '4px 20px 0' }}>
        {/* Progress */}
        <div className="fu" style={{ marginBottom: 20 }}><div style={{ height: 4, borderRadius: 2, background: T.fill, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 2, width: progress + '%', background: progress === 100 ? T.ok : T.warn, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} /></div><div className="flex justify-between" style={{ marginTop: 4 }}><span style={{ fontSize: 10, color: T.sec, fontFamily: ff }}>Sent</span><span style={{ fontSize: 10, color: T.sec, fontFamily: ff }}>Delivered</span></div></div>
        {/* Info card */}
        <div className="fu d1" style={{ borderRadius: 20, padding: 18, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
          <div className="flex items-start gap-3" style={{ marginBottom: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: pkg.status === 'Ready' ? T.okBg : T.fill }}>{pkg.status === 'Ready' ? '\u{2705}' : pkg.status === 'Delivered' ? '\u{1F389}' : '\u{1F69A}'}</div>
            <div className="flex-1"><h2 style={{ fontWeight: 800, fontSize: 18, fontFamily: ff }}>{pkg.name}</h2><span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 8, marginTop: 4, background: pkg.status === 'Ready' ? T.okBg : T.fill, color: pkg.status === 'Ready' ? T.okDark : T.sec, fontFamily: ff }}>{pkg.status}</span></div>
          </div>
          {[{ icon: '\u{1F4E4}', label: 'From', value: pkg.fromPhone, mono: true }, { icon: '\u{1F4E5}', label: 'To', value: pkg.toPhone, mono: true }, { icon: '\u{1F3EA}', label: 'Locker', value: pkg.location }].map(function (r, i) {
            return <div key={i} className="flex items-center gap-3" style={{ borderRadius: 12, padding: '10px 12px', background: T.fill, marginBottom: 6 }}><span style={{ fontSize: 14 }}>{r.icon}</span><div className="flex-1"><p style={{ fontSize: 10, color: T.sec, fontFamily: ff, letterSpacing: '0.04em' }}>{r.label.toUpperCase()}</p><p style={{ fontWeight: 600, fontSize: 13, fontFamily: r.mono ? mf : ff }}>{r.value}</p></div></div>;
          })}
        </div>
        {/* Drop-off code — for packages the user sent */}
        {pkg.dropCode && (
          <div className="fu d2" style={{ borderRadius: 20, padding: 16, background: T.accentBg || T.blueBg, border: '1.5px solid ' + T.accent + '22', marginBottom: 12 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
              <Shield style={{ width: 13, height: 13, color: T.accent }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: '0.06em', fontFamily: ff }}>DROP-OFF PIN</p>
              {pkg.status !== 'In transit' && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: T.fill, color: T.muted, fontFamily: ff, marginLeft: 'auto' }}>Used</span>}
            </div>
            <div className="flex items-center gap-2" style={{ marginBottom: pkg.status === 'In transit' ? 14 : 0 }}>
              <div className="flex-1" style={{ borderRadius: 14, padding: '14px 16px', fontSize: 26, fontWeight: 800, letterSpacing: '0.15em', background: '#fff', textAlign: 'center', fontFamily: mf, border: '1px solid ' + T.accent + '22', opacity: pkg.status !== 'In transit' ? 0.5 : 1 }}>{pkg.dropCode}</div>
              <button onClick={hDropCp} className="tap" style={{ width: 50, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid ' + T.accent + '22' }}>{dropCopied ? <Check style={{ width: 18, height: 18, color: T.ok }} /> : <Copy style={{ width: 18, height: 18, color: T.sec }} />}</button>
            </div>
            {pkg.status === 'In transit' && (
              <>
                <button onClick={function () { setShowDropQR(!showDropQR); }} className="tap flex items-center justify-between w-full" style={{ borderRadius: 12, padding: '10px 12px', background: '#fff', border: '1px solid ' + T.accent + '22' }}>
                  <div className="flex items-center gap-2"><Zap style={{ width: 13, height: 13, color: T.accent }} /><span style={{ fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: ff }}>Show QR Code</span></div>
                  <ChevronDown style={{ width: 14, height: 14, color: T.accent, transform: showDropQR ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                </button>
                {showDropQR && (
                  <div className="fu flex flex-col items-center" style={{ paddingTop: 14 }}>
                    <QRCode data={pkg.dropCode} size={160} radius={18} padding={16} bg="#fff" />
                    <p style={{ fontSize: 11, color: T.accent, marginTop: 10, fontFamily: ff, textAlign: 'center' }}>Scan at any LocQar locker to drop off</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Overage banner */}
        {pkg.status === 'Ready' && lstatus === 'overdue' && (
          <div className="fu d2" style={{ borderRadius: 16, padding: '12px 14px', background: T.redBg, border: '1px solid ' + T.red + '28', marginBottom: 12, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <AlertTriangle style={{ width: 15, height: 15, color: T.red, flexShrink: 0, marginTop: 1 }} />
            <div className="flex-1">
              <p style={{ fontSize: 13, fontWeight: 700, color: T.red, fontFamily: ff }}>Overage charge applies</p>
              <p style={{ fontSize: 12, color: T.red, opacity: 0.8, fontFamily: ff, marginTop: 2, lineHeight: 1.4 }}>
                Package has been in the locker for <span style={{ fontFamily: mf, fontWeight: 700 }}>{fmtHours(pkg.hoursInLocker)}</span>.{' '}
                <span style={{ fontFamily: mf, fontWeight: 800 }}>GH₵{overage.toFixed(2)}</span> is due at pickup.
              </p>
            </div>
          </div>
        )}
        {pkg.status === 'Ready' && lstatus === 'warning' && (
          <div className="fu d2" style={{ borderRadius: 16, padding: '12px 14px', background: T.warnBg, border: '1px solid ' + T.warn + '28', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Clock style={{ width: 15, height: 15, color: T.warn, flexShrink: 0 }} />
            <p style={{ fontSize: 12, fontWeight: 600, color: T.warn, fontFamily: ff }}>
              Collect soon — <span style={{ fontFamily: mf, fontWeight: 700 }}>{fmtHours(FREE_HOURS - pkg.hoursInLocker)}</span> left before overage charges apply.
            </p>
          </div>
        )}

        {/* Pickup code */}
        {pkg.status === 'Ready' && (
          <div className="fu d2" style={{ borderRadius: 20, padding: 16, background: T.okBg, border: '1.5px solid ' + T.ok + '22', marginBottom: 12 }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Shield style={{ width: 13, height: 13, color: T.okDark }} /><p style={{ fontSize: 10, fontWeight: 700, color: T.okDark, letterSpacing: '0.06em', fontFamily: ff }}>PICKUP CODE</p></div>
            <div className="flex items-center gap-2" style={{ marginBottom: 14 }}>
              <div className="flex-1" style={{ borderRadius: 14, padding: '14px 16px', fontSize: 26, fontWeight: 800, letterSpacing: '0.15em', background: '#fff', textAlign: 'center', fontFamily: mf, border: '1px solid ' + T.ok + '22' }}>{code}</div>
              <button onClick={hCp} className="tap" style={{ width: 50, height: 54, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid ' + T.ok + '22' }}>{showCopied ? <Check style={{ width: 18, height: 18, color: T.ok }} /> : <Copy style={{ width: 18, height: 18, color: T.sec }} />}</button>
            </div>
            <button onClick={function () { setShowCodeQR(!showCodeQR); }} className="tap flex items-center justify-between w-full" style={{ borderRadius: 12, padding: '10px 12px', background: '#fff', border: '1px solid ' + T.ok + '22' }}>
              <div className="flex items-center gap-2"><Zap style={{ width: 13, height: 13, color: T.okDark }} /><span style={{ fontSize: 12, fontWeight: 700, color: T.okDark, fontFamily: ff }}>Show QR Code</span></div>
              <ChevronDown style={{ width: 14, height: 14, color: T.okDark, transform: showCodeQR ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {showCodeQR && (
              <div className="fu flex flex-col items-center" style={{ paddingTop: 14 }}>
                <QRCode data={code} size={160} radius={18} padding={16} bg="#fff" />
                <p style={{ fontSize: 11, color: T.okDark, marginTop: 10, fontFamily: ff, textAlign: 'center' }}>Scan at the locker to open</p>
              </div>
            )}
          </div>
        )}
        {/* Timeline */}
        <div className="fu d3" style={{ borderRadius: 20, padding: 18, border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12 }}>
          <h3 style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, fontFamily: ff, letterSpacing: '-0.01em' }}>Timeline</h3>
          {tl.map(function (it, i) {
            return (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div style={{ width: 34, height: 34, borderRadius: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: it.d ? T.fill : '#FAFAFA', opacity: it.d ? 1 : 0.25, border: it.d ? '1px solid ' + T.border : 'none' }}>{it.e}</div>
                  {i < tl.length - 1 && <div style={{ width: 2, height: 16, margin: '3px 0', borderRadius: 1, background: tl[i + 1].d ? T.text : T.border }} />}
                </div>
                <div style={{ flex: 1, paddingBottom: 8 }}><p style={{ fontWeight: 600, fontSize: 13, opacity: it.d ? 1 : 0.2, fontFamily: ff }}>{it.t}</p><p style={{ fontSize: 11, color: it.d ? T.sec : T.muted, fontFamily: ff }}>{it.tm}</p></div>
              </div>
            );
          })}
        </div>

        {/* Share tracking */}
        <div className="fu d4">
          <ShareButton packageData={pkg}>
            <button className="tap" style={{ width: '100%', padding: 14, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: T.blueBg, border: '1.5px solid ' + T.blue + '22', fontWeight: 700, fontSize: 13, color: T.blue, fontFamily: ff }}>
              <ExternalLink style={{ width: 15, height: 15 }} />Share Tracking
            </button>
          </ShareButton>
        </div>
      </div>
      {pkg.status === 'Ready' && (
        <div className="glass fixed bottom-0 left-0 right-0" style={{ padding: 16, paddingBottom: 28, borderTop: '1px solid ' + T.border }}>
          {lstatus === 'overdue' && (
            <div className="flex items-center justify-between" style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 10, background: T.redBg, border: '1px solid ' + T.red + '25' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.red, fontFamily: ff }}>Overage due</span>
              <span style={{ fontSize: 14, fontWeight: 900, fontFamily: mf, color: T.red }}>GH₵{overage.toFixed(2)}</span>
            </div>
          )}
          <button className="tap" style={{ width: '100%', padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, color: '#fff', background: lstatus === 'overdue' ? T.red : T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: ff, boxShadow: lstatus === 'overdue' ? '0 4px 14px ' + T.red + '33' : '0 4px 14px rgba(0,0,0,0.15)' }}>
            <Navigation style={{ width: 16, height: 16 }} />{lstatus === 'overdue' ? 'Pay & Collect' : 'Get Directions'}
          </button>
        </div>
      )}
      {pkg.status === 'Delivered' && (
        <div className="glass fixed bottom-0 left-0 right-0" style={{ padding: 16, borderTop: '1px solid ' + T.border }}>
          <button onClick={function () { if (props.onRate) props.onRate(pkg); }} className="tap" style={{ width: '100%', padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, color: '#fff', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: ff, boxShadow: '0 4px 14px rgba(245,158,11,0.25)' }}>
            <Star style={{ width: 16, height: 16 }} />Rate this delivery
          </button>
        </div>
      )}
    </div>
  );
}
