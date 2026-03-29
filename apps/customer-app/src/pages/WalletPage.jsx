import React from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import { Zap } from "../components/Icons";

export default function WalletPage(props) {
  var balance = 245.00;
  var txns = [
    { id: 1, e: '📤', t: 'Package Delivery', d: 'To +233 24 555 1234', amt: '-GH₵12.50', time: '2h ago', color: T.accent },
    { id: 2, e: '💳', t: 'Wallet Top-Up', d: 'MoMo ••8521', amt: '+GH₵200.00', time: '1d ago', color: T.ok },
    { id: 3, e: '🏪', t: 'Locker Storage', d: 'Osu Mall — 2hrs', amt: '-GH₵3.00', time: '3d ago', color: T.warn },
    { id: 4, e: '📦', t: 'Package Delivery', d: 'From +233 20 888 5678', amt: '-GH₵8.00', time: '5d ago', color: T.accent },
    { id: 5, e: '💳', t: 'Wallet Top-Up', d: 'Vodafone Cash', amt: '+GH₵100.00', time: '1w ago', color: T.ok },
    { id: 6, e: '🎁', t: 'Referral Bonus', d: 'Friend joined LocQar', amt: '+GH₵10.00', time: '2w ago', color: T.purple }
  ];
  return (
    <div className="min-h-screen pb-24 noscroll overflow-y-auto" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="My Wallet" onBack={props.onBack} subtitle="Fast & secure payments" />
      <div style={{ padding: '0 20px' }}>
        {/* Balance card */}
        <div className="fu" style={{ borderRadius: 32, padding: 32, background: T.gradient, position: 'relative', overflow: 'hidden', marginBottom: 20, boxShadow: T.shadowLg }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: 90, background: 'rgba(255,255,255,0.08)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -20, width: 140, height: 140, borderRadius: 70, background: 'rgba(255,255,255,0.05)', filter: 'blur(25px)' }} />
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontFamily: ff, fontWeight: 900, letterSpacing: '0.12em', marginBottom: 12, textTransform: 'uppercase' }}>Available Balance</p>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', fontFamily: mf, letterSpacing: '-0.04em', lineHeight: 1 }}>GH₵{balance.toFixed(2)}</h1>
          <div className="flex items-center gap-2" style={{ marginTop: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: T.ok, filter: 'drop-shadow(0 0 4px ' + T.ok + ')' }} />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: ff, fontWeight: 600 }}>Secure Wallet Active</p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-3 fu d1" style={{ marginBottom: 24 }}>
          {[
            { l: 'Top Up', e: '💳', s: 'wallet-topup', bg: T.okBg, c: T.okDark },
            { l: 'Transfer', e: '📤', s: 'send', bg: T.blueBg, c: T.blue },
            { l: 'Scan', e: 'Zap', s: 'qr-scan', bg: T.purpleBg, c: T.purple }
          ].map(function (a, i) {
            var Icon = a.e === 'Zap' ? Zap : null;
            return (
              <button key={i} onClick={function () { if (props.onNav) props.onNav(a.s); }} className="tap flex-1" style={{ borderRadius: 24, padding: '20px 12px', textAlign: 'center', background: T.card, border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
                <div style={{ width: 44, height: 44, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: a.bg, margin: '0 auto 10px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  {Icon ? <Icon style={{ width: 20, height: 20, color: a.c }} /> : <span style={{ fontSize: 22 }}>{a.e}</span>}
                </div>
                <p style={{ fontSize: 13, fontWeight: 800, color: T.text, fontFamily: ff }}>{a.l}</p>
              </button>
            );
          })}
        </div>

        {/* Transaction history */}
        <div className="fu d2">
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, fontFamily: ff, color: T.text, letterSpacing: '-0.02em' }}>Recent Transactions</h3>
            <button onClick={function () { if (props.onNav) props.onNav('transactions'); }} className="tap" style={{ fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: ff }}>View All</button>
          </div>
          <div className="glass" style={{ borderRadius: 28, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
            {txns.map(function (tx, i) {
              var isPos = tx.amt.charAt(0) === '+';
              return (
                <div key={tx.id} className="flex items-center gap-4" style={{ padding: '16px 20px', background: T.card, borderBottom: i < txns.length - 1 ? '1.5px solid ' + T.fill : 'none' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: tx.color + '18', border: '1px solid ' + tx.color + '12', flexShrink: 0 }}>{tx.e}</div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontSize: 15, fontWeight: 800, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>{tx.t}</p>
                    <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2, fontWeight: 500 }}>{tx.d} · {tx.time}</p>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 900, fontFamily: mf, color: isPos ? T.ok : T.text }}>{tx.amt}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
