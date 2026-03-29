import React, { useState } from "react";
import { T, ff, hf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import { Check, Eye, EyeOff } from "../components/Icons";

export default function StudentAuth(props) {
  var [studentId, setStudentId] = useState('');
  var [password, setPassword] = useState('');
  var [showPass, setShowPass] = useState(false);
  var [focusField, setFocusField] = useState(null);
  var idValid = studentId.trim().length >= 4;
  var passValid = password.length >= 6;
  var valid = idValid && passValid;

  var fieldStyle = function (field, v) {
    return {
      width: '100%', borderRadius: 14, padding: '13px 16px', fontSize: 15, fontWeight: 600,
      background: T.fill, fontFamily: ff,
      border: '1.5px solid ' + (v && focusField !== field ? T.ok + '55' : focusField === field ? T.text : T.border),
      transition: 'border .25s, box-shadow .25s',
      boxShadow: focusField === field ? '0 0 0 3px ' + T.text + '08' : 'none'
    };
  };
  var labelStyle = { fontSize: 10, fontWeight: 700, color: T.muted, letterSpacing: '0.08em', marginBottom: 7, display: 'block', fontFamily: ff };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: T.bg }}><StatusBar />
      <div className="flex-1" style={{ padding: '44px 24px 0' }}>
        <div className="fu">
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, ' + T.blueBg + ', ' + T.purpleBg + ')', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 20 }}>{'\u{1F393}'}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.03em', fontFamily: hf }}>Student Login</h1>
          <p style={{ fontSize: 14, lineHeight: '1.65', color: T.sec, marginBottom: 28, fontFamily: ff }}>Sign in with your student ID and password to access lockers.</p>
        </div>

        <div className="fu d1" style={{ marginBottom: 16 }}>
          <label style={labelStyle}>STUDENT ID</label>
          <div style={{ position: 'relative' }}>
            <input type="text" value={studentId} onChange={function (e) { setStudentId(e.target.value); }} onFocus={function () { setFocusField('sid'); }} onBlur={function () { setFocusField(null); }} placeholder="e.g. UG9876543" style={fieldStyle('sid', idValid)} autoFocus />
            {idValid && <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}><div className="fi" style={{ width: 20, height: 20, borderRadius: 10, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} /></div></div>}
          </div>
        </div>

        <div className="fu d2" style={{ marginBottom: 16 }}>
          <label style={labelStyle}>PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} value={password} onChange={function (e) { setPassword(e.target.value); }} onFocus={function () { setFocusField('pass'); }} onBlur={function () { setFocusField(null); }} placeholder="Enter your password" style={fieldStyle('pass', passValid)} />
            <button onClick={function () { setShowPass(!showPass); }} className="tap" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
              {showPass ? <EyeOff style={{ width: 18, height: 18, color: T.muted }} /> : <Eye style={{ width: 18, height: 18, color: T.muted }} />}
            </button>
          </div>
        </div>

        {valid && <div className="flex items-center gap-2 fu" style={{ marginTop: 4, padding: '0 2px' }}><div style={{ width: 16, height: 16, borderRadius: 8, background: T.ok, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check style={{ width: 10, height: 10, color: '#fff', strokeWidth: 3 }} /></div><p style={{ fontSize: 12, fontWeight: 600, color: T.okDark, fontFamily: ff }}>Ready to sign in</p></div>}
      </div>
      <div style={{ padding: '0 24px 36px' }}>
        <button onClick={function () { if (valid) props.onLogin(studentId, password); }} className="tap" style={{ width: '100%', padding: '14px 0', borderRadius: 14, fontWeight: 700, fontSize: 15, background: valid ? 'linear-gradient(135deg, ' + T.blue + ', ' + T.purple + ')' : T.fill, color: valid ? '#fff' : T.muted, transition: 'all .25s', fontFamily: ff, boxShadow: valid ? '0 4px 14px rgba(59,130,246,0.3)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>{'\u{1F393}'} Sign In</button>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 13, color: T.sec, fontFamily: ff }}>Don't have a student account? <button onClick={props.onSignup} className="tap" style={{ fontWeight: 700, color: T.blue, fontFamily: ff }}>Register</button></p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: T.muted, fontFamily: ff }}>Not a student? <button onClick={props.onRegular} className="tap" style={{ fontWeight: 700, color: T.accent, fontFamily: ff }}>Sign in here</button></p>
      </div>
    </div>
  );
}
