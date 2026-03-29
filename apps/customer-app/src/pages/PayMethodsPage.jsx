import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { Shield, ChevronRight } from "../components/Icons";

export default function PayMethodsPage(props) {
  var [showAdd, setShowAdd] = useState(false);
  var [addedToast, setAddedToast] = useState(false);
  var methods = [
    { id: 1, type: 'momo', e: '\u{1F7E1}', name: 'MTN MoMo', detail: '+233 24 \u2022\u2022\u2022\u2022 2521', primary: true },
    { id: 2, type: 'card', e: '\u{1F4B3}', name: 'Visa ending 4821', detail: 'Expires 08/27', primary: false },
    { id: 3, type: 'wallet', e: '\u{1F45B}', name: 'LocQar Wallet', detail: 'GH\u20B5245.00', primary: false }
  ];
  return (
    <div className="min-h-screen pb-6 noscroll overflow-y-auto" style={{ background: T.bg }}><StatusBar />
      <Toast show={addedToast} emoji={'\u{2705}'} text="Payment method added!" />
      <PageHeader title="Payment Methods" onBack={props.onBack} subtitle="Manage how you pay" />
      <div style={{ padding: '0 20px' }}>
        {methods.map(function (m, i) {
          return (
            <div key={m.id} className="fu" style={{ borderRadius: 24, padding: 18, display: 'flex', alignItems: 'center', gap: 16, background: T.card, border: '1.5px solid ' + (m.primary ? T.ok + '40' : T.border), boxShadow: m.primary ? '0 12px 32px rgba(16,185,129,0.1)' : T.shadow, marginBottom: 12, animationDelay: (i * 0.05) + 's' }}>
              <div style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: m.primary ? T.okBg : T.fill, border: '1px solid ' + (m.primary ? T.ok + '20' : T.border) }}>{m.e}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="truncate" style={{ fontWeight: 800, fontSize: 16, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>{m.name}</h3>
                  {m.primary && <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 20, background: T.okBg, color: T.okDark, fontFamily: ff, letterSpacing: '0.04em' }}>PRIMARY</span>}
                </div>
                <p style={{ fontSize: 13, color: T.sec, fontFamily: m.type === 'momo' ? mf : ff, fontWeight: 600, marginTop: 2 }}>{m.detail}</p>
              </div>
              <button className="tap" style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1.5px solid ' + T.border }}><ChevronRight style={{ width: 18, height: 18, color: T.muted }} /></button>
            </div>
          );
        })}

        {/* Add new */}
        <button onClick={function () { setShowAdd(!showAdd); }} className="tap fu d4" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 16, padding: 18, borderRadius: 24, background: T.card, border: '1.5px dashed ' + T.border, marginBottom: 16, boxShadow: T.shadow }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1px solid ' + T.border }}><span style={{ fontSize: 24, color: T.muted }}>+</span></div>
          <div className="text-left">
            <p style={{ fontWeight: 800, fontSize: 16, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>Add Payment Method</p>
            <p style={{ fontSize: 13, color: T.sec, fontFamily: ff, fontWeight: 500, marginTop: 2 }}>MoMo, card, or bank account</p>
          </div>
        </button>

        {showAdd && (
          <div className="fu glass" style={{ borderRadius: 24, padding: 20, marginBottom: 16, boxShadow: T.shadowLg }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', marginBottom: 16, fontFamily: ff, textTransform: 'uppercase' }}>Select Type</p>
            {[
              { e: '\u{1F4F1}', l: 'Mobile Money', d: 'MTN, Vodafone, AirtelTigo' },
              { e: '\u{1F4B3}', l: 'Debit/Credit Card', d: 'Visa, Mastercard' },
              { e: '\u{1F3E6}', l: 'Bank Account', d: 'Direct debit' }
            ].map(function (m, i) {
              return (
                <button key={i} onClick={function () { setAddedToast(true); setShowAdd(false); setTimeout(function () { setAddedToast(false); }, 2000); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 18, background: T.fill, border: '1.5px solid ' + T.border, marginBottom: 8 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: '#fff', border: '1px solid ' + T.border }}>{m.e}</div>
                  <div className="flex-1 text-left">
                    <p style={{ fontWeight: 700, fontSize: 14, fontFamily: ff, color: T.text }}>{m.l}</p>
                    <p style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>{m.d}</p>
                  </div>
                  <ChevronRight style={{ width: 16, height: 16, color: T.muted }} />
                </button>
              );
            })}
          </div>
        )}

        {/* Security note */}
        <div className="flex items-center gap-3 justify-center fu d5" style={{ marginTop: 12 }}>
          <div style={{ width: 24, height: 24, borderRadius: 12, background: T.okBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield style={{ width: 12, height: 12, color: T.ok }} /></div>
          <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, fontWeight: 600 }}>All payment data is encrypted end-to-end</p>
        </div>
      </div>
    </div>
  );
}
