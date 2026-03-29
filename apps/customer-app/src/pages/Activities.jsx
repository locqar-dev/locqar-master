import React, { useState, useEffect } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import Chip from "../components/Chip";
import EmptyState from "../components/EmptyState";
import { SkeletonList } from "../components/Skeleton";
import { usePullRefresh, PullIndicator } from "../components/PullRefresh";
import { Search, X, ArrowRight, Clock, AlertTriangle, Package, Check, MapPin, Zap } from "../components/Icons";
import { calcOverage, lockerStatus } from "../utils/storageUtils";

// Group packages by a date label
function groupByDate(pkgs) {
  var groups = [];
  var map = {};
  var labels = { '26h ago': 'Yesterday', '8h ago': 'Today', '2h ago': 'Today', '1d ago': 'Yesterday', '3d ago': 'Feb 5' };
  pkgs.forEach(function (p) {
    var label = labels[p.time] || p.time;
    if (!map[label]) { map[label] = []; groups.push({ label: label, items: map[label] }); }
    map[label].push(p);
  });
  return groups;
}

export default function Activities(props) {
  var [f, sF] = useState('all');
  var [searchQ, setSearchQ] = useState('');
  var [searchOpen, setSearchOpen] = useState(false);
  var [loading, setLoading] = useState(true);
  useEffect(function () { var t = setTimeout(function () { setLoading(false); }, 600); return function () { clearTimeout(t); }; }, []);
  var fs = [{ id: 'all', l: 'All', e: '\u{1F4E6}' }, { id: 'ready', l: 'Ready', e: '\u{2705}' }, { id: 'transit', l: 'Transit', e: '\u{1F69A}' }, { id: 'done', l: 'Done', e: '\u{1F389}' }];
  var fl = f === 'all' ? props.pkgs : props.pkgs.filter(function (p) { return f === 'ready' ? p.status === 'Ready' : f === 'transit' ? p.status === 'In transit' : p.status === 'Delivered'; });
  if (searchQ.trim()) { var q = searchQ.toLowerCase(); fl = fl.filter(function (p) { return p.name.toLowerCase().indexOf(q) >= 0 || p.location.toLowerCase().indexOf(q) >= 0 || p.toPhone.indexOf(q) >= 0 || p.fromPhone.indexOf(q) >= 0 || p.status.toLowerCase().indexOf(q) >= 0; }); }
  var groups = groupByDate(fl);
  var ptr = usePullRefresh(function () { });

  return (
    <div className="pb-24 min-h-screen overflow-y-auto noscroll" style={{ background: T.bg }} ref={ptr.containerRef} onTouchStart={ptr.onTouchStart} onTouchMove={ptr.onTouchMove} onTouchEnd={ptr.onTouchEnd}>
      <StatusBar /><PullIndicator pullY={ptr.pullY} refreshing={ptr.refreshing} />
      <PageHeader title="My Activities" subtitle={props.pkgs.length + ' deliveries'} right={
        <button onClick={function () { setSearchOpen(!searchOpen); if (searchOpen) setSearchQ(''); }} className="tap" style={{ width: 44, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: searchOpen ? T.text : T.card, border: '1.5px solid ' + (searchOpen ? T.text : T.border), transition: 'all .25s', boxShadow: T.shadow }}>
          {searchOpen ? <X style={{ width: 18, height: 18, color: '#fff' }} /> : <Search style={{ width: 18, height: 18, color: T.text }} />}
        </button>
      } />
      {searchOpen && (
        <div className="fu" style={{ padding: '0 20px 16px' }}>
          <div className="flex items-center gap-3 glass" style={{ borderRadius: 16, padding: '12px 16px', border: '1.5px solid ' + (searchQ ? T.accent : T.border), transition: 'all .2s', boxShadow: T.shadow }}>
            <Search style={{ width: 18, height: 18, color: T.sec, flexShrink: 0 }} />
            <input type="text" value={searchQ} onChange={function (e) { setSearchQ(e.target.value); }} placeholder="Search deliveries..." className="flex-1" autoFocus style={{ background: 'transparent', fontSize: 14, fontWeight: 700, fontFamily: ff, color: T.text }} />
            {searchQ && <button onClick={function () { setSearchQ(''); }} className="tap" style={{ width: 24, height: 24, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill }}><X style={{ width: 12, height: 12, color: T.sec }} /></button>}
          </div>
        </div>
      )}
      <div style={{ padding: '0 20px 16px' }}>
        <div className="flex gap-2 overflow-x-auto noscroll fu d1">
          {fs.map(function (x) { return <Chip key={x.id} label={x.l} emoji={x.e} active={f === x.id} onClick={function () { sF(x.id); }} />; })}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {loading ? <SkeletonList count={3} /> :
          fl.length === 0 ? <EmptyState emoji={searchQ ? "\u{1F50D}" : "\u{1F4E6}"} title={searchQ ? "No results found" : "Nothing here yet"} desc={searchQ ? "Try a different search term or adjust filters." : "Your activities will appear here once you send or receive."} action={searchQ ? null : "Send First Package"} onAction={function () { props.onNav('send'); }} /> :
          groups.map(function (group, gi) {
            return (
              <div key={gi} className="fu" style={{ animationDelay: (gi * 0.06) + 's', marginBottom: 20 }}>
                {/* Date header */}
                <p style={{ fontSize: 11, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: ff, marginBottom: 8, paddingLeft: 4 }}>{group.label}</p>

                {/* Card containing all items for this date */}
                <div style={{ borderRadius: 20, background: T.card, border: '1.5px solid ' + T.border, boxShadow: T.shadow, overflow: 'hidden' }}>
                  {group.items.map(function (p, i) {
                    var isReady = p.status === 'Ready';
                    var isDone = p.status === 'Delivered';
                    var lstatus = isReady ? lockerStatus(p.hoursInLocker) : null;
                    var overage = isReady ? calcOverage(p.hoursInLocker) : 0;
                    var statusColor = isReady ? T.ok : isDone ? T.sec : T.warn;
                    var statusBg = isReady ? T.okBg : isDone ? T.fill : T.warnBg;
                    var StatusIcon = isReady ? Check : isDone ? Package : Zap;

                    return (
                      <button
                        key={p.id}
                        onClick={function () { props.onNav('pkg-detail', p); }}
                        className="tap w-full text-left"
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < group.items.length - 1 ? '1px solid ' + T.border : 'none', background: 'none' }}
                      >
                        {/* Status icon */}
                        <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: statusBg, border: '1.5px solid ' + statusColor + '22', flexShrink: 0 }}>
                          <StatusIcon style={{ width: 18, height: 18, color: statusColor, strokeWidth: isDone ? 1.5 : 2.5 }} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                            <p className="truncate" style={{ fontWeight: 700, fontSize: 14, fontFamily: ff, color: T.text }}>{p.name}</p>
                            {lstatus === 'overdue' && (
                              <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.red, flexShrink: 0 }} />
                            )}
                            {lstatus === 'warning' && (
                              <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.warn, flexShrink: 0 }} />
                            )}
                          </div>
                          <div className="flex items-center gap-1" style={{ marginTop: 1 }}>
                            <MapPin style={{ width: 11, height: 11, color: T.muted, flexShrink: 0 }} />
                            <p className="truncate" style={{ fontSize: 12, color: T.muted, fontFamily: ff }}>{p.location}</p>
                          </div>
                          {lstatus === 'overdue' && (
                            <div className="flex items-center gap-1" style={{ marginTop: 3 }}>
                              <AlertTriangle style={{ width: 11, height: 11, color: T.red, flexShrink: 0 }} />
                              <p style={{ fontSize: 11, fontWeight: 700, color: T.red, fontFamily: ff }}>GH₵{overage.toFixed(2)} overdue</p>
                            </div>
                          )}
                          {lstatus === 'warning' && (
                            <div className="flex items-center gap-1" style={{ marginTop: 3 }}>
                              <Clock style={{ width: 11, height: 11, color: T.warn, flexShrink: 0 }} />
                              <p style={{ fontSize: 11, fontWeight: 600, color: T.warn, fontFamily: ff }}>Collect soon</p>
                            </div>
                          )}
                        </div>

                        {/* Right: status badge + time + chevron */}
                        <div className="flex flex-col items-end gap-1" style={{ flexShrink: 0 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: statusBg, color: statusColor, fontFamily: ff, letterSpacing: '0.04em', border: '1px solid ' + statusColor + '20' }}>{p.status}</span>
                          <p style={{ fontSize: 11, color: T.muted, fontFamily: mf }}>{p.time}</p>
                        </div>
                        <ArrowRight style={{ width: 14, height: 14, color: T.border, flexShrink: 0 }} />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}
