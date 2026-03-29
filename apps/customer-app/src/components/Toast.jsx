import React from "react";
import { T, ff } from "../theme/themes";

export default function Toast(props) {
  if (!props.show) return null;
  var bg = props.type === 'error' ? T.accentBg : T.okBg;
  var c = props.type === 'error' ? T.accent : T.okDark;
  return (
    <div className="fixed left-4 right-4 z-[100] flex justify-center pointer-events-none" style={{ top: 60, animation: 'toast .4s cubic-bezier(0.32, 0.72, 0, 1)' }}>
      <div className="flex items-center gap-3 glass" style={{ padding: '12px 24px', borderRadius: 100, boxShadow: T.shadowLg }}>
        <span style={{ fontSize: 18 }}>{props.emoji}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: ff }}>{props.text}</span>
      </div>
    </div>
  );
}
