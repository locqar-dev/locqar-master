import React, { useState, useEffect } from 'react';

const ff = "'Inter', system-ui, -apple-system, sans-serif";

const SplashScreen = ({ onDone, T }) => {
  const [s, setS] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setS(1), 300);
    const t2 = setTimeout(() => setS(2), 1200);
    const t3 = setTimeout(onDone, 2200);
    return () => [t1, t2, t3].forEach(clearTimeout);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: T.bg,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: 180, height: 180, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(225,29,72,0.05) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: 150, height: 150, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      <img
        src="locqar-symbol.png"
        alt="LocQar"
        style={{
          width: 120, height: 120, objectFit: 'contain',
          opacity: s >= 1 ? 1 : 0,
          transform: s >= 1 ? 'scale(1)' : 'scale(0.85)',
          transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
          filter: s >= 2 ? 'blur(8px)' : 'blur(0px)',
        }}
      />

      <p style={{
        marginTop: 12,
        fontSize: 11, fontWeight: 700, fontFamily: ff,
        color: T.sec,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        opacity: s >= 1 && s < 2 ? 1 : 0,
        transition: 'opacity 0.4s ease 0.2s',
      }}>Courier</p>

      <div style={{
        display: 'flex', gap: 6, marginTop: 32,
        opacity: s >= 1 && s < 2 ? 1 : 0,
        transition: 'opacity 0.4s',
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3,
            background: T.red,
            animation: 'dotPulse 1.4s ease-in-out infinite',
            animationDelay: `${i * 0.16}s`,
          }} />
        ))}
      </div>
    </div>
  );
};

export default SplashScreen;
