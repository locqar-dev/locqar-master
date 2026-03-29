import React from "react";
import { T, ff } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";

export default function Notifs(props) {
  var ns = [
    { e: '\u{2705}', t: 'Package Ready!', d: 'iPhone Case ready at Osu Mall', tm: '5m', u: true },
    { e: '\u{1F69A}', t: 'In Transit', d: 'Book Bundle on the way to Accra Mall', tm: '2h', u: true },
    { e: '\u{1F4E4}', t: 'Delivered', d: 'Package to Abena picked up', tm: '1d', u: false },
    { e: '\u{1F381}', t: '+50 Points', d: 'Earned for recent delivery', tm: '3d', u: false }
  ];
  return (
    <div className="min-h-screen" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="Notifications" onBack={props.onBack} />
      <div style={{ padding: '0 20px' }}>{ns.map(function (n, i) {
        return (
          <div key={i} className="fu tap" style={{ borderRadius: 18, padding: 16, display: 'flex', alignItems: 'flex-start', gap: 14, background: n.u ? '#fff' : T.card, border: '1.5px solid ' + (n.u ? T.accent + '18' : T.border), boxShadow: n.u ? '0 4px 16px rgba(225,29,72,0.06)' : T.shadow, marginBottom: 10, animationDelay: (i * 0.04) + 's' }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0, background: n.u ? T.accentBg : T.fill, boxShadow: n.u ? '0 2px 6px rgba(225,29,72,0.08)' : 'none' }}>{n.e}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2" style={{ marginBottom: 3 }}><h3 style={{ fontWeight: 700, fontSize: 14, fontFamily: ff }}>{n.t}</h3>{n.u && <div className="breathe" style={{ width: 7, height: 7, borderRadius: 4, flexShrink: 0, background: T.accent }} />}</div>
              <p style={{ fontSize: 12, lineHeight: '1.55', color: T.sec, fontFamily: ff }}>{n.d}</p>
            </div>
            <p style={{ fontSize: 10, flexShrink: 0, paddingTop: 3, color: T.muted, fontFamily: ff, fontWeight: 500 }}>{n.tm}</p>
          </div>
        );
      })}</div>
    </div>
  );
}
