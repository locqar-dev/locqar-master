import { useState, useRef, useEffect } from 'react';

/**
 * Custom hook for QR code scanning
 */
export const useQRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Simple QR code detection simulation
  // In production, integrate with qrcode.js or jsQR library
  const startScanning = async () => {
    try {
      setScanning(true);
      setError(null);

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera not supported on this device');
        setScanning(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(err.message);
      setScanning(false);
    }
  };

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  // Simulated QR code parsing
  const parseQRCode = (qrString) => {
    try {
      // Expected format: {tracking}:{locker}:{size}
      const [tracking, lockerCode, size] = qrString.split(':');
      return {
        tracking: tracking?.trim(),
        lockerCode: lockerCode?.trim(),
        size: size?.trim(),
      };
    } catch (e) {
      return null;
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    // In production, use jsQR or similar library to scan
    // For now, return mock data
    return null;
  };

  useEffect(() => {
    return () => stopScanning();
  }, []);

  return {
    videoRef,
    canvasRef,
    scanning,
    scannedData,
    error,
    startScanning,
    stopScanning,
    captureFrame,
    parseQRCode,
  };
};

/**
 * Custom hook for camera/photo capture
 */
export const useCamera = () => {
  const [photos, setPhotos] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return null;

    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    const photoData = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setPhotos((prev) => [...prev, { url: photoData, timestamp: Date.now() }]);
    return photoData;
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const clearPhotos = () => {
    setPhotos([]);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return {
    videoRef,
    canvasRef,
    photos,
    cameraActive,
    startCamera,
    stopCamera,
    takePhoto,
    removePhoto,
    clearPhotos,
  };
};

export default useQRScanner;
