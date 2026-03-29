import React, { useState } from "react";
import { T, ff, hf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import { ArrowLeft, ArrowRight, Check, Shield } from "../components/Icons";

export default function Signup(props) {
  var [step, setStep] = useState(1);
  var [name, setName] = useState('');
  var [email, setEmail] = useState('');
  var [phone, setPhone] = useState('');
  var [agreed, setAgreed] = useState(false);
  var [focusField, setFocusField] = useState(null);

  var nameValid = name.trim().length >= 2;
  var emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  var phoneValid = phone.replace(/\s/g, '').length >= 9;
  var step1Valid = nameValid && emailValid;
  var step2Valid = phoneValid && agreed;

  var fieldStyle = function (field, valid) {
    return {
      width: '100%', borderRadius: 14, padding: '13px 16px', fontSize: 15, fontWeight: 600,
      background: T.fill, fontFamily: ff,
      border: '1.5px solid ' + (valid && focusField !== field ? T.ok + '55' : focusField === field ? T.text : T.border),
      transition: 'border .25s, box-shadow .25s',
      boxShadow: focusField === field ? '0 0 0 3px ' + T.text + '08' : 'none'
    };
  };

  var labelStyle = { fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 7, display: 'block', fontFamily: ff };

  var progress = step === 1 ? (nameValid && emailValid ? 50 : nameValid || emailValid ? 25 : 0) : (phoneValid && agreed ? 100 : phoneValid || agreed ? 75 : 50);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg }}><StatusBar />
      <div style={{ padding: '8px 24px 0' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 6 }}>
          <button onClick={function () { step > 1 ? setStep(1) : props.onBack(); }} className="tap" style={{ width: 40, height: 40, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1px solid ' + T.border }}><ArrowLeft style={{ width: 18, height: 18 }} /></button>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: '0.06em', fontFamily: ff }}>STEP {step} OF 2</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, fontFamily: ff }}>{progress}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: T.fill, marginTop: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, width: progress + '%', background: progress === 100 ? T.ok : 'linear-gradient(90deg, ' + T.accent + ', ' + T.accentLight + ')', transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1" style={{ padding: '20px 24px 0' }}>
        {step === 1 && (
          <div className="fu">
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, ' + T.purpleBg + ', ' + T.blueBg + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 18, border: '1px solid ' + T.purple + '15' }}>{'\u{1F464}'}</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.03em', fontFamily: hf }}>Create your account</h1>
            <p style={{ fontSize: 14, lineHeight: '1.65', color: T.sec, marginBottom: 28, fontFamily: ff }}>Let's start with the basics. We just need your name and email.</p>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <input type="text" value={name} onChange={function (e) { setName(e.target.value); }} onFocus={function () { setFocusField('name'); }} onBlur={function () { setFocusField(null); }} placeholder="e.g. Kwame Asante" style={fieldStyle('name', nameValid)} autoFocus />
                {nameValid && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}><div className="fi" style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} /></div></div>}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} onFocus={function () { setFocusField('email'); }} onBlur={function () { setFocusField(null); }} placeholder="you@example.com" style={fieldStyle('email', emailValid)} />
                {emailValid && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}><div className="fi" style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} /></div></div>}
              </div>
              {email.length > 0 && !emailValid && <p className="fi" style={{ fontSize: 11, fontWeight: 600, color: T.accent, marginTop: 6, fontFamily: ff }}>Enter a valid email address</p>}
            </div>

            <div style={{ borderRadius: 16, padding: 14, background: T.fill, border: '1px solid ' + T.border, marginTop: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 10, fontFamily: ff }}>WHAT YOU GET</p>
              {[{ e: '\u{1F4E6}', t: 'Send & receive packages via phone number' }, { e: '\u{1F5C4}\u{FE0F}', t: 'Rent secure smart lockers 24/7' }, { e: '\u{1F381}', t: 'Earn reward points on every delivery' }].map(function (b, i) {
                return (
                  <div key={i} className="flex items-center gap-3" style={{ marginBottom: i < 2 ? 8 : 0 }}>
                    <span style={{ fontSize: 15 }}>{b.e}</span>
                    <span style={{ fontSize: 12, color: T.sec, fontFamily: ff, lineHeight: '1.4' }}>{b.t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fu">
            <div style={{ width: 56, height: 56, borderRadius: 18, background: 'linear-gradient(135deg, ' + T.accentBg + ', ' + T.warnBg + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 18, border: '1px solid ' + T.accent + '15' }}>{'\u{1F4F1}'}</div>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.03em', fontFamily: hf }}>Your LocQar address</h1>
            <p style={{ fontSize: 14, lineHeight: '1.65', color: T.sec, marginBottom: 28, fontFamily: ff }}>This phone number becomes your delivery address. People send packages to you using it.</p>

            <div className="flex items-center gap-3" style={{ borderRadius: 14, padding: '12px 14px', background: T.blueBg, border: '1px solid ' + T.blue + '22', marginBottom: 20 }}>
              <span style={{ fontSize: 18 }}>{'\u{1F44B}'}</span>
              <p style={{ fontSize: 13, color: T.blue, fontFamily: ff }}>Welcome, <span style={{ fontWeight: 700 }}>{name.split(' ')[0]}</span>! Just one more step.</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>PHONE NUMBER</label>
              <div className="flex gap-3 items-center">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderRadius: 14, padding: '13px 14px', fontWeight: 600, fontSize: 14, background: T.fill, fontFamily: ff, border: '1.5px solid ' + T.border, flexShrink: 0 }}>{'\u{1F1EC}\u{1F1ED}'} +233</div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="tel" value={phone} onChange={function (e) { setPhone(e.target.value); }} onFocus={function () { setFocusField('phone'); }} onBlur={function () { setFocusField(null); }} placeholder="24 000 0000" style={Object.assign({}, fieldStyle('phone', phoneValid), { fontSize: 20 })} autoFocus />
                  {phoneValid && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}><div className="fi" style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} /></div></div>}
                </div>
              </div>
              {phoneValid && <p className="flex items-center gap-2 fi" style={{ marginTop: 8 }}><div style={{ width: 16, height: 16, borderRadius: 8, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 3 }} /></div><span style={{ fontSize: 12, fontWeight: 600, color: T.okDark, fontFamily: ff }}>We'll send a verification code via SMS</span></p>}
            </div>

            <button onClick={function () { setAgreed(!agreed); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, padding: 14, borderRadius: 14, background: agreed ? T.okBg : '#fff', border: '1.5px solid ' + (agreed ? T.ok + '33' : T.border), transition: 'all .2s', textAlign: 'left' }}>
              <div style={{ width: 22, height: 22, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, background: agreed ? T.ok : T.fill, border: agreed ? 'none' : '2px solid ' + T.border, transition: 'all .2s' }}>
                {agreed && <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} />}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: T.text, fontFamily: ff, lineHeight: '1.5' }}>I agree to LocQar's <span onClick={function (e) { e.stopPropagation(); if (props.onNav) props.onNav('terms'); }} style={{ color: T.accent, textDecoration: 'underline' }}>Terms of Service</span> and <span onClick={function (e) { e.stopPropagation(); if (props.onNav) props.onNav('privacy'); }} style={{ color: T.accent, textDecoration: 'underline' }}>Privacy Policy</span></p>
                <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, marginTop: 3 }}>You can opt out anytime from settings</p>
              </div>
            </button>

            <div className="flex items-center gap-2 justify-center" style={{ marginTop: 20 }}>
              <Shield style={{ width: 12, height: 12, color: T.muted }} />
              <p style={{ fontSize: 10, color: T.muted, fontFamily: ff }}>Your data is encrypted and never shared</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '16px 24px 36px' }}>
        <button onClick={function () { if (step === 1 && step1Valid) setStep(2); else if (step === 2 && step2Valid) props.onSignup(phone, name, email); }} className="tap" style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 15, background: (step === 1 ? step1Valid : step2Valid) ? T.text : T.fill, color: (step === 1 ? step1Valid : step2Valid) ? '#fff' : T.muted, transition: 'all .25s', fontFamily: ff, boxShadow: (step === 1 ? step1Valid : step2Valid) ? '0 4px 14px rgba(0,0,0,0.15)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {step === 1 ? 'Continue' : 'Create Account'}
          {(step === 1 ? step1Valid : step2Valid) && <ArrowRight style={{ width: 16, height: 16 }} />}
        </button>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: T.sec, fontFamily: ff }}>Already have an account? <button onClick={props.onLogin} className="tap" style={{ fontWeight: 700, color: T.accent, fontFamily: ff }}>Sign in</button></p>
      </div>
    </div>
  );
}
