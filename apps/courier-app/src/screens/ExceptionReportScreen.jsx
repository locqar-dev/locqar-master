import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import SwipeConfirm from '../components/SwipeConfirm';
import { SizeIcon } from './HomeScreen';

const ExceptionReportScreen = ({ task, onSubmit, onBack, T }) => {
  const [type, setType] = useState(null);
  const [desc, setDesc] = useState('');
  const types = [{ id: 'damaged', icon: '\uD83D\uDCE6', l: 'Damaged', c: T.red }, { id: 'missing', icon: '\u2753', l: 'Missing', c: T.amber }, { id: 'wrongAddress', icon: '\uD83D\uDCCD', l: 'Wrong Address', c: T.blue }, { id: 'customerRefused', icon: '\uD83D\uDEAB', l: 'Customer Refused', c: T.purple }, { id: 'other', icon: '\uD83D\uDCDD', l: 'Other', c: T.sec }];
  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="Report Issue" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ borderRadius: 12, padding: 14, background: T.card, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <SizeIcon sz={task.sz} T={T} /><div style={{ flex: 1 }}><p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 2px' }}>{task.trk}</p><p style={{ fontSize: 12, color: T.sec, margin: 0 }}>{task.locker} {'\u00B7'} {task.receiver}</p></div>
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: '0 0 10px' }}>Issue Type</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
        {types.map(t => (
          <button key={t.id} onClick={() => setType(t.id)} className="tap" style={{ borderRadius: 12, padding: 16, textAlign: 'center', border: type === t.id ? `2px solid ${t.c}` : `2px solid ${T.border}`, background: type === t.id ? t.c + '10' : T.bg }}>
            <span style={{ display: 'block', fontSize: 24, marginBottom: 6 }}>{t.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: type === t.id ? t.c : T.text }}>{t.l}</span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: '0 0 10px' }}>Description</p>
      <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the issue..." style={{ width: '100%', height: 100, borderRadius: 12, border: `1.5px solid ${T.border}`, padding: 14, fontSize: 14, fontFamily: 'inherit', resize: 'none', background: T.fill, color: T.text }} />
      {type && <div style={{ marginTop: 20 }}><SwipeConfirm label="Swipe to Submit Report" color={T.red} onConfirm={() => onSubmit({ type, description: desc, reportedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })} T={T} /></div>}
    </div>
  </div>;
};

export default ExceptionReportScreen;
