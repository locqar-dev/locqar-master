import React, { useState, useEffect } from 'react';
import { Wifi, Battery } from './Icons';

const StatusBar = ({ T }) => {
  const [t, setT] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  const [battery, setBattery] = useState(100);

  useEffect(() => {
    const updateTime = () => {
      setT(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!navigator.getBattery) return;
    navigator.getBattery && navigator.getBattery().then((batteryManager) => {
      setBattery(Math.round(batteryManager.level * 100));
    });
  }, []);

  const statusColor = battery > 50 ? '#10b981' : battery > 20 ? '#f59e0b' : '#e11d48';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        background: 'rgba(0,0,0,0.02)',
        fontSize: 11,
        fontWeight: 600,
        color: '#64748b',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{t}</span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: statusColor,
        }}
      >
        <Wifi size={12} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <Battery size={12} />
          {battery}%
        </span>
      </div>
    </div>
  );
};

export default StatusBar;
