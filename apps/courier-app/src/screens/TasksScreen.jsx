import React, { useState, useEffect, useRef } from 'react';
import StatusBar from '../components/StatusBar';
import Ring from '../components/Ring';
import Badge from '../components/Badge';
import NavigationButton, { openNavigation } from '../components/NavigationModal';
import SwipeConfirm from '../components/SwipeConfirm';
import { ArrowLeft, Filter, Search, X, ChevronDown, MapPin, Check, Package, Truck, Camera, Shield, CheckCircle, RotateCcw, RefreshCw, AlertTriangle, User, Clock, Home, Copy, Phone, Navigation, Box, Star } from '../components/Icons';
import { lockersData } from '../data/mockData';
import { SizeIcon, sizeColor } from './HomeScreen';

const ff = "'Inter', system-ui, -apple-system, sans-serif";
const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";
const mf = "'JetBrains Mono', 'SF Mono', 'Fira Code', monospace";

const TasksScreen = ({ tasks, setTasks, onBack, T }) => {
  const [activeTab, setActiveTab] = useState('assigned');
  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [dropModal, setDropModal] = useState(null);
  const [dropView, setDropView] = useState('choice');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ locker: 'all', size: 'all' });
  const [activeDropOff, setActiveDropOff] = useState(null);
  const searchRef = useRef(null);
  const activeFilterCount = Object.values(filters).filter(v => v !== 'all').length;

  const genCode = (pre, trk) => { let h = 0; for (let i = 0; i < trk.length; i++) h = ((h << 5) - h) + trk.charCodeAt(i); return pre + '-' + (Math.abs(h) % 9000 + 1000) };

  const tabs = [
    { id: 'assigned', label: 'Assigned', color: T.accent, bg: T.accentBg },
    { id: 'accepted', label: 'Delivering', color: T.accent, bg: T.accentBg },
    { id: 'delivered_to_locker', label: 'Delivered', color: T.green, bg: T.greenBg },
    { id: 'recalled', label: 'Recall', color: T.red, bg: T.redBg },
  ];

  const counts = tabs.reduce((a, t) => ({
    ...a,
    [t.id]: tasks.filter(tk => tk.tab === t.id || (t.id === 'accepted' && tk.tab === 'in_transit_to_locker')).length,
  }), {});
  const totalActive = counts.assigned + counts.accepted;

  const filtered = tasks.filter(t => {
    const effectiveTab = t.tab === 'in_transit_to_locker' ? 'accepted' : t.tab;
    if (effectiveTab !== activeTab) return false;
    if (search) { const q = search.toLowerCase(); if (!(t.trk.toLowerCase().includes(q) || t.locker.toLowerCase().includes(q) || t.receiver.toLowerCase().includes(q) || t.sender.toLowerCase().includes(q))) return false }
    if (filters.locker !== 'all' && t.locker !== filters.locker) return false;
    if (filters.size !== 'all' && t.sz !== filters.size) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'size') { const o = { S: 0, M: 1, L: 2, XL: 3 }; return o[a.sz] - o[b.sz] }
    if (sortBy === 'locker') return a.locker.localeCompare(b.locker);
    return 0;
  });

  const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2200) };

  const moveTask = (id, to, label) => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const extra = to === 'accepted' ? { acceptedAt: now } : to === 'in_transit_to_locker' ? { inTransitAt: now } : to === 'delivered_to_locker' ? { depositedAt: now } : {};
    setTasks(prev => prev.map(t => t.id === id ? { ...t, tab: to, ...extra } : t));
    setExpandedId(null); setModal(null);
    showToast(label || 'Updated', to === 'delivered_to_locker' ? T.green : to === 'recalled' ? T.red : T.text);
  };

  const copyTrk = (trk) => { navigator.clipboard?.writeText(trk); setCopiedId(trk); setTimeout(() => setCopiedId(null), 1500) };

  useEffect(() => { if (showSearch && searchRef.current) searchRef.current.focus() }, [showSearch]);

  const currentTab = tabs.find(t => t.id === activeTab);
  const progressPct = tasks.length > 0 ? Math.round((counts.delivered_to_locker / tasks.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 88 }}>
      <StatusBar />

      {/* Header */}
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          {onBack && (
            <button
              onClick={onBack}
              className="tap press"
              style={{
                width: 44, height: 44, borderRadius: 14,
                background: T.card, border: `1.5px solid ${T.border}`,
                boxShadow: T.shadow,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: T.text, flexShrink: 0,
              }}
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.03em', fontFamily: hf, color: T.text }}>Tasks</h1>
            <p style={{ fontSize: 13, color: T.sec, margin: 0, fontFamily: ff }}>
              {totalActive} active{' \u00B7 '}{counts.delivered_to_locker} deposited
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="tap"
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: showFilters || activeFilterCount > 0 ? T.accent : T.card,
              border: `1.5px solid ${showFilters || activeFilterCount > 0 ? T.accent : T.border}`,
              boxShadow: T.shadow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: showFilters || activeFilterCount > 0 ? '#fff' : T.text, position: 'relative',
            }}
          >
            <Filter size={18} />
            {activeFilterCount > 0 && (
              <div style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: 8, background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>{activeFilterCount}</span>
              </div>
            )}
          </button>
          <button
            onClick={() => { setShowSearch(!showSearch); if (showSearch) setSearch('') }}
            className="tap"
            style={{
              width: 44, height: 44, borderRadius: 14,
              background: showSearch ? T.accent : T.card,
              border: `1.5px solid ${showSearch ? T.accent : T.border}`,
              boxShadow: T.shadow,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: showSearch ? '#fff' : T.text,
            }}
          >
            {showSearch ? <X size={18} /> : <Search size={18} />}
          </button>
        </div>

        {showSearch && (
          <div className="sd" style={{ marginBottom: 12, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by tracking, locker, name..."
              style={{
                width: '100%', height: 44, borderRadius: 12,
                border: `1.5px solid ${T.border}`,
                padding: '0 14px 0 40px',
                fontSize: 14, fontWeight: 500, fontFamily: ff,
                background: T.fill, color: T.text,
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: T.muted, padding: 4 }}>
                <X size={14} />
              </button>
            )}
          </div>
        )}

        {showFilters && (
          <div className="sd" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, alignSelf: 'center', marginRight: 4, fontFamily: ff }}>Locker:</span>
              <button onClick={() => setFilters(f => ({ ...f, locker: 'all' }))} className="tap" style={{ height: 28, padding: '0 10px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, fontFamily: ff, background: filters.locker === 'all' ? T.accent : T.fill, color: filters.locker === 'all' ? '#fff' : T.sec }}>All</button>
              {lockersData.map(l => (
                <button key={l.id} onClick={() => setFilters(f => ({ ...f, locker: l.name }))} className="tap" style={{ height: 28, padding: '0 10px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, fontFamily: ff, background: filters.locker === l.name ? T.accent : T.fill, color: filters.locker === l.name ? '#fff' : T.sec }}>
                  {l.name.split(' ')[0]}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, marginRight: 4, fontFamily: ff }}>Size:</span>
              {['all', 'S', 'M', 'L', 'XL'].map(s => (
                <button key={s} onClick={() => setFilters(f => ({ ...f, size: s }))} className="tap" style={{ height: 28, padding: '0 10px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, fontFamily: ff, background: filters.size === s ? T.accent : T.fill, color: filters.size === s ? '#fff' : T.sec }}>
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
              {activeFilterCount > 0 && (
                <button onClick={() => setFilters({ locker: 'all', size: 'all' })} className="tap" style={{ marginLeft: 'auto', height: 28, padding: '0 10px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, fontFamily: ff, background: T.redBg, color: T.red }}>
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overall progress */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{
          borderRadius: 20, padding: '16px 18px',
          background: T.gradient,
          border: `1.5px solid transparent`,
          boxShadow: T.shadowMd,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ff }}>Shift Progress</p>
              <h2 style={{ fontSize: 28, fontWeight: 800, margin: '2px 0 0', color: '#fff', fontFamily: mf, letterSpacing: '-0.02em', lineHeight: 1 }}>{progressPct}%</h2>
            </div>
            <Ring pct={progressPct} sz={52} sw={4} color="#fff" T={T}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: mf }}>{counts.delivered_to_locker}</span>
            </Ring>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'rgba(255,255,255,0.9)', borderRadius: 2, width: `${progressPct}%`, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            {tabs.map(t => (
              <div key={t.id} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', margin: 0, fontFamily: mf }}>{counts[t.id]}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', margin: 0, fontFamily: ff, fontWeight: 600 }}>{t.label.split(' ')[0]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ padding: '0 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }} className="no-sb">
          {tabs.map(t => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => { setActiveTab(t.id); setExpandedId(null); setSearch(''); setActiveDropOff(null); }}
                className="tap press"
                style={{
                  flex: '0 0 auto', borderRadius: 14,
                  padding: '10px 14px',
                  background: isActive ? T.accent : T.card,
                  border: `1.5px solid ${isActive ? T.accent : T.border}`,
                  color: isActive ? '#fff' : T.sec,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                  minWidth: 72,
                  boxShadow: isActive ? T.shadowMd : T.shadow,
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: 17, fontWeight: 800, fontFamily: mf, color: isActive ? '#fff' : t.color }}>
                  {counts[t.id]}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, fontFamily: ff, letterSpacing: '0.02em', opacity: isActive ? 0.85 : 0.7, whiteSpace: 'nowrap' }}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step hint */}
      {['assigned', 'accepted'].includes(activeTab) && (
        <div style={{ padding: '0 20px', marginBottom: 10 }}>
          <div style={{ borderRadius: 12, padding: '10px 14px', background: T.fill, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>
              {activeTab === 'assigned' ? '📦' : '🚗'}
            </span>
            <p style={{ fontSize: 13, fontWeight: 600, color: T.sec, margin: 0, fontFamily: ff }}>
              {activeTab === 'assigned' && 'At the warehouse? Confirm pickup for each locker group below'}
              {activeTab === 'accepted' && 'Expand a package and tap Start Delivery, then Deposit when you arrive'}
            </p>
          </div>
        </div>
      )}

      {/* Sort/label bar */}
      {(
        <div style={{ padding: '0 20px', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: currentTab.color }} />
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: ff, color: T.text }}>{currentTab.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: T.muted, fontFamily: ff }}>
                ({filtered.length}{activeTab === 'assigned' ? ' across ' + [...new Set(filtered.map(t => t.locker))].length + ' locations' : ''})
              </span>
            </div>
            {activeTab !== 'assigned' && (
              <div style={{ display: 'flex', gap: 4 }}>
                {[{ id: 'default', l: 'All' }, { id: 'locker', l: '📍 Locker' }].map(s => (
                  <button key={s.id} onClick={() => setSortBy(s.id)} className="tap" style={{ height: 28, padding: '0 10px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, fontFamily: ff, background: sortBy === s.id ? T.accent : T.fill, color: sortBy === s.id ? '#fff' : T.sec }}>
                    {s.l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Assigned ── one location at a time */}
      {activeTab === 'assigned' && (
        <div style={{ padding: '0 20px' }}>
          {(() => {
            const locGroups = {};
            filtered.forEach(t => { if (!locGroups[t.locker]) locGroups[t.locker] = { locker: t.locker, addr: t.addr, packages: [] }; locGroups[t.locker].packages.push(t) });
            const groups = Object.values(locGroups);
            if (groups.length === 0) return (
              <div style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 20, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: T.fill2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Package size={26} style={{ color: T.sec }} />
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, margin: '0 0 4px', fontFamily: hf, letterSpacing: '-0.02em' }}>
                  {search ? 'No matches' : 'No drop-off assignments'}
                </p>
                <p style={{ fontSize: 14, color: T.sec, margin: 0, fontFamily: ff }}>
                  {search ? `No results for "${search}"` : 'New locker assignments will appear here'}
                </p>
                {search && <button onClick={() => setSearch('')} className="tap" style={{ marginTop: 16, height: 36, padding: '0 20px', borderRadius: 10, border: `1.5px solid ${T.border}`, background: T.bg, fontWeight: 600, fontSize: 13, fontFamily: ff }}>Clear Search</button>}
              </div>
            );
            const totalPkgs = groups.reduce((s, g) => s + g.packages.length, 0);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Summary row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.sec, fontFamily: ff }}>
                    {totalPkgs} package{totalPkgs !== 1 ? 's' : ''} · {groups.length} location{groups.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {groups.map((g, gi) => (
                  <div key={g.locker} className={`fu d${Math.min(gi + 1, 6)}`} style={{ borderRadius: 20, overflow: 'hidden', background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
                    {/* Location header */}
                    <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: T.accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: mf }}>{gi + 1}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 800, fontSize: 15, margin: 0, fontFamily: hf, letterSpacing: '-0.02em', color: T.text }} className="truncate">{g.locker}</p>
                        <p style={{ fontSize: 12, color: T.sec, margin: '1px 0 0', fontFamily: ff }} className="truncate">{g.addr}</p>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: T.sec, fontFamily: mf, flexShrink: 0 }}>{g.packages.length} pkg{g.packages.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* Package list */}
                    <div style={{ borderTop: `1px solid ${T.border}` }}>
                      <div style={{ padding: '6px 16px 4px', display: 'flex' }}>
                        <span style={{ flex: 2, fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ff }}>Tracking</span>
                        <span style={{ flex: 2, fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ff }}>Recipient</span>
                        <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', fontFamily: ff }}>Size</span>
                      </div>
                      {g.packages.map(task => (
                        <div key={task.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', borderTop: `1px solid ${T.fill2}`, gap: 12 }}>
                          <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                            <SizeIcon sz={task.sz} sm T={T} />
                            <p style={{ fontWeight: 700, fontSize: 13, margin: 0, fontFamily: mf, letterSpacing: '-0.01em', color: T.text }} className="truncate">{task.trk}</p>
                          </div>
                          <div style={{ flex: 2, minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: 13, margin: 0, fontFamily: ff, color: T.text }} className="truncate">{task.receiver}</p>
                          </div>
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                            {task.ageRestricted && <Badge v="warn" sm T={T}>ID</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Confirm pickup CTA */}
                    <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${T.border}` }}>
                      <button
                        onClick={() => { g.packages.forEach(p => moveTask(p.id, 'accepted', 'Pickup confirmed')) }}
                        className="press"
                        style={{
                          width: '100%', height: 46, borderRadius: 14, border: 'none',
                          fontWeight: 700, fontSize: 14, fontFamily: ff,
                          background: T.accentGradient, color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          boxShadow: `0 4px 12px ${T.accent}40`,
                        }}
                      >
                        <Check size={16} />Confirm Pickup · {g.packages.length} Package{g.packages.length !== 1 ? 's' : ''}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Accepted ── grouped by locker */}
      {activeTab === 'accepted' && (
        <div style={{ padding: '0 20px' }}>
          {(() => {
            const locGroups = {};
            filtered.forEach(t => { if (!locGroups[t.locker]) locGroups[t.locker] = { locker: t.locker, addr: t.addr, packages: [] }; locGroups[t.locker].packages.push(t) });
            const groups = Object.values(locGroups);
            if (groups.length === 0) return (
              <div style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 20, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
                <div style={{ width: 60, height: 60, borderRadius: 18, background: T.fill2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Truck size={26} style={{ color: T.sec }} />
                </div>
                <p style={{ fontWeight: 800, fontSize: 16, margin: '0 0 4px', fontFamily: hf, letterSpacing: '-0.02em' }}>
                  {search ? 'No matches' : 'Nothing to deliver yet'}
                </p>
                <p style={{ fontSize: 14, color: T.sec, margin: 0, fontFamily: ff }}>
                  {search ? `No results for "${search}"` : 'Scan packages at the warehouse to confirm pickup'}
                </p>
                {!search && (
                  <button onClick={() => { setActiveTab('assigned'); setExpandedId(null) }} className="tap" style={{ marginTop: 16, height: 40, padding: '0 20px', borderRadius: 12, border: 'none', background: T.accentGradient, color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: ff, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Package size={14} />View Assigned
                  </button>
                )}
              </div>
            );
            const sorted = activeDropOff
              ? [...groups].sort((a, b) => (a.locker === activeDropOff ? -1 : b.locker === activeDropOff ? 1 : 0))
              : groups;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sorted.map((g, gi) => {
                  const isActive = activeDropOff === g.locker;
                  const isLocExpanded = isActive || expandedId === ('acc-' + g.locker);
                  const lockerInfo = lockersData.find(l => l.name === g.locker);
                  const isDimmed = activeDropOff && !isActive;
                  const recallPkgs = tasks.filter(t => t.tab === 'recalled' && t.locker === g.locker);
                  return (
                    <div key={g.locker} className={`fu d${Math.min(gi + 1, 6)}`} style={{
                      borderRadius: 20, overflow: 'hidden', background: T.card,
                      border: `1.5px solid ${isActive ? T.accent : T.border}`,
                      boxShadow: isActive ? `0 0 0 3px ${T.accent}20, ${T.shadowMd}` : T.shadow,
                      opacity: isDimmed ? 0.5 : 1,
                      transition: 'opacity 0.2s, border-color 0.2s, box-shadow 0.2s',
                    }}>
                      {isActive && (
                        <div style={{ padding: '8px 16px', background: T.accentGradient, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 6, height: 6, borderRadius: 3, background: '#fff', animation: 'badgePulse 1.5s ease-in-out infinite' }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: ff }}>Drop off in progress · {g.packages.length} package{g.packages.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button onClick={() => setExpandedId(isLocExpanded && !isActive ? null : 'acc-' + g.locker)} className="tap" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'transparent', textAlign: 'left', minWidth: 0 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 14, background: isActive ? T.accentBg : T.fill2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MapPin size={20} style={{ color: isActive ? T.accent : T.sec }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 800, fontSize: 15, margin: 0, fontFamily: ff, color: T.text }} className="truncate">{g.locker}</p>
                            <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? T.accent : T.sec, background: isActive ? T.accentBg : T.fill, borderRadius: 6, padding: '2px 7px', fontFamily: ff }}>{g.packages.length} pkg{g.packages.length !== 1 ? 's' : ''}</span>
                              {recallPkgs.length > 0 && (
                                <span style={{ fontSize: 11, fontWeight: 700, color: T.red, background: T.redBg, borderRadius: 6, padding: '2px 7px', fontFamily: ff, display: 'flex', alignItems: 'center', gap: 3 }}>
                                  <AlertTriangle size={9} />{recallPkgs.length} recall{recallPkgs.length !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          {!isActive && <ChevronDown size={18} style={{ color: T.muted, transform: isLocExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />}
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); setActiveDropOff(isActive ? null : g.locker); }}
                          className="press"
                          style={{
                            height: 36, padding: '0 12px', borderRadius: 10, border: isActive ? `1.5px solid ${T.accent}` : 'none', flexShrink: 0,
                            background: isActive ? T.accentBg : T.accentGradient,
                            color: isActive ? T.accent : '#fff',
                            fontSize: 12, fontWeight: 700, fontFamily: ff,
                            display: 'flex', alignItems: 'center', gap: 5,
                            boxShadow: isActive ? 'none' : `0 4px 12px ${T.accent}40`,
                          }}
                        >
                          {isActive ? <><Check size={13} />Active</> : <><Package size={13} />Begin Drop Off</>}
                        </button>
                      </div>

                      {isLocExpanded && (
                        <div style={{ borderTop: `1px solid ${T.border}` }}>
                          <div style={{ padding: '10px 16px 6px', display: 'flex', alignItems: 'center' }}>
                            <span style={{ flex: 2, fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ff }}>Package</span>
                            <span style={{ flex: 2, fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: ff }}>Recipient</span>
                            <span style={{ flex: 1, fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right', fontFamily: ff }}>Action</span>
                          </div>
                          {g.packages.map(task => {
                            const isTaskExpanded = expandedId === ('pkg-' + task.id);
                            const isInTransit = task.tab === 'in_transit_to_locker';
                            return (
                              <div key={task.id} style={{ borderTop: `1px solid ${T.fill2}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 10 }}>
                                  <button onClick={e => { e.stopPropagation(); setExpandedId(isTaskExpanded ? null : 'pkg-' + task.id) }} className="tap" style={{ flex: 1, display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', textAlign: 'left', gap: 10, minWidth: 0 }}>
                                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                                      <SizeIcon sz={task.sz} sm T={T} />
                                      <div style={{ minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: 13, margin: 0, fontFamily: mf, letterSpacing: '-0.01em', color: T.text }} className="truncate">{task.trk}</p>
                                        <p style={{ fontSize: 11, color: isInTransit ? T.accent : T.sec, margin: 0, fontFamily: ff, fontWeight: isInTransit ? 700 : 400 }}>{isInTransit ? 'In transit' : task.sz}</p>
                                      </div>
                                    </div>
                                    <div style={{ flex: 2, minWidth: 0 }}>
                                      <p style={{ fontWeight: 600, fontSize: 13, margin: 0, fontFamily: ff, color: T.text }} className="truncate">{task.receiver}</p>
                                    </div>
                                    <ChevronDown size={15} style={{ color: T.muted, flexShrink: 0, transform: isTaskExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                                  </button>
                                  {isInTransit && (
                                    <button
                                      onClick={e => { e.stopPropagation(); setDropView('pin'); setDropModal({ ...task }); }}
                                      className="press"
                                      style={{ height: 36, padding: '0 12px', borderRadius: 10, border: 'none', background: T.gradientSuccess, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: ff, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, boxShadow: `0 4px 10px ${T.green}40` }}
                                    >
                                      <Package size={12} />Deposit
                                    </button>
                                  )}
                                </div>
                                {isTaskExpanded && (
                                  <div style={{ padding: '12px 16px 14px', borderTop: `1px solid ${T.fill2}` }}>
                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: T.sec, background: T.fill, borderRadius: 8, padding: '4px 10px', fontFamily: ff }}>{task.sender} → {task.receiver}</span>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: T.sec, background: T.fill, borderRadius: 8, padding: '4px 10px', fontFamily: ff }}>ETA {task.eta}</span>
                                    </div>
                                    {(task.ageRestricted || task.highValue) && (
                                      <div style={{ borderRadius: 10, padding: '8px 12px', background: T.redBg, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                                        <Shield size={13} style={{ color: T.red }} />
                                        <span style={{ fontSize: 12, fontWeight: 700, color: T.red, fontFamily: ff }}>{task.ageRestricted ? 'Age Restricted' : 'High Value'} — ID Required</span>
                                      </div>
                                    )}
                                    {!isInTransit && (
                                      <button
                                        onClick={e => { e.stopPropagation(); moveTask(task.id, 'in_transit_to_locker', 'Delivery started'); }}
                                        className="press"
                                        style={{ width: '100%', height: 44, borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, fontFamily: ff, background: T.accentGradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 12px ${T.accent}40` }}
                                      >
                                        <Truck size={16} />Start Delivery
                                      </button>
                                    )}
                                    {isInTransit && (
                                      <button
                                        onClick={e => { e.stopPropagation(); setDropView('pin'); setDropModal({ ...task }); }}
                                        className="press"
                                        style={{ width: '100%', height: 44, borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, fontFamily: ff, background: T.gradientSuccess, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 4px 12px ${T.green}40` }}
                                      >
                                        <Package size={16} />Deposit Package
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {recallPkgs.length > 0 && (
                            <div style={{ borderTop: `1.5px solid ${T.red}40`, padding: '12px 16px', background: T.redBg, display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <AlertTriangle size={14} style={{ color: T.red, flexShrink: 0 }} />
                                <span style={{ fontSize: 12, fontWeight: 700, color: T.red, fontFamily: ff }}>
                                  Pick up {recallPkgs.length} recalled package{recallPkgs.length !== 1 ? 's' : ''} before you leave
                                </span>
                              </div>
                              {recallPkgs.map(rp => (
                                <div key={rp.id} style={{ borderRadius: 10, padding: '10px 12px', background: T.card, border: `1px solid ${T.red}30`, display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <SizeIcon sz={rp.sz} sm T={T} />
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: 700, fontSize: 13, margin: 0, fontFamily: mf, letterSpacing: '-0.01em', color: T.text }} className="truncate">{rp.trk}</p>
                                    <p style={{ fontSize: 11, color: T.sec, margin: 0, fontFamily: ff }}>→ {rp.returnDest || 'Warehouse'}</p>
                                  </div>
                                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                    <p style={{ fontSize: 9, fontWeight: 700, color: T.muted, margin: 0, fontFamily: ff, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pick-up code</p>
                                    <p style={{ fontSize: 14, fontWeight: 800, color: T.red, margin: 0, fontFamily: mf }}>{genCode('PKU', rp.trk)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── Delivered / Recall ── individual cards */}
      {(activeTab === 'delivered_to_locker' || activeTab === 'recalled') && (
        <div style={{ padding: '0 20px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', borderRadius: 20, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
              <div style={{ width: 60, height: 60, borderRadius: 18, background: currentTab.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                {activeTab === 'delivered_to_locker' && <CheckCircle size={26} style={{ color: currentTab.color }} />}
                {activeTab === 'recalled' && <RotateCcw size={26} style={{ color: currentTab.color }} />}
              </div>
              <p style={{ fontWeight: 800, fontSize: 16, margin: '0 0 4px', fontFamily: hf, letterSpacing: '-0.02em' }}>
                {search ? 'No matches' : activeTab === 'delivered_to_locker' ? 'No deliveries yet' : 'No recalled packages'}
              </p>
              <p style={{ fontSize: 14, color: T.sec, margin: 0, fontFamily: ff }}>
                {search ? `No results for "${search}"` : activeTab === 'delivered_to_locker' ? 'Packages confirmed at lockers will appear here' : 'No recalled packages at this time'}
              </p>
              {!search && activeTab === 'delivered_to_locker' && (
                <button onClick={() => { setActiveTab('assigned'); setExpandedId(null) }} className="tap" style={{ marginTop: 16, height: 40, padding: '0 20px', borderRadius: 12, border: 'none', background: T.accentGradient, color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: ff, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Package size={14} />View Pickup List
                </button>
              )}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((task, ti) => {
              const isExpanded = expandedId === task.id;
              return (
                <div
                  key={task.id}
                  className={`fu d${Math.min(ti + 1, 6)}`}
                  style={{
                    borderRadius: 16, overflow: 'hidden', background: T.card,
                    border: `1.5px solid ${T.border}`,
                    boxShadow: T.shadow,
                  }}
                >
                  <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => setExpandedId(isExpanded ? null : task.id)} className="tap" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, border: 'none', background: 'transparent', textAlign: 'left', minWidth: 0 }}>
                      <SizeIcon sz={task.sz} T={T} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, margin: 0, fontFamily: mf, letterSpacing: '-0.01em', color: T.text }} className="truncate">{task.trk}</p>
                        <p style={{ fontSize: 12, color: T.sec, margin: '2px 0 0', fontFamily: ff }}>
                          {task.locker}
                        </p>
                      </div>
                      <ChevronDown size={16} style={{ color: T.muted, transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform .2s', flexShrink: 0 }} />
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={{ borderTop: `1px solid ${T.border}`, padding: '14px 16px 16px' }}>

                      {/* Key info chips */}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.sec, background: T.fill, borderRadius: 8, padding: '4px 10px', fontFamily: ff, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <User size={11} />{task.sender} → {task.receiver}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.sec, background: T.fill, borderRadius: 8, padding: '4px 10px', fontFamily: ff, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} />ETA {task.eta}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.sec, background: T.fill, borderRadius: 8, padding: '4px 10px', fontFamily: ff, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} />{task.addr}
                        </span>
                      </div>

                      {/* Alerts */}
                      {(task.ageRestricted || task.highValue) && (
                        <div style={{ borderRadius: 10, padding: '8px 12px', background: T.redBg, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <Shield size={13} style={{ color: T.red }} />
                          <span style={{ fontSize: 12, fontWeight: 700, color: T.red, fontFamily: ff }}>{task.ageRestricted ? 'Age Restricted' : 'High Value'} — ID Required</span>
                        </div>
                      )}
                      {activeTab === 'recalled' && task.reason && (
                        <div style={{ borderRadius: 10, padding: '8px 12px', background: T.redBg, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <AlertTriangle size={13} style={{ color: T.red }} />
                          <div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: T.red, fontFamily: ff, display: 'block' }}>Recall: {task.reason}</span>
                          </div>
                        </div>
                      )}

                      {/* Quick actions */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                        <button onClick={() => copyTrk(task.trk)} className="tap" style={{ height: 32, padding: '0 10px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 11, fontWeight: 600, fontFamily: ff, display: 'flex', alignItems: 'center', gap: 4, color: copiedId === task.trk ? T.green : T.sec }}>
                          {copiedId === task.trk ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy ID</>}
                        </button>
                        <button onClick={() => window.open('tel:' + task.phone?.replace(/\s/g, ''))} className="tap" style={{ height: 32, padding: '0 10px', borderRadius: 8, border: `1.5px solid ${T.border}`, background: T.bg, fontSize: 11, fontWeight: 600, fontFamily: ff, display: 'flex', alignItems: 'center', gap: 4, color: T.sec }}>
                          <Phone size={11} />Call
                        </button>
                        <NavigationButton name={task.locker} addr={task.addr} lat={(lockersData.find(l => l.name === task.locker) || {}).lat} lng={(lockersData.find(l => l.name === task.locker) || {}).lng} compact T={T} />
                      </div>

                      {/* Primary CTA */}
                      {activeTab === 'recalled' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ borderRadius: 14, padding: 14, background: T.fill, textAlign: 'center' }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: ff }}>Pick Up Code</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                              {genCode('PKU', task.trk).split('').map((ch, ci) => (
                                <div key={ci} style={{ width: 34, height: 42, borderRadius: 8, background: ch === '-' ? 'transparent' : T.card, border: ch === '-' ? 'none' : `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ch === '-' ? 18 : 20, fontWeight: 700, fontFamily: mf, color: T.red }}>
                                  {ch}
                                </div>
                              ))}
                            </div>
                            <p style={{ fontSize: 12, color: T.sec, margin: 0, fontFamily: ff }}>Enter at the locker to pick up</p>
                          </div>
                          <NavigationButton name={task.locker} addr={task.addr} lat={(lockersData.find(l => l.name === task.locker) || {}).lat} lng={(lockersData.find(l => l.name === task.locker) || {}).lng} T={T} />
                        </div>
                      )}
                      {activeTab === 'delivered_to_locker' && (
                        <div style={{ borderRadius: 12, padding: 12, background: T.greenBg, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check size={16} style={{ color: '#fff' }} />
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: T.greenDark, margin: 0, fontFamily: ff }}>Dropped off at {task.depositedAt}</p>
                            <p style={{ fontSize: 12, color: T.green, margin: 0, fontFamily: ff }}>Customer notified automatically</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Drop modal (bottom sheet) ── */}
      {dropModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => { setDropModal(null); setDropView('choice') }}>
          <div style={{ position: 'absolute', inset: 0, background: T.overlayLight, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
          <div className="su" onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 448, background: T.bg, borderRadius: '24px 24px 0 0', padding: '24px 24px 36px', boxShadow: T.shadowLg }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: T.fill2, margin: '0 auto 20px' }} />

            {/* Assigned → scan to accept */}
            {dropModal.tab === 'assigned' && (
              <>
                {dropView === 'choice' && (
                  <>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: T.fill2, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <Package size={24} style={{ color: T.text }} />
                      </div>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', fontFamily: hf, letterSpacing: '-0.025em' }}>Scan to Accept</h3>
                      <p style={{ fontSize: 14, color: T.sec, margin: 0, fontFamily: ff }}>{dropModal.trk}{' \u00B7 '}{dropModal.sz}</p>
                    </div>
                    <div style={{ borderRadius: 16, padding: 14, background: T.card, border: `1.5px solid ${T.border}`, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <SizeIcon sz={dropModal.sz} T={T} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 2px', fontFamily: ff }}>{dropModal.receiver}</p>
                        <p style={{ fontSize: 12, color: T.sec, margin: 0, fontFamily: ff }}>{dropModal.locker}{' \u00B7 '}{dropModal.addr}</p>
                      </div>
                    </div>
                    <button onClick={() => setDropView('scanning')} className="press" style={{ width: '100%', height: 52, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 16, fontFamily: hf, letterSpacing: '-0.025em', background: T.accentGradient, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10, boxShadow: `0 4px 16px ${T.accent}50` }}>
                      <Package size={20} />Scan Package Barcode
                    </button>
                    <button onClick={() => { setDropModal(null); setDropView('choice') }} className="tap" style={{ width: '100%', height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, fontWeight: 600, fontSize: 14, fontFamily: ff, color: T.sec }}>Cancel</button>
                  </>
                )}
                {dropView === 'scanning' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 200, height: 200, borderRadius: 20, background: T.fill2, margin: '0 auto 24px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="scan-line" style={{ position: 'absolute', left: 12, right: 12, height: 2, background: `linear-gradient(90deg, transparent, ${T.text}, transparent)`, borderRadius: 1, boxShadow: `0 0 8px rgba(0,0,0,0.25)`, zIndex: 2 }} />
                      <ScanFrame T={T} />
                      <div style={{ width: 64, height: 64, borderRadius: 16, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Package size={28} style={{ color: T.text }} />
                      </div>
                    </div>
                    <p style={{ fontWeight: 800, fontSize: 17, margin: '0 0 6px', fontFamily: hf, letterSpacing: '-0.025em' }}>Scanning {dropModal.trk}</p>
                    <p style={{ fontSize: 14, color: T.sec, margin: '0 0 24px', fontFamily: ff }}>Align the package barcode within the frame</p>
                    <button onClick={() => setDropView('confirmed')} className="press" style={{ width: '100%', height: 48, borderRadius: 14, border: `1.5px solid ${T.border}`, fontWeight: 700, fontSize: 15, fontFamily: ff, background: T.card, color: T.sec, marginBottom: 10, boxShadow: T.shadow }}>
                      Barcode detected — tap to proceed
                    </button>
                    <button onClick={() => setDropView('choice')} className="tap" style={{ border: 'none', background: 'none', fontSize: 14, fontWeight: 600, color: T.muted, fontFamily: ff }}>Back</button>
                  </div>
                )}
                {dropView === 'confirmed' && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 72, height: 72, borderRadius: 36, background: T.gradientSuccess, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 12px 32px ${T.green}40` }}>
                      <svg width={36} height={36} viewBox="0 0 40 40">
                        <circle cx={20} cy={20} r={18} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
                        <path d="M12 20l6 6 10-12" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} style={{ animation: 'checkAnim .5s ease forwards' }} />
                      </svg>
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: T.green, margin: '0 0 4px', fontFamily: hf, letterSpacing: '-0.025em' }}>Package Verified</h3>
                    <p style={{ fontSize: 14, color: T.sec, margin: '0 0 24px', fontFamily: ff }}>{dropModal.trk} matched successfully</p>
                    <button onClick={() => { moveTask(dropModal.id, 'accepted', 'Pickup confirmed'); setDropModal(null); setDropView('choice') }} className="press" style={{ width: '100%', height: 52, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 16, fontFamily: hf, letterSpacing: '-0.025em', background: T.gradientSuccess, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 8px 24px ${T.green}40` }}>
                      <Check size={20} />Confirm Pickup
                    </button>
                  </div>
                )}
              </>
            )}

            {/* In Transit → deposit PIN */}
            {dropModal.tab === 'in_transit_to_locker' && dropView === 'pin' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: T.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <Package size={24} style={{ color: T.green }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px', fontFamily: hf, letterSpacing: '-0.025em' }}>Deposit at {dropModal.locker}</h3>
                <p style={{ fontSize: 14, color: T.sec, margin: '0 0 20px', fontFamily: ff }}>{dropModal.trk} · {dropModal.sz}</p>
                <div style={{ borderRadius: 16, padding: '14px 16px', background: T.fill, marginBottom: 16 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: ff }}>Deposit Code</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                    {genCode('DEP', dropModal.trk).split('').map((ch, ci) => (
                      <div key={ci} style={{ width: 34, height: 42, borderRadius: 8, background: ch === '-' ? 'transparent' : T.card, border: ch === '-' ? 'none' : `1.5px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: ch === '-' ? 18 : 20, fontWeight: 700, fontFamily: mf, color: T.green }}>
                        {ch}
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: T.sec, margin: 0, fontFamily: ff }}>Scan or enter at the locker terminal</p>
                </div>
                <button onClick={() => { moveTask(dropModal.id, 'delivered_to_locker', 'Package deposited'); setDropModal(null); setDropView('choice'); }} className="press" style={{ width: '100%', height: 52, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 16, fontFamily: hf, letterSpacing: '-0.025em', background: T.gradientSuccess, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10, boxShadow: `0 8px 24px ${T.green}40` }}>
                  <Check size={20} />Confirm Deposit
                </button>
                <button onClick={() => { setDropModal(null); setDropView('choice'); }} className="tap" style={{ width: '100%', height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, fontWeight: 600, fontSize: 14, fontFamily: ff, color: T.sec }}>Cancel</button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── Confirmation modal ── */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={() => setModal(null)}>
          <div style={{ position: 'absolute', inset: 0, background: T.overlayLight, backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
          <div className="su" onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 448, background: T.bg, borderRadius: '24px 24px 0 0', padding: '28px 24px 36px', boxShadow: T.shadowLg }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: T.fill2, margin: '0 auto 20px' }} />
            <div style={{ width: 52, height: 52, borderRadius: 16, background: modal.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              {modal.to === 'accepted' && <Package size={26} style={{ color: modal.color }} />}
              {modal.to === 'in_transit_to_locker' && <Truck size={26} style={{ color: modal.color }} />}
              {modal.to === 'delivered_to_locker' && <CheckCircle size={26} style={{ color: modal.color }} />}
              {modal.to === 'assigned' && <RotateCcw size={26} style={{ color: modal.color }} />}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', textAlign: 'center', fontFamily: hf, letterSpacing: '-0.025em' }}>{modal.label}</h3>
            <p style={{ fontSize: 14, color: T.sec, margin: '0 0 4px', textAlign: 'center', fontFamily: ff }}>{modal.desc}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 24px', textAlign: 'center', fontFamily: mf }}>{modal.task.trk}{' \u00B7 '}{modal.task.locker}</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setModal(null)} className="tap" style={{ flex: 1, height: 48, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, fontWeight: 700, fontSize: 14, fontFamily: ff, color: T.sec }}>Cancel</button>
              <button onClick={() => moveTask(modal.task.id, modal.to, modal.label + ' complete')} className="press" style={{ flex: 2, height: 48, borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, fontFamily: ff, background: modal.color, color: '#fff' }}>{modal.label}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className="sd" style={{ position: 'fixed', top: 52, left: '50%', transform: 'translateX(-50%)', zIndex: 200, padding: '10px 20px', borderRadius: 14, background: T.text, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: ff, display: 'flex', alignItems: 'center', gap: 8, boxShadow: T.shadowLg, whiteSpace: 'nowrap' }}>
          <div style={{ width: 20, height: 20, borderRadius: 10, background: toast.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={12} style={{ color: '#fff' }} />
          </div>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default TasksScreen;
