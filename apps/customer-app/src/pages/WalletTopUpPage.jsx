import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import { RotateCw } from "../components/Icons";

export default function WalletTopUpPage(props) {
  var [amount, setAmount] = useState('');
  var [method, setMethod] = useState('momo');
  var [loading, setLoading] = useState(false);
  var [done, setDone] = useState(false);
  var presets = [10, 20, 50, 100, 200, 500];
  var methods = [
    { id: 'momo', e: '📱', l: 'MTN MoMo', d: '••8521', bg: T.warnBg, c: T.warn },
    { id: 'voda', e: '📲', l: 'Vodafone Cash', d: '••4477', bg: T.blueBg, c: T.blue },
    { id: 'card', e: '💳', l: 'Visa Debit', d: '••3291', bg: T.purpleBg, c: T.purple }
  ];

  var handleTopUp = function () {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setTimeout(function () { setLoading(false); setDone(true); }, 1800);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg }}><StatusBar />
        <div className="fu text-center" style={{ padding: 40 }}>
          <div className="pop" style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, fontFamily: ff, marginBottom: 12, color: T.text, letterSpacing: '-0.03em' }}>Top-Up Successful!</h1>
          <div style={{ padding: '20px', borderRadius: 24, background: T.okBg, border: '1.5px solid ' + T.ok + '20', marginBottom: 24, display: 'inline-block' }}>
            <p style={{ fontSize: 38, fontWeight: 900, fontFamily: mf, color: T.okDark, letterSpacing: '-0.04em' }}>+GH₵{parseFloat(amount).toFixed(2)}</p>
          </div>
          <p style={{ fontSize: 14, color: T.sec, fontFamily: ff, marginBottom: 32, fontWeight: 500 }}>Funds are now available in your wallet.</p>
          <button onClick={function () { if (props.onBack) props.onBack(); }} className="tap" style={{ padding: '16px 48px', borderRadius: 18, fontWeight: 800, fontSize: 16, background: T.text, color: '#fff', fontFamily: ff, boxShadow: T.shadowLg }}>Return to Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 noscroll overflow-y-auto" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="Top Up" onBack={props.onBack} subtitle="Add funds to your wallet" />
      <div style={{ padding: '0 20px' }}>
        {/* Amount input */}
        <div className="fu glass" style={{ borderRadius: 32, padding: 32, border: '1.5px solid ' + T.border, marginBottom: 24, textAlign: 'center', boxShadow: T.shadow }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.12em', marginBottom: 16, fontFamily: ff, textTransform: 'uppercase' }}>Amount to Add</p>
          <div className="flex items-center justify-center gap-3">
            <span style={{ fontSize: 28, fontWeight: 900, color: T.muted, fontFamily: mf }}>GH₵</span>
            <input type="number" value={amount} onChange={function (e) { setAmount(e.target.value); }} placeholder="0.00" style={{ fontSize: 48, fontWeight: 900, fontFamily: mf, color: T.text, background: 'transparent', border: 'none', width: 200, textAlign: 'center', letterSpacing: '-0.04em', outline: 'none' }} />
          </div>
        </div>

        {/* Presets */}
        <div className="fu d1" style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.12em', marginBottom: 12, fontFamily: ff, textTransform: 'uppercase' }}>Quick Select</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {presets.map(function (p) {
              var sel = amount === '' + p;
              return <button key={p} onClick={function () { setAmount('' + p); }} className="tap" style={{ padding: '14px 0', borderRadius: 16, fontWeight: 800, fontSize: 15, fontFamily: mf, background: sel ? T.text : T.card, color: sel ? '#fff' : T.text, border: '1.5px solid ' + (sel ? T.text : T.border), boxShadow: sel ? T.shadowMd : 'none', transition: 'all .2s' }}>{p}</button>;
            })}
          </div>
        </div>

        {/* Payment method */}
        <div className="fu d2">
          <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.12em', marginBottom: 12, fontFamily: ff, textTransform: 'uppercase' }}>Payment Source</p>
          <div className="glass" style={{ borderRadius: 28, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
            {methods.map(function (m, i) {
              var sel = method === m.id;
              return (
                <button key={m.id} onClick={function () { setMethod(m.id); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: sel ? m.bg + '30' : 'transparent', borderBottom: i < methods.length - 1 ? '1.5px solid ' + T.fill : 'none' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: m.bg, border: '1px solid ' + m.c + '15' }}>{m.e}</div>
                  <div className="flex-1 text-left">
                    <p style={{ fontSize: 15, fontWeight: 800, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>{m.l}</p>
                    <p style={{ fontSize: 12, color: T.sec, fontFamily: mf, marginTop: 2, fontWeight: 600 }}>{m.d}</p>
                  </div>
                  <div style={{ width: 24, height: 24, borderRadius: 12, border: '2.5px solid ' + (sel ? m.c : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .25s' }}>
                    {sel && <div className="pop" style={{ width: 12, height: 12, borderRadius: 6, background: m.c }} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="glass fixed bottom-0 left-0 right-0 z-50" style={{ padding: 16, borderTop: '1.5px solid ' + T.border }}>
        <button onClick={handleTopUp} disabled={!amount || parseFloat(amount) <= 0 || loading} className="tap" style={{ width: '100%', padding: '16px 0', borderRadius: 18, fontWeight: 800, fontSize: 16, background: amount && parseFloat(amount) > 0 ? T.gradientAccent : T.fill, color: amount && parseFloat(amount) > 0 ? '#fff' : T.muted, transition: 'all .3s', fontFamily: ff, boxShadow: amount && parseFloat(amount) > 0 ? '0 12px 32px ' + T.accent + '33' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {loading ? <RotateCw style={{ width: 18, height: 18, animation: 'spin 1s linear infinite' }} /> : null}
          {loading ? 'Processing...' : amount && parseFloat(amount) > 0 ? 'Top Up GH₵' + parseFloat(amount).toFixed(2) : 'Enter Amount'}
        </button>
      </div>
    </div>
  );
}
