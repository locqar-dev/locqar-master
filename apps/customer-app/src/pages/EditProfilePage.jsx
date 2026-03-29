import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { Camera } from "../components/Icons";

export default function EditProfilePage(props) {
  var [name, setName] = useState(props.user.name);
  var [email, setEmail] = useState('kwame.asante@gmail.com');
  var [saved, setSaved] = useState(false);
  var [focusField, setFocusField] = useState(null);
  var fld = function (f, valid) { return { width: '100%', borderRadius: 14, padding: '13px 16px', fontSize: 14, fontWeight: 600, background: T.fill, fontFamily: ff, border: '1.5px solid ' + (focusField === f ? T.text : T.border), transition: 'border .25s' }; };
  var lbl = { fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 7, display: 'block', fontFamily: ff };
  return (
    <div className="min-h-screen" style={{ paddingBottom: 100, background: T.bg }}><StatusBar />
      <Toast show={saved} emoji={'\u{2705}'} text="Profile saved!" />
      <PageHeader title="Edit Profile" onBack={props.onBack} />
      <div style={{ padding: '0 20px' }}>
        {/* Avatar */}
        <div className="fu flex flex-col items-center" style={{ marginBottom: 24 }}>
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, background: T.fill, border: '3px solid ' + T.border }}>{'\u{1F464}'}</div>
            <button className="tap" style={{ position: 'absolute', bottom: -2, right: -2, width: 30, height: 30, borderRadius: 15, background: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}><Camera style={{ width: 13, height: 13, color: '#fff' }} /></button>
          </div>
          <p style={{ fontSize: 11, color: T.sec, fontFamily: ff }}>Tap to change photo</p>
        </div>
        {/* Fields */}
        <div className="fu d1" style={{ marginBottom: 16 }}><label style={lbl}>FULL NAME</label><input type="text" value={name} onChange={function (e) { setName(e.target.value); }} onFocus={function () { setFocusField('name'); }} onBlur={function () { setFocusField(null); }} style={fld('name')} /></div>
        <div className="fu d2" style={{ marginBottom: 16 }}><label style={lbl}>EMAIL</label><input type="email" value={email} onChange={function (e) { setEmail(e.target.value); }} onFocus={function () { setFocusField('email'); }} onBlur={function () { setFocusField(null); }} style={fld('email')} /></div>
        <div className="fu d3" style={{ marginBottom: 16 }}>
          <label style={lbl}>PHONE NUMBER</label>
          <div className="flex items-center gap-2" style={{ borderRadius: 14, padding: '13px 16px', background: T.fill, border: '1.5px solid ' + T.border }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.sec, fontFamily: ff }}>{'\u{1F1EC}\u{1F1ED}'} +233</span>
            <span style={{ fontWeight: 700, fontSize: 14, fontFamily: mf, color: T.text }}>{props.user.phone}</span>
            <span className="flex-1" />
            <span style={{ fontSize: 10, fontWeight: 600, color: T.accent, fontFamily: ff }}>Verified {'\u2713'}</span>
          </div>
          <p style={{ fontSize: 11, color: T.sec, marginTop: 6, fontFamily: ff }}>Changing your phone requires re-verification</p>
        </div>
        {/* Date joined */}
        <div className="fu d4" style={{ borderRadius: 14, padding: '12px 16px', background: T.fill, border: '1px solid ' + T.border }}>
          <div className="flex items-center justify-between"><span style={{ fontSize: 12, color: T.sec, fontFamily: ff }}>Member since</span><span style={{ fontSize: 12, fontWeight: 700, fontFamily: ff }}>January 2026</span></div>
        </div>
      </div>
      <div className="glass fixed bottom-0 left-0 right-0" style={{ padding: 16, borderTop: '1px solid ' + T.border }}>
        <button onClick={function () { setSaved(true); setTimeout(function () { setSaved(false); props.onBack(); }, 1200); }} className="tap" style={{ width: '100%', padding: '13px 0', borderRadius: 14, fontWeight: 700, fontSize: 15, background: T.text, color: '#fff', fontFamily: ff, boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>Save Changes</button>
      </div>
    </div>
  );
}
