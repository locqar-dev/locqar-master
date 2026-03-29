import React from "react";
import { T } from "../theme/themes";

export function Skeleton(props) {
  return <div className="skel" style={Object.assign({ height: props.h || 16, width: props.w || '100%', borderRadius: props.r || 12, '--fill': T.fill, '--fill2': T.fill2 }, props.style)} />;
}

export function SkeletonCard() {
  return (
    <div style={{ padding: 20, borderRadius: 24, background: T.card, border: '1.5px solid ' + T.border }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <Skeleton w={48} h={48} r={16} />
        <div className="flex-1 space-y-2"><Skeleton h={14} w="60%" /><Skeleton h={10} w="40%" /></div>
      </div>
      <Skeleton h={40} />
    </div>
  );
}

export function SkeletonList(props) {
  var count = props.count || props.rows || 4;
  return (
    <div style={{ padding: props.noPadding ? 0 : '0 20px' }}>
      {Array.from({ length: count }).map(function (_, i) {
        return (
          <div key={i} className="flex items-center gap-3" style={{ padding: '14px 0', borderBottom: '1px solid ' + T.fill }}>
            <Skeleton w={44} h={44} r={14} />
            <div className="flex-1 space-y-2"><Skeleton h={13} w={120 + Math.random() * 80 + 'px'} /><Skeleton h={10} w="50%" /></div>
          </div>
        );
      })}
    </div>
  );
}

export function SkeletonPackageCard() {
  return (
    <div style={{ borderRadius: 24, padding: 18, background: T.card, marginBottom: 12, border: '1.5px solid ' + T.border }}>
      <div className="flex items-center gap-4">
        <Skeleton w={52} h={52} r={18} />
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <Skeleton h={15} w="60%" />
            <Skeleton h={20} w={80} r={20} />
          </div>
          <Skeleton h={12} w="40%" style={{ marginBottom: 12 }} />
          <Skeleton h={6} w="100%" r={3} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText(props) {
  var lines = props.lines || 3;
  return (
    <div>
      {Array.from({ length: lines }).map(function (_, i) {
        var isLast = i === lines - 1;
        return <Skeleton key={i} h={12} w={isLast ? '60%' : '100%'} style={{ marginBottom: i < lines - 1 ? 8 : 0 }} />;
      })}
    </div>
  );
}

export function SkeletonButton() {
  return <Skeleton h={48} w="100%" r={16} />;
}

export function SkeletonCircle(props) {
  var size = props.size || 40;
  return <Skeleton w={size} h={size} r={size / 2} />;
}
