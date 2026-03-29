import React from "react";

export function Skeleton(props) {
  var T = props.T || {};
  return <div className="skel" style={Object.assign({ height: props.h || 16, width: props.w || '100%', borderRadius: props.r || 12, '--fill': T.fill || '#f1f5f9', '--fill2': T.fill2 || '#e2e8f0' }, props.style)} />;
}

export function SkeletonCard({ T = {} }) {
  return (
    <div style={{ padding: 20, borderRadius: 24, background: T.card, border: '1.5px solid ' + T.border }}>
      <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
        <Skeleton T={T} w={48} h={48} r={16} />
        <div className="flex-1 space-y-2"><Skeleton T={T} h={14} w="60%" /><Skeleton T={T} h={10} w="40%" /></div>
      </div>
      <Skeleton T={T} h={40} />
    </div>
  );
}

export function SkeletonList(props) {
  var T = props.T || {};
  var count = props.count || props.rows || 4;
  return (
    <div style={{ padding: props.noPadding ? 0 : '0 20px' }}>
      {Array.from({ length: count }).map(function (_, i) {
        return (
          <div key={i} className="flex items-center gap-3" style={{ padding: '14px 0', borderBottom: '1px solid ' + T.fill }}>
            <Skeleton T={T} w={44} h={44} r={14} />
            <div className="flex-1 space-y-2"><Skeleton T={T} h={13} w={120 + Math.random() * 80 + 'px'} /><Skeleton T={T} h={10} w="50%" /></div>
          </div>
        );
      })}
    </div>
  );
}

export function SkeletonPackageCard({ T = {} }) {
  return (
    <div style={{ borderRadius: 24, padding: 18, background: T.card, marginBottom: 12, border: '1.5px solid ' + T.border }}>
      <div className="flex items-center gap-4">
        <Skeleton T={T} w={52} h={52} r={18} />
        <div className="flex-1" style={{ minWidth: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <Skeleton T={T} h={15} w="60%" />
            <Skeleton T={T} h={20} w={80} r={20} />
          </div>
          <Skeleton T={T} h={12} w="40%" style={{ marginBottom: 12 }} />
          <Skeleton T={T} h={6} w="100%" r={3} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonText(props) {
  var T = props.T || {};
  var lines = props.lines || 3;
  return (
    <div>
      {Array.from({ length: lines }).map(function (_, i) {
        var isLast = i === lines - 1;
        return <Skeleton T={T} key={i} h={12} w={isLast ? '60%' : '100%'} style={{ marginBottom: i < lines - 1 ? 8 : 0 }} />;
      })}
    </div>
  );
}

export function SkeletonButton({ T = {} }) {
  return <Skeleton T={T} h={48} w="100%" r={16} />;
}

export function SkeletonCircle(props) {
  var T = props.T || {};
  var size = props.size || 40;
  return <Skeleton T={T} w={size} h={size} r={size / 2} />;
}
