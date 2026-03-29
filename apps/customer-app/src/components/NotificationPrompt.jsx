import React, { useState } from "react";
import { T, ff } from "../theme/themes";
import { X, Bell, Check } from "./Icons";
import { NotificationManager } from "../utils/notifications";

export default function NotificationPrompt({ onClose, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEnable = async () => {
    setLoading(true);
    setError('');

    try {
      const granted = await NotificationManager.requestPermission();

      if (granted) {
        // Show a test notification
        setTimeout(() => {
          NotificationManager.show('🎉 Notifications Enabled!', {
            body: 'You\'ll now receive updates about your packages',
            tag: 'welcome-notification'
          });
        }, 300);

        onComplete && onComplete();
      } else {
        setError('Permission denied. You can enable it later in settings.');
        setTimeout(() => {
          onClose && onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to enable notifications');
      setTimeout(() => {
        onClose && onClose();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    NotificationManager.dismissPrompt();
    onClose && onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fu fixed inset-0 bg-black/40"
        style={{ backdropFilter: 'blur(4px)', zIndex: 9998 }}
        onClick={handleSkip}
      />

      {/* Modal */}
      <div
        className="fu fixed left-1/2 top-1/2"
        style={{
          transform: 'translate(-50%, -50%)',
          width: 'calc(100% - 48px)',
          maxWidth: 340,
          zIndex: 9999
        }}
      >
        <div
          style={{
            borderRadius: 24,
            padding: 24,
            background: T.bg,
            border: '1px solid ' + T.border,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="tap absolute"
            style={{
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: T.fill
            }}
          >
            <X style={{ width: 16, height: 16, color: T.sec }} />
          </button>

          {/* Icon */}
          <div
            className="fu"
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Animated background */}
            <div
              className="pulse"
              style={{
                position: 'absolute',
                inset: -20,
                background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent)',
                animation: 'pulse 2s infinite'
              }}
            />
            <Bell style={{ width: 30, height: 30, color: '#fff', zIndex: 1 }} />
          </div>

          {/* Content */}
          <h3
            style={{
              fontSize: 20,
              fontWeight: 800,
              marginBottom: 8,
              fontFamily: ff,
              letterSpacing: '-0.02em'
            }}
          >
            Stay Updated
          </h3>

          <p
            style={{
              fontSize: 14,
              color: T.sec,
              lineHeight: 1.5,
              marginBottom: 20,
              fontFamily: ff
            }}
          >
            Get real-time notifications when your packages are out for delivery, ready for pickup, or delivered.
          </p>

          {/* Benefits */}
          <div style={{ marginBottom: 24 }}>
            {[
              { icon: '📦', text: 'Package status updates' },
              { icon: '⏰', text: 'Pickup reminders' },
              { icon: '🎉', text: 'Delivery confirmations' }
            ].map((item, index) => (
              <div
                key={index}
                className="fu flex items-center gap-3"
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: T.fill,
                  marginBottom: 6,
                  animationDelay: (index * 0.1) + 's'
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: ff }}>
                  {item.text}
                </span>
                <Check style={{ width: 14, height: 14, color: T.ok, marginLeft: 'auto' }} />
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div
              className="fu"
              style={{
                padding: 12,
                borderRadius: 12,
                background: T.errBg,
                border: '1px solid ' + T.err + '22',
                marginBottom: 16
              }}
            >
              <p style={{ fontSize: 12, color: T.err, fontFamily: ff }}>
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="tap"
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px 0',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                color: T.sec,
                background: T.fill,
                border: '1px solid ' + T.border,
                fontFamily: ff,
                opacity: loading ? 0.5 : 1
              }}
            >
              Maybe Later
            </button>

            <button
              onClick={handleEnable}
              disabled={loading}
              className="tap"
              style={{
                flex: 2,
                padding: '14px 0',
                borderRadius: 14,
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                background: loading
                  ? T.muted
                  : 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                border: 'none',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(59,130,246,0.3)',
                fontFamily: ff,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {loading ? (
                <>
                  <div
                    className="spin"
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff',
                      borderRadius: '50%'
                    }}
                  />
                  <span>Enabling...</span>
                </>
              ) : (
                <>
                  <Bell style={{ width: 16, height: 16 }} />
                  <span>Enable Notifications</span>
                </>
              )}

              {/* Shine effect */}
              {!loading && (
                <div
                  style={{
                    position: 'absolute',
                    top: -40,
                    right: -30,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    filter: 'blur(20px)'
                  }}
                />
              )}
            </button>
          </div>

          {/* Privacy note */}
          <p
            style={{
              fontSize: 10,
              color: T.muted,
              textAlign: 'center',
              marginTop: 12,
              fontFamily: ff
            }}
          >
            You can change this anytime in settings
          </p>
        </div>
      </div>
    </>
  );
}
