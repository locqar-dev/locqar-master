import React from "react";
import { T, ff } from "../theme/themes";

export default function Chip(props) {
  return (
    <button onClick={props.onClick} className="flex-shrink-0 flex items-center gap-1.5 tap" style={{ padding: '8px 16px', borderRadius: 24, fontSize: 12, fontWeight: 600, background: props.active ? T.text : '#fff', color: props.active ? '#fff' : T.text, fontFamily: ff, border: props.active ? 'none' : '1.5px solid ' + T.border, transition: 'all .25s cubic-bezier(.2,.9,.3,1)', boxShadow: props.active ? '0 2px 8px rgba(0,0,0,0.12)' : 'none' }}>
      {props.emoji && <span style={{ fontSize: 12 }}>{props.emoji}</span>}<span>{props.label}</span>
    </button>
  );
}
