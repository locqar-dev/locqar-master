import React from "react";
import { T, ff, hf } from "../theme/themes";

export default function EmptyState(props) {
  return (
    <div className="flex flex-col items-center justify-center text-center fu" style={{ padding: '60px 40px' }}>
      <div style={{ width: 88, height: 88, borderRadius: 30, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, border: '1.5px solid ' + T.border }}>
        <div className="float" style={{ fontSize: 40 }}>{props.emoji}</div>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, fontFamily: hf, letterSpacing: '-0.02em' }}>{props.title}</h2>
      <p style={{ fontSize: 13, lineHeight: '1.7', color: T.sec, maxWidth: 250, marginBottom: 28, fontFamily: ff }}>{props.desc}</p>
      {props.action && <button onClick={props.onAction} className="tap" style={{ padding: '12px 28px', borderRadius: 16, fontWeight: 700, fontSize: 14, color: '#fff', background: T.gradient, fontFamily: ff, boxShadow: T.shadowMd }}>{props.action}</button>}
    </div>
  );
}
