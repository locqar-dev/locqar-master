import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { ChevronDown, CreditCard, Gift, Check, Shield, Wallet } from "../components/Icons";

export default function PaymentPage(props) {
  var [method, setMethod] = useState(null);
  var [momoProvider, setMomoProvider] = useState(null);
  var [momoNum, setMomoNum] = useState('');
  var [cardNum, setCardNum] = useState('');
  var [cardExp, setCardExp] = useState('');
  var [cardCvv, setCardCvv] = useState('');
  var [cardName, setCardName] = useState('');
  var [promo, setPromo] = useState('');
  var [promoApplied, setPromoApplied] = useState(false);
  var [promoDiscount, setPromoDiscount] = useState(0);
  var [processing, setProcessing] = useState(false);
  var [showSuccess, setShowSuccess] = useState(false);
  var [showDetails, setShowDetails] = useState(true);

  var amt = parseFloat(props.amount || '0');
  var discount = promoApplied ? promoDiscount : 0;
  var fee = amt >= 20 ? 0 : 1.50;
  var total = Math.max(0, amt - discount + fee).toFixed(2);

  var momoProviders = [
    { id: 'mtn', e: '🟡', n: 'MTN MoMo', d: 'Instant', bg: '#FEF3C7', c: '#D97706' },
    { id: 'voda', e: '🔴', n: 'Vodafone', d: 'Instant', bg: '#FEE2E2', c: '#DC2626' },
    { id: 'air', e: '🔵', n: 'AirtelTigo', d: '~1 min', bg: '#DBEAFE', c: '#2563EB' }
  ];

  var methods = [
    { id: 'momo', e: '📱', n: 'Mobile Money', d: 'MTN, Vodafone, AirtelTigo', pop: true, bg: T.warnBg, c: T.warn },
    { id: 'card', e: '💳', n: 'Credit/Debit Card', d: 'Visa, Mastercard', bg: T.blueBg, c: T.blue },
    { id: 'wallet', e: '👛', n: 'LocQar Wallet', d: 'Balance: GH₵245.00', bg: T.okBg, c: T.ok }
  ];

  var canPay = (method === 'momo' && momoProvider && momoNum.replace(/\s/g, '').length >= 9) ||
    (method === 'card' && cardNum.replace(/\s/g, '').length >= 12 && cardExp.length >= 4 && cardCvv.length >= 3) ||
    (method === 'wallet');

  var handleApplyPromo = function () {
    if (promo.toUpperCase() === 'LOCQAR10') { setPromoApplied(true); setPromoDiscount(amt * 0.1); }
    else if (promo.toUpperCase() === 'FREE') { setPromoApplied(true); setPromoDiscount(amt); }
    else { setPromoApplied(false); setPromoDiscount(0); }
  };

  var handlePay = function () {
    setProcessing(true);
    setTimeout(function () {
      setProcessing(false);
      setShowSuccess(true);
      setTimeout(function () { setShowSuccess(false); if (props.onSuccess) props.onSuccess(); }, 1500);
    }, 2000);
  };

  var formatCard = function (v) { var d = v.replace(/\D/g, '').slice(0, 16); return d.replace(/(\d{4})(?=\d)/g, '$1 '); };
  var formatExp = function (v) { var d = v.replace(/\D/g, '').slice(0, 4); if (d.length > 2) return d.slice(0, 2) + '/' + d.slice(2); return d; };

  return (
    <div className="min-h-screen pb-32 noscroll overflow-y-auto" style={{ background: T.bg }}><StatusBar />
      <Toast show={showSuccess} emoji="✅" text="Payment successful!" />

      {/* Processing overlay */}
      {processing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)' }}>
          <div className="fu glass" style={{ borderRadius: 32, padding: 40, background: '#fff', textAlign: 'center', width: 280, boxShadow: T.shadowLg }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, border: '4px solid ' + T.fill, borderTopColor: T.accent, margin: '0 auto 20px', animation: 'spin 0.8s linear infinite' }} />
            <h3 style={{ fontSize: 18, fontWeight: 900, fontFamily: ff, marginBottom: 8, color: T.text, letterSpacing: '-0.02em' }}>Processing</h3>
            <p style={{ fontSize: 13, color: T.sec, fontFamily: ff, lineHeight: 1.5 }}>{method === 'momo' ? 'Check your phone for the approval prompt' : 'Verifying your transaction...'}</p>
            {method === 'momo' && <p style={{ fontSize: 11, color: T.muted, fontFamily: ff, marginTop: 10, lineHeight: 1.5 }}>Didn't get a prompt? Wait 30 seconds, then try again or use a different payment method.</p>}
          </div>
        </div>
      )}

      <PageHeader title="Payment" onBack={props.onBack} subtitle={props.label || 'Complete your order'} />

      <div style={{ padding: '0 20px' }}>
        {/* Total Card */}
        <div className="fu" style={{ borderRadius: 28, padding: 24, background: T.gradient, position: 'relative', overflow: 'hidden', marginBottom: 16, boxShadow: T.shadowLg }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 140, height: 140, borderRadius: 70, background: 'rgba(255,255,255,0.06)', filter: 'blur(20px)' }} />
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: ff, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>Amount to Pay</p>
              <h1 style={{ fontSize: 42, fontWeight: 900, color: '#fff', fontFamily: mf, letterSpacing: '-0.04em', lineHeight: 1 }}>GH₵{total}</h1>
            </div>
            <button onClick={function () { setShowDetails(!showDetails); }} className="tap" style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronDown style={{ width: 18, height: 18, color: '#fff', transform: showDetails ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
            </button>
          </div>
          {showDetails && (
            <div className="fi" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              {(props.items || []).map(function (it, i) {
                return (
                  <div key={i} className="flex items-center justify-between" style={{ marginBottom: 10 }}>
                    <div className="flex items-center gap-2"><span style={{ fontSize: 13 }}>{it.e || '📦'}</span><span style={{ fontSize: 13, fontFamily: ff, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{it.l || 'Item'}</span></div>
                    <span style={{ fontSize: 13, fontWeight: 800, fontFamily: mf, color: '#fff' }}>{it.v}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="flex items-center justify-between"><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: ff, fontWeight: 600 }}>Subtotal</span><span style={{ fontSize: 11, fontWeight: 700, fontFamily: mf, color: 'rgba(255,255,255,0.8)' }}>GH₵{amt.toFixed(2)}</span></div>
                {promoApplied && <div className="flex items-center justify-between"><span style={{ fontSize: 11, color: T.ok, fontFamily: ff, fontWeight: 700 }}>Discount</span><span style={{ fontSize: 11, fontWeight: 700, fontFamily: mf, color: T.ok }}>-GH₵{discount.toFixed(2)}</span></div>}
                <div className="flex items-center justify-between"><span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: ff, fontWeight: 600 }}>Service fee</span><span style={{ fontSize: 11, fontWeight: 700, fontFamily: mf, color: fee === 0 ? T.ok : 'rgba(255,255,255,0.8)' }}>{fee === 0 ? 'FREE' : 'GH₵' + fee.toFixed(2)}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Promo code */}
        <div className="fu d1" style={{ marginBottom: 24 }}>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-3" style={{ borderRadius: 18, padding: '12px 16px', background: T.fill, border: '1.5px solid ' + (promoApplied ? T.ok + '50' : T.border), transition: 'all .3s' }}>
              <Gift style={{ width: 16, height: 16, color: promoApplied ? T.ok : T.muted }} />
              <input type="text" value={promo} onChange={function (e) { setPromo(e.target.value); setPromoApplied(false); }} placeholder="Promo code" className="flex-1" style={{ background: 'transparent', fontSize: 14, fontWeight: 700, fontFamily: ff, outline: 'none' }} />
              {promoApplied && <Check style={{ width: 14, height: 14, color: T.ok, strokeWidth: 3 }} />}
            </div>
            <button onClick={handleApplyPromo} className="tap" style={{ padding: '0 20px', borderRadius: 18, fontWeight: 800, fontSize: 13, background: promo.length > 0 ? T.text : T.fill, color: promo.length > 0 ? '#fff' : T.muted, transition: 'all .3s', fontFamily: ff, border: promo.length > 0 ? 'none' : '1.5px solid ' + T.border }}>Apply</button>
          </div>
        </div>

        {/* Payment methods */}
        <div className="fu d2">
          <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.1em', marginBottom: 12, fontFamily: ff, textTransform: 'uppercase' }}>Select Payment Method</p>
          {methods.map(function (m) {
            var sel = method === m.id;
            return (
              <div key={m.id} style={{ marginBottom: 10 }}>
                <button onClick={function () { setMethod(sel ? null : m.id); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: 18, borderRadius: 24, background: sel ? T.text : T.card, color: sel ? '#fff' : T.text, transition: 'all .3s', border: '1.5px solid ' + (sel ? T.text : T.border), boxShadow: sel ? T.shadowLg : T.shadow }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: sel ? 'rgba(255,255,255,0.1)' : m.bg, border: sel ? 'none' : '1px solid ' + T.border }}>{m.e}</div>
                  <div className="flex-1 text-left">
                    <p style={{ fontWeight: 800, fontSize: 16, fontFamily: ff, letterSpacing: '-0.01em' }}>{m.n}</p>
                    <p style={{ fontSize: 12, opacity: 0.6, fontFamily: ff, fontWeight: 500 }}>{m.d}</p>
                  </div>
                  <div style={{ width: 22, height: 22, borderRadius: 11, border: '2px solid ' + (sel ? '#fff' : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {sel && <div style={{ width: 12, height: 12, borderRadius: 6, background: '#fff' }} />}
                  </div>
                </button>

                {/* MoMo Options */}
                {sel && m.id === 'momo' && (
                  <div className="fu glass" style={{ borderRadius: 24, padding: 20, marginTop: 10, border: '1.5px solid ' + T.border, boxShadow: T.shadowLg }}>
                    <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', marginBottom: 12, fontFamily: ff }}>MOBILE OPERATOR</p>
                    <div className="flex gap-2" style={{ marginBottom: 16 }}>
                      {momoProviders.map(function (p) {
                        var pSel = momoProvider === p.id;
                        return (
                          <button key={p.id} onClick={function () { setMomoProvider(p.id); }} className="tap flex-1" style={{ padding: '12px 8px', borderRadius: 16, background: pSel ? T.text : T.fill, color: pSel ? '#fff' : T.text, transition: 'all .25s', border: pSel ? 'none' : '1px solid ' + T.border }}>
                            <div style={{ fontSize: 20, marginBottom: 4 }}>{p.e}</div>
                            <p style={{ fontSize: 11, fontWeight: 800, fontFamily: ff }}>{p.n.split(' ')[0]}</p>
                          </button>
                        );
                      })}
                    </div>
                    <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>PHONE NUMBER</p>
                    <div className="flex items-center gap-3" style={{ borderRadius: 16, padding: '14px 18px', background: T.fill, border: '1.5px solid ' + (momoNum.replace(/\s/g, '').length >= 9 ? T.ok + '50' : T.border), transition: 'all .3s' }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: T.muted, fontFamily: ff }}>+233</span>
                      <input type="tel" value={momoNum} onChange={function (e) { setMomoNum(e.target.value); }} placeholder="24 000 0000" className="flex-1" style={{ background: 'transparent', fontWeight: 800, fontSize: 16, fontFamily: mf, color: T.text, outline: 'none' }} />
                    </div>
                  </div>
                )}

                {/* Card Options */}
                {sel && m.id === 'card' && (
                  <div className="fu glass" style={{ borderRadius: 24, padding: 20, marginTop: 10, border: '1.5px solid ' + T.border, boxShadow: T.shadowLg }}>
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>CARD NUMBER</p>
                      <div className="flex items-center gap-3" style={{ borderRadius: 16, padding: '14px 18px', background: T.fill, border: '1.5px solid ' + T.border }}>
                        <CreditCard style={{ width: 18, height: 18, color: T.muted }} />
                        <input type="text" value={cardNum} onChange={function (e) { setCardNum(formatCard(e.target.value)); }} placeholder="0000 0000 0000 0000" className="flex-1" style={{ background: 'transparent', fontWeight: 800, fontSize: 16, fontFamily: mf, letterSpacing: '0.05em', color: T.text, outline: 'none' }} />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>EXPIRY</p>
                        <input type="text" value={cardExp} onChange={function (e) { setCardExp(formatExp(e.target.value)); }} placeholder="MM/YY" style={{ width: '100%', borderRadius: 16, padding: '14px 18px', background: T.fill, fontWeight: 800, fontSize: 15, fontFamily: mf, textAlign: 'center', border: '1.5px solid ' + T.border, color: T.text, outline: 'none' }} />
                      </div>
                      <div className="flex-1">
                        <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>CVV</p>
                        <input type="password" value={cardCvv} onChange={function (e) { setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 3)); }} placeholder="•••" maxLength={3} style={{ width: '100%', borderRadius: 16, padding: '14px 18px', background: T.fill, fontWeight: 800, fontSize: 15, fontFamily: mf, textAlign: 'center', border: '1.5px solid ' + T.border, color: T.text, outline: 'none' }} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Wallet Options */}
                {sel && m.id === 'wallet' && (
                  <div className="fu glass" style={{ borderRadius: 24, padding: 20, marginTop: 10, border: '1.5px solid ' + T.border, boxShadow: T.shadowLg }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: T.okBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Wallet style={{ width: 20, height: 20, color: T.ok }} /></div>
                        <div>
                          <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, fontWeight: 600 }}>Available Balance</p>
                          <p style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: mf }}>GH₵245.00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Security note */}
        <div className="fu d3 flex items-center gap-2 justify-center" style={{ marginTop: 24 }}>
          <Shield style={{ width: 14, height: 14, color: T.muted }} /><p style={{ fontSize: 11, color: T.muted, fontFamily: ff, fontWeight: 600 }}>Secure 256-bit encrypted payment</p>
        </div>
      </div>

      {/* Pay button */}
      <div className="glass fixed bottom-0 left-0 right-0 z-50 shadow-2xl" style={{ padding: '20px 20px 40px', borderTop: '1.5px solid ' + T.border }}>
        <button onClick={function () { if (canPay && !processing) handlePay(); }} className="tap" style={{ width: '100%', padding: '18px 0', borderRadius: 20, fontWeight: 900, fontSize: 16, background: canPay ? T.accent : T.fill, color: canPay ? '#fff' : T.muted, transition: 'all .3s', fontFamily: ff, boxShadow: canPay ? '0 12px 24px ' + T.accent + '44' : 'none', border: canPay ? 'none' : '1.5px solid ' + T.border, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {processing ? <div style={{ width: 20, height: 20, borderRadius: 10, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.6s linear infinite' }} /> : (canPay ? <span>Pay GH₵{total}</span> : <span>Select Method</span>)}
        </button>
      </div>
    </div>
  );
}
