import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import { ArrowLeft, Check, ChevronDown, ChevronRight, ChevronUp, Clock, Copy, ExternalLink, X, Zap } from "../components/Icons";

export default function ManageSubPage(props) {
  var currentPlan = props.currentPlan || 'student';
  var [showCancel, setShowCancel] = useState(false);
  var [cancelStep, setCancelStep] = useState(1);
  var [cancelReason, setCancelReason] = useState('');
  var [cancelled, setCancelled] = useState(false);
  var [cancelToast, setCancelToast] = useState(false);
  var [showPause, setShowPause] = useState(false);
  var [pauseDuration, setPauseDuration] = useState('');
  var [paused, setPaused] = useState(false);
  var [pauseToast, setPauseToast] = useState(false);
  var [billingCycle, setBillingCycle] = useState('monthly');
  var [showHistory, setShowHistory] = useState(false);
  var [copiedId, setCopiedId] = useState('');
  var [downloadToast, setDownloadToast] = useState(false);

  var invoices = [
    { id: 'INV-2026-0222', date: 'Feb 22, 2026', plan: 'Student', amount: 15, status: 'Paid', method: 'MTN MoMo ••8521' },
    { id: 'INV-2026-0122', date: 'Jan 22, 2026', plan: 'Student', amount: 15, status: 'Paid', method: 'MTN MoMo ••8521' },
    { id: 'INV-2025-1222', date: 'Dec 22, 2025', plan: 'Student', amount: 15, status: 'Paid', method: 'MTN MoMo ••8521' }
  ];
  var totalSpent = invoices.reduce(function (s, inv) { return s + inv.amount; }, 0);
  var handleCopyId = function (id) {
    if (navigator.clipboard) navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(function () { setCopiedId(''); }, 1500);
  };

  var plans = {
    student: { e: '🎓', name: 'Student Storage', color: T.blue, bg: T.blueBg, border: T.blue + '33', priceM: 15, priceS: 60, priceY: 120, features: ['Personal locker storage', 'Access any locker with student ID', '24/7 store & retrieve items', 'Student support channel'] }
  };
  var pm = plans[currentPlan] || plans.student;
  var isFree = false;
  var currentPrice = billingCycle === 'yearly' ? pm.priceY : billingCycle === 'semester' ? pm.priceS : pm.priceM;
  var billingSuffix = billingCycle === 'yearly' ? '/yr' : billingCycle === 'semester' ? '/sem' : '/mo';
  var billingLabel = billingCycle === 'yearly' ? 'Yearly' : billingCycle === 'semester' ? 'Semester' : 'Monthly';
  var cancelReasons = ['Too expensive', 'Not using it enough', 'Missing features I need', 'Switching to a different plan', 'Other'];

  var doCancel = function () {
    setCancelled(true);
    setCancelToast(true);
    setTimeout(function () { setCancelToast(false); if (props.onCancelled) props.onCancelled(); }, 2200);
  };

  // Cancelled state
  if (cancelled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: T.bg, padding: '40px 24px' }}>
        <StatusBar />
        <div className="fu text-center">
          <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: ff, marginBottom: 8, color: T.text, letterSpacing: '-0.02em' }}>Subscription cancelled</h1>
          <p style={{ fontSize: 14, color: T.sec, fontFamily: ff, lineHeight: '1.6', marginBottom: 32 }}>Your storage plan has been cancelled. You can resubscribe anytime from Account → Student Storage.</p>
          <button onClick={props.onBack} className="tap" style={{ padding: '14px 40px', borderRadius: 18, fontWeight: 800, fontSize: 15, background: T.text, color: '#fff', fontFamily: ff, boxShadow: T.shadowLg }}>Back to Account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 noscroll overflow-y-auto" style={{ background: T.bg }}>
      <StatusBar />
      <Toast show={cancelToast} emoji="✅" text="Subscription cancelled" />
      <Toast show={pauseToast} emoji={paused ? '⏸️' : '▶️'} text={paused ? 'Plan paused for ' + pauseDuration : 'Plan resumed!'} />
      <div style={{ padding: '0' }}>
        {/* Hero header */}
        <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 50%, #3B82F6 100%)', padding: '12px 20px 24px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: 90, background: 'rgba(255,255,255,0.06)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.04)', filter: 'blur(20px)' }} />
          <div className="flex items-center gap-3" style={{ marginBottom: 20, position: 'relative' }}>
            <button onClick={props.onBack} className="tap" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}><ArrowLeft style={{ width: 18, height: 18, color: '#fff' }} /></button>
            <div className="flex-1">
              <h1 style={{ fontSize: 20, fontWeight: 900, fontFamily: ff, color: '#fff', letterSpacing: '-0.02em' }}>Student Storage</h1>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: ff }}>Manage your storage plan</p>
            </div>
          </div>
          {/* Plan card inside hero */}
          <div className="fu" style={{ borderRadius: 22, padding: 20, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', position: 'relative' }}>
            <div className="flex items-center gap-4" style={{ marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.15)' }}>{pm.e}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: ff, color: '#fff', letterSpacing: '-0.02em' }}>{pm.name} Plan</h2>
                  <span style={{ fontSize: 8, fontWeight: 900, padding: '4px 10px', borderRadius: 20, background: 'rgba(16,185,129,0.25)', color: '#6EE7B7', fontFamily: ff, letterSpacing: '0.06em' }}>ACTIVE</span>
                </div>
                <p style={{ fontSize: 22, fontWeight: 900, fontFamily: mf, color: '#fff', marginTop: 4, letterSpacing: '-0.02em' }}>
                  {isFree ? 'Free' : 'GH₵' + currentPrice}<span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{billingSuffix}</span>
                </p>
              </div>
            </div>
            {!isFree && (
              <div className="flex items-center gap-2" style={{ borderRadius: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: 13 }}>📅</span>
                <p style={{ fontSize: 12, fontFamily: ff, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Renews on <span style={{ color: '#fff', fontWeight: 800 }}>March 22, 2026</span></p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', marginTop: 20 }}>
        {/* Features */}
        <div className="fu" style={{ borderRadius: 20, padding: 16, background: T.card, border: '1.5px solid ' + T.border, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff, marginBottom: 12 }}>YOUR BENEFITS</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 8px' }}>
            {pm.features.map(function (f, i) {
              return (
                <div key={i} className="flex items-start gap-2">
                  <div style={{ width: 18, height: 18, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pm.color + '15', flexShrink: 0, marginTop: 1 }}>
                    <Check style={{ width: 10, height: 10, color: pm.color, strokeWidth: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, fontFamily: ff, color: T.text, lineHeight: '1.4' }}>{f}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Billing cycle options */}
        {!isFree && (
          <div className="fu d1" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff, marginBottom: 10 }}>BILLING CYCLE</p>
            {[
              { id: 'monthly', label: 'Monthly', price: pm.priceM, suffix: '/mo', equiv: null, save: null },
              { id: 'semester', label: 'Semester', price: pm.priceS, suffix: '/sem', equiv: '\u2248 GH₵' + (pm.priceS / 4).toFixed(0) + '/mo', save: 'SAVE 17%' },
              { id: 'yearly', label: 'Yearly', price: pm.priceY, suffix: '/yr', equiv: '\u2248 GH₵' + (pm.priceY / 12).toFixed(0) + '/mo', save: 'SAVE 33%' }
            ].map(function (opt, i) {
              var isActive = billingCycle === opt.id;
              return (
                <button key={opt.id} onClick={function () { setBillingCycle(opt.id); }} className="tap w-full text-left" style={{
                  borderRadius: 16, padding: 14, marginBottom: 8,
                  background: isActive ? pm.bg : T.card,
                  border: '1.5px solid ' + (isActive ? pm.color + '44' : T.border),
                  boxShadow: isActive ? '0 4px 16px ' + pm.color + '15' : T.shadow,
                  transition: 'all .25s', position: 'relative', display: 'flex', alignItems: 'center', gap: 12
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: 10, border: '2px solid ' + (isActive ? pm.color : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', transition: 'all .2s', flexShrink: 0 }}>
                    {isActive && <div style={{ width: 10, height: 10, borderRadius: 5, background: pm.color, transition: 'all .2s' }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: ff, color: T.text }}>{opt.label}</span>
                      {opt.save && <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: T.okBg, color: T.okDark, fontFamily: ff, letterSpacing: '0.04em' }}>{opt.save}</span>}
                    </div>
                    {opt.equiv && <p style={{ fontSize: 11, fontWeight: 600, color: T.sec, fontFamily: ff, marginTop: 1 }}>{opt.equiv}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 18, fontWeight: 900, fontFamily: mf, color: T.text }}>GH₵{opt.price}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.sec, fontFamily: ff }}>{opt.suffix}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Usage this month */}
        <div className="fu d1" style={{ borderRadius: 22, padding: 20, background: T.card, border: '1.5px solid ' + T.border, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff }}>USAGE THIS MONTH</p>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: T.fill, color: T.sec, fontFamily: ff, border: '1px solid ' + T.border }}>Resets Mar 1</span>
          </div>
          {(function () {
            var usageItems = [
              { l: 'Storage days used', used: 12, max: 30, color: T.blue, bg: T.blueBg, e: '🗄️', unlimited: false },
              { l: 'Locker access', used: 6, max: 0, color: T.purple, bg: T.purpleBg, e: '🔑', unlimited: true },
              { l: 'Support tickets', used: 1, max: 5, color: T.ok, bg: T.okBg, e: '🎫', unlimited: false }
            ];
            return usageItems.map(function (u, i) {
              var pct = u.unlimited ? 0.47 : Math.min(u.used / u.max, 1);
              var isHigh = pct > 0.8 && !u.unlimited;
              return (
                <div key={i} style={{ padding: '12px 14px', borderRadius: 14, background: T.fill, border: '1px solid ' + T.border, marginBottom: i < 2 ? 8 : 0 }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: 28, height: 28, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: u.bg }}>{u.e}</div>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: ff, color: T.text }}>{u.l}</span>
                    </div>
                    <div style={{ padding: '3px 10px', borderRadius: 8, background: isHigh ? T.accentBg : u.bg }}>
                      <span style={{ fontSize: 13, fontWeight: 900, fontFamily: mf, color: isHigh ? T.accent : u.color }}>{u.used}</span>
                      {!u.unlimited && <span style={{ fontSize: 11, fontWeight: 600, fontFamily: mf, color: T.muted }}>/{u.max}</span>}
                      {u.unlimited && <span style={{ fontSize: 10, fontWeight: 700, color: T.okDark, fontFamily: ff, marginLeft: 2 }}>unlimited</span>}
                    </div>
                  </div>
                  <div style={{ height: 8, borderRadius: 4, background: '#fff', overflow: 'hidden', border: '1px solid ' + T.border }}>
                    <div style={{ height: '100%', borderRadius: 4, width: (pct * 100) + '%', background: isHigh ? T.gradientAccent : u.color, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
                  </div>
                </div>
              );
            });
          })()}
        </div>

        {/* Billing info (paid plans) */}
        {!isFree && (
          <div className="fu d1" style={{ borderRadius: 22, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px 10px', background: T.card }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff, marginBottom: 12 }}>BILLING DETAILS</p>
            </div>
            {[
              { e: '💳', l: 'Payment method', v: 'MTN MoMo ••8521' },
              { e: '📅', l: 'Billing cycle', v: billingLabel },
              { e: '🔄', l: 'Next charge', v: 'GH₵' + currentPrice + ' on Mar 22' }
            ].map(function (row, i) {
              return (
                <div key={i} className="flex items-center gap-4" style={{ padding: '12px 18px', background: T.card, borderBottom: '1px solid ' + T.fill }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: T.fill, border: '1px solid ' + T.border }}>{row.e}</div>
                  <div className="flex-1">
                    <p style={{ fontSize: 10, color: T.muted, fontFamily: ff, fontWeight: 700, letterSpacing: '0.02em' }}>{row.l}</p>
                    <p style={{ fontSize: 14, fontWeight: 800, fontFamily: ff, color: T.text, marginTop: 2 }}>{row.v}</p>
                  </div>
                </div>
              );
            })}
            {/* Billing history toggle */}
            <button onClick={function () { setShowHistory(!showHistory); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: T.fill, borderTop: '1px solid ' + T.border }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: T.card, border: '1px solid ' + T.border }}>📄</div>
              <span className="flex-1 text-left" style={{ fontSize: 13, fontWeight: 700, fontFamily: ff, color: T.text }}>Billing History</span>
              {showHistory ? <ChevronUp style={{ width: 14, height: 14, color: T.muted }} /> : <ChevronDown style={{ width: 14, height: 14, color: T.muted }} />}
            </button>
            {showHistory && (
              <div style={{ borderTop: '1px solid ' + T.border }}>
                <Toast show={downloadToast} emoji="📄" text="Receipt downloaded" />
                <Toast show={!!copiedId} emoji="📋" text="Invoice ID copied" />
                <div style={{ padding: '14px 18px', background: T.gradient, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontFamily: ff, marginBottom: 2 }}>TOTAL SPENT</p>
                      <p style={{ fontSize: 20, fontWeight: 900, fontFamily: mf, color: '#fff', letterSpacing: '-0.03em' }}>GH₵{totalSpent}<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>.00</span></p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontFamily: ff, marginBottom: 2 }}>INVOICES</p>
                      <p style={{ fontSize: 20, fontWeight: 900, fontFamily: mf, color: '#fff' }}>{invoices.length}</p>
                    </div>
                  </div>
                </div>
                {invoices.map(function (inv, i) {
                  var isPaid = inv.status === 'Paid';
                  return (
                    <div key={i} style={{ padding: '14px 18px', background: T.card, borderBottom: i < invoices.length - 1 ? '1px solid ' + T.fill : 'none' }}>
                      <div className="flex items-start gap-3">
                        <div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, background: isPaid ? T.okBg : T.fill, border: '1px solid ' + (isPaid ? T.ok + '22' : T.border), flexShrink: 0 }}>
                          {isPaid ? '✅' : '📦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p style={{ fontSize: 13, fontWeight: 800, fontFamily: ff, color: T.text }}>{inv.plan} Plan</p>
                            <p style={{ fontSize: 14, fontWeight: 900, fontFamily: mf, color: isPaid ? T.text : T.muted }}>{inv.amount > 0 ? 'GH₵' + inv.amount : 'Free'}</p>
                          </div>
                          <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, marginTop: 2 }}>{inv.date}</p>
                          <div className="flex items-center gap-3" style={{ marginTop: 6 }}>
                            <button onClick={function () { handleCopyId(inv.id); }} className="tap flex items-center gap-1.5" style={{ fontSize: 9, fontWeight: 700, color: copiedId === inv.id ? T.ok : T.sec, fontFamily: mf, padding: '3px 7px', borderRadius: 6, background: T.fill, border: '1px solid ' + T.border, transition: 'all .2s' }}>
                              {copiedId === inv.id ? <Check style={{ width: 9, height: 9 }} /> : <Copy style={{ width: 9, height: 9 }} />} {inv.id}
                            </button>
                            {isPaid && (
                              <button onClick={function () { setDownloadToast(true); setTimeout(function () { setDownloadToast(false); }, 2000); }} className="tap flex items-center gap-1" style={{ fontSize: 9, fontWeight: 700, color: T.blue, fontFamily: ff, padding: '3px 7px', borderRadius: 6, background: T.blueBg, border: '1px solid ' + T.blue + '22' }}>
                                <ExternalLink style={{ width: 9, height: 9 }} /> Receipt
                              </button>
                            )}
                          </div>
                          {isPaid && <p style={{ fontSize: 9, color: T.muted, fontFamily: ff, marginTop: 4 }}>via {inv.method}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {/* Pause & Cancel actions */}
        {!isFree && !showPause && !paused && !showCancel && (
          <div className="fu d3" style={{ borderRadius: 22, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <button onClick={function () { setShowPause(true); }} className="tap w-full" style={{ padding: '16px 18px', fontWeight: 700, fontSize: 14, background: T.card, color: T.text, fontFamily: ff, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid ' + T.fill }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.warnBg, border: '1px solid ' + T.warn + '22' }}><Clock style={{ width: 16, height: 16, color: T.warn }} /></div>
              <div className="flex-1 text-left">
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: ff }}>Pause Subscription</span>
                <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, marginTop: 1 }}>Take a break without losing your plan</p>
              </div>
              <ChevronRight style={{ width: 14, height: 14, color: T.muted }} />
            </button>
            <button onClick={function () { setShowCancel(true); setCancelStep(1); }} className="tap w-full" style={{ padding: '16px 18px', fontWeight: 700, fontSize: 14, background: T.card, color: T.text, fontFamily: ff, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentBg, border: '1px solid ' + T.accent + '22' }}><X style={{ width: 16, height: 16, color: T.accent }} /></div>
              <div className="flex-1 text-left">
                <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: ff }}>Cancel Subscription</span>
                <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, marginTop: 1 }}>You can resubscribe anytime</p>
              </div>
              <ChevronRight style={{ width: 14, height: 14, color: T.muted }} />
            </button>
          </div>
        )}

        {/* Pause flow */}
        {!isFree && showPause && (
          <div className="fu" style={{ borderRadius: 20, border: '1.5px solid ' + T.warn + '33', overflow: 'hidden', marginBottom: 10 }}>
            <div style={{ padding: 20 }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: T.warnBg }}>⏸️</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: ff, color: T.text }}>Pause your plan</h3>
                  <p style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>Take a break without losing your plan</p>
                </div>
              </div>
              <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, lineHeight: '1.6', marginBottom: 14 }}>Your {pm.name} benefits will be paused. You won't be billed during the pause period. Your plan will automatically resume after the selected duration.</p>
              {['1 week', '2 weeks', '1 month'].map(function (d, i) {
                return (
                  <button key={i} onClick={function () { setPauseDuration(d); }} className="tap w-full" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: pauseDuration === d ? T.warnBg : T.fill, border: '1.5px solid ' + (pauseDuration === d ? T.warn + '33' : T.border), marginBottom: 8, transition: 'all .2s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 10, border: '2px solid ' + (pauseDuration === d ? T.warn : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}>
                      {pauseDuration === d && <div style={{ width: 10, height: 10, borderRadius: 5, background: T.warn }} />}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, fontFamily: ff, color: T.text }}>{d}</span>
                  </button>
                );
              })}
              <div className="flex gap-3" style={{ marginTop: 12 }}>
                <button onClick={function () { setShowPause(false); setPauseDuration(''); }} className="tap flex-1" style={{ padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: T.fill, color: T.text, fontFamily: ff, border: '1.5px solid ' + T.border }}>Never mind</button>
                <button disabled={!pauseDuration} onClick={function () { setPaused(true); setShowPause(false); setPauseToast(true); setTimeout(function () { setPauseToast(false); }, 2500); }} className="tap flex-1" style={{ padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: pauseDuration ? T.warn : T.fill, color: pauseDuration ? '#fff' : T.muted, fontFamily: ff, transition: 'all .2s' }}>Pause Plan</button>
              </div>
            </div>
          </div>
        )}

        {/* Paused state banner */}
        {!isFree && paused && (
          <div className="fu" style={{ borderRadius: 20, padding: 18, background: T.warnBg, border: '1.5px solid ' + T.warn + '33', marginBottom: 10 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: '#fff' }}>⏸️</div>
              <div className="flex-1">
                <h3 style={{ fontSize: 15, fontWeight: 800, fontFamily: ff, color: T.text }}>Plan paused</h3>
                <p style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>Paused for {pauseDuration} — resumes automatically</p>
              </div>
            </div>
            <button onClick={function () { setPaused(false); setPauseDuration(''); setPauseToast(true); setTimeout(function () { setPauseToast(false); }, 2000); }} className="tap w-full" style={{ padding: '12px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: T.ok, color: '#fff', fontFamily: ff, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Zap style={{ width: 14, height: 14 }} /> Resume Now
            </button>
          </div>
        )}


        {/* Cancel flow */}
        {!isFree && showCancel && (
          <div className="fu" style={{ borderRadius: 20, border: '1.5px solid ' + T.accent + '33', overflow: 'hidden', marginBottom: 8 }}>
            {cancelStep === 1 && (
              <div style={{ padding: 20 }}>
                <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: T.accentBg }}>😕</div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: ff, color: T.text }}>Sorry to see you go</h3>
                    <p style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>What's the main reason?</p>
                  </div>
                </div>
                {cancelReasons.map(function (r, i) {
                  return (
                    <button key={i} onClick={function () { setCancelReason(r); }} className="tap w-full" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: cancelReason === r ? T.accentBg : T.fill, border: '1.5px solid ' + (cancelReason === r ? T.accent + '33' : T.border), marginBottom: 8, transition: 'all .2s' }}>
                      <div style={{ width: 20, height: 20, borderRadius: 10, border: '2px solid ' + (cancelReason === r ? T.accent : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s', flexShrink: 0 }}>
                        {cancelReason === r && <div style={{ width: 10, height: 10, borderRadius: 5, background: T.accent }} />}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: ff, color: T.text, textAlign: 'left' }}>{r}</span>
                    </button>
                  );
                })}
                <div className="flex gap-3" style={{ marginTop: 16 }}>
                  <button onClick={function () { setShowCancel(false); setCancelReason(''); }} className="tap flex-1" style={{ padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: T.fill, color: T.text, fontFamily: ff, border: '1.5px solid ' + T.border }}>Keep Plan</button>
                  <button disabled={!cancelReason} onClick={function () { setCancelStep(2); }} className="tap flex-1" style={{ padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: cancelReason ? T.accent : T.fill, color: cancelReason ? '#fff' : T.muted, fontFamily: ff, transition: 'all .2s' }}>Continue</button>
                </div>
              </div>
            )}
            {cancelStep === 2 && (
              <div style={{ padding: 20 }}>
                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 44, marginBottom: 12 }}>⚠️</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, fontFamily: ff, color: T.text, marginBottom: 6 }}>Confirm cancellation</h3>
                  <p style={{ fontSize: 13, color: T.sec, fontFamily: ff, lineHeight: '1.6' }}>
                    You'll lose all {pm.name} benefits immediately. You can re-subscribe at any time.
                  </p>
                </div>
                <div style={{ borderRadius: 16, padding: 16, background: T.accentBg, border: '1px solid ' + T.accent + '22', marginBottom: 16 }}>
                  {pm.features.map(function (f, i) {
                    return (
                      <div key={i} className="flex items-center gap-2" style={{ marginBottom: i < pm.features.length - 1 ? 6 : 0 }}>
                        <X style={{ width: 14, height: 14, color: T.accent, flexShrink: 0, strokeWidth: 3 }} />
                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: ff, color: T.accent }}>{f}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-3">
                  <button onClick={function () { setCancelStep(1); }} className="tap flex-1" style={{ padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: T.ok, color: '#fff', fontFamily: ff, boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>Keep {pm.name}</button>
                  <button onClick={doCancel} className="tap flex-1" style={{ padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 14, background: T.accentBg, color: T.accent, fontFamily: ff, border: '1.5px solid ' + T.accent + '33' }}>Cancel Plan</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
