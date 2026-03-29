import React, { useState, useEffect } from "react";
import { T, ff } from "../theme/themes";
import { Bell, Check, X } from "./Icons";
import { NotificationManager } from "../utils/notifications";

export default function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    packageUpdates: true,
    messages: true,
    promos: true
  });
  const [loading, setLoading] = useState(false);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    // Load current settings
    setEnabled(NotificationManager.isEnabled());
    setPreferences(NotificationManager.getPreferences());
  }, []);

  const handleToggleNotifications = async () => {
    if (enabled) {
      // Can't disable notifications programmatically
      alert('To disable notifications, please use your browser settings.');
      return;
    }

    setLoading(true);
    try {
      const granted = await NotificationManager.requestPermission();
      setEnabled(granted);
    } catch (error) {
      alert(error.message || 'Failed to enable notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreference = (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);
    NotificationManager.setPreferences(newPrefs);
  };

  const handleTestNotification = () => {
    if (!enabled) {
      alert('Please enable notifications first');
      return;
    }

    NotificationManager.show('🔔 Test Notification', {
      body: 'Your notifications are working perfectly!',
      tag: 'test-notification'
    });

    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  };

  const settingsItems = [
    {
      key: 'packageUpdates',
      emoji: '📦',
      title: 'Package Updates',
      description: 'Status changes and delivery notifications'
    },
    {
      key: 'messages',
      emoji: '💬',
      title: 'Messages',
      description: 'New messages from support or senders'
    },
    {
      key: 'promos',
      emoji: '🎁',
      title: 'Promotions & Offers',
      description: 'Special deals and exclusive offers'
    }
  ];

  return (
    <div style={{ padding: '0 20px' }}>
      {/* Main toggle */}
      <div
        style={{
          borderRadius: 20,
          padding: 18,
          background: T.card,
          border: '1.5px solid ' + T.border,
          boxShadow: T.shadow,
          marginBottom: 16
        }}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: enabled ? 'linear-gradient(135deg, #3B82F6, #8B5CF6)' : T.fill,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bell style={{ width: 24, height: 24, color: enabled ? '#fff' : T.sec }} />
          </div>
          <div className="flex-1">
            <h3 style={{ fontSize: 16, fontWeight: 800, fontFamily: ff, marginBottom: 2 }}>
              Push Notifications
            </h3>
            <p style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>
              {enabled ? 'Currently enabled' : 'Get real-time updates'}
            </p>
          </div>
          <button
            onClick={handleToggleNotifications}
            disabled={loading || enabled}
            className="tap"
            style={{
              width: 52,
              height: 30,
              borderRadius: 15,
              background: enabled ? T.ok : T.border,
              position: 'relative',
              transition: 'all .3s',
              opacity: loading ? 0.6 : 1
            }}
          >
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                background: '#fff',
                position: 'absolute',
                top: 2,
                left: enabled ? 24 : 2,
                transition: 'left .3s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {loading && (
                <div
                  className="spin"
                  style={{
                    width: 12,
                    height: 12,
                    border: '2px solid ' + T.border,
                    borderTopColor: T.accent,
                    borderRadius: '50%'
                  }}
                />
              )}
            </div>
          </button>
        </div>

        {enabled && (
          <button
            onClick={handleTestNotification}
            className="tap w-full"
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: testSent ? T.okBg : T.fill,
              border: '1px solid ' + (testSent ? T.ok + '33' : T.border),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'all .2s'
            }}
          >
            {testSent ? (
              <>
                <Check style={{ width: 14, height: 14, color: T.ok }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.okDark, fontFamily: ff }}>
                  Test Sent!
                </span>
              </>
            ) : (
              <>
                <Bell style={{ width: 14, height: 14, color: T.sec }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: ff }}>
                  Send Test Notification
                </span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Notification preferences */}
      {enabled && (
        <div
          style={{
            borderRadius: 20,
            padding: 18,
            background: T.card,
            border: '1.5px solid ' + T.border,
            boxShadow: T.shadow,
            marginBottom: 16
          }}
        >
          <h3
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: T.muted,
              letterSpacing: '0.08em',
              marginBottom: 12,
              fontFamily: ff
            }}
          >
            NOTIFICATION TYPES
          </h3>

          {settingsItems.map((item, index) => (
            <button
              key={item.key}
              onClick={() => handleTogglePreference(item.key)}
              className="tap w-full"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 12px',
                borderRadius: 14,
                background: preferences[item.key] ? T.fill : 'transparent',
                border: '1px solid ' + (preferences[item.key] ? T.border : 'transparent'),
                marginBottom: index < settingsItems.length - 1 ? 8 : 0,
                transition: 'all .2s'
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: preferences[item.key] ? '#fff' : T.fill,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  border: '1px solid ' + T.border,
                  transition: 'all .2s'
                }}
              >
                {item.emoji}
              </div>
              <div className="flex-1 text-left">
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: ff,
                    color: preferences[item.key] ? T.text : T.muted
                  }}
                >
                  {item.title}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: T.sec,
                    fontFamily: ff,
                    marginTop: 1
                  }}
                >
                  {item.description}
                </p>
              </div>
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: preferences[item.key] ? T.ok : T.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all .2s'
                }}
              >
                {preferences[item.key] && (
                  <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} />
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Info */}
      <div
        style={{
          padding: 14,
          borderRadius: 14,
          background: T.fill,
          border: '1px solid ' + T.border
        }}
      >
        <p style={{ fontSize: 11, color: T.sec, lineHeight: 1.5, fontFamily: ff }}>
          💡 Notifications help you stay updated on your packages. You can manage these settings
          anytime. To completely disable notifications, use your browser settings.
        </p>
      </div>
    </div>
  );
}
