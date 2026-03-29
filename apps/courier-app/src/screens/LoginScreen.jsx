import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import { Check } from '../components/Icons';

const ff = "'Inter', system-ui, -apple-system, sans-serif";
const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";

const LoginScreen = ({ onLogin, T }) => {
  const [ph, setPh] = useState('');
  const valid = ph.replace(/\s/g, '').length >= 7;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: T.bg }}>
      <StatusBar T={T} />

      <div style={{ flex: 1, padding: '44px 24px 0' }}>
        <div className="fu">
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: T.fill,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, marginBottom: 20,
          }}>📱</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em', fontFamily: hf, color: T.text }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.65, color: T.sec, margin: '0 0 28px', fontFamily: ff }}>
            Enter your phone number to sign in to your LocQar Courier account.
          </p>
        </div>

        <div className="fu d1" style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
            borderRadius: 14, padding: '13px 14px',
            fontWeight: 600, fontSize: 14, fontFamily: ff,
            background: T.fill, border: `1.5px solid ${T.border}`,
          }}>🇬🇭 +233</div>
          <input
            type="tel"
            value={ph}
            onChange={e => setPh(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && valid && onLogin(ph)}
            placeholder="24 000 0000"
            style={{
              flex: 1, borderRadius: 14, padding: '13px 18px',
              fontSize: 20, fontWeight: 600, fontFamily: ff,
              background: T.fill, color: T.text,
              border: `1.5px solid ${valid ? T.green : 'transparent'}`,
              transition: 'border .25s', outline: 'none',
            }}
          />
        </div>

        {valid && (
          <div className="fu" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 2px' }}>
            <div style={{
              width: 16, height: 16, borderRadius: 8, background: T.green,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Check size={10} style={{ color: '#fff', strokeWidth: 3 }} />
            </div>
            <p style={{ fontSize: 12, fontWeight: 600, color: T.greenDark, fontFamily: ff, margin: 0 }}>
              We'll send a verification code
            </p>
          </div>
        )}
      </div>

      <div style={{ padding: '0 24px 36px' }}>
        <button
          onClick={() => valid && onLogin(ph)}
          className="tap"
          style={{
            width: '100%', padding: '15px 0', borderRadius: 14, border: 'none',
            fontWeight: 700, fontSize: 15, fontFamily: ff,
            background: valid ? T.gradient : T.fill,
            color: valid ? '#fff' : T.muted,
            transition: 'all .25s',
            boxShadow: valid ? '0 4px 14px rgba(0,0,0,0.15)' : 'none',
            cursor: valid ? 'pointer' : 'not-allowed',
          }}
        >
          Sign In
        </button>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: T.muted, fontFamily: ff, lineHeight: 1.6 }}>
          By continuing you agree to our{' '}
          <a href="#" style={{ color: T.blue, textDecoration: 'none', fontWeight: 700 }}>Terms</a>
          {' '}&{' '}
          <a href="#" style={{ color: T.blue, textDecoration: 'none', fontWeight: 700 }}>Privacy</a>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
