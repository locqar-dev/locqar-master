import React, { useState, useEffect, useRef } from 'react';
import StatusBar from '../components/StatusBar';
import { ArrowLeft } from '../components/Icons';

const ff = "'Inter', system-ui, -apple-system, sans-serif";
const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";
const mf = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

const OtpScreen = ({ phone, onVerify, onBack, T }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [success, setSuccess] = useState(false);
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  useEffect(() => { refs[0].current?.focus() }, []);
  useEffect(() => {
    if (timer > 0) {
      const i = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(i);
    }
  }, [timer]);

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v) || v.length > 1) return;
    const next = [...otp]; next[i] = v; setOtp(next);
    if (v && i < 5) refs[i + 1].current?.focus();
    if (next.every(d => d)) {
      setSuccess(true);
      setTimeout(onVerify, 600);
    }
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <StatusBar T={T} />

      <div style={{ padding: '8px 24px' }}>
        <button
          onClick={onBack}
          className="tap"
          style={{
            width: 40, height: 40, borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: T.fill, border: `1px solid ${T.border}`,
          }}
        >
          <ArrowLeft size={18} style={{ color: T.text }} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '24px 24px 0' }}>
        <div className="fu">
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: T.fill,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, marginBottom: 20,
          }}>🔐</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em', fontFamily: hf, color: T.text }}>
            Verification code
          </h1>
          <p style={{ fontSize: 14, color: T.sec, margin: '0 0 28px', fontFamily: ff }}>
            Sent to{' '}
            <span style={{ fontWeight: 700, color: T.text, fontFamily: mf }}>+233 {phone}</span>
          </p>
        </div>

        <div className="fu d1" style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {otp.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKey(i, e)}
              style={{
                width: 48, height: 56, borderRadius: 14,
                textAlign: 'center', fontSize: 24, fontWeight: 700,
                fontFamily: mf,
                background: T.fill,
                border: `2px solid ${d ? T.text : 'transparent'}`,
                color: T.text,
                transition: 'all .2s',
                outline: 'none',
              }}
            />
          ))}
        </div>

        <div className="fu d2" style={{ textAlign: 'center' }}>
          {timer > 0
            ? <p style={{ fontSize: 13, color: T.sec, fontFamily: ff }}>
                Resend in <b style={{ color: T.text, fontFamily: mf }}>{timer}s</b>
              </p>
            : <button
                onClick={() => setTimer(30)}
                className="tap"
                style={{ border: 'none', background: 'none', fontSize: 13, fontWeight: 700, color: T.red, fontFamily: ff }}
              >
                Resend code
              </button>
          }
        </div>
      </div>
    </div>
  );
};

export default OtpScreen;
