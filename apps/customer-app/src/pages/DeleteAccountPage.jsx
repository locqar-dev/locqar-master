import React, { useState } from "react";
import { T, ff } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import { Check, Info, X } from "../components/Icons";

export default function DeleteAccountPage(props) {
  var [step, setStep] = useState(1);
  var [reason, setReason] = useState(null);
  var [confirmed, setConfirmed] = useState(false);
  var [deleting, setDeleting] = useState(false);
  var [deleted, setDeleted] = useState(false);

  var reasons = [
    { id: 'unused', e: '💤', l: 'No longer using LocQar' },
    { id: 'alt', e: '🔄', l: 'Switching to another app' },
    { id: 'privacy', e: '🛡️', l: 'Data privacy concerns' },
    { id: 'cost', e: '💰', l: 'Service is too expensive' },
    { id: 'exp', e: '😤', l: 'Unpleasant experience' },
    { id: 'other', e: '💬', l: 'Other reason' }
  ];

  var doDelete = function () {
    setDeleting(true);
    setTimeout(function () { setDeleted(true); setDeleting(false); }, 2500);
  };

  if (deleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ background: T.bg }}><StatusBar />
        <div className="fu text-center glass p-8" style={{ borderRadius: 32, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
          <div className="pop" style={{ fontSize: 64, marginBottom: 20 }}>👋</div>
          <h1 style={{ fontSize: 24, fontWeight: 900, fontFamily: ff, color: T.text, letterSpacing: '-0.04em' }}>Account Closed</h1>
          <p style={{ fontSize: 14, color: T.sec, fontFamily: ff, marginTop: 8, lineHeight: '1.6', fontWeight: 500 }}>We're sad to see you go. Your data is scheduled for permanent deletion within 30 days.</p>
          <button onClick={function () { props.onLogout(); }} className="tap w-full mt-8" style={{ padding: '18px 0', borderRadius: 22, fontWeight: 900, fontSize: 16, background: T.text, color: '#fff', fontFamily: ff, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>Exit Application</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ paddingBottom: 120, background: T.bg }}><StatusBar />
      <PageHeader title="Delete Account" onBack={props.onBack} />

      <div style={{ padding: '0 20px' }} className="space-y-6">
        <div className="fu glass p-6" style={{ borderRadius: 28, background: 'linear-gradient(135deg, ' + T.accentBg + ', #FFF1F2)', border: '1.5px solid ' + T.accent + '20', boxShadow: T.shadow }}>
          <div className="flex items-start gap-4">
            <div className="pop" style={{ width: 52, height: 52, borderRadius: 18, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, boxShadow: '0 8px 16px ' + T.accent + '15' }}>⚠️</div>
            <div>
              <h3 style={{ fontWeight: 900, fontSize: 18, color: T.accent, fontFamily: ff, letterSpacing: '-0.02em' }}>Irreversible Action</h3>
              <p style={{ fontSize: 13, color: T.accent, fontFamily: ff, lineHeight: '1.5', marginTop: 4, fontWeight: 600, opacity: 0.85 }}>Your transaction history, wallet balance, and reward points will be permanently erased.</p>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="fu space-y-4">
            <p style={{ fontSize: 12, fontWeight: 800, color: T.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: ff }}>Why are you leaving?</p>
            <div className="grid grid-cols-1 gap-3">
              {reasons.map(function (r) {
                var sel = reason === r.id;
                return (
                  <button key={r.id} onClick={function () { setReason(r.id); }} className="tap text-left flex items-center gap-4 glass" style={{ padding: 16, borderRadius: 22, background: sel ? T.text : '#fff', color: sel ? '#fff' : T.text, transition: 'all .25s', border: '1.5px solid ' + (sel ? T.text : T.border), boxShadow: sel ? T.shadowMd : T.shadow }}>
                    <div className="pop" style={{ width: 44, height: 44, borderRadius: 14, background: sel ? 'rgba(255,255,255,0.15)' : T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{r.e}</div>
                    <span style={{ fontWeight: 800, fontSize: 15, fontFamily: ff }}>{r.l}</span>
                    {sel && <div className="ml-auto" style={{ width: 22, height: 22, borderRadius: 11, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fu space-y-6">
            <div className="glass p-6 space-y-4" style={{ borderRadius: 28, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
              <h3 style={{ fontSize: 16, fontWeight: 900, fontFamily: ff, color: T.text }}>Final Confirmation</h3>
              <div className="space-y-3">
                <label className="flex items-start gap-4 p-4 glass pointer" style={{ borderRadius: 20, background: confirmed ? T.accentBg : T.fill, transition: 'all .2s' }}>
                  <input type="checkbox" checked={confirmed} onChange={function (e) { setConfirmed(e.target.checked); }} style={{ width: 22, height: 22, borderRadius: 8, accentColor: T.accent, marginTop: 2, appearance: 'none', border: '2px solid ' + T.border, background: '#fff' }} />
                  <p style={{ fontSize: 13, color: T.sec, fontFamily: ff, fontWeight: 600, lineHeight: '1.5' }}>I understand that all my data will be permanently deleted and cannot be recovered.</p>
                </label>
              </div>
            </div>

            <div className="glass p-5 flex gap-4 items-start" style={{ borderRadius: 24, background: T.blueBg, border: '1.5px solid ' + T.blue + '15' }}>
              <Info style={{ width: 18, height: 18, color: T.blue, flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, color: T.blue, fontFamily: ff, lineHeight: '1.6', fontWeight: 600 }}>We'll keep your account for 30 days in case you change your mind. Simply log back in to reactivate.</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass fixed bottom-0 left-0 right-0 p-5 pb-8" style={{ borderTop: '1.5px solid ' + T.border }}>
        {step === 1 ? (
          <button disabled={!reason} onClick={function () { setStep(2); }} className="tap w-full" style={{ padding: '18px 0', borderRadius: 22, fontWeight: 900, fontSize: 16, background: reason ? T.text : T.fill, color: reason ? '#fff' : T.muted, fontFamily: ff, boxShadow: reason ? '0 12px 24px rgba(0,0,0,0.1)' : 'none', border: 'none' }}>Continue to Deletion</button>
        ) : (
          <button disabled={!confirmed || deleting} onClick={doDelete} className="tap w-full flex items-center justify-center gap-3" style={{ padding: '18px 0', borderRadius: 22, fontWeight: 900, fontSize: 16, background: confirmed ? T.accent : T.fill, color: confirmed ? '#fff' : T.muted, fontFamily: ff, boxShadow: confirmed ? '0 12px 24px ' + T.accent + '44' : 'none', border: 'none' }}>
            {deleting ? <div style={{ width: 20, height: 20, borderRadius: 10, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.6s linear infinite' }} /> : (confirmed ? 'Confirm Permanent Deletion' : 'Accept Terms to Delete')}
          </button>
        )}
      </div>
    </div>
  );
}
