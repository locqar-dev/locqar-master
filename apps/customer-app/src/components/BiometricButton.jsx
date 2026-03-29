import React, { useState, useEffect } from "react";
import { T, ff } from "../theme/themes";
import { BiometricAuth } from "../utils/biometric";

export default function BiometricButton({ onSuccess, onError }) {
  const [available, setAvailable] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const isAvailable = await BiometricAuth.isAvailable();
    const hasCreds = BiometricAuth.hasCredentials();
    const storedUsername = BiometricAuth.getUsername();

    setAvailable(isAvailable);
    setHasCredentials(hasCreds);
    setUsername(storedUsername || '');
  };

  const handleBiometricAuth = async () => {
    setLoading(true);
    try {
      const result = await BiometricAuth.authenticate();
      if (result.success) {
        onSuccess && onSuccess(result.username);
      } else {
        onError && onError('Authentication failed');
      }
    } catch (error) {
      onError && onError(error.message || 'Biometric authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (!available || !hasCredentials) {
    return null;
  }

  return (
    <button
      onClick={handleBiometricAuth}
      disabled={loading}
      className="tap"
      style={{
        width: '100%',
        padding: '16px',
        borderRadius: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        background: T.gradient,
        border: 'none',
        boxShadow: T.shadowLg,
        marginBottom: 12,
        opacity: loading ? 0.6 : 1,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background effects */}
      <div style={{ position: 'absolute', top: -40, right: -30, width: 140, height: 140, borderRadius: '70px', background: 'rgba(255,255,255,0.06)', filter: 'blur(20px)' }} />

      {loading ? (
        <>
          <div className="spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: ff }}>
            Authenticating...
          </span>
        </>
      ) : (
        <>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <div className="text-left flex-1">
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: ff }}>
              Use Biometric Login
            </p>
            {username && (
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: ff, marginTop: 2 }}>
                as {username}
              </p>
            )}
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14m-7-7l7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  );
}
