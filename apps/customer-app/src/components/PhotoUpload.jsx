import React, { useState, useRef } from "react";
import { T, ff } from "../theme/themes";
import { Camera, X, Check } from "./Icons";

export default function PhotoUpload({ photos = [], onPhotosChange, maxPhotos = 3 }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    // Simulate upload delay and create preview URLs
    setTimeout(() => {
      const newPhotos = files.slice(0, maxPhotos - photos.length).map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        file: file,
        name: file.name
      }));

      onPhotosChange([...photos, ...newPhotos]);
      setUploading(false);
      e.target.value = ''; // Reset input
    }, 500);
  };

  const removePhoto = (id) => {
    const updated = photos.filter(p => p.id !== id);
    onPhotosChange(updated);
  };

  const canAddMore = photos.length < maxPhotos;

  return (
    <div style={{ marginTop: 14 }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', fontFamily: ff }}>
          PACKAGE PHOTOS {photos.length > 0 && `(${photos.length}/${maxPhotos})`}
        </p>
        {photos.length > 0 && (
          <p style={{ fontSize: 10, fontWeight: 600, color: T.ok, fontFamily: ff }}>
            <Check style={{ width: 10, height: 10, display: 'inline', marginRight: 2 }} />
            Added
          </p>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto noscroll" style={{ paddingBottom: 4 }}>
        {/* Add Photo Button */}
        {canAddMore && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="tap flex-shrink-0"
            style={{
              width: 90,
              height: 90,
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              background: T.fill,
              border: '1.5px dashed ' + T.border,
              opacity: uploading ? 0.5 : 1,
              transition: 'all .2s'
            }}
          >
            {uploading ? (
              <div className="spin" style={{ width: 16, height: 16, border: '2px solid ' + T.border, borderTopColor: T.accent, borderRadius: '50%' }} />
            ) : (
              <>
                <Camera style={{ width: 20, height: 20, color: T.sec }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: T.sec, fontFamily: ff }}>
                  Add Photo
                </span>
              </>
            )}
          </button>
        )}

        {/* Photo Previews */}
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="flex-shrink-0 relative slide-in"
            style={{
              width: 90,
              height: 90,
              borderRadius: 14,
              overflow: 'hidden',
              border: '1.5px solid ' + T.border,
              animationDelay: (index * 0.1) + 's'
            }}
          >
            <img
              src={photo.url}
              alt={photo.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <button
              onClick={() => removePhoto(photo.id)}
              className="tap"
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 22,
                height: 22,
                borderRadius: 11,
                background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
              }}
            >
              <X style={{ width: 12, height: 12, color: '#fff', strokeWidth: 2.5 }} />
            </button>
            {/* Photo number badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 4,
                left: 4,
                padding: '2px 6px',
                borderRadius: 6,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                fontSize: 9,
                fontWeight: 700,
                color: '#fff',
                fontFamily: ff
              }}
            >
              #{index + 1}
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <p style={{ fontSize: 11, color: T.muted, marginTop: 6, fontFamily: ff }}>
          📸 Add photos of your package for proof and tracking
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}
