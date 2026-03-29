import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import { ArrowDownLeft, ArrowUpRight, Check, ChevronDown, Copy, ExternalLink, Info } from "../components/Icons";

export default function TransactionsPage(props) {
  var [filter, setFilter] = useState('all');
  var allTx = [
    { id: 1, e: '📤', t: 'Send - Ama Serwaa', a: -12.50, d: 'Feb 15, 2026', tm: '2:30 PM', type: 'send', method: 'MTN MoMo', ref: 'TXN-LQ847291' },
    { id: 2, e: '➕', t: 'Wallet Top Up', a: 50, d: 'Feb 14, 2026', tm: '10:15 AM', type: 'topup', method: 'Visa •••4821', ref: 'TXN-LQ847290' },
    { id: 3, e: '🎁', t: 'Referral Bonus', a: 10, d: 'Feb 12, 2026', tm: '9:00 AM', type: 'reward', method: 'System', ref: 'TXN-LQ847289' },
    { id: 4, e: '📥', t: 'Receive - Kofi Mensah', a: -5, d: 'Feb 10, 2026', tm: '4:45 PM', type: 'receive', method: 'LocQar Wallet', ref: 'TXN-LQ847288' },
    { id: 5, e: '➕', t: 'Wallet Top Up', a: 20, d: 'Feb 8, 2026', tm: '11:30 AM', type: 'topup', method: 'MTN MoMo', ref: 'TXN-LQ847287' },
    { id: 6, e: '🏪', t: 'Storage Rental', a: -8, d: 'Feb 5, 2026', tm: '3:20 PM', type: 'storage', method: 'MTN MoMo', ref: 'TXN-LQ847286' },
    { id: 7, e: '📤', t: 'Send - Esi Appiah', a: -18, d: 'Feb 3, 2026', tm: '1:10 PM', type: 'send', method: 'Vodafone Cash', ref: 'TXN-LQ847285' },
    { id: 8, e: '🚚', t: 'Call Package', a: -6, d: 'Feb 1, 2026', tm: '5:00 PM', type: 'call', method: 'LocQar Wallet', ref: 'TXN-LQ847284' },
    { id: 9, e: '➕', t: 'Wallet Top Up', a: 100, d: 'Jan 28, 2026', tm: '8:00 AM', type: 'topup', method: 'MTN MoMo', ref: 'TXN-LQ847283' },
    { id: 10, e: '🎁', t: 'Welcome Bonus', a: 25, d: 'Jan 25, 2026', tm: '12:00 PM', type: 'reward', method: 'System', ref: 'TXN-LQ847282' }
  ];
  var filters = [
    { id: 'all', l: 'All', e: '📊' },
    { id: 'topup', l: 'Top Ups', e: '➕' },
    { id: 'send', l: 'Sends', e: '📤' },
    { id: 'receive', l: 'Receives', e: '📥' }
  ];
  var filtered = filter === 'all' ? allTx : allTx.filter(function (t) { return t.type === filter; });
  var [expanded, setExpanded] = useState(null);
  var [copiedRef, setCopiedRef] = useState(null);

  var totalIn = allTx.reduce(function (s, t) { return t.a > 0 ? s + t.a : s; }, 0);
  var totalOut = allTx.reduce(function (s, t) { return t.a < 0 ? s + Math.abs(t.a) : s; }, 0);

  return (
    <div className="min-h-screen pb-10" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="Transactions" onBack={props.onBack} />
      <div style={{ padding: '0 20px' }}>
        {/* Summary cards */}
        <div className="fu mb-6 grid grid-cols-2 gap-3">
          <div className="glass p-5" style={{ borderRadius: 28, background: 'linear-gradient(135deg, ' + T.ok + '08, #fff)', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: T.okBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><ArrowDownLeft style={{ width: 18, height: 18, color: T.ok }} /></div>
            <p style={{ fontSize: 11, fontWeight: 800, color: T.sec, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: ff }}>Money In</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: mf, marginTop: 4 }}>GH₵{totalIn.toFixed(2)}</p>
          </div>
          <div className="glass p-5" style={{ borderRadius: 28, background: 'linear-gradient(135deg, ' + T.accent + '08, #fff)', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: T.accentBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><ArrowUpRight style={{ width: 18, height: 18, color: T.accent }} /></div>
            <p style={{ fontSize: 11, fontWeight: 800, color: T.sec, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: ff }}>Money Out</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: T.text, fontFamily: mf, marginTop: 4 }}>GH₵{totalOut.toFixed(2)}</p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 noscroll mb-6" style={{ overflowX: 'auto', paddingBottom: 4 }}>
          {filters.map(function (f) {
            var sel = filter === f.id;
            return <button key={f.id} onClick={function () { setFilter(f.id); }} className="tap flex items-center gap-2" style={{ padding: '10px 18px', borderRadius: 18, fontWeight: 800, fontSize: 13, background: sel ? T.text : '#fff', color: sel ? '#fff' : T.sec, transition: 'all .25s', fontFamily: ff, whiteSpace: 'nowrap', border: '1.5px solid ' + (sel ? T.text : T.border), boxShadow: sel ? T.shadowMd : 'none' }}><span>{f.e}</span> {f.l}</button>;
          })}
        </div>

        {/* Transaction list */}
        <div className="space-y-4">
          {filtered.map(function (t, i) {
            var isOpen = expanded === t.id;
            return (
              <div key={t.id} className="fu" style={{ borderRadius: 24, border: '1.5px solid ' + (isOpen ? T.text + '22' : T.border), boxShadow: isOpen ? T.shadowMd : T.shadow, overflow: 'hidden', animationDelay: (i * 0.05) + 's', background: '#fff' }}>
                <button onClick={function () { setExpanded(isOpen ? null : t.id); }} className="tap w-full flex items-center gap-4 p-4" style={{ background: 'none', border: 'none' }}>
                  <div className="pop" style={{ width: 48, height: 48, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: t.a > 0 ? T.okBg : T.fill, border: '1px solid ' + (t.a > 0 ? T.ok + '15' : 'transparent') }}>{t.e}</div>
                  <div className="flex-1 text-left min-w-0">
                    <p style={{ fontWeight: 800, fontSize: 15, fontFamily: ff, color: T.text }}>{t.t}</p>
                    <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2 }}>{t.d} • {t.tm}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 900, fontSize: 16, color: t.a > 0 ? T.ok : T.text, fontFamily: mf }}>{(t.a > 0 ? '+' : '') + 'GH₵' + Math.abs(t.a).toFixed(2)}</p>
                    <ChevronDown style={{ width: 14, height: 14, color: T.muted, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .3s', marginLeft: 'auto', marginTop: 4 }} />
                  </div>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 16px 16px', animation: 'fadeUp .3s cubic-bezier(.2,.9,.3,1)' }}>
                    <div style={{ borderRadius: 20, background: T.fill, padding: 16 }}>
                      {[
                        { l: 'Reference', v: t.ref, mono: true, copy: true },
                        { l: 'Payment Method', v: t.method },
                        { l: 'Status', v: 'Completed', status: true }
                      ].map(function (r, ri) {
                        return <div key={ri} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: ri < 2 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                          <span style={{ fontSize: 12, color: T.sec, fontFamily: ff, fontWeight: 600 }}>{r.l}</span>
                          <div className="flex items-center gap-2">
                            {r.status && <div style={{ width: 6, height: 6, borderRadius: 3, background: T.ok }} />}
                            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: r.mono ? mf : ff, color: r.status ? T.ok : T.text }}>{r.v}</span>
                            {r.copy && <button onClick={function (e) { e.stopPropagation(); if (navigator.clipboard) navigator.clipboard.writeText(t.ref); setCopiedRef(t.id); setTimeout(function () { setCopiedRef(null); }, 2000); }} className="tap" style={{ border: 'none', background: 'none' }}>{copiedRef === t.id ? <Check style={{ width: 14, height: 14, color: T.ok }} /> : <Copy style={{ width: 14, height: 14, color: T.muted }} />}</button>}
                          </div>
                        </div>;
                      })}
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button className="tap flex-1 flex items-center justify-center gap-2" style={{ padding: '12px 0', borderRadius: 16, background: '#fff', border: '1.5px solid ' + T.border, fontSize: 13, fontWeight: 800, color: T.text, fontFamily: ff }}><Info style={{ width: 16, height: 16 }} /> Help</button>
                      <button className="tap flex-1 flex items-center justify-center gap-2" style={{ padding: '12px 0', borderRadius: 16, background: T.text, border: 'none', fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: ff }}><ExternalLink style={{ width: 16, height: 16 }} /> Receipt</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && <div className="fu text-center py-20"><div className="pop" style={{ width: 80, height: 80, borderRadius: 28, background: T.fill, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>📊</div><h3 style={{ fontSize: 18, fontWeight: 900, color: T.text, fontFamily: ff }}>No activity yet</h3><p style={{ fontSize: 14, color: T.sec, fontFamily: ff, marginTop: 4 }}>Transactions will appear here once you start using LocQar.</p></div>}
      </div>
    </div>
  );
}
