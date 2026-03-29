import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';

const ProfileSettingsScreen = ({ onBack, darkMode, onToggleDark, T }) => {
  const [notifOn, setNotifOn] = useState(true); const [sound, setSound] = useState(true);
  const Toggle = ({ on, onTap }) => (
    <button onClick={onTap} className="tap" style={{ width: 48, height: 28, borderRadius: 14, background: on ? T.green : T.fill2, border: 'none', padding: 2, display: 'flex', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start', transition: 'all .2s' }}>
      <div style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.15)' }} />
    </button>
  );
  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="App Settings" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      {[{ l: 'Push Notifications', d: 'Delivery alerts and updates', on: notifOn, tap: () => setNotifOn(!notifOn) }, { l: 'Dark Mode', d: 'Switch to dark theme', on: darkMode, tap: onToggleDark }, { l: 'Sound Effects', d: 'Button and alert sounds', on: sound, tap: () => setSound(!sound) }].map((s, i) =>
        <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ flex: 1 }}><p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 2px' }}>{s.l}</p><p style={{ fontSize: 12, color: T.sec, margin: 0 }}>{s.d}</p></div>
          <Toggle on={s.on} onTap={s.tap} />
        </div>
      )}
      <div style={{ marginTop: 24, borderRadius: 12, padding: 16, background: T.fill, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: T.muted, margin: '0 0 4px' }}>App Version</p>
        <p style={{ fontWeight: 700, margin: 0 }}>LocQar Courier v1.2.0</p>
      </div>
    </div>
  </div>;
};

export default ProfileSettingsScreen;
