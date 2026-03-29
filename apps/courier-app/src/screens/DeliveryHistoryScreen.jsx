import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { CheckCircle, Check } from '../components/Icons';

const DeliveryHistoryScreen = ({ tasks, onBack, T }) => {
  const [dateFilter, setDateFilter] = useState('today');
  const deposited = tasks.filter(t => t.tab === 'delivered_to_locker');
  const totalDeps = deposited.length;
  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="Delivery History" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[{ id: 'today', l: 'Today' }, { id: 'week', l: 'This Week' }, { id: 'month', l: 'This Month' }].map(f => (
          <button key={f.id} onClick={() => setDateFilter(f.id)} className="tap" style={{ flex: 1, height: 32, borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, background: dateFilter === f.id ? T.text : T.fill, color: dateFilter === f.id ? '#fff' : T.sec }}>{f.l}</button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
        <div style={{ borderRadius: 12, padding: 12, background: T.greenBg, textAlign: 'center' }}><p style={{ fontSize: 20, fontWeight: 800, color: T.green, margin: 0 }}>{totalDeps}</p><p style={{ fontSize: 11, color: T.green, margin: 0 }}>Delivered</p></div>
        <div style={{ borderRadius: 12, padding: 12, background: T.fill, textAlign: 'center' }}><p style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0 }}>{totalDeps > 0 ? Math.round(totalDeps / (dateFilter === 'today' ? 1 : dateFilter === 'week' ? 7 : 30)) : 0}</p><p style={{ fontSize: 11, color: T.sec, margin: 0 }}>Avg/Day</p></div>
        <div style={{ borderRadius: 12, padding: 12, background: T.fill, textAlign: 'center' }}><p style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: 0 }}>{tasks.length > 0 ? Math.round((totalDeps / tasks.length) * 100) : 0}%</p><p style={{ fontSize: 11, color: T.sec, margin: 0 }}>Rate</p></div>
      </div>
      {deposited.length === 0 ? <div style={{ textAlign: 'center', padding: '40px 20px' }}><CheckCircle size={32} style={{ color: T.muted, marginBottom: 12 }} /><p style={{ fontWeight: 700, margin: '0 0 4px' }}>No deliveries yet</p><p style={{ fontSize: 14, color: T.sec, margin: 0 }}>Completed deliveries will appear here</p></div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {deposited.map(t => (
            <div key={t.id} style={{ borderRadius: 16, padding: 14, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.greenBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={16} style={{ color: T.green }} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{t.trk}</p>
                <p style={{ fontSize: 12, color: T.sec, margin: 0 }}>{t.locker} {'\u00B7'} {t.receiver}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: T.green, margin: 0 }}>{t.depositedAt}</p>
                <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{t.sz} {'\u00B7'} {t.weight}</p>
              </div>
            </div>
          ))}
        </div>}
    </div>
  </div>;
};

export default DeliveryHistoryScreen;
