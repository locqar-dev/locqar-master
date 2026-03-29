import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import SwipeConfirm from '../components/SwipeConfirm';
import { Home, MapPin, Phone, Package, CheckCircle, Truck, Clock, ChevronDown, ChevronUp, Navigation, X } from '../components/Icons';

const ff = "'Inter', system-ui, -apple-system, sans-serif";
const hf = "'Space Grotesk', 'DM Sans', system-ui, -apple-system, sans-serif";

const STATUS_META = {
  assigned:           { label: 'Assigned',    color: '#D4AA5A', next: 'accepted',           nextLabel: 'Accept Delivery' },
  accepted:           { label: 'Accepted',    color: '#7EA8C9', next: 'in_transit_to_home',  nextLabel: 'Picked Up from Locker' },
  in_transit_to_home: { label: 'En Route',    color: '#7EA8C9', next: 'delivered_to_home',   nextLabel: 'Confirm Delivery' },
  delivered_to_home:  { label: 'Delivered',   color: '#81C995', next: null,                  nextLabel: null },
};

const SZ = { S: '#81C995', M: '#7EA8C9', L: '#D4AA5A', XL: '#B5A0D1' };

const HomeDeliveryScreen = ({ tasks, setTasks, onBack, T }) => {
  const homeTasks = tasks.filter(t => t.deliveryType === 'home');
  const [activeTab, setActiveTab] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, color) => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500) };

  const advanceStatus = (task) => {
    const meta = STATUS_META[task.tab];
    if (!meta?.next) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const extra = meta.next === 'accepted' ? { acceptedAt: now }
      : meta.next === 'in_transit_to_home' ? { transitHomeAt: now }
      : meta.next === 'delivered_to_home' ? { deliveredHomeAt: now }
      : {};
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, tab: meta.next, ...extra } : t));
    setConfirmId(null);
    showToast(meta.nextLabel + ' ✓', meta.next === 'delivered_to_home' ? T.green : T.accent);
    if (meta.next === 'delivered_to_home') setActiveTab('delivered');
  };

  const tabs = [
    { id: 'pending', label: 'Pending', count: homeTasks.filter(t => ['assigned', 'accepted'].includes(t.tab)).length },
    { id: 'en_route', label: 'En Route', count: homeTasks.filter(t => t.tab === 'in_transit_to_home').length },
    { id: 'delivered', label: 'Delivered', count: homeTasks.filter(t => t.tab === 'delivered_to_home').length },
  ];

  const filtered = homeTasks.filter(t => {
    if (activeTab === 'pending') return ['assigned', 'accepted'].includes(t.tab);
    if (activeTab === 'en_route') return t.tab === 'in_transit_to_home';
    if (activeTab === 'delivered') return t.tab === 'delivered_to_home';
    return false;
  });

  return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', fontFamily: ff }}>
      <StatusBar T={T} />
      <TopBar title="Home Deliveries" onBack={onBack} T={T} />

      {/* Stats Strip */}
      <div style={{ display: 'flex', gap: 0, margin: '12px 16px 0', borderRadius: 16, overflow: 'hidden', border: `1.5px solid ${T.border}` }}>
        {[
          { label: 'Pending', value: tabs[0].count, color: T.amber },
          { label: 'En Route', value: tabs[1].count, color: T.accent },
          { label: 'Done', value: tabs[2].count, color: T.green },
        ].map((s, i) => (
          <div key={s.label} style={{ flex: 1, padding: '10px 8px', background: T.card, textAlign: 'center', borderLeft: i > 0 ? `1px solid ${T.border}` : 'none' }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: s.color, margin: 0, fontFamily: hf }}>{s.value}</p>
            <p style={{ fontSize: 10, color: T.muted, margin: 0, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 0, margin: '12px 16px 0', background: T.fill, borderRadius: 12, padding: 3 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ flex: 1, height: 34, borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 12, fontFamily: ff, background: activeTab === tab.id ? T.card : 'transparent', color: activeTab === tab.id ? T.text : T.muted, boxShadow: activeTab === tab.id ? T.shadow : 'none', transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, cursor: 'pointer' }}>
            {tab.label}
            {tab.count > 0 && (
              <span style={{ minWidth: 18, height: 18, borderRadius: 9, background: activeTab === tab.id ? T.accentBg : T.fill2, color: activeTab === tab.id ? T.accent : T.muted, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Home size={36} style={{ color: T.muted, marginBottom: 12 }} />
            <p style={{ fontWeight: 700, color: T.text, margin: '0 0 4px', fontFamily: hf }}>
              {activeTab === 'delivered' ? 'No deliveries yet' : 'No home deliveries'}
            </p>
            <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
              {activeTab === 'delivered' ? 'Completed home deliveries appear here' : 'Home delivery assignments will appear here'}
            </p>
          </div>
        )}

        {filtered.map(task => {
          const meta = STATUS_META[task.tab] || {};
          const isExpanded = expandedId === task.id;
          return (
            <div key={task.id} style={{ borderRadius: 16, border: `1.5px solid ${isExpanded ? T.accent : T.border}`, background: T.card, overflow: 'hidden', boxShadow: isExpanded ? T.shadowMd : T.shadow }}>
              {/* Card Header */}
              <button onClick={() => setExpandedId(isExpanded ? null : task.id)} style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}>
                {/* Icon */}
                <div style={{ width: 40, height: 40, borderRadius: 12, background: task.tab === 'delivered_to_home' ? T.greenBg : T.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {task.tab === 'delivered_to_home'
                    ? <CheckCircle size={20} style={{ color: T.green }} />
                    : task.tab === 'in_transit_to_home'
                    ? <Truck size={20} style={{ color: T.accent }} />
                    : <Home size={20} style={{ color: T.accent }} />}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text, fontFamily: hf }}>{task.receiver}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, paddingInline: 6, paddingBlock: 2, borderRadius: 6, background: `${meta.color}20`, color: meta.color }}>{meta.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, paddingInline: 5, paddingBlock: 2, borderRadius: 6, background: `${SZ[task.sz]}20`, color: SZ[task.sz] }}>{task.sz}</span>
                  </div>
                  <p style={{ fontSize: 12, color: T.muted, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <MapPin size={10} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />{task.homeAddr}
                  </p>
                </div>
                {isExpanded ? <ChevronUp size={16} style={{ color: T.muted, flexShrink: 0 }} /> : <ChevronDown size={16} style={{ color: T.muted, flexShrink: 0 }} />}
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{ borderTop: `1px solid ${T.border}`, padding: '14px 16px' }}>
                  {/* Package & Pickup Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                    {[
                      { icon: <Package size={13} />, label: 'Tracking', value: task.trk },
                      { icon: <Home size={13} />, label: 'Pickup Locker', value: task.pickupLocker },
                      { icon: <Clock size={13} />, label: 'ETA', value: task.eta },
                      { icon: <Phone size={13} />, label: 'Recipient Phone', value: task.phone },
                    ].map(({ icon, label, value }) => (
                      <div key={label} style={{ background: T.fill, borderRadius: 10, padding: '8px 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: T.muted, marginBottom: 2 }}>
                          {icon}
                          <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: T.text, margin: 0 }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div style={{ background: T.fill, borderRadius: 10, padding: '10px 12px', marginBottom: 14 }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: T.muted, margin: '0 0 3px' }}>DELIVERY ADDRESS</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: T.text, margin: '0 0 3px' }}>{task.homeAddr}</p>
                    {task.homeNote && <p style={{ fontSize: 11, color: T.amber, margin: 0, fontWeight: 600 }}>📝 {task.homeNote}</p>}
                  </div>

                  {/* Timeline */}
                  <div style={{ marginBottom: task.tab !== 'delivered_to_home' ? 14 : 0 }}>
                    {[
                      { key: 'acceptedAt', label: 'Accepted' },
                      { key: 'transitHomeAt', label: 'Picked up from locker' },
                      { key: 'deliveredHomeAt', label: 'Delivered to door' },
                    ].filter(e => task[e.key]).map((e) => (
                      <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 4, background: T.green, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: T.muted, flex: 1 }}>{e.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: T.greenDark }}>{task[e.key]}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {task.tab !== 'delivered_to_home' && meta.next && (
                    <>
                      {/* Navigation Button */}
                      <button
                        onClick={() => { const q = encodeURIComponent(task.homeAddr); window.open(`https://maps.google.com/?q=${q}`, '_blank') }}
                        style={{ width: '100%', height: 42, borderRadius: 12, border: `1.5px solid ${T.border}`, background: 'none', color: T.accent, fontWeight: 600, fontSize: 13, fontFamily: ff, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8, cursor: 'pointer' }}>
                        <Navigation size={15} />Navigate to {task.tab === 'accepted' ? 'Locker' : 'Address'}
                      </button>

                      {/* Advance Status */}
                      {task.tab === 'in_transit_to_home' ? (
                        <SwipeConfirm
                          label={meta.nextLabel}
                          onConfirm={() => advanceStatus(task)}
                          T={T}
                        />
                      ) : (
                        <button
                          onClick={() => advanceStatus(task)}
                          style={{ width: '100%', height: 46, borderRadius: 12, border: 'none', background: T.accentGradient, color: '#fff', fontWeight: 700, fontSize: 14, fontFamily: hf, letterSpacing: '-0.02em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, boxShadow: `0 6px 20px ${T.accent}40` }}>
                          <Truck size={16} />{meta.nextLabel}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 80, left: 16, right: 16, maxWidth: 416, margin: '0 auto', zIndex: 150, padding: '12px 16px', borderRadius: 12, background: T.text, display: 'flex', alignItems: 'center', gap: 10, boxShadow: T.shadowLg, animation: 'slideUp .2s ease' }}>
          <CheckCircle size={16} style={{ color: T.green, flexShrink: 0 }} />
          <span style={{ flex: 1, color: '#fff', fontSize: 13, fontWeight: 600 }}>{toast.msg}</span>
        </div>
      )}
    </div>
  );
};

export default HomeDeliveryScreen;
