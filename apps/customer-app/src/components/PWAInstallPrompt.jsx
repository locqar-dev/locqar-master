import React, { useState, useEffect } from "react";
import { T, ff } from "../theme/themes";
import { X, Check } from "./Icons";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return; // Already installed
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      const dismissedDate = new Date(dismissed);
      const now = new Date();
      const daysSinceDismissed = (now - dismissedDate) / (1000 * 60 * 60 * 24);

      // Show again after 7 days
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after 10 seconds
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setInstalling(true);

    try {
      // Show browser install prompt
      deferredPrompt.prompt();

      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('PWA install accepted');
      } else {
        console.log('PWA install dismissed');
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('PWA install error:', error);
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', new Date().toISOString());
  };

  if (!showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fu fixed bottom-20 left-4 right-4 z-50" style={{ animation: 'slideUp .3s cubic-bezier(.2,.9,.3,1)' }}>
      <div
        style={{
          borderRadius: 20,
          padding: 18,
          background: '#fff',
          border: '1.5px solid ' + T.border,
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          position: 'relative'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="tap absolute"
          style={{
            top: 10,
            right: 10,
            width: 28,
            height: 28,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: T.fill
          }}
        >
          <X style={{ width: 14, height: 14, color: T.sec }} />
        </button>

        {/* Icon */}
        <div className="flex items-start gap-4">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #E11D48, #BE123C)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(225,29,72,0.2)'
            }}
          >
            📦
          </div>

          <div className="flex-1" style={{ paddingRight: 20 }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                marginBottom: 4,
                fontFamily: ff,
                letterSpacing: '-0.02em'
              }}
            >
              Install LocQar
            </h3>

            <p
              style={{
                fontSize: 13,
                color: T.sec,
                lineHeight: 1.4,
                marginBottom: 14,
                fontFamily: ff
              }}
            >
              Add to your home screen for quick access, offline support, and a native app experience.
            </p>

            {/* Benefits */}
            <div style={{ marginBottom: 14 }}>
              {[
                { icon: '⚡', text: 'Faster loading' },
                { icon: '📴', text: 'Works offline' },
                { icon: '🔔', text: 'Push notifications' }
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                  style={{ marginBottom: 4 }}
                >
                  <span style={{ fontSize: 12 }}>{item.icon}</span>
                  <span style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>
                    {item.text}
                  </span>
                  <Check style={{ width: 10, height: 10, color: T.ok, marginLeft: 'auto' }} />
                </div>
              ))}
            </div>

            {/* Install button */}
            <button
              onClick={handleInstall}
              disabled={installing}
              className="tap"
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 700,
                color: '#fff',
                background: installing
                  ? T.muted
                  : 'linear-gradient(135deg, #E11D48, #BE123C)',
                border: 'none',
                boxShadow: installing ? 'none' : '0 4px 14px rgba(225,29,72,0.25)',
                fontFamily: ff,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8
              }}
            >
              {installing ? (
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
                  <span>Installing...</span>
                </>
              ) : (
                <>
                  <span>📲</span>
                  <span>Install App</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
