import React from "react";
import { T, ff } from "../theme/themes";
import { ArrowLeft } from "./Icons";

export default function PageHeader(props) {
  return (
    <div style={{ padding: '12px 20px 16px' }}>
      <div className="flex items-center gap-4">
        {props.onBack && <button onClick={props.onBack} className="tap" style={{ width: 44, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.card, border: '1.5px solid ' + T.border, boxShadow: T.shadow }}><ArrowLeft style={{ width: 20, height: 20, color: T.text, strokeWidth: 2.5 }} /></button>}
        <div className="flex-1 min-w-0">
          <h1 className="truncate" style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.04em', fontFamily: ff, color: T.text }}>{props.title}</h1>
          {props.subtitle && <p className="truncate" style={{ fontSize: 12, color: T.sec, marginTop: 1, fontFamily: ff, fontWeight: 500 }}>{props.subtitle}</p>}
        </div>
        {props.right}
      </div>
    </div>
  );
}
