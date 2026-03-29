import React, { useState, useEffect, useRef } from "react";

export function useCountUp(target, duration) {
  var [val, setVal] = useState(0);
  var raf = useRef(null);
  useEffect(function () {
    var start = 0;
    var startTime = null;
    var dur = duration || 600;
    var step = function (ts) {
      if (!startTime) startTime = ts;
      var p = Math.min((ts - startTime) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return function () { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);
  return val;
}

export default function AnimatedNum(props) {
  var v = useCountUp(props.value, props.duration);
  return <span style={props.style}>{props.prefix || ''}{v}{props.suffix || ''}</span>;
}
