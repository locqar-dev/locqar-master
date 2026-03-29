import React from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { AlertTriangle, Shield, Phone, HelpCircle, User, ChevronRight } from '../components/Icons';

const ProfileSafetyScreen = ({ onBack, T }) => (
  <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="Safety & Support" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ borderRadius: 12, padding: 16, background: T.redBg, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={22} style={{ color: T.red }} /></div>
        <div style={{ flex: 1 }}><p style={{ fontWeight: 700, margin: '0 0 2px', color: T.redDark }}>Emergency SOS</p><p style={{ fontSize: 13, color: T.red, margin: 0 }}>Long press to alert emergency contacts</p></div>
      </div>
      {[{ icon: <Shield size={18} />, l: 'Insurance Coverage', d: 'View your delivery insurance details' }, { icon: <Phone size={18} />, l: 'Emergency Contacts', d: 'Manage your emergency contacts' }, { icon: <HelpCircle size={18} />, l: 'Report an Issue', d: 'Report safety concerns or incidents' }, { icon: <User size={18} />, l: 'Background Check', d: 'View verification status' }].map((m, i) =>
        <button key={i} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', border: 'none', background: 'none', borderBottom: `1px solid ${T.border}`, textAlign: 'left' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.sec }}>{m.icon}</div>
          <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>{m.l}</p><p style={{ fontSize: 12, color: T.sec, margin: 0 }}>{m.d}</p></div>
          <ChevronRight size={16} style={{ color: T.muted }} />
        </button>
      )}
    </div>
  </div>
);

export default ProfileSafetyScreen;
