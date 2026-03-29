import React from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { User, CheckCircle, Truck, Shield, Settings, HelpCircle, LogOut, ChevronRight, Star, TrendingUp } from '../components/Icons';
import { driver } from '../data/mockData';

const ProfileScreen = ({ onBack, onLogout, onNav, T }) => (
  <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}><StatusBar />
    <TopBar title="Profile" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 40,
            background: T.accentGradient,
            padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: T.shadowMd,
          }}>
            <div style={{ width: 74, height: 74, borderRadius: 37, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34 }}>{driver.avatar}</div>
          </div>
        </div>
        <h2 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{driver.name}</h2>
        <p style={{ fontSize: 13, color: T.sec, margin: '0 0 8px' }}>{driver.id} {'\u00B7'} Joined {driver.joined}</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: T.accentBg, borderRadius: 20, padding: '4px 12px', marginBottom: 4 }}>
          <Star size={12} fill={T.accent} style={{ color: T.accent }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>Pro Driver</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}><Star size={13} fill={T.amber} style={{ color: T.amber }} /><span style={{ fontWeight: 700, fontSize: 13 }}>{driver.rating}</span><span style={{ fontSize: 13, color: T.sec }}>({driver.deliveries} deliveries)</span></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[{ l: 'On-Time', v: `${driver.onTime}%` }, { l: 'Rating', v: driver.rating }, { l: 'Deliveries', v: driver.deliveries }].map((s, i) =>
          <div key={i} style={{ borderRadius: 14, padding: '14px 12px', textAlign: 'center', background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: '0 0 2px', fontFamily: "'JetBrains Mono', monospace" }}>{s.v}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: T.sec, margin: 0 }}>{s.l}</p>
          </div>
        )}
      </div>
      <div style={{ borderRadius: 16, padding: 16, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow, marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>Vehicle</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 48, height: 48, borderRadius: 12, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 24 }}>{'\uD83D\uDE90'}</span></div><div><p style={{ fontWeight: 700, margin: 0 }}>{driver.vehicle}</p><p style={{ fontSize: 14, color: T.sec, margin: 0 }}>{driver.plate}</p></div></div>
      </div>
      <div style={{ borderRadius: 16, overflow: 'hidden', background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
        {[{ icon: <User size={18} />, label: 'Personal Info', act: () => onNav('profileInfo') }, { icon: <CheckCircle size={18} />, label: 'Delivery History', act: () => onNav('history') }, { icon: <Truck size={18} />, label: 'Vehicle Settings', act: () => onNav('vehicleSettings') }, { icon: <Shield size={18} />, label: 'Safety & Support', act: () => onNav('profileSafety') }, { icon: <Settings size={18} />, label: 'App Settings', act: () => onNav('profileSettings') }, { icon: <HelpCircle size={18} />, label: 'Help Center', act: () => onNav('profileHelp') }, { icon: <LogOut size={18} style={{ color: T.red }} />, label: 'Log Out', act: onLogout, danger: true }].map((m, i) =>
          <button key={i} onClick={m.act} className="press" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: i < 6 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div>
            <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: m.danger ? T.red : T.text }}>{m.label}</span><ChevronRight size={16} style={{ color: T.muted }} />
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ProfileScreen;
