import React, { useState, useEffect } from "react";
import { T, ff } from "../theme/themes";

export default function StatusBar() {
  var [t, sT] = useState('');
  useEffect(function () { var u = function () { sT(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })); }; u(); var i = setInterval(u, 30000); return function () { clearInterval(i); }; }, []);
  return (
    <div className="flex items-center justify-between px-6" style={{ paddingTop: 12, paddingBottom: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 700, fontFamily: ff, letterSpacing: '-0.01em' }}>{t}</span>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5 items-end h-3">{[1, 2, 3, 4].map(function (i) { return <div key={i} className="rounded-full" style={{ width: 3, height: 3 + i * 2, background: T.text, opacity: i === 4 ? 0.3 : 1 }} />; })}</div>
        <div style={{ width: 22, height: 11, border: '1.5px solid ' + T.text, borderRadius: 3, marginLeft: 2, display: 'flex', alignItems: 'center', padding: 1, opacity: 0.8 }}><div style={{ width: '70%', height: '100%', background: T.text, borderRadius: 1 }} /></div>
      </div>
    </div>
  );
}
