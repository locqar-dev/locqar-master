import React from 'react';
import { Truck } from '../components/Icons';

const VehicleCapacityCard = ({ tasks, vehicleConfig, T }) => {
  const activeTasks = tasks.filter(t => t.tab === 'accepted' || t.tab === 'in_transit_to_locker');
  const currentLoad = activeTasks.length;
  const loadPct = vehicleConfig.maxCapacity > 0 ? (currentLoad / vehicleConfig.maxCapacity) * 100 : 0;
  const loadColor = loadPct > 90 ? T.red : loadPct > 70 ? T.accent : T.green;
  return <div style={{ borderRadius: 16, padding: 16, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <Truck size={16} style={{ color: T.sec }} />
      <span style={{ fontSize: 13, fontWeight: 600 }}>{vehicleConfig.type} Capacity</span>
    </div>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: T.sec }}>Packages</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{currentLoad}/{vehicleConfig.maxCapacity}</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: T.fill, overflow: 'hidden' }}><div style={{ height: '100%', background: loadColor, width: `${Math.min(loadPct, 100)}%` }} /></div>
    </div>
  </div>;
};

export default VehicleCapacityCard;
