import React, { useState } from "react";
import { T, ff, hf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import BiometricButton from "../components/BiometricButton";
import Toast from "../components/Toast";
import { Check } from "../components/Icons";

export default function Auth(props) {
  var [p, sP] = useState('');
  var [bioError, setBioError] = useState('');
  var valid = p.replace(/\s/g, '').length >= 7;

  var handleBiometricSuccess = function (username) {
    // Auto-login with biometric
    props.onLogin(username || p);
  };

  var handleBiometricError = function (error) {
    setBioError(error);
    setTimeout(function () { setBioError(''); }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg }}>
      <StatusBar />
      <Toast show={!!bioError} emoji={'⚠️'} text={bioError} />
      <div className="flex-1" style={{ padding: '44px 24px 0' }}>
        <div className="fu">
          <div style={{ width: 52, height: 52, borderRadius: 16, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>{'\u{1F4F1}'}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', fontFamily: hf }}>Welcome back</h1>
          <p style={{ fontSize: 14, lineHeight: '1.65', color: T.sec, marginBottom: 28, fontFamily: ff }}>Enter your phone number to sign in to your LocQar account.</p>
        </div>

        {/* Biometric Login Button */}
        <div className="fu d1">
          <BiometricButton onSuccess={handleBiometricSuccess} onError={handleBiometricError} />
        </div>

        <div className="fu d2 flex gap-3 items-center">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 14, padding: '13px 14px', fontWeight: 600, fontSize: 14, background: T.fill, fontFamily: ff, border: '1.5px solid ' + T.border }}>{'\u{1F1EC}\u{1F1ED}'} +233</div>
          <input type="tel" value={p} onChange={function (e) { sP(e.target.value); }} placeholder="24 000 0000" className="flex-1" style={{ borderRadius: 14, padding: '13px 18px', fontSize: 20, fontWeight: 600, background: T.fill, border: '1.5px solid ' + (valid ? T.ok : 'transparent'), transition: 'border .25s', fontFamily: ff }} />
        </div>
        {valid && <div className="flex items-center gap-2 fu" style={{ marginTop: 12, padding: '0 2px' }}><div style={{ width: 16, height: 16, borderRadius: 8, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 3 }} /></div><p style={{ fontSize: 12, fontWeight: 600, color: T.okDark, fontFamily: ff }}>We'll send a verification code</p></div>}
      </div>
      <div style={{ padding: '0 24px 36px' }}>
        <button onClick={function () { if (valid) props.onLogin(p); }} className="tap" style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 15, background: valid ? T.text : T.fill, color: valid ? '#fff' : T.muted, transition: 'all .25s', fontFamily: ff, boxShadow: valid ? '0 4px 14px rgba(0,0,0,0.15)' : 'none' }}>Sign In</button>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: T.sec, fontFamily: ff }}>Don't have an account? <button onClick={props.onSignup} className="tap" style={{ fontWeight: 700, color: T.accent, fontFamily: ff }}>Sign up</button></p>
      </div>
    </div>
  );
}
