import React from "react";

export default function ScreenWrap(props) {
  var cls = props.transition || 'scr-fade';
  return <div key={props.screenKey} className={cls} style={{ minHeight: '100vh' }}>{props.children}</div>;
}
