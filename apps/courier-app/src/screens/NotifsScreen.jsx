import React from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { AlertTriangle, Bell, CheckCircle } from '../components/Icons';

const NotifsScreen = ({ onBack, notifItems, setNotifItems, T }) => {
  const items = notifItems; const setItems = setNotifItems;
  const unread = items.filter(n => !n.read).length;
  const iconMap = {
    urgent: { icon: <AlertTriangle size={18} />, bg: T.redBg, color: T.red },
    info: { icon: <Bell size={18} />, bg: T.accentBg, color: T.accent },
    success: { icon: <CheckCircle size={18} />, bg: T.greenBg, color: T.green },
  };
  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="Notifications" onBack={onBack} T={T} right={unread > 0 && <button onClick={() => setItems(items.map(n => ({ ...n, read: true })))} className="press" style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: T.red }}>Mark all read</button>} />
    <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((n, i) => {
        const ic = iconMap[n.type] || iconMap.info;
        return <div key={n.id} className="fu" style={{
          borderRadius: 16, padding: 16, background: T.card, boxShadow: T.shadow,
          opacity: n.read ? .55 : 1, animationDelay: `${i * 0.06}s`,
          borderLeft: !n.read ? `3px solid ${ic.color}` : '3px solid transparent',
          transition: 'opacity .3s, border .3s',
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: ic.bg, color: ic.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{ic.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                <p style={{ fontWeight: 700, fontSize: 14, margin: 0 }}>{n.title}</p>
                {!n.read && <div style={{ width: 8, height: 8, borderRadius: 4, background: T.red, animation: 'badgePulse 2s ease-in-out infinite' }} />}
              </div>
              <p style={{ fontSize: 13, color: T.sec, margin: '0 0 4px', lineHeight: 1.4 }}>{n.body}</p>
              <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>{n.time}</p>
            </div>
          </div>
        </div>;
      })}
    </div>
  </div>;
};

export default NotifsScreen;
