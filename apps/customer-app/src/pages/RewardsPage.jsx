import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import Chip from "../components/Chip";
import { Info, Check } from "../components/Icons";

export default function RewardsPage(props) {
  var points = 450;
  var tier = 'Silver';
  var nextTier = 'Gold';
  var nextAt = 1000;
  var progress = (points / nextAt * 100);
  var tiers = [
    { name: 'Bronze', min: 0, e: '\u{1F949}', c: '#CD7F32', unlocked: true },
    { name: 'Silver', min: 200, e: '\u{1F948}', c: '#A0A0A0', unlocked: true },
    { name: 'Gold', min: 1000, e: '\u{1F947}', c: '#FFD700', unlocked: false },
    { name: 'Diamond', min: 5000, e: '\u{1F48E}', c: T.purple, unlocked: false }
  ];
  var history = [
    { e: '\u{1F4E4}', t: 'Sent package', pts: 10, d: 'Today' },
    { e: '\u{2B50}', t: 'Rated delivery', pts: 10, d: 'Today' },
    { e: '\u{1F465}', t: 'Referred Ama', pts: 25, d: 'Feb 5' },
    { e: '\u{1F4E4}', t: 'Sent package', pts: 10, d: 'Feb 3' },
    { e: '\u{1F465}', t: 'Referred Kofi', pts: 25, d: 'Feb 1' },
    { e: '\u{1F4E4}', t: 'Sent package', pts: 10, d: 'Jan 28' },
    { e: '\u{1F389}', t: 'Welcome bonus', pts: 50, d: 'Jan 15' }
  ];
  var redeemOptions = [
    { e: '\u{1F4E4}', l: 'Free Delivery', pts: 100, d: 'Waive service fee on next send' },
    { e: '\u{1F5C4}\u{FE0F}', l: '2hr Free Storage', pts: 200, d: 'Complimentary locker rental' },
    { e: '\u{2B06}\u{FE0F}', l: 'Size Upgrade', pts: 150, d: 'Free upgrade to next package size' },
    { e: '\u{1F4F2}', l: 'Free Call Package', pts: 300, d: 'Free locker-to-door delivery' }
  ];
  var [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="pb-6 min-h-screen noscroll overflow-y-auto" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="Rewards" onBack={props.onBack} />
      <div style={{ padding: '0 20px' }}>
        {/* Points hero */}
        <div className="fu glass" style={{ borderRadius: 32, padding: 32, background: T.gradient, color: '#fff', marginBottom: 20, position: 'relative', overflow: 'hidden', textAlign: 'center', boxShadow: T.shadowLg }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, background: 'rgba(255,255,255,0.08)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -20, width: 140, height: 140, borderRadius: 70, background: 'rgba(255,255,255,0.05)', filter: 'blur(25px)' }} />
          <div style={{ fontSize: 48, marginBottom: 12, animation: 'float 3s ease-in-out infinite' }}>{'\u{1F3C6}'}</div>
          <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', fontFamily: ff, marginBottom: 8, textTransform: 'uppercase' }}>Available Points</p>
          <h1 style={{ fontSize: 56, fontWeight: 900, fontFamily: mf, letterSpacing: '-0.04em', marginBottom: 4, lineHeight: 1 }}>{points}</h1>
          <div className="flex items-center justify-center gap-2" style={{ marginTop: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: ff }}>{tier} Member</span>
            <div style={{ width: 4, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.3)' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', fontFamily: ff }}>{nextTier} at {nextAt}</span>
          </div>
          {/* Progress to next tier */}
          <div style={{ marginTop: 24, padding: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: 24, border: '1.5px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.6)', fontFamily: ff }}>{progress.toFixed(0)}% to {nextTier}</span>
              <span style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.6)', fontFamily: ff }}>{nextAt - points} pts left</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
              <div className="glow" style={{ height: '100%', borderRadius: 4, width: progress + '%', background: '#fff', transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)', boxShadow: '0 0 12px rgba(255,255,255,0.5)' }} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="fu d1 flex gap-2 overflow-x-auto noscroll" style={{ marginBottom: 20 }}>
          {[{ id: 'overview', l: 'Redeem', e: '\u{1F381}' }, { id: 'history', l: 'History', e: '\u{1F4CB}' }, { id: 'tiers', l: 'Tiers', e: '\u{1F3C5}' }].map(function (t) {
            return <Chip key={t.id} label={t.l} emoji={t.e} active={activeTab === t.id} onClick={function () { setActiveTab(t.id); }} />;
          })}
        </div>

        {/* Redeem */}
        {activeTab === 'overview' && (
          <div className="fu">{redeemOptions.map(function (r, i) {
            var canRedeem = points >= r.pts;
            return (
              <button key={i} className={'w-full text-left tap fu d' + (i + 1)} style={{ borderRadius: 24, padding: 18, display: 'flex', alignItems: 'center', gap: 16, background: T.card, border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12, opacity: canRedeem ? 1 : 0.6 }}>
                <div style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: canRedeem ? T.purpleBg : T.fill, border: '1.5px solid ' + (canRedeem ? T.purple + '20' : T.border) }}>{r.e}</div>
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontWeight: 800, fontSize: 16, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>{r.l}</h3>
                  <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, fontWeight: 500, marginTop: 2 }}>{r.d}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 900, fontSize: 15, fontFamily: mf, color: canRedeem ? T.purple : T.sec }}>{r.pts}</p>
                  <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, fontFamily: ff, textTransform: 'uppercase' }}>Points</p>
                </div>
              </button>
            );
          })}</div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div>{history.map(function (h, i) {
            return (
              <div key={i} className="fu flex items-center gap-3" style={{ padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid ' + T.fill : 'none', animationDelay: (i * 0.03) + 's' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: T.fill }}>{h.e}</div>
                <div className="flex-1"><p style={{ fontWeight: 600, fontSize: 13, fontFamily: ff }}>{h.t}</p><p style={{ fontSize: 10, color: T.sec, fontFamily: ff }}>{h.d}</p></div>
                <p style={{ fontWeight: 700, fontSize: 13, color: T.okDark, fontFamily: mf }}>+{h.pts}</p>
              </div>
            );
          })}</div>
        )}

        {/* Tiers */}
        {activeTab === 'tiers' && (
          <div>{tiers.map(function (t, i) {
            var isCurrent = t.name === tier;
            return (
              <div key={i} className="fu" style={{ borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', gap: 12, background: isCurrent ? T.warnBg : '#fff', border: '1.5px solid ' + (isCurrent ? T.warn + '33' : T.border), boxShadow: isCurrent ? '0 2px 12px rgba(245,158,11,0.08)' : T.shadow, marginBottom: 8, opacity: t.unlocked ? 1 : 0.5, animationDelay: (i * 0.04) + 's' }}>
                <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: '#fff', border: '2px solid ' + (isCurrent ? T.warn : T.border) }}>{t.e}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><h3 style={{ fontWeight: 700, fontSize: 15, fontFamily: ff }}>{t.name}</h3>{isCurrent && <span style={{ fontSize: 8, fontWeight: 800, padding: '2px 7px', borderRadius: 5, background: T.warn, color: '#fff', fontFamily: ff }}>CURRENT</span>}</div>
                  <p style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>{t.min === 0 ? 'Starting tier' : t.min.toLocaleString() + ' points required'}</p>
                </div>
                {t.unlocked && <div style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} /></div>}
              </div>
            );
          })}</div>
        )}

        {/* How to earn */}
        <div className="fu" style={{ borderRadius: 18, padding: 16, background: T.blueBg, border: '1px solid ' + T.blue + '22', marginTop: 16 }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 10 }}><Info style={{ width: 13, height: 13, color: T.blue }} /><p style={{ fontSize: 10, fontWeight: 700, color: T.blue, letterSpacing: '0.06em', fontFamily: ff }}>HOW TO EARN POINTS</p></div>
          {[
            { t: 'Send a package', v: '+10 pts' },
            { t: 'Rate a delivery', v: '+10 pts' },
            { t: 'Refer a friend', v: '+25 pts' },
            { t: 'Complete profile', v: '+20 pts' }
          ].map(function (r, i) {
            return (
              <div key={i} className="flex items-center justify-between" style={{ padding: '6px 0', borderBottom: i < 3 ? '1px solid ' + T.blue + '11' : 'none' }}>
                <span style={{ fontSize: 12, color: T.blue, fontFamily: ff }}>{r.t}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: T.blue, fontFamily: mf }}>{r.v}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
