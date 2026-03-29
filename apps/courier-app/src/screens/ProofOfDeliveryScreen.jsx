import React, { useState, useRef } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { Camera, QrCode, Check, X, Upload, Image as ImageIcon } from '../components/Icons';
import { useCamera } from '../hooks/useCamera';

const ProofOfDeliveryScreen = ({ task, onBack, onConfirm, T }) => {
  const [step, setStep] = useState('menu'); // menu, qr-scan, photo, confirm
  const [qrData, setQrData] = useState(null);
  const [qrInput, setQrInput] = useState('');
  const { videoRef, canvasRef, photos, cameraActive, startCamera, stopCamera, takePhoto, removePhoto, clearPhotos } = useCamera();
  const [captureMode, setCaptureMode] = useState('photo'); // photo, signature
  const fileInputRef = useRef(null);

  const handleQRSubmit = () => {
    if (qrInput.trim()) {
      // Parse QR data (format: tracking:locker:size)
      const [tracking, locker, size] = qrInput.split(':').map(s => s.trim());
      setQrData({ tracking, locker, size });
      setStep('photo');
    }
  };

  const handlePhotoCapture = () => {
    if (cameraActive) {
      takePhoto();
    }
  };

  const handleUploadPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (canvas) {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const photoData = canvas.toDataURL('image/jpeg', 0.8);
            // Simulate adding photo
            photos.push({ url: photoData, timestamp: Date.now() });
          }
        };
        img.src = event.target?.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmDelivery = () => {
    onConfirm?.({
      task,
      qrData,
      photos,
      proofType: 'pod',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}>
      <StatusBar T={T} />
      <TopBar 
        title="Proof of Delivery" 
        sub={task?.trk || 'No package'}
        onBack={step === 'menu' ? onBack : () => setStep('menu')} 
        T={T} 
      />

      {/* Menu Screen */}
      {step === 'menu' && (
        <div style={{ padding: '24px 20px' }}>
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                background: T.blueBg,
                border: `1.5px solid ${T.blue}`,
                borderRadius: 14,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <p style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: T.blue,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                Package Details
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 14, fontWeight: 600, color: T.text }}>
                {task?.trk}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.sec }}>
                {task?.receiver} • {task?.locker}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* QR Code Scan */}
            <button
              onClick={() => setStep('qr-scan')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                borderRadius: 14,
                border: `1.5px solid ${T.border}`,
                background: T.card,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="tap"
              onMouseEnter={(e) => (e.currentTarget.style.background = T.fill)}
              onMouseLeave={(e) => (e.currentTarget.style.background = T.card)}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: T.purpleBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.purple,
                }}
              >
                <QrCode size={20} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>
                  Scan Package QR
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.sec }}>
                  Verify package with QR code
                </p>
              </div>
            </button>

            {/* Photo Capture */}
            <button
              onClick={() => setStep('photo')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                borderRadius: 14,
                border: `1.5px solid ${T.border}`,
                background: T.card,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="tap"
              onMouseEnter={(e) => (e.currentTarget.style.background = T.fill)}
              onMouseLeave={(e) => (e.currentTarget.style.background = T.card)}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: T.greenBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: T.green,
                }}
              >
                <Camera size={20} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: T.text }}>
                  Take Photo
                </p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: T.sec }}>
                  Capture proof of delivery
                </p>
              </div>
            </button>

            {qrData && photos.length > 0 && (
              <button
                onClick={() => setStep('confirm')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 14,
                  background: T.gradientSuccess,
                  border: 'none',
                  cursor: 'pointer',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                }}
                className="press"
              >
                <Check size={20} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700 }}>
                    Complete Delivery
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.9 }}>
                    QR + {photos.length} photo{photos.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* QR Scan Screen */}
      {step === 'qr-scan' && (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              fontSize: 12,
              fontWeight: 700,
              color: T.sec,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}>
              Enter QR Code Data
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="tracking:locker:size"
                style={{
                  flex: 1,
                  height: 44,
                  padding: '0 14px',
                  borderRadius: 12,
                  border: `1.5px solid ${T.border}`,
                  background: T.fill,
                  fontSize: 14,
                  fontFamily: 'monospace',
                }}
              />
              <button
                onClick={handleQRSubmit}
                disabled={!qrInput.trim()}
                style={{
                  height: 44,
                  padding: '0 20px',
                  borderRadius: 12,
                  border: 'none',
                  background: qrInput.trim() ? T.blue : T.fill,
                  color: qrInput.trim() ? '#fff' : T.muted,
                  fontWeight: 700,
                  cursor: qrInput.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Verify
              </button>
            </div>
          </div>

          {qrData && (
            <div
              style={{
                background: T.greenBg,
                border: `1.5px solid ${T.green}`,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.green }}>
                ✓ QR Verified
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 12, color: T.text }}>
                <strong>Tracking:</strong> {qrData.tracking}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.text }}>
                <strong>Locker:</strong> {qrData.locker}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.text }}>
                <strong>Size:</strong> {qrData.size}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Photo Screen */}
      {step === 'photo' && (
        <div style={{ padding: '20px' }}>
          {!cameraActive ? (
            <button
              onClick={startCamera}
              style={{
                width: '100%',
                height: 200,
                borderRadius: 14,
                border: `2px dashed ${T.blue}`,
                background: T.fill,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                marginBottom: 16,
              }}
              className="tap"
            >
              <Camera size={32} style={{ color: T.blue }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                Tap to Start Camera
              </span>
            </button>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{
                  width: '100%',
                  borderRadius: 14,
                  background: '#000',
                  marginBottom: 16,
                }}
              />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <button
                onClick={handlePhotoCapture}
                style={{
                  width: '100%',
                  height: 52,
                  borderRadius: 14,
                  border: 'none',
                  background: T.gradientAccent,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: 'pointer',
                  marginBottom: 12,
                }}
              >
                📸 Take Photo
              </button>
              <button
                onClick={stopCamera}
                style={{
                  width: '100%',
                  height: 44,
                  borderRadius: 12,
                  border: `1.5px solid ${T.border}`,
                  background: T.card,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </>
          )}

          {/* Photos Preview */}
          {photos.length > 0 && (
            <div>
              <p style={{
                fontSize: 12,
                fontWeight: 700,
                color: T.sec,
                margin: '20px 0 12px',
                textTransform: 'uppercase',
              }}>
                Captured Photos ({photos.length})
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '100%',
                      borderRadius: 10,
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={photo.url}
                      alt={`Proof ${idx + 1}`}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <button
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        background: T.red,
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirm Screen */}
      {step === 'confirm' && (
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: T.text }}>
              Delivery Summary
            </h3>

            {/* Package Info */}
            <div style={{
              background: T.card,
              border: `1.5px solid ${T.border}`,
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
            }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: T.sec, textTransform: 'uppercase' }}>
                Package
              </p>
              <p style={{ margin: '6px 0 0', fontSize: 13, fontWeight: 600, color: T.text }}>
                {task?.trk}
              </p>
            </div>

            {/* QR Verification */}
            {qrData && (
              <div style={{
                background: T.greenBg,
                border: `1.5px solid ${T.green}`,
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
              }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.green, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Check size={14} /> QR Code Verified
                </p>
              </div>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <div style={{
                background: T.blueBg,
                border: `1.5px solid ${T.blue}`,
                borderRadius: 12,
                padding: 14,
                marginBottom: 16,
              }}>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: T.blue, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <ImageIcon size={14} /> {photos.length} Photo Proof Captured
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleConfirmDelivery}
            style={{
              width: '100%',
              height: 52,
              borderRadius: 14,
              border: 'none',
              background: T.gradientSuccess,
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor: 'pointer',
              marginBottom: 10,
            }}
          >
            ✓ Confirm Delivery
          </button>

          <button
            onClick={() => setStep('menu')}
            style={{
              width: '100%',
              height: 44,
              borderRadius: 12,
              border: `1.5px solid ${T.border}`,
              background: T.card,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default ProofOfDeliveryScreen;
