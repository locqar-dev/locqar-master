import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import AnimatedNum from "../components/AnimatedNum";
import { Wallet, ChevronRight, ChevronUp, ChevronDown, ArrowRight, Zap, User, Users, CreditCard, Bell, Gift, Star, Phone, Settings, LogOut } from "../components/Icons";

export default function Account(props) {
  var [walletOpen, setWalletOpen] = useState(false);
  var [addAmt, setAddAmt] = useState('');
  var [customAmt, setCustomAmt] = useState('');
  var tx = [{ e: '\u{1F4E4}', t: 'Send - Ama', a: -12.50, d: 'Today' }, { e: '\u{2795}', t: 'Top Up', a: 50, d: 'Yesterday' }, { e: '\u{1F381}', t: 'Bonus', a: 10, d: 'Feb 1' }, { e: '\u{1F4E5}', t: 'Receive - Kofi', a: -5, d: 'Jan 30' }, { e: '\u{2795}', t: 'Top Up', a: 20, d: 'Jan 28' }, { e: '\u{1F3EA}', t: 'Storage Rental', a: -8, d: 'Jan 25' }];
  var topUpAmount = addAmt || customAmt;
  var doTopUp = function () {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) return;
    props.onNav('payment', {
      amount: topUpAmount,
      label: 'Wallet Top-Up',
      icon: '\u{1F45B}',
      items: [
        { e: '\u{1F45B}', l: 'Add to Wallet', v: 'GH\u20B5' + topUpAmount },
        { e: '\u{1F4B0}', l: 'New balance', v: 'GH\u20B5' + (245 + parseFloat(topUpAmount)).toFixed(2) }
      ],
      backTo: 'account',
      onSuccessNav: 'account'
    });
  };
  var mn = [
    { icon: Zap, l: props.currentPlan ? 'Student Storage' : 'Get Student Storage', s: props.currentPlan ? 'manage-sub' : 'subscribe', bg: T.blueBg, c: T.blue, badge: props.currentPlan ? '\u{1F393} Active' : null },
    { icon: Wallet, l: 'My Wallet', s: 'wallet', bg: T.okBg, c: T.okDark }, { icon: Zap, l: 'Scan QR Code', s: 'qr-scan', bg: T.blueBg, c: T.blue },
    { icon: User, l: 'Edit Profile', s: 'edit-profile', bg: T.fill, c: T.sec }, { icon: Users, l: 'Contacts', s: 'contacts', bg: T.purpleBg, c: T.purple }, { icon: CreditCard, l: 'Payment Methods', s: 'pay-methods', bg: T.fill, c: T.sec },
    { icon: Bell, l: 'Notifications', s: 'notif-prefs', bg: T.accentBg, c: T.accent }, { icon: Gift, l: 'Invite Friends', s: 'referral', bg: T.purpleBg, c: T.purple }, { icon: Star, l: 'Rewards', s: 'rewards', bg: T.warnBg, c: T.warn }, { icon: Phone, l: 'Support Chat', s: 'support', bg: T.okBg, c: T.okDark }, { icon: Settings, l: 'Settings', s: 'settings', bg: T.fill, c: T.sec }
  ];
  return (
    <div className="pb-24 min-h-screen noscroll overflow-y-auto" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="Profile" />
      <div style={{ padding: '0 20px 20px' }}>
        {/* Profile */}
        <div className="fu glass" style={{ borderRadius: 28, padding: 24, marginBottom: 16, boxShadow: T.shadowLg, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '60px', background: 'rgba(225,29,72,0.05)', filter: 'blur(20px)' }} />
          <div className="flex items-center gap-5" style={{ position: 'relative' }}>
            <div style={{ width: 80, height: 80, borderRadius: 28, background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid ' + T.bg, boxShadow: T.shadow }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#fff', fontFamily: ff }}>{props.user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="truncate" style={{ fontWeight: 900, fontSize: 22, fontFamily: ff, color: T.text, letterSpacing: '-0.02em' }}>{props.user.name}</h2>
              <p className="truncate" style={{ fontSize: 13, fontWeight: 600, color: T.sec, marginTop: 4, fontFamily: mf }}>+233 {props.user.phone}</p>
              {props.currentPlan && (
                <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
                  <span onClick={function () { props.onNav('manage-sub'); }} style={{ fontSize: 10, fontWeight: 900, background: T.blueBg, color: T.blue, padding: '4px 10px', borderRadius: 20, fontFamily: ff, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer' }}>{'\u{1F393}'} Student Storage</span>
                </div>
              )}
            </div>
            <button onClick={function () { props.onNav('edit-profile'); }} className="tap" style={{ width: 44, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.fill, border: '1.5px solid ' + T.border }}><ChevronRight style={{ width: 18, height: 18, color: T.sec }} /></button>
          </div>
        </div>
        {/* Stats */}
        <div className="fu d1" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
          {[{ e: '\u{1F4E4}', v: 24, l: 'Sent', sub: 'This month', bg: T.accentBg, c: T.accent }, { e: '\u{1F4E5}', v: 18, l: 'Received', sub: 'This month', bg: T.blueBg, c: T.blue }, { e: '\u{1F381}', v: 450, l: 'Points', sub: '~GH\u20B54.50', bg: T.purpleBg, c: T.purple }].map(function (s, i) {
            return <div key={i} style={{ borderRadius: 18, padding: 16, textAlign: 'center', background: T.card, border: '1.5px solid ' + s.c + '18', boxShadow: '0 2px 10px ' + s.c + '08' }}><div style={{ width: 36, height: 36, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, background: s.bg, margin: '0 auto 8px', boxShadow: '0 2px 6px ' + s.c + '10' }}>{s.e}</div><p style={{ fontWeight: 800, fontSize: 18, fontFamily: ff, letterSpacing: '-0.02em', color: T.text }}><AnimatedNum value={s.v} duration={900 + i * 200} /></p><p style={{ fontSize: 10, color: T.sec, fontFamily: ff, letterSpacing: '0.02em', marginTop: 2 }}>{s.l}</p><p style={{ fontSize: 8, color: T.muted, fontFamily: ff, marginTop: 2 }}>{s.sub}</p></div>;
          })}
        </div>
        {/* Wallet */}
        <div className="fu d2" style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 12, border: '1.5px solid ' + T.border, boxShadow: T.shadowMd }}>
          <button onClick={function () { props.onNav('wallet'); }} className="tap" style={{ width: '100%', padding: '16px 16px', display: 'flex', alignItems: 'center', gap: 14, background: T.card }}>
            <div style={{ width: 44, height: 44, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.gradient, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}><Wallet style={{ width: 19, height: 19, color: '#fff' }} /></div>
            <div className="flex-1 text-left">
              <p style={{ fontSize: 11, fontWeight: 600, color: T.sec, fontFamily: ff, letterSpacing: '0.02em' }}>Wallet Balance</p>
              <p style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: mf }}>GH{'\u20B5'} 245<span style={{ fontSize: 14, color: T.muted }}>.00</span></p>
            </div>
            {walletOpen ? <ChevronUp style={{ width: 16, height: 16, color: T.muted }} /> : <ChevronDown style={{ width: 16, height: 16, color: T.muted }} />}
          </button>
          {walletOpen && (
            <div style={{ borderTop: '1px solid ' + T.border, animation: 'fadeUp .25s cubic-bezier(.2,.9,.3,1)' }}>
              <div style={{ padding: '14px 16px 10px' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 8, fontFamily: ff }}>TOP UP WALLET</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
                  {[10, 20, 50, 100].map(function (p) {
                    return <button key={p} onClick={function () { setAddAmt(addAmt === p + '' ? '' : p + ''); setCustomAmt(''); }} className="tap" style={{ padding: '9px 0', borderRadius: 10, fontWeight: 700, fontSize: 13, background: addAmt === p + '' ? T.text : T.fill, color: addAmt === p + '' ? '#fff' : T.text, transition: 'all .15s', fontFamily: ff, border: addAmt === p + '' ? 'none' : '1px solid ' + T.border }}>{'GH\u20B5' + p}</button>;
                  })}
                </div>
                <div className="flex items-center gap-2" style={{ marginTop: 8 }}>
                  <div className="flex-1" style={{ borderRadius: 10, overflow: 'hidden', border: '1.5px solid ' + T.border, background: T.fill }}>
                    <div className="flex items-center gap-2" style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: T.sec, fontFamily: ff }}>GH{'\u20B5'}</span>
                      <input type="number" value={customAmt} onChange={function (e) { setCustomAmt(e.target.value); setAddAmt(''); }} placeholder="Custom" style={{ flex: 1, background: 'transparent', fontWeight: 600, fontSize: 14, fontFamily: mf, width: '100%' }} />
                    </div>
                  </div>
                  <button onClick={doTopUp} className="tap" style={{ padding: '9px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13, background: topUpAmount && parseFloat(topUpAmount) > 0 ? T.ok : T.fill, color: topUpAmount && parseFloat(topUpAmount) > 0 ? '#fff' : T.muted, transition: 'all .2s', fontFamily: ff, display: 'flex', alignItems: 'center', gap: 6 }}>Top Up{topUpAmount && parseFloat(topUpAmount) > 0 && <ArrowRight style={{ width: 13, height: 13 }} />}</button>
                </div>
              </div>
              <div style={{ padding: '6px 16px 14px' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', fontFamily: ff }}>RECENT TRANSACTIONS</p>
                  <button onClick={function () { props.onNav('transactions'); }} className="tap" style={{ fontSize: 10, fontWeight: 700, color: T.accent, fontFamily: ff }}>See All</button>
                </div>
                {tx.slice(0, 3).map(function (t, i) {
                  return (
                    <div key={i} className="flex items-center gap-3" style={{ padding: '9px 0', borderBottom: i < 2 ? '1px solid ' + T.fill : 'none' }}>
                      <div style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, background: t.a > 0 ? T.okBg : T.fill }}>{t.e}</div>
                      <div className="flex-1"><p style={{ fontWeight: 600, fontSize: 13, fontFamily: ff }}>{t.t}</p><p style={{ fontSize: 10, color: T.sec, fontFamily: ff }}>{t.d}</p></div>
                      <p style={{ fontWeight: 700, fontSize: 13, color: t.a > 0 ? T.okDark : T.text, fontFamily: mf }}>{(t.a > 0 ? '+' : '') + 'GH\u20B5' + Math.abs(t.a).toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        {/* Menu */}
        <div className="fu d3" style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
          {mn.map(function (m, i) {
            var Icon = m.icon;
            return (
              <button key={i} onClick={function () { if (m.s) props.onNav(m.s); }} className="tap" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: '#fff', borderBottom: i < mn.length - 1 ? '1px solid ' + T.fill : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.bg }}><Icon style={{ width: 16, height: 16, color: m.c }} /></div>
                <span className="flex-1 text-left" style={{ fontWeight: 600, fontSize: 14, fontFamily: ff }}>{m.l}</span>
                {m.badge && <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 20, background: T.purpleBg, color: T.purple, fontFamily: ff, letterSpacing: '0.04em' }}>{m.badge}</span>}
                <ChevronRight style={{ width: 15, height: 15, color: T.muted }} />
              </button>
            );
          })}
        </div>
        <button onClick={props.onLogout} className="tap" style={{ width: '100%', marginTop: 16, padding: '14px 0', borderRadius: 16, fontWeight: 700, fontSize: 14, background: T.accentBg, color: T.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: ff, border: '1.5px solid ' + T.accent + '15', boxShadow: '0 2px 8px rgba(225,29,72,0.06)' }}><LogOut style={{ width: 16, height: 16 }} />Sign Out</button>
        <p style={{ textAlign: 'center', fontSize: 10, color: T.muted, marginTop: 16, marginBottom: 10, fontFamily: ff, letterSpacing: '0.04em' }}>LocQar v1.0.0</p>
      </div>
    </div>
  );
}
