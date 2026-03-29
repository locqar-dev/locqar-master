import React from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';

const VehicleSettingsScreen = ({ vehicleConfig, setVehicleConfig, onBack, T }) => {
  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="Vehicle Settings" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: '0 0 10px' }}>Vehicle Type</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
        {[{ id: 'car', l: 'Car', cap: 15, w: 50 }, { id: 'van', l: 'Van', cap: 30, w: 150 }, { id: 'bike', l: 'Bike', cap: 5, w: 15 }].map(v => (
          <button key={v.id} onClick={() => setVehicleConfig({ type: v.l, maxCapacity: v.cap, maxWeight: v.w })} className="tap" style={{ borderRadius: 12, padding: 16, textAlign: 'center', border: vehicleConfig.type === v.l ? `2px solid ${T.blue}` : `2px solid ${T.border}`, background: vehicleConfig.type === v.l ? T.blueBg : T.bg }}>
            <span style={{ display: 'block', fontSize: 24, marginBottom: 6 }}>{v.id === 'car' ? '\uD83D\uDE97' : v.id === 'van' ? '\uD83D\uDE90' : '\uD83C\uDFCD\uFE0F'}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{v.l}</span>
            <p style={{ fontSize: 11, color: T.sec, margin: '4px 0 0' }}>{v.cap} pkgs {'\u00B7'} {v.w} kg</p>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: 'uppercase', margin: '0 0 10px' }}>Capacity Limits</p>
      <div style={{ borderRadius: 16, padding: 16, background: T.card, border: `1.5px solid ${T.border}`, boxShadow: T.shadow }}>
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>Max Packages: {vehicleConfig.maxCapacity}</p>
          <input type="range" min={5} max={50} value={vehicleConfig.maxCapacity} onChange={e => setVehicleConfig(c => ({ ...c, maxCapacity: parseInt(e.target.value) }))} style={{ width: '100%' }} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>Max Weight: {vehicleConfig.maxWeight} kg</p>
          <input type="range" min={10} max={200} value={vehicleConfig.maxWeight} onChange={e => setVehicleConfig(c => ({ ...c, maxWeight: parseInt(e.target.value) }))} style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  </div>;
};

export default VehicleSettingsScreen;
