import React, { useState } from "react";
import { T, ff, hf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import { ArrowRight } from "../components/Icons";

export default function Onboard(props) {
  var [s, sS] = useState(0);
  var sl = [
    { e: '\u{1F4F1}', t: 'Phone = Address', d: 'Send packages using just a phone number. No street address needed.', bg: 'linear-gradient(135deg, #FFF1F2 0%, #FEE2E2 50%, #FECDD3 100%)', c: T.accent, deco: ['\u{1F4E6}', '\u{2709}\u{FE0F}', '\u{1F514}'] },
    { e: '\u{1F3EA}', t: 'Lockers Everywhere', d: 'Secure 24/7 pickup from malls, gas stations, and stores.', bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #BFDBFE 100%)', c: T.blue, deco: ['\u{1F510}', '\u{26FD}', '\u{1F3EC}'] },
    { e: '\u{1F4CD}', t: 'Real-Time Tracking', d: 'Both sender and receiver get live updates via SMS.', bg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%)', c: T.ok, deco: ['\u{1F69A}', '\u{1F4F2}', '\u{2705}'] },
    { e: '\u{1F381}', t: 'Earn Rewards', d: 'Get points for every delivery. Redeem for discounts.', bg: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #DDD6FE 100%)', c: T.purple, deco: ['\u{2B50}', '\u{1F3C6}', '\u{1F48E}'] },
    { e: '\u{1F393}', t: 'Student? Store Free', d: 'Register with your student ID. Access any locker and store items for free.', bg: 'linear-gradient(135deg, #EFF6FF 0%, #E0E7FF 50%, #C7D2FE 100%)', c: T.blue, deco: ['\u{1F5C4}\u{FE0F}', '\u{1F511}', '\u{1F4DA}'] }
  ];
  var total = sl.length;
  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg }}><StatusBar />
      <div className="flex justify-end px-6 pt-1"><button onClick={props.onDone} className="tap" style={{ fontSize: 13, fontWeight: 600, color: T.sec, padding: '6px 14px', borderRadius: 12, fontFamily: ff, background: T.fill, border: '1px solid ' + T.border }}>Skip</button></div>
      <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: '0 40px' }}>
        <div key={s} className="text-center fu">
          <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 36px' }}>
            {sl[s].deco.map(function (d, di) { var angles = [[-40, -20], [50, -30], [45, 40]]; return <div key={di} className="float" style={{ position: 'absolute', left: '50%', top: '50%', marginLeft: angles[di][0], marginTop: angles[di][1], fontSize: 18, opacity: 0.5, animationDelay: (di * 0.4) + 's', filter: 'blur(0.5px)' }}>{d}</div>; })}
            <div style={{ width: 100, height: 100, borderRadius: 34, background: sl[s].bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 46, margin: '20px auto 0', boxShadow: '0 12px 32px ' + sl[s].c + '20', border: '1px solid ' + sl[s].c + '15', position: 'relative', zIndex: 2 }}>{sl[s].e}</div>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 14, letterSpacing: '-0.03em', fontFamily: hf }}>{sl[s].t}</h1>
          <p style={{ fontSize: 15, lineHeight: '1.7', color: T.sec, maxWidth: 270, fontFamily: ff }}>{sl[s].d}</p>
        </div>
      </div>
      <div className="flex justify-center gap-2 mb-8">{sl.map(function (_, i) { return <button key={i} onClick={function () { sS(i); }} className="rounded-full transition-all duration-300" style={{ width: s === i ? 24 : 7, height: 7, borderRadius: 4, background: s === i ? T.text : T.border }} />; })}</div>
      <div style={{ padding: '0 24px 40px' }}><button onClick={function () { s < total - 1 ? sS(s + 1) : props.onDone(); }} className="tap" style={{ width: '100%', padding: '15px 0', borderRadius: 16, fontWeight: 700, fontSize: 15, background: s === total - 1 ? T.gradientAccent : T.gradient, color: '#fff', fontFamily: ff, boxShadow: s === total - 1 ? '0 6px 20px rgba(225,29,72,0.25)' : '0 6px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{s === total - 1 ? "Get Started" : "Next"}{s < total - 1 && <ArrowRight style={{ width: 16, height: 16 }} />}</button></div>
    </div>
  );
}
