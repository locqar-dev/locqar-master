import React, { useState } from "react";
import { T, ff } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import NotificationSettings from "../components/NotificationSettings";

export default function NotifPrefsPage(props) {
  var [prefs, setPrefs] = useState({
    pkgReady: true, inTransit: true, delivered: true,
    promos: false, rewards: true, security: true,
    sms: true, push: true, email: false
  });
  var [saved, setSaved] = useState(false);
  var toggle = function (k) { setPrefs(function (p) { var n = {}; for (var x in p) n[x] = p[x]; n[k] = !n[k]; return n; }); };
  var Toggle = function (p) {
    return (
      <button onClick={function () { toggle(p.k); }} style={{ width: 52, height: 30, borderRadius: 15, padding: 3, background: prefs[p.k] ? T.ok : T.fill2, transition: 'all .3s cubic-bezier(0.32, 0.72, 0, 1)', flexShrink: 0 }}>
        <div style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', marginLeft: prefs[p.k] ? 22 : 0, transition: 'all .3s cubic-bezier(0.32, 0.72, 0, 1)' }} />
      </button>
    );
  };
  var Section = function (p) {
    return (
      <div className="fu glass" style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 20, animationDelay: p.delay || '0s' }}>
        <div style={{ padding: '14px 20px', background: T.fill, borderBottom: '1.5px solid ' + T.border }}><p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', fontFamily: ff, textTransform: 'uppercase' }}>{p.title}</p></div>
        <div style={{ background: T.card }}>{p.children}</div>
      </div>
    );
  };
  var Row = function (p) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: p.last ? 'none' : '1.5px solid ' + T.fill }}>
        <div className="flex items-center gap-4">
          <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: T.fill, border: '1px solid ' + T.border }}>{p.e}</div>
          <div>
            <p style={{ fontWeight: 800, fontSize: 15, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>{p.l}</p>
            {p.d && <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2, fontWeight: 500 }}>{p.d}</p>}
          </div>
        </div>
        <Toggle k={p.k} />
      </div>
    );
  };
  return (
    <div className="min-h-screen pb-24" style={{ background: T.bg }}><StatusBar />
      <Toast show={saved} emoji={'\u{2705}'} text="Preferences saved!" />
      <PageHeader title="Notifications" onBack={props.onBack} subtitle="Manage updates and alerts" />

      {/* Push Notification Settings */}
      <div style={{ marginBottom: 20, marginTop: 4 }}>
        <NotificationSettings />
      </div>

      <div style={{ padding: '0 20px' }}>
        <Section title="Delivery Updates" delay="0.06s">
          <Row e={'\u{2705}'} l="Package ready" d="When it arrives at your locker" k="pkgReady" />
          <Row e={'\u{1F69A}'} l="In transit" d="Real-time delivery tracking" k="inTransit" />
          <Row e={'\u{1F389}'} l="Delivered" d="When recipient picks up" k="delivered" last />
        </Section>
        <Section title="Marketing & Rewards" delay="0.12s">
          <Row e={'\u{1F3F7}\u{FE0F}'} l="Promotions" d="Discounts and special deals" k="promos" />
          <Row e={'\u{1F381}'} l="Reward milestones" d="Points and tier progress" k="rewards" />
          <Row e={'\u{1F512}'} l="Security alerts" d="Login and account changes" k="security" last />
        </Section>
        <Section title="Channels" delay="0.18s">
          <Row e={'\u{1F4F1}'} l="SMS" d="+233 24 \u2022\u2022\u2022\u2022 2521" k="sms" />
          <Row e={'\u{1F514}'} l="Push notifications" d="In-app and device alerts" k="push" />
          <Row e={'\u{1F4E7}'} l="Email" d="kwame.asante@gmail.com" k="email" last />
        </Section>
      </div>
      <div className="glass fixed bottom-0 left-0 right-0 z-50" style={{ padding: 16, borderTop: '1.5px solid ' + T.border }}>
        <button onClick={function () { setSaved(true); setTimeout(function () { setSaved(false); props.onBack(); }, 1200); }} className="tap" style={{ width: '100%', padding: '16px 0', borderRadius: 16, fontWeight: 700, fontSize: 15, background: T.text, color: '#fff', fontFamily: ff, boxShadow: T.shadowLg }}>Save Preferences</button>
      </div>
    </div>
  );
}
