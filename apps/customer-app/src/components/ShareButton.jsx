import React, { useState } from "react";
import { T, ff } from "../theme/themes";
import { X, Copy, Check } from "./Icons";

export default function ShareButton({ packageData, children }) {
  const [showSheet, setShowSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const trackingUrl = `https://locqar.com/track/${packageData?.id || 'DEMO'}`;
  const shareText = `Track your package: ${packageData?.name || 'Package'}\nStatus: ${packageData?.status}\nLocation: ${packageData?.location}\n\nTrack here: ${trackingUrl}`;

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowSheet(false);
      }, 1500);
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      action: () => {
        const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank');
        setShowSheet(false);
      }
    },
    {
      name: 'SMS',
      icon: '📱',
      color: T.blue,
      action: () => {
        const url = `sms:?body=${encodeURIComponent(shareText)}`;
        window.location.href = url;
        setShowSheet(false);
      }
    },
    {
      name: 'Email',
      icon: '✉️',
      color: T.purple,
      action: () => {
        const subject = encodeURIComponent(`Package Tracking: ${packageData?.name || 'Your Package'}`);
        const body = encodeURIComponent(shareText);
        const url = `mailto:?subject=${subject}&body=${body}`;
        window.location.href = url;
        setShowSheet(false);
      }
    },
    {
      name: 'Copy Link',
      icon: '🔗',
      color: T.text,
      action: handleCopyLink
    }
  ];

  // Native share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Package Tracking: ${packageData?.name}`,
          text: shareText,
          url: trackingUrl
        });
        setShowSheet(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          // Fall back to custom share sheet
          setShowSheet(true);
        }
      }
    } else {
      setShowSheet(true);
    }
  };

  return (
    <>
      <div onClick={handleNativeShare} style={{ cursor: 'pointer' }}>
        {children}
      </div>

      {/* Custom Share Sheet */}
      {showSheet && (
        <div
          className="fixed inset-0 flex items-end justify-center"
          style={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            animation: 'fadeIn .2s ease'
          }}
          onClick={() => setShowSheet(false)}
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
              <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: ff, color: T.text }}>
                Share Tracking Link
              </h2>
              <button
                onClick={() => setShowSheet(false)}
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

            {/* Package Info */}
            <div
              style={{
                padding: '14px',
                borderRadius: 14,
                background: T.fill,
                border: '1.5px solid ' + T.border,
                marginBottom: 20
              }}
            >
              <p style={{ fontSize: 13, fontWeight: 700, color: T.text, fontFamily: ff, marginBottom: 4 }}>
                {packageData?.name}
              </p>
              <p style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>
                {packageData?.location}
              </p>
            </div>

            {/* Share Options */}
            <div className="grid grid-cols-4 gap-3" style={{ marginBottom: 16 }}>
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={option.action}
                  className="tap flex flex-col items-center gap-2"
                  style={{
                    padding: '12px 8px',
                    borderRadius: 14,
                    background: T.fill,
                    border: '1.5px solid ' + T.border,
                    transition: 'all .2s'
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 20,
                      background: option.color + '15',
                      border: '1.5px solid ' + option.color + '33'
                    }}
                  >
                    {option.name === 'Copy Link' && copied ? (
                      <Check style={{ width: 18, height: 18, color: T.ok }} />
                    ) : (
                      option.icon
                    )}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.text, fontFamily: ff, textAlign: 'center' }}>
                    {option.name === 'Copy Link' && copied ? 'Copied!' : option.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Direct Link */}
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                background: T.fill,
                border: '1.5px solid ' + T.border,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <span style={{ flex: 1, fontSize: 11, color: T.sec, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {trackingUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="tap"
                style={{
                  padding: '6px 10px',
                  borderRadius: 8,
                  background: copied ? T.okBg : T.text,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0
                }}
              >
                {copied ? (
                  <Check style={{ width: 12, height: 12, color: T.ok }} />
                ) : (
                  <Copy style={{ width: 12, height: 12, color: '#fff' }} />
                )}
                <span style={{ fontSize: 10, fontWeight: 700, color: copied ? T.ok : '#fff', fontFamily: ff }}>
                  {copied ? 'Copied' : 'Copy'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
