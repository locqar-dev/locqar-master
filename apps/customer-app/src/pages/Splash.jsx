import React, { useState, useEffect } from "react";
import { T } from "../theme/themes";
import StatusBar from "../components/StatusBar";

export default function Splash(props) {
  var [s, sS] = useState(0);
  useEffect(function () {
    var t1 = setTimeout(function () { sS(1); }, 300);
    var t2 = setTimeout(function () { sS(2); }, 1200);
    var t3 = setTimeout(props.onDone, 2200);
    return function () { [t1, t2, t3].forEach(clearTimeout); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FAFB 50%, #F3F4F6 100%)' }}>
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(225,29,72,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <img src="locqar-symbol.png" alt="LocQar" style={{
        width: 120, height: 120, objectFit: 'contain',
        opacity: s >= 1 ? 1 : 0,
        transform: s >= 1 ? 'scale(1)' : 'scale(0.85)',
        transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
        filter: s >= 2 ? 'blur(8px)' : 'blur(0px)',
      }} />
      <div style={{ display: 'flex', gap: 6, marginTop: 32, opacity: s >= 1 && s < 2 ? 1 : 0, transition: 'opacity 0.4s' }}>
        {[0, 1, 2].map(function (i) {
          return <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: T.accent, animation: 'dotPulse 1.4s ease-in-out infinite', animationDelay: (i * 0.16) + 's' }} />;
        })}
      </div>
    </div>
  );
}
