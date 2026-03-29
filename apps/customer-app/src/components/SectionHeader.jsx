import React from "react";
import { T, ff, hf } from "../theme/themes";
import { ChevronRight } from "./Icons";

export default function SectionHeader(props) {
  return (
    <div className="flex items-center justify-between" style={{ padding: (props.pt || 22) + 'px 20px 12px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, fontFamily: hf, letterSpacing: '-0.025em', color: T.text }}>{props.title}</h2>
      {props.action && <button onClick={props.onAction} className="tap flex items-center gap-0.5" style={{ fontSize: 12, fontWeight: 600, color: T.accent, fontFamily: ff, padding: '4px 2px' }}>{props.action}<ChevronRight style={{ width: 14, height: 14 }} /></button>}
    </div>
  );
}
