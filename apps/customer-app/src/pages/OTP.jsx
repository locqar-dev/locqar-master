import React, { useState, useEffect } from "react";
import { T, ff, hf, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import BiometricSetup from "../components/BiometricSetup";
import { BiometricAuth } from "../utils/biometric";
import { ArrowLeft } from "../components/Icons";

export default function OTP(props) {
  var [o, sO] = useState(['', '', '', '', '', '']);
  var [t, sT] = useState(30);
  var [success, setSuccess] = useState(false);
  var [showBiometricSetup, setShowBiometricSetup] = useState(false);

  useEffect(function () { if (t > 0) { var i = setInterval(function () { sT(function (v) { return v - 1; }); }, 1000); return function () { clearInterval(i); }; } }, [t]);
  useEffect(function () { var el = document.getElementById('o-0'); if (el) el.focus(); }, []);

  var hC = function (i, v) {
    if (v.length <= 1 && /^\d*$/.test(v)) {
      var n = o.slice();
      n[i] = v;
      sO(n);
      if (v && i < 5) {
        var el = document.getElementById('o-' + (i + 1));
        if (el) el.focus();
      }
      if (n.every(function (d) { return d; })) {
        setSuccess(true);
        // Check if biometric is available and not already set up
        BiometricAuth.isAvailable().then(function (available) {
          var hasCredentials = BiometricAuth.hasCredentials();
          if (available && !hasCredentials) {
            setTimeout(function () { setShowBiometricSetup(true); }, 600);
          } else {
            setTimeout(props.onOk, 500);
          }
        });
      }
    }
  };

  var handleBiometricComplete = function () {
    setShowBiometricSetup(false);
    props.onOk();
  };

  var handleBiometricSkip = function () {
    setShowBiometricSetup(false);
    props.onOk();
  };
  var hKey = function (i, e) { if (e.key === 'Backspace' && !o[i] && i > 0) { var el = document.getElementById('o-' + (i - 1)); if (el) el.focus(); } };
  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg }}><StatusBar />
      <Toast show={success} emoji={'\u{1F389}'} text="Verified!" />
      {showBiometricSetup && (
        <BiometricSetup
          username={props.phone}
          onClose={handleBiometricSkip}
          onComplete={handleBiometricComplete}
        />
      )}
      <div style={{ padding: '8px 24px' }}><button onClick={props.onBack} className="tap" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1px solid ' + T.border }}><ArrowLeft style={{ width: 18, height: 18 }} /></button></div>
      <div className="flex-1" style={{ padding: '24px 24px 0' }}>
        <div className="fu">
          <div style={{ width: 52, height: 52, borderRadius: 16, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>{'\u{1F510}'}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', fontFamily: hf }}>Verification code</h1>
          <p style={{ fontSize: 14, color: T.sec, marginBottom: 28, fontFamily: ff }}>Sent to <span style={{ fontWeight: 700, color: T.text, fontFamily: mf }}>+233 {props.phone}</span></p>
        </div>
        <div className="flex gap-2 justify-center mb-8 fu d1">
          {o.map(function (d, i) {
            return <input key={i} id={'o-' + i} type="text" inputMode="numeric" maxLength={1} value={d} onChange={function (e) { hC(i, e.target.value); }} onKeyDown={function (e) { hKey(i, e); }} style={{ width: 48, height: 56, borderRadius: 14, textAlign: 'center', fontSize: 24, fontWeight: 700, background: T.fill, border: '2px solid ' + (d ? T.text : 'transparent'), transition: 'all .2s', fontFamily: mf }} />;
          })}
        </div>
        <div className="text-center fu d2">{t > 0 ? <p style={{ fontSize: 13, color: T.sec, fontFamily: ff }}>Resend in <span style={{ fontWeight: 700, color: T.text, fontFamily: mf }}>{t}s</span></p> : <button onClick={function () { sT(30); }} className="tap" style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: ff }}>Resend code</button>}</div>
      </div>
    </div>
  );
}
