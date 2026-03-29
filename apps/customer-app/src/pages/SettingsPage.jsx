import React, { useState } from "react";
import { T, ff, useDarkMode } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import { Bell, Globe, CreditCard, Shield, Info, X, ChevronRight } from "../components/Icons";

export default function SettingsPage(props) {
  var [sms, setSms] = useState(true);
  var [dark, setDark] = useDarkMode();
  var navigate = function (s) { if (props.onNav) props.onNav(s); };
  return (
    <div className="min-h-screen pb-10 noscroll overflow-y-auto" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="Settings" />
      <div style={{ padding: '0 20px' }}>
        {/* Appearance */}
        <p style={{ fontSize: 11, fontWeight: 900, color: T.sec, letterSpacing: '0.1em', marginBottom: 12, fontFamily: ff, textTransform: 'uppercase' }}>Appearance</p>
        <div className="glass" style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 24 }}>
          <div className="flex items-center justify-between" style={{ padding: 18 }}>
            <div className="flex items-center gap-4">
              <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.purpleBg }}><span style={{ fontSize: 18 }}>{dark ? '\u{1F319}' : '\u{2600}\u{FE0F}'}</span></div>
              <div><span style={{ fontWeight: 800, fontSize: 15, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>Dark Mode</span><p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2, fontWeight: 500 }}>{dark ? 'Deep Midnight' : 'Soft Light'}</p></div>
            </div>
            <button onClick={function () { setDark(!dark); }} style={{ width: 52, height: 30, borderRadius: 15, padding: 3, background: dark ? T.accent : T.fill2, transition: 'all .3s cubic-bezier(0.32, 0.72, 0, 1)' }}>
              <div style={{ width: 24, height: 24, borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', marginLeft: dark ? 22 : 0, transition: 'all .3s cubic-bezier(0.32, 0.72, 0, 1)' }} />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <p style={{ fontSize: 11, fontWeight: 900, color: T.sec, letterSpacing: '0.1em', marginBottom: 12, fontFamily: ff, textTransform: 'uppercase' }}>Preferences</p>
        <div className="glass" style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 24 }}>
          {[
            { icon: Bell, l: 'Notifications', d: 'Manage alerts & updates', s: 'notif-prefs', bg: T.accentBg, c: T.accent },
            { icon: Globe, l: 'Language', v: 'English', bg: T.blueBg, c: T.blue },
            { icon: CreditCard, l: 'Currency', v: 'GH\u20B5', bg: T.okBg, c: T.okDark }
          ].map(function (m, i) {
            var Icon = m.icon;
            return (
              <button key={i} onClick={function () { if (m.s) navigate(m.s); }} className="tap w-full" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, background: 'transparent', borderBottom: i < 2 ? '1.5px solid ' + T.fill : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.bg }}><Icon style={{ width: 18, height: 18, color: m.c, strokeWidth: 2.5 }} /></div>
                <div className="flex-1 text-left">
                  <p style={{ fontWeight: 800, fontSize: 15, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>{m.l}</p>
                  {m.d && <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2, fontWeight: 500 }}>{m.d}</p>}
                </div>
                {m.v && <span style={{ fontSize: 13, fontWeight: 700, color: T.sec, fontFamily: ff, marginRight: 4 }}>{m.v}</span>}
                <ChevronRight style={{ width: 18, height: 18, color: T.muted }} />
              </button>
            );
          })}
        </div>

        {/* Security & Legal */}
        <p style={{ fontSize: 11, fontWeight: 900, color: T.sec, letterSpacing: '0.1em', marginBottom: 12, fontFamily: ff, textTransform: 'uppercase' }}>Security & Legal</p>
        <div className="glass" style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 24 }}>
          {[
            { icon: Shield, l: 'Security PIN', d: 'Manage access code', s: 'security', bg: T.purpleBg, c: T.purple },
            { icon: Info, l: 'Terms of Service', s: 'terms', bg: T.blueBg, c: T.blue },
            { icon: Shield, l: 'Privacy Policy', s: 'privacy', bg: T.okBg, c: T.okDark }
          ].map(function (m, i) {
            var Icon = m.icon;
            return (
              <button key={i} onClick={function () { navigate(m.s); }} className="tap w-full" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 18, background: 'transparent', borderBottom: i < 2 ? '1.5px solid ' + T.fill : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: m.bg }}><Icon style={{ width: 18, height: 18, color: m.c, strokeWidth: 2.5 }} /></div>
                <div className="flex-1 text-left">
                  <p style={{ fontWeight: 800, fontSize: 15, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>{m.l}</p>
                  {m.d && <p style={{ fontSize: 12, color: T.sec, fontFamily: ff, marginTop: 2, fontWeight: 500 }}>{m.d}</p>}
                </div>
                <ChevronRight style={{ width: 18, height: 18, color: T.muted }} />
              </button>
            );
          })}
        </div>

        {/* Danger zone */}
        <button onClick={function () { navigate('delete-account'); }} className="tap fu" style={{ width: '100%', padding: 20, borderRadius: 24, display: 'flex', alignItems: 'center', gap: 14, background: T.accentBg, border: '1.5px solid ' + T.accent + '20', marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}><X style={{ width: 18, height: 18, color: T.accent, strokeWidth: 3 }} /></div>
          <div className="flex-1 text-left">
            <p style={{ fontWeight: 800, fontSize: 15, color: T.accent, fontFamily: ff, letterSpacing: '-0.01em' }}>Delete Account</p>
            <p style={{ fontSize: 12, color: T.accent, opacity: 0.7, fontFamily: ff, marginTop: 2, fontWeight: 500 }}>Permanently remove your data</p>
          </div>
          <ChevronRight style={{ width: 18, height: 18, color: T.accent }} />
        </button>
      </div>
    </div>
  );
}
