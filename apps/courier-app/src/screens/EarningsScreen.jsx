import React, { useState } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { TrendingUp } from '../components/Icons';
import { driver } from '../data/mockData';

const EarningsScreen = ({ onBack, T }) => {
  const [period, setPeriod] = useState('week');
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], weekVals = [45, 62, 38, 71, 55, 89, 67];
  const monthDays = ['W1', 'W2', 'W3', 'W4'], monthVals = [320, 410, 380, driver.monthEarn - 1110];
  const dayHours = ['6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p'], dayVals = [0, 18, 22, 35, 12, 28, 8, 5];
  const labels = period === 'day' ? dayHours : period === 'month' ? monthDays : weekDays;
  const vals = period === 'day' ? dayVals : period === 'month' ? monthVals : weekVals;
  const mx = Math.max(...vals);
  const activeIdx = period === 'week' ? Math.max(0, new Date().getDay() - 1) : period === 'day' ? Math.min(Math.floor(new Date().getHours() / 2.5), 7) : new Date().getDate() <= 7 ? 0 : new Date().getDate() <= 14 ? 1 : new Date().getDate() <= 21 ? 2 : 3;
  const totalLabel = period === 'day' ? 'Today' : period === 'month' ? 'This Month' : 'This Week';
  const totalVal = period === 'day' ? driver.todayEarn : period === 'month' ? driver.monthEarn : driver.weekEarn;
  return <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}><StatusBar />
    <TopBar title="Earnings" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ display: 'flex', borderRadius: 14, background: T.fill, padding: 4, marginBottom: 16 }}>
        {[{ id: 'day', l: 'Daily' }, { id: 'week', l: 'Weekly' }, { id: 'month', l: 'Monthly' }].map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)} className="tap" style={{ flex: 1, height: 38, borderRadius: 11, border: 'none', fontWeight: 700, fontSize: 13, background: period === p.id ? T.card : 'transparent', color: period === p.id ? T.text : T.sec, boxShadow: period === p.id ? T.shadowMd : 'none', transition: 'all .2s' }}>{p.l}</button>
        ))}
      </div>
      <div style={{ borderRadius: 20, padding: 20, marginBottom: 16, overflow: 'hidden', position: 'relative', background: `radial-gradient(ellipse at top left, #1a2d4a 0%, ${T.text} 60%)`, boxShadow: '0 8px 28px rgba(0,0,0,0.2)' }}>
        <div style={{ position: 'absolute', top: -30, right: -20, width: 130, height: 130, borderRadius: '50%', background: 'rgba(225,29,72,0.1)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, margin: 0 }}>{totalLabel}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(16,185,129,0.2)', borderRadius: 8, padding: '3px 8px' }}>
            <span style={{ fontSize: 11, color: '#34D399', fontWeight: 700, animation: 'trendBounce 2s ease-in-out infinite' }}>{'\u2191'}</span>
            <span style={{ fontSize: 11, color: '#34D399', fontWeight: 700 }}>+12.4%</span>
          </div>
        </div>
        <p style={{ color: '#fff', fontSize: 38, fontWeight: 800, margin: '0 0 22px', lineHeight: 1, letterSpacing: '-0.02em' }}>GH{'\u20B5'} {totalVal.toFixed(2)}</p>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 88, gap: 5 }}>
          {vals.map((v, i) => {
            const h = mx > 0 ? (v / mx) * 100 : 0;
            const isAct = i === activeIdx;
            return <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: 72 }}>
                <div style={{ width: '100%', borderRadius: '6px 6px 3px 3px', background: isAct ? '#fff' : 'rgba(255,255,255,.18)', height: `${h}%`, minHeight: v > 0 ? 6 : 0, transition: 'height .4s ease', boxShadow: isAct ? '0 -4px 10px rgba(255,255,255,0.25)' : 'none' }} />
              </div>
              <span style={{ fontSize: 10, color: isAct ? '#fff' : 'rgba(255,255,255,.35)', fontWeight: isAct ? 700 : 400 }}>{labels[i]}</span>
            </div>;
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'Today', v: `\u20B5${driver.todayEarn.toFixed(2)}`, accent: T.green, bg: T.greenBg },
          { l: 'This Month', v: `\u20B5${driver.monthEarn.toFixed(2)}`, accent: T.accent, bg: T.accentBg },
          { l: 'Deliveries', v: driver.deliveries, accent: T.sec, bg: T.fill },
          { l: 'On-Time Rate', v: `${driver.onTime}%`, accent: T.sec, bg: T.fill },
        ].map((s, i) =>
          <div key={i} className="fu" style={{ borderRadius: 16, padding: 16, background: T.card, boxShadow: T.shadow, animationDelay: `${i * 0.08}s`, borderLeft: `3px solid ${s.accent}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <TrendingUp size={14} style={{ color: s.accent }} />
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, margin: '0 0 2px', color: T.text }}>{s.v}</p>
            <p style={{ fontSize: 12, color: T.sec, margin: 0 }}>{s.l}</p>
          </div>
        )}
      </div>
    </div>
  </div>;
};

export default EarningsScreen;
