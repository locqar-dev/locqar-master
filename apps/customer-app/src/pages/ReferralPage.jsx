import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { Phone, ExternalLink, Check, Copy, Zap } from "../components/Icons";

export default function ReferralPage(props) {
  var [codeCopied, setCodeCopied] = useState(false);
  var [activeTab, setActiveTab] = useState('invite');
  var [showHow, setShowHow] = useState(false);
  var [inviteSent, setInviteSent] = useState(false);
  var [invitePhone, setInvitePhone] = useState('');
  var [showInviteInput, setShowInviteInput] = useState(false);

  var code = 'KWAME2026';
  var totalEarned = 120;
  var totalInvited = 4;
  var pending = 2;

  var rewards = [
    { at: 1, pts: 25, label: 'First friend', unlocked: true, e: '\u{1F389}' },
    { at: 3, pts: 50, label: '3 friends', unlocked: true, e: '\u{1F525}' },
    { at: 5, pts: 100, label: '5 friends', unlocked: false, e: '\u{2B50}' },
    { at: 10, pts: 250, label: '10 friends', unlocked: false, e: '\u{1F451}' },
    { at: 25, pts: 750, label: '25 friends', unlocked: false, e: '\u{1F48E}' }
  ];

  var friends = [
    { name: 'Ama Mensah', phone: '+233 24 \u2022\u2022\u2022\u2022 1234', status: 'joined', date: 'Feb 5', pts: 25, emoji: '\u{1F469}\u{1F3FE}' },
    { name: 'Kofi Boateng', phone: '+233 20 \u2022\u2022\u2022\u2022 5678', status: 'joined', date: 'Feb 3', pts: 25, emoji: '\u{1F468}\u{1F3FE}' },
    { name: 'Abena Owusu', phone: '+233 55 \u2022\u2022\u2022\u2022 9012', status: 'joined', date: 'Jan 28', pts: 25, emoji: '\u{1F469}\u{1F3FE}\u{200D}\u{1F4BC}' },
    { name: 'Yaw Darko', phone: '+233 27 \u2022\u2022\u2022\u2022 4567', status: 'joined', date: 'Jan 20', pts: 25, emoji: '\u{1F468}\u{1F3FE}\u{200D}\u{1F527}' },
    { name: 'Unknown', phone: '+233 50 \u2022\u2022\u2022\u2022 3333', status: 'pending', date: 'Feb 8', pts: 0, emoji: '\u{1F464}' },
    { name: 'Unknown', phone: '+233 24 \u2022\u2022\u2022\u2022 7777', status: 'pending', date: 'Feb 7', pts: 0, emoji: '\u{1F464}' }
  ];

  var handleCopy = function () {
    if (navigator.clipboard) navigator.clipboard.writeText(code);
    setCodeCopied(true); setTimeout(function () { setCodeCopied(false); }, 2000);
  };

  var handleSendInvite = function () {
    if (invitePhone.replace(/\s/g, '').length >= 7) {
      setInviteSent(true);
      setTimeout(function () { setInviteSent(false); setInvitePhone(''); setShowInviteInput(false); }, 2000);
    }
  };

  var shareMsg = 'Join LocQar and get 25 bonus points! Use my code: ' + code + ' \u{1F4E6}';

  return (
    <div className="min-h-screen noscroll overflow-y-auto pb-24" style={{ background: T.bg }}><StatusBar />
      <Toast show={codeCopied} emoji={'\u{1F4CB}'} text="Referral code copied!" />
      <Toast show={inviteSent} emoji={'\u{1F4E4}'} text="Invite sent via SMS!" />

      <PageHeader title="Refer & Earn" onBack={props.onBack} subtitle="Invite friends to get free rewards" />

      <div style={{ padding: '0 20px' }}>
        {/* Hero Card */}
        <div className="fu mb-6" style={{ borderRadius: 32, padding: 24, background: T.gradient, color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: T.shadowLg }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: 70, background: 'rgba(255,255,255,0.1)', filter: 'blur(30px)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: -20, width: 100, height: 100, borderRadius: 50, background: 'rgba(0,0,0,0.15)', filter: 'blur(20px)' }} />

          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div style={{ width: 56, height: 56, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.1)' }}>{'\u{1F381}'}</div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, fontFamily: ff, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Invite Friends,<br />Get Rewards</h2>
            </div>
          </div>

          <div className="flex gap-2 mb-6 relative z-10" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
            {[
              { v: totalInvited, l: 'Joined', e: '\u{1F465}' },
              { v: pending, l: 'Pending', e: '\u{23F3}' },
              { v: totalEarned, l: 'Points', e: '\u{2728}' }
            ].map(function (s, i) {
              return (
                <div key={i} style={{ textAlign: 'center', padding: '12px 4px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <p style={{ fontSize: 22, fontWeight: 900, fontFamily: mf, lineHeight: 1 }}>{s.v}</p>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontFamily: ff, fontWeight: 700, marginTop: 4 }}>{s.l}</p>
                </div>
              );
            })}
          </div>

          <div className="relative z-10">
            <p style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: 8, fontFamily: ff }}>YOUR UNIQUE CODE</p>
            <div className="flex items-center gap-2">
              <div className="flex-1" style={{ borderRadius: 18, padding: '14px 20px', fontSize: 24, fontWeight: 900, letterSpacing: '0.15em', background: 'rgba(255,255,255,0.1)', textAlign: 'center', fontFamily: mf, border: '1.5px dashed rgba(255,255,255,0.2)' }}>{code}</div>
              <button onClick={handleCopy} className="tap" style={{ width: 54, height: 54, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', background: codeCopied ? T.ok : 'rgba(255,255,255,0.15)', transition: 'all .3s' }}>
                {codeCopied ? <Check style={{ width: 20, height: 20, color: '#fff' }} /> : <Copy style={{ width: 20, height: 20, color: '#fff' }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="fu d1 flex gap-2 mb-6">
          <button onClick={function () { setShowInviteInput(!showInviteInput); }} className="tap flex-1 flex items-center justify-center gap-2" style={{ padding: '16px 0', borderRadius: 20, background: T.text, color: '#fff', fontWeight: 900, fontSize: 14, fontFamily: ff, boxShadow: T.shadowLg }}>
            <Phone style={{ width: 16, height: 16 }} /> SMS Invite
          </button>
          <button onClick={function () { if (navigator.share) navigator.share({ title: 'Join LocQar', text: shareMsg }).catch(function () { }); else handleCopy(); }} className="tap flex-1 flex items-center justify-center gap-2" style={{ padding: '16px 0', borderRadius: 20, background: '#fff', color: T.text, fontWeight: 900, fontSize: 14, fontFamily: ff, border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
            <ExternalLink style={{ width: 16, height: 16 }} /> Share Info
          </button>
        </div>

        {showInviteInput && (
          <div className="fu fi mb-6 glass" style={{ borderRadius: 24, padding: 20, background: '#fff', border: '1.5px solid ' + T.border }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', marginBottom: 10, fontFamily: ff }}>RECIPIENT NUMBER</p>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-3" style={{ borderRadius: 18, padding: '14px 18px', background: T.fill, border: '1.5px solid ' + T.border }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.muted }}>+233</span>
                <input type="tel" value={invitePhone} onChange={function (e) { setInvitePhone(e.target.value); }} placeholder="24 000 0000" className="flex-1" style={{ background: 'transparent', fontWeight: 800, fontSize: 16, fontFamily: mf, color: T.text, outline: 'none' }} autoFocus />
              </div>
              <button onClick={handleSendInvite} className="tap" style={{ padding: '0 24px', borderRadius: 18, fontWeight: 900, fontSize: 13, background: invitePhone.length >= 7 ? T.accent : T.fill, color: invitePhone.length >= 7 ? '#fff' : T.muted, transition: 'all .3s', fontFamily: ff }}>SEND</button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="fu d2 flex gap-2 mb-6 p-1 bg-white rounded-2xl border" style={{ background: T.fill }}>
          {[{ id: 'invite', l: 'Friends', e: '\u{1F465}' }, { id: 'rewards', l: 'Rewards', e: '\u{1F3C6}' }].map(function (t) {
            var sel = activeTab === t.id;
            return (
              <button key={t.id} onClick={function () { setActiveTab(t.id); }} className="tap flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300" style={{ background: sel ? '#fff' : 'transparent', color: sel ? T.text : T.muted, boxShadow: sel ? '0 4px 12px rgba(0,0,0,0.05)' : 'none' }}>
                <span style={{ fontSize: 14 }}>{t.e}</span>
                <span style={{ fontSize: 13, fontWeight: 800, fontFamily: ff }}>{t.l}</span>
              </button>
            );
          })}
        </div>

        {/* Content areas */}
        {activeTab === 'invite' && (
          <div className="fi">
            {friends.map(function (f, i) {
              var joined = f.status === 'joined';
              return (
                <div key={i} className="fu glass mb-3" style={{ borderRadius: 24, padding: 14, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid ' + (joined ? T.ok + '15' : T.border), boxShadow: T.shadow }}>
                  <div style={{ width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, background: joined ? T.okBg : T.fill, border: '1px solid ' + (joined ? T.ok + '20' : T.border) }}>{f.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate" style={{ fontWeight: 800, fontSize: 14, fontFamily: ff }}>{f.name}</h3>
                      {joined && <div style={{ width: 18, height: 18, borderRadius: 9, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 4 }} /></div>}
                    </div>
                    <p style={{ fontSize: 12, color: T.muted, fontFamily: mf, fontWeight: 500 }}>{f.phone}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 8, background: joined ? T.okBg : T.warnBg, color: joined ? T.okDark : T.warn, fontFamily: ff }}>{joined ? 'JOINED' : 'PENDING'}</span>
                    {joined && <p style={{ fontSize: 12, fontWeight: 900, color: T.okDark, fontFamily: mf, marginTop: 4 }}>+25 pts</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'rewards' && (
          <div className="fi">
            {/* Progress */}
            <div className="fu glass mb-4 p-5" style={{ borderRadius: 28, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadowLg }}>
              <div className="flex items-center justify-between mb-4">
                <span style={{ fontSize: 14, fontWeight: 900, fontFamily: ff, color: T.text }}>Referral Milestone</span>
                <span style={{ fontSize: 14, fontWeight: 900, color: T.accent, fontFamily: mf }}>{totalInvited} / {rewards[rewards.length - 1].at}</span>
              </div>
              <div style={{ height: 12, borderRadius: 6, background: T.fill, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 6, width: (totalInvited / rewards[rewards.length - 1].at * 100) + '%', background: T.gradient, transition: 'width 1s ease-out' }} />
              </div>
              <div className="flex justify-between">
                {rewards.map(function (r, i) {
                  return (
                    <div key={i} style={{ textAlign: 'center', opacity: r.at <= totalInvited ? 1 : 0.4 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: r.at <= totalInvited ? T.okBg : T.fill, border: '2px solid ' + (r.at <= totalInvited ? T.ok : T.border), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, margin: '0 auto 4px' }}>{r.e}</div>
                      <p style={{ fontSize: 9, fontWeight: 900, color: T.text, fontFamily: mf }}>{r.at}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tier List */}
            {rewards.map(function (r, i) {
              var ok = r.at <= totalInvited;
              return (
                <div key={i} className="fu glass mb-3" style={{ borderRadius: 24, padding: 16, display: 'flex', alignItems: 'center', gap: 14, background: '#fff', border: '1.5px solid ' + (ok ? T.ok + '15' : T.border), opacity: ok ? 1 : 0.7 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: ok ? T.okBg : T.fill, border: '1.5px solid ' + (ok ? T.ok + '20' : T.border) }}>{r.e}</div>
                  <div className="flex-1">
                    <h3 style={{ fontWeight: 900, fontSize: 15, fontFamily: ff }}>{r.label}</h3>
                    <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, fontWeight: 500 }}>Invite {r.at} friend{r.at > 1 ? 's' : ''}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontWeight: 900, fontSize: 18, fontFamily: mf, color: ok ? T.okDark : T.text }}>+{r.pts}</p>
                    {ok && <span style={{ fontSize: 9, fontWeight: 900, background: T.okBg, color: T.okDark, padding: '3px 8px', borderRadius: 6, fontFamily: ff }}>EARNED</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
