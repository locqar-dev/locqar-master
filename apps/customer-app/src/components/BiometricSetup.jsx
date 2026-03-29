import React, { useState } from "react";
import { T, ff } from "../theme/themes";
import { X } from "./Icons";
import { BiometricAuth } from "../utils/biometric";

export default function BiometricSetup({ username, onClose, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSetup = async () => {
    setLoading(true);
    setError('');

    try {
      await BiometricAuth.register(username);
      onComplete && onComplete();
    } catch (err) {
      setError(err.message || 'Failed to set up biometric authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        animation: 'fadeIn .2s ease'
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: T.bg,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: '24px 20px 32px',
          animation: 'slideUp .35s cubic-bezier(0.32, 0.72, 0, 1)',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: ff, color: T.text }}>
            Enable Biometric Login
          </h2>
          <button
            onClick={onClose}
            className="tap"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: T.fill,
              border: '1px solid ' + T.border
            }}
          >
            <X style={{ width: 16, height: 16, color: T.text }} />
          </button>
        </div>

        {/* Icon */}
        <div className="flex justify-center" style={{ marginBottom: 20 }}>
          <div
            className="breathe"
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: T.gradient,
              boxShadow: '0 8px 24px rgba(225,29,72,0.25)'
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
        </div>

        {/* Description */}
        <p style={{ fontSize: 14, color: T.sec, textAlign: 'center', marginBottom: 24, fontFamily: ff, lineHeight: 1.5 }}>
          Use your fingerprint or face to quickly and securely log in to your account
        </p>

        {/* Error message */}
        {error && (
          <div
            className="fi"
            style={{
              padding: '12px 14px',
              borderRadius: 12,
              background: T.dangerBg,
              border: '1px solid ' + T.danger + '33',
              marginBottom: 16
            }}
          >
            <p style={{ fontSize: 12, color: T.danger, fontFamily: ff }}>
              ⚠️ {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="tap flex-1"
            style={{
              padding: '14px',
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 14,
              fontFamily: ff,
              background: T.fill,
              border: '1.5px solid ' + T.border,
              color: T.text
            }}
          >
            Maybe Later
          </button>
          <button
            onClick={handleSetup}
            disabled={loading}
            className="tap flex-1"
            style={{
              padding: '14px',
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 14,
              fontFamily: ff,
              background: T.gradient,
              border: 'none',
              color: '#fff',
              boxShadow: T.shadowLg,
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="spin" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
                Setting up...
              </div>
            ) : (
              'Enable Now'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
