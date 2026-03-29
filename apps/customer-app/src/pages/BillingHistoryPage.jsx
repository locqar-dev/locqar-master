import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { Check, Copy, ExternalLink, Info } from "../components/Icons";

export default function BillingHistoryPage(props) {
  var invoices = [
    { id: 'INV-2026-0222', date: 'Feb 22, 2026', plan: 'Student', amount: 15, status: 'Paid', method: 'MTN MoMo ••8521' },
    { id: 'INV-2026-0122', date: 'Jan 22, 2026', plan: 'Student', amount: 15, status: 'Paid', method: 'MTN MoMo ••8521' },
    { id: 'INV-2025-1222', date: 'Dec 22, 2025', plan: 'Student', amount: 15, status: 'Paid', method: 'MTN MoMo ••8521' }
  ];
  var [copiedId, setCopiedId] = useState('');
  var [downloadToast, setDownloadToast] = useState(false);
  var totalSpent = invoices.reduce(function (s, inv) { return s + inv.amount; }, 0);

  var handleCopyId = function (id) {
    if (navigator.clipboard) navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(function () { setCopiedId(''); }, 1500);
  };

  return (
    <div className="min-h-screen pb-24 noscroll overflow-y-auto" style={{ background: T.bg }}>
      <StatusBar />
      <Toast show={downloadToast} emoji="📄" text="Receipt downloaded" />
      <Toast show={!!copiedId} emoji="📋" text="Invoice ID copied" />
      <PageHeader title="Billing History" onBack={props.onBack} subtitle="Your payment records" />

      <div style={{ padding: '0 20px' }}>
        {/* Summary card */}
        <div className="fu" style={{ borderRadius: 20, padding: 18, background: T.gradient, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -20, right: -10, width: 100, height: 100, borderRadius: 50, background: 'rgba(255,255,255,0.04)', filter: 'blur(20px)' }} />
          <div className="flex items-center justify-between" style={{ position: 'relative' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontFamily: ff, marginBottom: 4 }}>TOTAL SPENT</p>
              <p style={{ fontSize: 28, fontWeight: 900, fontFamily: mf, color: '#fff', letterSpacing: '-0.03em' }}>GH₵{totalSpent}<span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>.00</span></p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontFamily: ff, marginBottom: 4 }}>INVOICES</p>
              <p style={{ fontSize: 28, fontWeight: 900, fontFamily: mf, color: '#fff' }}>{invoices.length}</p>
            </div>
          </div>
        </div>

        {/* Invoice list */}
        <p style={{ fontSize: 10, fontWeight: 800, color: T.muted, letterSpacing: '0.08em', fontFamily: ff, marginBottom: 10 }}>ALL INVOICES</p>
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
          {invoices.map(function (inv, i) {
            var isPaid = inv.status === 'Paid';
            return (
              <div key={i} className={'fu d' + Math.min(i + 1, 5)} style={{ padding: '16px 18px', background: T.card, borderBottom: i < invoices.length - 1 ? '1px solid ' + T.fill : 'none' }}>
                <div className="flex items-start gap-4">
                  <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: isPaid ? T.okBg : T.fill, border: '1px solid ' + (isPaid ? T.ok + '22' : T.border), flexShrink: 0 }}>
                    {isPaid ? '✅' : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p style={{ fontSize: 14, fontWeight: 800, fontFamily: ff, color: T.text }}>{inv.plan} Plan</p>
                      <p style={{ fontSize: 15, fontWeight: 900, fontFamily: mf, color: isPaid ? T.text : T.muted }}>{inv.amount > 0 ? 'GH₵' + inv.amount : 'Free'}</p>
                    </div>
                    <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2 }}>{inv.date}</p>
                    <div className="flex items-center gap-3" style={{ marginTop: 8 }}>
                      <button onClick={function () { handleCopyId(inv.id); }} className="tap flex items-center gap-1.5" style={{ fontSize: 10, fontWeight: 700, color: copiedId === inv.id ? T.ok : T.sec, fontFamily: mf, padding: '4px 8px', borderRadius: 8, background: T.fill, border: '1px solid ' + T.border, transition: 'all .2s' }}>
                        {copiedId === inv.id ? <Check style={{ width: 10, height: 10 }} /> : <Copy style={{ width: 10, height: 10 }} />} {inv.id}
                      </button>
                      {isPaid && (
                        <button onClick={function () { setDownloadToast(true); setTimeout(function () { setDownloadToast(false); }, 2000); }} className="tap flex items-center gap-1" style={{ fontSize: 10, fontWeight: 700, color: T.blue, fontFamily: ff, padding: '4px 8px', borderRadius: 8, background: T.blueBg, border: '1px solid ' + T.blue + '22' }}>
                          <ExternalLink style={{ width: 10, height: 10 }} /> Receipt
                        </button>
                      )}
                    </div>
                    {isPaid && <p style={{ fontSize: 10, color: T.muted, fontFamily: ff, marginTop: 6 }}>via {inv.method}</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help text */}
        <div className="fu d5 flex items-center gap-3" style={{ marginTop: 16, padding: '14px 16px', borderRadius: 16, background: T.fill, border: '1px solid ' + T.border }}>
          <Info style={{ width: 16, height: 16, color: T.sec, flexShrink: 0 }} />
          <p style={{ fontSize: 11, color: T.sec, fontFamily: ff, lineHeight: '1.5' }}>Need help with a charge? Contact support from your Account page.</p>
        </div>
      </div>
    </div>
  );
}
