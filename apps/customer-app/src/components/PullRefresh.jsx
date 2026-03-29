import React, { useState, useRef, useCallback } from "react";
import { T } from "../theme/themes";
import { RotateCw } from "./Icons";

export function usePullRefresh(onRefresh) {
  var ref = useRef(null), startY = useRef(0);
  var [refreshing, setRefreshing] = useState(false);
  var [pullY, setPullY] = useState(0);
  var onTS = useCallback(function (e) { if (ref.current && ref.current.scrollTop === 0) startY.current = e.touches[0].clientY; }, []);
  var onTM = useCallback(function (e) { if (startY.current === 0 || refreshing) return; var dy = e.touches[0].clientY - startY.current; if (dy > 0 && ref.current && ref.current.scrollTop === 0) setPullY(Math.min(dy * 0.3, 60)); }, [refreshing]);
  var onTE = useCallback(function () { if (pullY > 40) { setRefreshing(true); setPullY(32); if (onRefresh) onRefresh(); setTimeout(function () { setRefreshing(false); setPullY(0); }, 800); } else { setPullY(0); } startY.current = 0; }, [pullY, onRefresh]);
  return { containerRef: ref, pullY: pullY, refreshing: refreshing, onTouchStart: onTS, onTouchMove: onTM, onTouchEnd: onTE };
}

export function PullIndicator(props) {
  return (
    <div className="flex justify-center items-center overflow-hidden" style={{ height: props.pullY, opacity: props.pullY > 6 ? 1 : 0, transition: 'height .12s' }}>
      <RotateCw style={{ width: 15, height: 15, color: T.ok, animation: props.refreshing ? 'spin 0.7s linear infinite' : 'none', transform: !props.refreshing ? 'rotate(' + (props.pullY * 5) + 'deg)' : undefined }} />
    </div>
  );
}
