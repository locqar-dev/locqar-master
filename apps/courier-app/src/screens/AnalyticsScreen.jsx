import React, { useState, useMemo } from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import {
  TrendingUp,
  Clock,
  MapPin,
  Award,
  Calendar,
  ChevronRight,
  Star,
} from '../components/Icons';

const AnalyticsScreen = ({ onBack, T }) => {
  const [period, setPeriod] = useState('week'); // week, month, all-time

  // Mock analytics data
  const analytics = {
    week: {
      totalDeliveries: 42,
      averageTime: '8m 32s',
      totalDistance: '124.5 km',
      rating: 4.8,
      earnings: '$318.50',
      efficiency: 92,
      completionRate: 98,
      onTimeRate: 96,
    },
    month: {
      totalDeliveries: 168,
      averageTime: '8m 45s',
      totalDistance: '512.3 km',
      rating: 4.7,
      earnings: '$1,247.20',
      efficiency: 90,
      completionRate: 97,
      onTimeRate: 94,
    },
    'all-time': {
      totalDeliveries: 856,
      averageTime: '9m 12s',
      totalDistance: '2,847 km',
      rating: 4.6,
      earnings: '$6,584.80',
      efficiency: 88,
      completionRate: 96,
      onTimeRate: 91,
    },
  };

  const current = analytics[period];

  // Daily breakdown for last 7 days
  const dailyStats = [
    { day: 'Mon', deliveries: 5, earnings: '$42.50' },
    { day: 'Tue', deliveries: 7, earnings: '$54.20' },
    { day: 'Wed', deliveries: 6, earnings: '$48.90' },
    { day: 'Thu', deliveries: 8, earnings: '$62.10' },
    { day: 'Fri', deliveries: 9, earnings: '$71.30' },
    { day: 'Sat', deliveries: 4, earnings: '$31.50' },
    { day: 'Sun', deliveries: 3, earnings: '$8.00' },
  ];

  const maxDeliveries = Math.max(...dailyStats.map((d) => d.deliveries));

  return (
    <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 80 }}>
      <StatusBar T={T} />
      <TopBar title="Analytics" onBack={onBack} T={T} />

      {/* Period Selector */}
      <div style={{ padding: '16px 12px', borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {['week', 'month', 'all-time'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 10,
                border: `1.5px solid ${period === p ? T.blue : T.border}`,
                background: period === p ? T.blueBg : T.card,
                color: period === p ? T.blue : T.sec,
                fontWeight: 600,
                fontSize: 12,
                textTransform: 'capitalize',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {p.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div style={{ padding: '16px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {/* Total Deliveries */}
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: T.card,
              border: `1.5px solid ${T.green}50`,
              backgroundImage: `linear-gradient(135deg, ${T.greenBg} 0%, transparent 100%)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: T.green,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <TrendingUp size={16} />
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: T.sec }}>
                Total Deliveries
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text }}>
              {current.totalDeliveries}
            </p>
          </div>

          {/* Average Time */}
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: T.card,
              border: `1.5px solid ${T.blue}50`,
              backgroundImage: `linear-gradient(135deg, ${T.blueBg} 0%, transparent 100%)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: T.blue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Clock size={16} />
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: T.sec }}>
                Avg. Time
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text }}>
              {current.averageTime}
            </p>
          </div>

          {/* Total Distance */}
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: T.card,
              border: `1.5px solid ${T.purple}50`,
              backgroundImage: `linear-gradient(135deg, ${T.purpleBg} 0%, transparent 100%)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: T.purple,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <MapPin size={16} />
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: T.sec }}>
                Total Distance
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text }}>
              {current.totalDistance}
            </p>
          </div>

          {/* Earnings */}
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: T.card,
              border: `1.5px solid ${T.amber}50`,
              backgroundImage: `linear-gradient(135deg, ${T.amberBg} 0%, transparent 100%)`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: T.amber,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                }}
              >
                $
              </div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: T.sec }}>
                Earnings
              </p>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 800, color: T.text }}>
              {current.earnings}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div style={{ padding: '12px 12px', borderBottom: `1px solid ${T.border}` }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>
          Performance Metrics
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {/* Efficiency */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: T.card,
              border: `1.5px solid ${T.border}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: T.blueBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
              }}
            >
              <TrendingUp size={20} color={T.blue} />
            </div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: T.text }}>
              {current.efficiency}%
            </p>
            <p style={{ margin: 0, fontSize: 10, color: T.muted, fontWeight: 600 }}>
              Efficiency
            </p>
          </div>

          {/* Completion Rate */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: T.card,
              border: `1.5px solid ${T.border}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: T.greenBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
              }}
            >
              <Award size={20} color={T.green} />
            </div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: T.text }}>
              {current.completionRate}%
            </p>
            <p style={{ margin: 0, fontSize: 10, color: T.muted, fontWeight: 600 }}>
              Completion
            </p>
          </div>

          {/* On-Time Rate */}
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: T.card,
              border: `1.5px solid ${T.border}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: T.purpleBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
              }}
            >
              <Clock size={20} color={T.purple} />
            </div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 16, color: T.text }}>
              {current.onTimeRate}%
            </p>
            <p style={{ margin: 0, fontSize: 10, color: T.muted, fontWeight: 600 }}>
              On-Time
            </p>
          </div>
        </div>
      </div>

      {/* Rating & Reviews */}
      <div style={{ padding: '16px 12px', borderBottom: `1px solid ${T.border}` }}>
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: T.card,
            border: `1.5px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: T.amberBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Star size={24} color={T.amber} fill={T.amber} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: T.text }}>
              {current.rating} / 5.0
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: T.sec }}>
              Based on customer reviews
            </p>
          </div>
          <ChevronRight size={20} color={T.sec} />
        </div>
      </div>

      {/* Daily Breakdown */}
      <div style={{ padding: '16px 12px' }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: T.sec, margin: '0 0 12px', textTransform: 'uppercase' }}>
          This Week
        </h3>

        {dailyStats.map((stat, idx) => (
          <div key={stat.day} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 12, color: T.text }}>
                {stat.day}
              </p>
              <span
                style={{
                  display: 'flex',
                  gap: 8,
                  fontSize: 11,
                  color: T.sec,
                }}
              >
                <span>{stat.deliveries} deliveries</span>
                <span style={{ fontWeight: 700, color: T.green }}>{stat.earnings}</span>
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 20,
                borderRadius: 10,
                background: T.fill,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(stat.deliveries / maxDeliveries) * 100}%`,
                  background: `linear-gradient(90deg, ${T.blue} 0%, ${T.purple} 100%)`,
                  borderRadius: 10,
                  animation: `slideRight 0.6s ease ${idx * 0.1}s both`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideRight {
          from {
            opacity: 0;
            width: 0 !important;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AnalyticsScreen;
