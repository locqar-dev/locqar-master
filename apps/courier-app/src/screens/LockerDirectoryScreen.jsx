import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import NavigationButton from '../components/NavigationModal';
import { Search, MapPin, ChevronDown, Battery } from '../components/Icons';
import { lockersData } from '../data/mockData';
import { sizeColor } from './HomeScreen';

const LockerDirectoryScreen = ({ tasks, adjLockers, onBack, T }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const filtered = adjLockers.filter(l => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (search) { const q = search.toLowerCase(); return l.name.toLowerCase().includes(q) || l.addr.toLowerCase().includes(q) }
    return true;
  });
  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="Locker Directory" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: T.muted }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search lockers..." style={{ width: '100%', height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, padding: '0 14px 0 40px', fontSize: 14, fontWeight: 500, background: T.fill, color: T.text }} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[{ id: 'all', l: 'All' }, { id: 'online', l: 'Online' }, { id: 'offline', l: 'Offline' }, { id: 'maintenance', l: 'Maintenance' }].map(f => (
          <button key={f.id} onClick={() => setStatusFilter(f.id)} className="tap" style={{ height: 30, padding: '0 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, background: statusFilter === f.id ? T.text : T.fill, color: statusFilter === f.id ? '#fff' : T.sec }}>{f.l}</button>
        ))}
      </div>
      {filtered.map(l => {
        const isExp = expandedId === l.id;
        const taskCount = tasks.filter(t => t.locker === l.name && t.tab !== 'recalled' && t.tab !== 'delivered_to_locker').length;
        const totalCompartments = Object.values(l.avail).reduce((a, b) => a + b, 0);
        return <div key={l.id} className="fu" style={{ borderRadius: 16, overflow: 'hidden', background: T.card, border: `1.5px solid ${isExp ? T.accent : T.border}`, boxShadow: T.shadow, marginBottom: 12 }}>
          <button onClick={() => setExpandedId(isExp ? null : l.id)} className="tap" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: l.status === 'online' ? T.greenBg : l.status === 'maintenance' ? T.fill2 : T.redBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={22} style={{ color: l.status === 'online' ? T.green : l.status === 'maintenance' ? T.sec : T.red }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{l.name}</p>
                <div style={{ width: 8, height: 8, borderRadius: 4, background: l.status === 'online' ? T.green : l.status === 'maintenance' ? T.sec : T.red }} />
              </div>
              <p style={{ fontSize: 12, color: T.sec, margin: '2px 0 0' }}>{l.addr}</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: T.sec }}>{l.dist}</span>
                <span style={{ fontSize: 11, color: T.sec }}>{'\u00B7'}</span>
                <span style={{ fontSize: 11, color: T.sec }}>{l.hours}</span>
              </div>
            </div>
            <div style={{ transform: isExp ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}><ChevronDown size={16} style={{ color: T.muted }} /></div>
          </button>
          {isExp && <div style={{ borderTop: `1px solid ${T.border}`, padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: '0 0 8px' }}>Compartment Availability</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
              {Object.entries(l.avail).map(([s, n]) => {
                const [bg, c] = sizeColor(s, T); return <div key={s} style={{ borderRadius: 12, padding: 10, textAlign: 'center', background: bg }}>
                  <p style={{ fontSize: 18, fontWeight: 800, color: c, margin: 0 }}>{n}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: c, margin: 0 }}>{s}</p>
                </div>
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Battery size={14} style={{ color: l.bat > 80 ? T.green : l.bat > 40 ? T.sec : T.red }} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>{l.bat}%</span>
              </div>
              <span style={{ fontSize: 12, color: T.sec }}>{totalCompartments} compartments {'\u00B7'} {taskCount} active tasks</span>
            </div>
            <NavigationButton name={l.name} addr={l.addr} lat={l.lat} lng={l.lng} T={T} />
          </div>}
        </div>;
      })}
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px' }}><MapPin size={32} style={{ color: T.muted, marginBottom: 12 }} /><p style={{ fontWeight: 700, margin: '0 0 4px' }}>No lockers found</p><p style={{ fontSize: 14, color: T.sec, margin: 0 }}>Try adjusting your search or filters</p></div>}
    </div>
  </div>;
};

export default LockerDirectoryScreen;
