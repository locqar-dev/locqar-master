import React, { useState, useEffect } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { Bell, Zap, AlertTriangle, CheckCircle, Info, X, Volume2, Vibrate } from '../components/Icons';
import { useNotifications } from '../hooks/useNotifications';

const NotificationsScreen = ({ onBack, T }) => {
  const {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    sendPushNotification,
    sound,
    setSound,
    vibration,
    setVibration,
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // all, urgent, success, warnings
  const [mockNotifications, setMockNotifications] = useState([
    {
      id: 1,
      type: 'urgent',
      title: 'Urgent Delivery',
      message: 'Package at Locker A1 needs immediate delivery',
      timestamp: new Date(Date.now() - 5 * 60000),
      action: 'View',
      read: false,
    },
    {
      id: 2,
      type: 'success',
      title: 'Delivery Complete',
      message: 'TRK-2026-001 successfully delivered',
      timestamp: new Date(Date.now() - 15 * 60000),
      read: false,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Locker Full',
      message: 'Locker B2 compartments are full',
      timestamp: new Date(Date.now() - 30 * 60000),
      read: true,
    },
    {
      id: 4,
      type: 'info',
      title: 'Route Optimized',
      message: 'New optimized route available: saves 5 minutes',
      timestamp: new Date(Date.now() - 45 * 60000),
      read: true,
    },
  ]);

  const typeConfig = {
    urgent: { color: T.red, icon: Zap, bg: T.redBg },
    success: { color: T.green, icon: CheckCircle, bg: T.greenBg },
    warning: { color: T.amber, icon: AlertTriangle, bg: T.amberBg },
    info: { color: T.blue, icon: Info, bg: T.blueBg },
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filtered = mockNotifications.filter((n) => {
    if (filter === 'all') return true;
    return n.type === filter;
  });

  const handleTestNotification = (type) => {
    const messages = {
      urgent: 'Urgent delivery assigned!',
      success: 'Delivery confirmed!',
      warning: 'Locker capacity warning',
      info: 'Route has been optimized',
    };
    addNotification(messages[type], type, 4000);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}>
      <StatusBar T={T} />
      <TopBar title="Notifications" onBack={onBack} T={T} />

      {/* Settings Section */}
      <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>
          Notification Settings
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Sound Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 12,
              background: T.fill,
              cursor: 'pointer',
            }}
            onClick={() => setSound(!sound)}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: sound ? T.blueBg : T.fill2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: sound ? T.blue : T.muted,
              }}
            >
              <Volume2 size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, color: T.text }}>Sound</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: T.sec }}>
                {sound ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                background: sound ? T.green : T.fill2,
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  background: '#fff',
                  top: 2,
                  left: sound ? 22 : 2,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </div>
          </div>

          {/* Vibration Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 12,
              borderRadius: 12,
              background: T.fill,
              cursor: 'pointer',
            }}
            onClick={() => setVibration(!vibration)}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: vibration ? T.purpleBg : T.fill2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: vibration ? T.purple : T.muted,
              }}
            >
              <Vibrate size={18} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 600, color: T.text }}>Vibration</p>
              <p style={{ margin: '2px 0 0', fontSize: 12, color: T.sec }}>
                {vibration ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                background: vibration ? T.green : T.fill2,
                position: 'relative',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  background: '#fff',
                  top: 2,
                  left: vibration ? 22 : 2,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>
          Test Notifications
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
          {Object.entries(typeConfig).map(([type, config]) => (
            <button
              key={type}
              onClick={() => handleTestNotification(type)}
              style={{
                padding: 10,
                borderRadius: 10,
                border: `1.5px solid ${config.color}`,
                background: config.bg,
                color: config.color,
                fontWeight: 600,
                fontSize: 12,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="tap"
            >
              Test {type}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Section */}
      <div style={{ padding: '20px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
          {['all', 'urgent', 'success', 'warning', 'info'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: `1.5px solid ${filter === f ? typeConfig[f]?.color || T.blue : T.border}`,
                background: filter === f ? typeConfig[f]?.bg || T.fill : T.card,
                color: filter === f ? typeConfig[f]?.color || T.blue : T.sec,
                fontWeight: 600,
                fontSize: 12,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {filtered.length > 0 ? (
        <div style={{ padding: '12px 12px 20px' }}>
          {filtered.map((notif, idx) => {
            const config = typeConfig[notif.type];
            const Icon = config?.icon || Bell;

            return (
              <div
                key={notif.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: 14,
                  borderRadius: 12,
                  background: T.card,
                  border: `1.5px solid ${T.border}`,
                  marginBottom: 10,
                  opacity: notif.read ? 0.6 : 1,
                  animation: `slideDown 0.3s ease ${idx * 0.05}s both`,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: config.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: config.color,
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: T.text }}>
                        {notif.title}
                      </p>
                      <p style={{ margin: '4px 0 0', fontSize: 12, color: T.sec }}>
                        {notif.message}
                      </p>
                      <p style={{ margin: '6px 0 0', fontSize: 11, color: T.muted }}>
                        {formatTime(notif.timestamp)}
                      </p>
                    </div>
                    {notif.action && (
                      <button
                        style={{
                          padding: '6px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: config.color,
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        {notif.action}
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeNotification(notif.id)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    border: 'none',
                    background: T.fill,
                    color: T.muted,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}

          {filtered.length > 0 && (
            <button
              onClick={clearAll}
              style={{
                width: '100%',
                height: 40,
                borderRadius: 10,
                border: `1.5px solid ${T.border}`,
                background: 'transparent',
                color: T.sec,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              Clear all notifications
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: '48px 20px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: T.text, margin: 0 }}>
            No notifications
          </p>
          <p style={{ fontSize: 12, color: T.sec, margin: '4px 0 0' }}>
            You're all caught up!
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsScreen;
