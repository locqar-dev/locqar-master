import React, { useEffect } from "react";
import { T, ff } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import { ArrowRight, Check } from "../components/Icons";

export default function SubSuccessPage(props) {
  var plan = props.plan || 'student';
  var planMeta = {
    student: { e: '🎓', name: 'Student Storage', color: T.blue, bg: T.blueBg, perks: ['Personal locker storage', 'Access any locker with student ID', '24/7 store & retrieve items', 'Student support channel'] }
  };
  var pm = planMeta[plan] || planMeta.student;
  var isStudent = plan === 'student';

  useEffect(function () {
    var t = setTimeout(function () { if (props.onDone) props.onDone(); }, 3500);
    return function () { clearTimeout(t); };
  }, []);

  var headline = isStudent ? 'Storage Activated!' : pm.name + ' activated!';
  var subtitle = isStudent ? 'Your student storage is ready. Access any locker with your student ID to store and retrieve items.' : 'Your ' + pm.name + ' plan is now active.';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: T.bg, padding: '40px 24px' }}>
      <StatusBar />
      {/* Celebration icon */}
      <div className="pop" style={{ fontSize: 72, marginBottom: 20, filter: 'drop-shadow(0 8px 24px ' + pm.color + '44)' }}>{pm.e}</div>

      {/* Headline */}
      <div className="text-center fu" style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', fontFamily: ff, color: T.text, marginBottom: 8 }}>
          {headline}
        </h1>
        <p style={{ fontSize: 15, color: T.sec, fontFamily: ff, lineHeight: '1.6', maxWidth: 280 }}>
          {subtitle}
        </p>
      </div>

      {/* Perks card */}
      <div className="fu d1 w-full" style={{ borderRadius: 24, padding: 20, background: pm.bg, border: '1.5px solid ' + pm.color + '22', marginBottom: 28, maxWidth: 380 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 13, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 2px 8px ' + pm.color + '20' }}>{pm.e}</div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 800, color: pm.color, letterSpacing: '0.08em', fontFamily: ff }}>YOUR PLAN</p>
            <p style={{ fontSize: 18, fontWeight: 900, fontFamily: ff, color: T.text, letterSpacing: '-0.02em' }}>{pm.name}</p>
          </div>
        </div>
        {pm.perks.map(function (perk, i) {
          return (
            <div key={i} className="flex items-center gap-3 fu" style={{ marginBottom: i < pm.perks.length - 1 ? 8 : 0, animationDelay: (i * 0.07) + 's' }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pm.color, flexShrink: 0 }}>
                <Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: ff, color: T.text }}>{perk}</span>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <button onClick={function () { if (props.onDone) props.onDone(); }} className="tap fu d2 w-full" style={{ maxWidth: 380, padding: '16px 0', borderRadius: 18, fontWeight: 800, fontSize: 16, background: T.gradient, color: '#fff', fontFamily: ff, boxShadow: T.shadowLg, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        Go to Home <ArrowRight style={{ width: 18, height: 18 }} />
      </button>

      {/* Auto-redirect hint */}
      <p className="fu d3" style={{ fontSize: 11, color: T.muted, fontFamily: ff, marginTop: 14, textAlign: 'center' }}>Redirecting automatically in a moment...</p>
    </div>
  );
}
