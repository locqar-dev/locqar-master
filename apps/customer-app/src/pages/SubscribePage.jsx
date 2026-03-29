import React, { useState } from "react";
import { T, ff, hf, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import { ArrowLeft, ArrowRight, Check, Info, Gift, Eye, EyeOff } from "../components/Icons";

export default function SubscribePage(props) {
  var [sel, setSel] = useState(props.current || 'student');
  var [billingCycle, setBillingCycle] = useState('monthly');
  var [showCompare, setShowCompare] = useState(false);
  var [confirmed, setConfirmed] = useState(false);
  var [showPromo, setShowPromo] = useState(false);
  var [studentId, setStudentId] = useState('');
  var [studentPass, setStudentPass] = useState('');
  var [showPass, setShowPass] = useState(false);
  var [promoCode, setPromoCode] = useState('');
  var [promoApplied, setPromoApplied] = useState(false);
  var [promoError, setPromoError] = useState('');
  var [promoDiscount, setPromoDiscount] = useState(0);

  var validPromos = { 'LOCQAR20': 20, 'WELCOME10': 10, 'FIRST50': 50 };

  var applyPromo = function () {
    var code = promoCode.trim().toUpperCase();
    if (validPromos[code]) { setPromoDiscount(validPromos[code]); setPromoApplied(true); setPromoError(''); }
    else { setPromoError('Invalid promo code'); setPromoApplied(false); setPromoDiscount(0); }
  };

  var plans = [
    { id: 'student', e: '\u{1F393}', name: 'Student Storage', tag: null, priceM: 15, priceS: 60, priceY: 120, desc: 'Personal locker storage for students',
      features: [{ t: 'Personal locker storage', ok: true }, { t: 'Access any locker with student ID', ok: true }, { t: '24/7 store & retrieve items', ok: true }, { t: 'Student support channel', ok: true }],
      color: T.blue, bg: T.blueBg, border: T.blue + '33' }
  ];

  var selPlan = plans.find(function (p) { return p.id === sel; });
  var basePrice = selPlan ? (billingCycle === 'yearly' ? selPlan.priceY : billingCycle === 'semester' ? selPlan.priceS : selPlan.priceM) : 0;
  var discountAmt = promoApplied && basePrice > 0 ? Math.round(basePrice * promoDiscount / 100) : 0;
  var price = basePrice - discountAmt;
  var billingLabel = billingCycle === 'yearly' ? 'Yearly' : billingCycle === 'semester' ? 'Semester' : 'Monthly';
  var billingSuffix = billingCycle === 'yearly' ? '/yr' : billingCycle === 'semester' ? '/sem' : '/mo';
  var monthlyEquivPrice = selPlan ? (billingCycle === 'yearly' ? (selPlan.priceY / 12).toFixed(0) : billingCycle === 'semester' ? (selPlan.priceS / 4).toFixed(0) : null) : null;
  var savings = selPlan && billingCycle === 'yearly' && selPlan.priceM > 0 ? (selPlan.priceM * 12 - selPlan.priceY) : (selPlan && billingCycle === 'semester' && selPlan.priceM > 0 ? (selPlan.priceM * 4 - selPlan.priceS) : 0);
  var credentialsValid = studentId.trim().length >= 3 && studentPass.length >= 4;

  var handleContinue = function () {
    if (sel && price > 0 && credentialsValid) {
      if (props.onNav) {
        var payItems = [
          { e: selPlan.e, l: selPlan.name + ' subscription', v: 'GH\u20B5' + basePrice + billingSuffix },
          { e: '\u{1F4C5}', l: billingLabel + ' billing', v: savings > 0 ? 'Save GH\u20B5' + savings : '' },
          { e: '\u{1F393}', l: 'Student ID: ' + studentId.trim(), v: '' }
        ];
        if (promoApplied && discountAmt > 0) {
          payItems.push({ e: '\u{1F39F}\u{FE0F}', l: 'Promo: ' + promoCode.toUpperCase(), v: '-GH\u20B5' + discountAmt + ' (' + promoDiscount + '% off)' });
        }
        props.onNav('payment', {
          amount: price + '', label: selPlan.name + ' Plan \u2014 ' + billingLabel, icon: selPlan.e, items: payItems,
          backTo: props.payBackTo || 'subscribe', onSuccessNav: 'sub-success',
          onSuccessData: { plan: sel, studentId: studentId.trim(), studentPass: studentPass }
        });
      }
    }
  };

  if (props.current) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: T.bg, padding: 40 }}>
        <StatusBar />
        <div style={{ fontSize: 56, marginBottom: 16 }}>{'\u{1F393}'}</div>
        <h2 style={{ fontSize: 22, fontWeight: 900, fontFamily: ff, color: T.text, marginBottom: 8, textAlign: 'center' }}>Already Subscribed</h2>
        <p style={{ fontSize: 14, color: T.sec, fontFamily: ff, textAlign: 'center', lineHeight: '1.6', marginBottom: 24, maxWidth: 260 }}>You have an active Student Storage plan. Manage or upgrade from your subscription settings.</p>
        <div className="flex gap-3">
          <button onClick={function () { if (props.onNav) props.onNav('manage-sub'); }} className="tap" style={{ padding: '14px 28px', borderRadius: 16, fontWeight: 800, fontSize: 14, background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)', color: '#fff', fontFamily: ff, boxShadow: '0 6px 20px rgba(59,130,246,0.3)' }}>Manage Plan</button>
          {props.onBack && <button onClick={props.onBack} className="tap" style={{ padding: '14px 28px', borderRadius: 16, fontWeight: 800, fontSize: 14, background: T.fill, color: T.text, fontFamily: ff, border: '1.5px solid ' + T.border }}>Go Back</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ paddingBottom: sel ? 130 : 40, background: T.bg }}>
      <StatusBar />
      <Toast show={confirmed} emoji={'\u{1F389}'} text="Storage plan activated!" />
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #1E40AF 50%, #3B82F6 100%)', padding: '16px 20px 28px', borderRadius: '0 0 32px 32px', position: 'relative', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ position: 'absolute', top: -40, right: -30, width: 180, height: 180, borderRadius: 90, background: 'rgba(255,255,255,0.06)', filter: 'blur(30px)' }} />
        <div style={{ position: 'absolute', bottom: -20, left: -20, width: 120, height: 120, borderRadius: 60, background: 'rgba(255,255,255,0.04)', filter: 'blur(20px)' }} />
        <div className="flex items-center gap-3" style={{ marginBottom: 16, position: 'relative' }}>
          {props.onBack && <button onClick={props.onBack} className="tap" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}><ArrowLeft style={{ width: 18, height: 18, color: '#fff' }} /></button>}
        </div>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ fontSize: 48, marginBottom: 10, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }}>{'\u{1F393}'}</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em', fontFamily: ff, color: '#fff', marginBottom: 6 }}>Student Storage</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: ff, lineHeight: '1.5', maxWidth: 280, margin: '0 auto' }}>Personal locker storage starting at GH\u20B515/mo</p>
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff, marginBottom: 10 }}>CHOOSE YOUR PLAN</p>
        {(function () {
          var plan = plans[0];
          var billingOptions = [
            { id: 'monthly', label: 'Monthly', price: plan.priceM, suffix: '/mo', equiv: null, save: null, badge: null, desc: 'Billed monthly' },
            { id: 'semester', label: 'Semester', price: plan.priceS, suffix: '/sem', equiv: 'GH\u20B5' + (plan.priceS / 4).toFixed(0) + '/mo', save: '17%', badge: null, desc: '4 months billed at once' },
            { id: 'yearly', label: 'Yearly', price: plan.priceY, suffix: '/yr', equiv: 'GH\u20B5' + (plan.priceY / 12).toFixed(0) + '/mo', save: '33%', badge: 'BEST VALUE', desc: '12 months billed at once' }
          ];
          return billingOptions.map(function (opt, i) {
            var isSel = billingCycle === opt.id;
            var isYearly = opt.id === 'yearly';
            return (
              <button key={opt.id} onClick={function () { setBillingCycle(opt.id); setSel(plan.id); }} className={'w-full text-left tap fu d' + (i + 1)} style={{ borderRadius: 20, padding: isSel ? 18 : 16, marginBottom: 10, background: isSel ? (isYearly ? 'linear-gradient(135deg, ' + plan.bg + ' 0%, #DBEAFE 100%)' : plan.bg) : T.card, border: '2px solid ' + (isSel ? plan.color : T.border), boxShadow: isSel ? '0 8px 28px ' + plan.color + '20' : '0 2px 8px rgba(0,0,0,0.04)', transition: 'all .3s cubic-bezier(.2,.9,.3,1)', position: 'relative', overflow: 'hidden' }}>
                {opt.badge && <div style={{ position: 'absolute', top: 0, right: 0, background: plan.color, color: '#fff', fontSize: 8, fontWeight: 900, padding: '5px 12px', borderRadius: '0 18px 0 12px', fontFamily: ff, letterSpacing: '0.06em' }}>{opt.badge}</div>}
                <div className="flex items-center gap-3">
                  <div style={{ width: 24, height: 24, borderRadius: 12, border: '2.5px solid ' + (isSel ? plan.color : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', transition: 'all .2s', flexShrink: 0 }}>
                    {isSel && <div style={{ width: 12, height: 12, borderRadius: 6, background: plan.color, transition: 'all .2s' }} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 16, fontWeight: 800, fontFamily: ff, color: T.text }}>{opt.label}</span>
                      {opt.save && <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20, background: T.ok, color: '#fff', fontFamily: ff, letterSpacing: '0.02em' }}>-{opt.save}</span>}
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 500, color: T.sec, fontFamily: ff, marginTop: 2 }}>{opt.desc}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div><span style={{ fontSize: 10, fontWeight: 700, color: T.sec, fontFamily: ff }}>GH\u20B5</span><span style={{ fontSize: 24, fontWeight: 900, fontFamily: mf, letterSpacing: '-0.03em', color: T.text }}>{opt.price}</span></div>
                    <span style={{ fontSize: 10, fontWeight: 600, color: T.muted, fontFamily: ff }}>{opt.equiv ? opt.equiv : 'per month'}</span>
                  </div>
                </div>
              </button>
            );
          });
        })()}

        <div className="fu d4" style={{ borderRadius: 22, padding: 20, background: T.card, border: '1.5px solid ' + (credentialsValid ? T.ok + '33' : T.border), boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginTop: 6, marginBottom: 10, transition: 'border .3s' }}>
          <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: credentialsValid ? T.okBg : T.blueBg, border: '1px solid ' + (credentialsValid ? T.ok : T.blue) + '22', transition: 'all .3s' }}>{credentialsValid ? '\u2705' : '\u{1F511}'}</div>
            <div><p style={{ fontSize: 14, fontWeight: 800, fontFamily: ff, color: T.text }}>Create Locker Login</p><p style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>Used to access lockers at the terminal</p></div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff, display: 'block', marginBottom: 6 }}>STUDENT ID</label>
            <div className="flex items-center" style={{ borderRadius: 14, border: '1.5px solid ' + (studentId.trim().length >= 3 ? T.ok + '44' : studentId.trim() ? T.blue + '44' : T.border), background: T.fill, overflow: 'hidden', transition: 'all .2s' }}>
              <input type="text" value={studentId} onChange={function (e) { setStudentId(e.target.value); }} placeholder="e.g. UG9876543" style={{ flex: 1, padding: '13px 16px', fontWeight: 700, fontSize: 14, fontFamily: mf, background: 'transparent', color: T.text, letterSpacing: '0.02em' }} />
              {studentId.trim().length >= 3 && <div style={{ paddingRight: 14 }}><div style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} /></div></div>}
            </div>
          </div>
          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff, display: 'block', marginBottom: 6 }}>CREATE PASSWORD</label>
            <div className="flex items-center" style={{ borderRadius: 14, border: '1.5px solid ' + (studentPass.length >= 4 ? T.ok + '44' : studentPass ? T.blue + '44' : T.border), background: T.fill, overflow: 'hidden', transition: 'all .2s' }}>
              <input type={showPass ? 'text' : 'password'} value={studentPass} onChange={function (e) { setStudentPass(e.target.value); }} placeholder="Min 4 characters" style={{ flex: 1, padding: '13px 16px', fontWeight: 700, fontSize: 14, fontFamily: mf, background: 'transparent', color: T.text }} />
              <button onClick={function () { setShowPass(!showPass); }} className="tap" style={{ padding: '0 14px', display: 'flex', alignItems: 'center' }}>
                {showPass ? <EyeOff style={{ width: 16, height: 16, color: T.muted }} /> : <Eye style={{ width: 16, height: 16, color: T.muted }} />}
              </button>
              {studentPass.length >= 4 && <div style={{ paddingRight: 14 }}><div style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} /></div></div>}
            </div>
          </div>
          <p style={{ fontSize: 10, color: T.sec, fontFamily: ff, marginTop: 8, lineHeight: '1.5' }}>You'll use this ID and password at any LocQar locker terminal.</p>
        </div>

        <div className="fu d5" style={{ borderRadius: 22, padding: 20, background: T.card, border: '1.5px solid ' + T.border, boxShadow: '0 4px 16px rgba(0,0,0,0.04)', marginTop: 0, marginBottom: 8 }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff, marginBottom: 14 }}>WHAT YOU GET</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 10px' }}>
            {plans[0].features.map(function (f, fi) {
              return (<div key={fi} className="flex items-start gap-2"><div style={{ width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: T.blue + '15', marginTop: 1 }}><Check style={{ width: 11, height: 11, color: T.blue, strokeWidth: 3 }} /></div><span style={{ fontSize: 11, fontWeight: 600, color: T.text, fontFamily: ff, lineHeight: '1.4' }}>{f.t}</span></div>);
            })}
          </div>
        </div>

        <div className="fu d5" style={{ borderRadius: 16, padding: 14, background: T.warnBg, border: '1px solid ' + T.warn + '22', marginTop: 0, marginBottom: 8 }}>
          <div className="flex items-start gap-3">
            <Info style={{ width: 16, height: 16, color: T.warn, flexShrink: 0, marginTop: 1 }} />
            <div><p style={{ fontSize: 12, fontWeight: 700, color: T.text, fontFamily: ff, marginBottom: 4 }}>Storage only</p><p style={{ fontSize: 11, color: T.sec, fontFamily: ff, lineHeight: '1.5' }}>This subscription covers personal locker storage only. Delivery, shipping, and other services are billed separately at standard rates.</p></div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3" style={{ marginTop: 10, marginBottom: 6 }}>
          {[{ e: '\u{1F512}', t: 'Secure payment' }, { e: '\u{21A9}\u{FE0F}', t: 'Cancel anytime' }, { e: '\u{1F4B3}', t: 'Storage only' }].map(function (b, i) {
            return (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 20, background: T.fill, border: '1px solid ' + T.border }}><span style={{ fontSize: 10 }}>{b.e}</span><span style={{ fontSize: 9, fontWeight: 700, color: T.sec, fontFamily: ff }}>{b.t}</span></div>);
          })}
        </div>

        {!showPromo && (<button onClick={function () { setShowPromo(true); }} className="tap flex items-center justify-center gap-2 w-full" style={{ padding: '12px 0', marginTop: 6 }}><Gift style={{ width: 14, height: 14, color: T.purple }} /><span style={{ fontSize: 13, fontWeight: 700, color: T.purple, fontFamily: ff }}>Have a promo code?</span></button>)}
        {showPromo && (
          <div className="fu" style={{ marginTop: 10, borderRadius: 18, padding: 16, background: T.purpleBg, border: '1.5px solid ' + T.purple + '22' }}>
            <div className="flex items-center gap-2">
              <div className="flex-1" style={{ borderRadius: 14, overflow: 'hidden', border: '1.5px solid ' + (promoError ? T.accent + '44' : promoApplied ? T.ok + '44' : T.border), background: T.card }}>
                <input type="text" value={promoCode} onChange={function (e) { setPromoCode(e.target.value); setPromoError(''); setPromoApplied(false); setPromoDiscount(0); }} placeholder="Enter code" style={{ width: '100%', padding: '12px 16px', fontWeight: 700, fontSize: 14, fontFamily: mf, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'transparent', color: T.text }} />
              </div>
              <button onClick={applyPromo} disabled={!promoCode.trim()} className="tap" style={{ padding: '12px 20px', borderRadius: 14, fontWeight: 800, fontSize: 13, background: promoCode.trim() ? T.purple : T.fill, color: promoCode.trim() ? '#fff' : T.muted, fontFamily: ff, transition: 'all .2s', whiteSpace: 'nowrap' }}>Apply</button>
            </div>
            {promoError && <p style={{ fontSize: 11, fontWeight: 600, color: T.accent, fontFamily: ff, marginTop: 8 }}>{promoError}</p>}
            {promoApplied && (<div className="flex items-center gap-2 pop" style={{ marginTop: 10 }}><div style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} /></div><span style={{ fontSize: 13, fontWeight: 700, color: T.okDark, fontFamily: ff }}>{promoDiscount}% discount applied!</span></div>)}
          </div>
        )}
      </div>

      {sel && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px 16px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid ' + T.border, boxShadow: '0 -4px 20px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 10, padding: '0 4px' }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 600, color: T.sec, fontFamily: ff }}>{billingLabel} plan</span>
              <div className="flex items-center gap-2" style={{ marginTop: 2 }}>
                {promoApplied && discountAmt > 0 && <span style={{ fontSize: 14, fontWeight: 600, fontFamily: mf, color: T.muted, textDecoration: 'line-through' }}>GH\u20B5{basePrice}</span>}
                <span style={{ fontWeight: 900, fontSize: 22, fontFamily: mf, letterSpacing: '-0.02em', color: promoApplied && discountAmt > 0 ? T.okDark : T.text }}>GH\u20B5{price}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.muted, fontFamily: ff }}>{billingSuffix}</span>
              </div>
            </div>
            {savings > 0 && <div style={{ padding: '6px 12px', borderRadius: 12, background: T.okBg, border: '1px solid ' + T.ok + '22' }}><span style={{ fontSize: 11, fontWeight: 800, color: T.okDark, fontFamily: ff }}>Save GH\u20B5{savings}</span></div>}
          </div>
          <button onClick={handleContinue} disabled={!sel || price <= 0 || !credentialsValid} className="tap" style={{ width: '100%', padding: '16px 0', borderRadius: 16, fontWeight: 800, fontSize: 16, color: '#fff', background: (!sel || price <= 0 || !credentialsValid) ? '#94A3B8' : 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)', fontFamily: ff, boxShadow: (!sel || price <= 0 || !credentialsValid) ? 'none' : '0 8px 24px rgba(59,130,246,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: '-0.01em', opacity: (!sel || price <= 0 || !credentialsValid) ? 0.6 : 1, cursor: (!sel || price <= 0 || !credentialsValid) ? 'not-allowed' : 'pointer' }}>
            {!credentialsValid ? 'Create Login to Continue' : 'Continue to Payment'}
            <ArrowRight style={{ width: 18, height: 18 }} />
          </button>
          <p style={{ textAlign: 'center', fontSize: 10, color: T.muted, marginTop: 8, fontFamily: ff }}>Cancel anytime from settings</p>
        </div>
      )}
    </div>
  );
}
