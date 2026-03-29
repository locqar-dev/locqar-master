import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import {
  User,
  Zap,
  Lock,
  Bell,
  HelpCircle,
  LogOut,
  Download,
  Shield,
  Copy,
  ChevronRight,
  Eye,
  EyeOff,
} from '../components/Icons';

const SettingsScreen = ({ onBack, onLogout, T }) => {
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@courier.app',
    phone: '+1 (555) 123-4567',
    vehicleType: 'Bike',
    licensePlate: 'WK-2026-1',
    rating: 4.8,
    totalDeliveries: 42,
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: true,
    locationTracking: true,
    autoAcceptDeliveries: false,
  });

  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const MenuItem = ({ icon: Icon, label, sublabel, action, secondary, color }) => (
    <div
      onClick={action}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 12,
        background: T.card,
        border: `1.5px solid ${T.border}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginBottom: 8,
      }}
      className="tap"
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: color || T.blueBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color ? color.replace('Bg', '') : T.blue,
          flexShrink: 0,
        }}
      >
        <Icon size={18} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: T.text }}>
          {label}
        </p>
        {sublabel && (
          <p style={{ margin: '2px 0 0', fontSize: 11, color: T.sec }}>
            {sublabel}
          </p>
        )}
      </div>
      {secondary && (
        <span style={{ fontSize: 12, fontWeight: 600, color: T.sec }}>
          {secondary}
        </span>
      )}
      <ChevronRight size={16} color={T.muted} />
    </div>
  );

  const ToggleSetting = ({ label, value, onChange }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 16px',
        borderRadius: 12,
        background: T.card,
        border: `1.5px solid ${T.border}`,
        marginBottom: 8,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: T.text }}>
          {label}
        </p>
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 48,
          height: 28,
          borderRadius: 14,
          background: value ? T.green : T.fill2,
          position: 'relative',
          cursor: 'pointer',
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
            left: value ? 22 : 2,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        />
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}>
      <StatusBar T={T} />
      <TopBar title="Settings" onBack={onBack} T={T} />

      {/* Profile Section */}
      <div style={{ padding: '16px 12px', borderBottom: `1.5px solid ${T.border}` }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 16,
            borderRadius: 14,
            background: T.card,
            border: `1.5px solid ${T.border}`,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: T.blueBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flexShrink: 0,
            }}
          >
            👤
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: T.text }}>
              {profile.name}
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: T.sec }}>
              {profile.email}
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginTop: 6,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: T.amber }}>
                ⭐ {profile.rating}
              </span>
              <span style={{ fontSize: 11, color: T.muted }}>
                {profile.totalDeliveries} deliveries
              </span>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
          }}
        >
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: T.fill,
              border: `1.5px solid ${T.border}`,
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>
              Vehicle
            </p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.text }}>
              {profile.vehicleType}
            </p>
          </div>
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: T.fill,
              border: `1.5px solid ${T.border}`,
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase' }}>
              License Plate
            </p>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.text }}>
              {profile.licensePlate}
            </p>
          </div>
        </div>

        <button
          onClick={() => setEditing(!editing)}
          style={{
            width: '100%',
            height: 40,
            borderRadius: 10,
            border: `1.5px solid ${T.blue}`,
            background: T.blueBg,
            color: T.blue,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            marginTop: 12,
            transition: 'all 0.2s ease',
          }}
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {/* Notifications Section */}
      <div style={{ padding: '16px 12px', borderBottom: `1.5px solid ${T.border}` }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>
          Notifications
        </h3>
        <ToggleSetting
          label="Email Notifications"
          value={preferences.emailNotifications}
          onChange={(val) =>
            setPreferences({ ...preferences, emailNotifications: val })
          }
        />
        <ToggleSetting
          label="Push Notifications"
          value={preferences.pushNotifications}
          onChange={(val) =>
            setPreferences({ ...preferences, pushNotifications: val })
          }
        />
      </div>

      {/* App Settings Section */}
      <div style={{ padding: '16px 12px', borderBottom: `1.5px solid ${T.border}` }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>
          App Settings
        </h3>
        <ToggleSetting
          label="Dark Mode"
          value={preferences.darkMode}
          onChange={(val) => setPreferences({ ...preferences, darkMode: val })}
        />
        <ToggleSetting
          label="Location Tracking"
          value={preferences.locationTracking}
          onChange={(val) =>
            setPreferences({ ...preferences, locationTracking: val })
          }
        />
        <ToggleSetting
          label="Auto-Accept Deliveries"
          value={preferences.autoAcceptDeliveries}
          onChange={(val) =>
            setPreferences({ ...preferences, autoAcceptDeliveries: val })
          }
        />
      </div>

      {/* Account Section */}
      <div style={{ padding: '16px 12px', borderBottom: `1.5px solid ${T.border}` }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>
          Account
        </h3>
        <MenuItem
          icon={Shield}
          label="Change Password"
          sublabel="Update your account password"
          color={T.purpleBg}
          action={() => alert('Open password change modal')}
        />
        <MenuItem
          icon={Download}
          label="Data Export"
          sublabel="Download your activity history"
          color={T.greenBg}
          action={() => alert('Starting data export...')}
        />
      </div>

      {/* Support Section */}
      <div style={{ padding: '16px 12px', borderBottom: `1.5px solid ${T.border}` }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>
          Support
        </h3>
        <MenuItem
          icon={HelpCircle}
          label="Help & FAQ"
          sublabel="Get answers to common questions"
          color={T.amberBg}
          action={() => alert('Opening FAQ...')}
        />
        <MenuItem
          icon={Zap}
          label="Report Issue"
          sublabel="Let us know if something is wrong"
          color={T.redBg}
          action={() => alert('Opening issue report form...')}
        />
      </div>

      {/* Danger Zone */}
      <div style={{ padding: '16px 12px', marginBottom: 12 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.red, margin: '0 0 12px', textTransform: 'uppercase' }}>
          Danger Zone
        </h3>
        <button
          onClick={onLogout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: 44,
            padding: '12px 16px',
            borderRadius: 12,
            border: `1.5px solid ${T.red}`,
            background: T.redBg,
            color: T.red,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Version Info */}
      <div
        style={{
          padding: '16px 12px',
          textAlign: 'center',
          borderTop: `1px solid ${T.border}`,
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: T.muted }}>
          Courier App v1.0.0
        </p>
        <p style={{ margin: '4px 0 0', fontSize: 10, color: T.muted }}>
          Build 2024.12.001
        </p>
      </div>
    </div>
  );
};

export default SettingsScreen;
