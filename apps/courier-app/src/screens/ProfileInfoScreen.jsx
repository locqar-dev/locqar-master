import React from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { driver } from '../data/mockData';

const ProfileInfoScreen = ({ onBack, T }) => (
  <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="Personal Info" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: T.gradientAccent, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><span style={{ fontSize: 36 }}>{driver.avatar}</span></div>
        <button className="tap" style={{ border: `1.5px solid ${T.border}`, borderRadius: 10, background: T.bg, padding: '8px 16px', fontWeight: 600, fontSize: 13, color: T.sec }}>Change Photo</button>
      </div>
      {[{ l: 'Full Name', v: driver.name }, { l: 'Driver ID', v: driver.id }, { l: 'Phone', v: '+233 24 000 0000' }, { l: 'Email', v: 'kwame.asante@email.com' }, { l: 'Date of Birth', v: '15 March 1992' }, { l: 'Address', v: 'East Legon, Accra' }].map((f, i) =>
        <div key={i} style={{ padding: '14px 0', borderBottom: i < 5 ? `1px solid ${T.border}` : 'none' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: T.muted, margin: '0 0 4px', textTransform: 'uppercase' }}>{f.l}</p>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{f.v}</p>
        </div>
      )}
    </div>
  </div>
);

export default ProfileInfoScreen;
