import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { ArrowLeft, Check, ChevronRight, Fingerprint, Info, Lock, RefreshCw, Shield } from "../components/Icons";

export default function SecurityPinPage(props) {
  var [mode, setMode] = useState('menu');
  var [pin, setPin] = useState('');
  var [confirmPin, setConfirmPin] = useState('');
  var [step, setStep] = useState(1);
  var [pinEnabled, setPinEnabled] = useState(true);
  var [biometric, setBiometric] = useState(false);
  var [showSuccess, setShowSuccess] = useState(false);
  var [error, setError] = useState('');
  var existingPin = '1234';

  var handleDot = function (num) {
    if (step === 1) {
      var newPin = pin + num;
      if (newPin.length > 4) return;
      setPin(newPin);
      setError('');
      if (mode === 'verify' && newPin.length === 4) {
        if (newPin === existingPin) {
          setShowSuccess(true);
          setTimeout(function () { props.onBack(); }, 1200);
        } else {
          setError('Incorrect security code');
          setTimeout(function () { setPin(''); setError(''); }, 800);
        }
      } else if (mode === 'set' && newPin.length === 4) {
        setTimeout(function () { setStep(2); }, 300);
      }
    } else {
      var newConfirm = confirmPin + num;
      if (newConfirm.length > 4) return;
      setConfirmPin(newConfirm);
      setError('');
      if (newConfirm.length === 4) {
        if (newConfirm === pin) {
          setPinEnabled(true);
          setShowSuccess(true);
          setTimeout(function () { setMode('menu'); setShowSuccess(false); setPin(''); setConfirmPin(''); setStep(1); }, 1500);
        } else {
          setError('PIN codes do not match');
          setTimeout(function () { setConfirmPin(''); setError(''); }, 800);
        }
      }
    }
  };

  var handleDelete = function () {
    if (step === 1) setPin(pin.slice(0, -1));
    else setConfirmPin(confirmPin.slice(0, -1));
  };

  var currentPin = step === 1 ? pin : confirmPin;

  if (mode === 'menu') {
    return (
      <div className="min-h-screen" style={{ background: T.bg }}><StatusBar />
        <PageHeader title="Security Center" onBack={props.onBack} />
        <Toast show={showSuccess} emoji="🔒" text="Security PIN updated!" />

        <div style={{ padding: '0 20px' }} className="space-y-6">
          <div className="glass p-6 text-center" style={{ borderRadius: 32, background: 'linear-gradient(135deg, ' + T.accent + '08, ' + T.purple + '08)', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
            <div className="pop" style={{ width: 64, height: 64, borderRadius: 22, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}><Shield style={{ width: 32, height: 32, color: T.accent }} /></div>
            <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: ff, color: T.text, letterSpacing: '-0.04em' }}>Account Protection</h2>
            <p style={{ fontSize: 13, color: T.sec, fontFamily: ff, marginTop: 4, fontWeight: 500 }}>Manage your secure access methods</p>
          </div>

          <div className="glass overflow-hidden" style={{ borderRadius: 28, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
            <div className="p-2">
              <div className="flex items-center justify-between p-4" style={{ borderRadius: 20 }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lock style={{ width: 20, height: 20, color: T.text }} /></div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, fontFamily: ff, color: T.text }}>Security PIN</p>
                    <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, fontWeight: 600 }}>Require code for transactions</p>
                  </div>
                </div>
                <button onClick={function () { setPinEnabled(!pinEnabled); }} style={{ width: 52, height: 30, borderRadius: 15, background: pinEnabled ? T.accent : T.fill, padding: 3, transition: 'all .3s', position: 'relative', border: 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', position: 'absolute', top: 3, left: pinEnabled ? 25 : 3, transition: 'all .3s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                </button>
              </div>

              <div style={{ height: 1.5, background: T.fill, margin: '0 16px' }} />

              <button onClick={function () { setMode('set'); setStep(1); }} className="tap w-full flex items-center justify-between p-4" style={{ borderRadius: 20 }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw style={{ width: 20, height: 20, color: T.text }} /></div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, fontFamily: ff, color: T.text }}>Change PIN</p>
                    <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, fontWeight: 600 }}>Update your 4-digit code</p>
                  </div>
                </div>
                <ChevronRight style={{ width: 20, height: 20, color: T.muted }} />
              </button>

              <div style={{ height: 1.5, background: T.fill, margin: '0 16px' }} />

              <div className="flex items-center justify-between p-4" style={{ borderRadius: 20 }}>
                <div className="flex items-center gap-4">
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Fingerprint style={{ width: 20, height: 20, color: T.text }} /></div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 800, fontFamily: ff, color: T.text }}>Biometrics</p>
                    <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, fontWeight: 600 }}>Fingerprint or Face ID</p>
                  </div>
                </div>
                <button onClick={function () { setBiometric(!biometric); }} style={{ width: 52, height: 30, borderRadius: 15, background: biometric ? T.accent : T.fill, padding: 3, transition: 'all .3s', position: 'relative', border: 'none' }}>
                  <div style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', position: 'absolute', top: 3, left: biometric ? 25 : 3, transition: 'all .3s', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                </button>
              </div>
            </div>
          </div>

          <div className="glass p-5 flex gap-4 items-start" style={{ borderRadius: 24, background: T.blueBg, border: '1.5px solid ' + T.blue + '15' }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Info style={{ width: 18, height: 18, color: T.blue }} /></div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: ff }}>Secure Authentication</p>
              <p style={{ fontSize: 12, color: T.blue, fontFamily: ff, marginTop: 2, lineHeight: '1.5', fontWeight: 600 }}>Your PIN is used to authorize wallet withdrawals and locker access. Never share your PIN with anyone.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg }}><StatusBar />
      <PageHeader title={mode === 'set' ? (step === 1 ? 'New PIN' : 'Confirm PIN') : 'Verify Identity'} onBack={function () { if (step === 2) setStep(1); else setMode('menu'); }} />

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="fu text-center mb-10">
          <div className="pop" style={{ width: 72, height: 72, borderRadius: 24, background: T.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            {showSuccess ? <div className="pop" style={{ width: 32, height: 32, borderRadius: 16, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 18, height: 18, color: '#fff', strokeWidth: 3 }} /></div> : <Lock style={{ width: 28, height: 28, color: T.accent }} />}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, fontFamily: ff, color: T.text, letterSpacing: '-0.04em' }}>
            {showSuccess ? 'Secure Success!' : (mode === 'verify' ? 'Verification Required' : (step === 1 ? 'Create 4-Digit PIN' : 'Verify New PIN'))}
          </h2>
          <p style={{ fontSize: 14, color: error ? T.err : T.sec, fontFamily: ff, marginTop: 8, fontWeight: 600 }}>{error || (mode === 'verify' ? 'Enter your current security PIN' : (step === 1 ? 'Choose a code for your account' : 'Type your new PIN again to confirm'))}</p>
        </div>

        <div className="flex gap-5 mb-12">
          {[0, 1, 2, 3].map(function (i) {
            var filled = currentPin.length > i;
            return (
              <div key={i} className="pop" style={{ width: 18, height: 18, borderRadius: 10, border: '2.5px solid ' + (error ? T.err : (filled ? T.accent : T.border)), background: filled ? (error ? T.err : T.accent) : 'transparent', transition: 'all .25s', transform: filled ? 'scale(1.2)' : 'none' }} />
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-y-4 gap-x-8 w-full max-w-xs">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (num) {
            return (
              <button key={num} onClick={function () { handleDot(num + ''); }} className="tap glass" style={{ height: 64, borderRadius: 20, background: '#fff', border: '1.5px solid ' + T.border, fontSize: 24, fontWeight: 900, fontFamily: mf, color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.shadow }}>{num}</button>
            );
          })}
          <div />
          <button onClick={function () { handleDot('0'); }} className="tap glass" style={{ height: 64, borderRadius: 20, background: '#fff', border: '1.5px solid ' + T.border, fontSize: 24, fontWeight: 900, fontFamily: mf, color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: T.shadow }}>0</button>
          <button onClick={handleDelete} className="tap" style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: 15, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowLeft style={{ width: 22, height: 22, color: T.text }} /></div>
          </button>
        </div>
      </div>
    </div>
  );
}
