import React from 'react';
import StatusBar from '../components/StatusBar';
import TopBar from '../components/TopBar';
import { HelpCircle, ChevronRight, Phone } from '../components/Icons';

const ProfileHelpScreen = ({ onBack, T }) => (
  <div style={{ minHeight: '100vh', background: T.bg, paddingBottom: 32 }}><StatusBar />
    <TopBar title="Help Center" onBack={onBack} T={T} />
    <div style={{ padding: '0 20px' }}>
      <div style={{ borderRadius: 12, padding: 20, background: T.blueBg, marginBottom: 20, textAlign: 'center' }}>
        <HelpCircle size={32} style={{ color: T.blue, marginBottom: 8 }} />
        <h3 style={{ fontWeight: 700, margin: '0 0 4px' }}>Need help?</h3>
        <p style={{ fontSize: 14, color: T.sec, margin: 0 }}>Browse FAQs or contact support</p>
      </div>
      {[{ q: 'How do I deposit a package?', a: 'Navigate to your assigned stop, scan the package, and follow the prompts to deposit.' }, { q: 'What if a locker is full?', a: 'Contact dispatch through the app. They will reassign the package to a nearby locker.' }, { q: 'How are earnings calculated?', a: 'Earnings include base pay per block, plus per-package fees and surge bonuses.' }, { q: 'How do I handle a recall?', a: 'Go to Tasks > Recall tab. Use the pick-up code to retrieve the package from the locker.' }].map((faq, i) =>
        <details key={i} style={{ marginBottom: 8, borderRadius: 12, overflow: 'hidden', background: T.card }}>
          <summary style={{ padding: 16, fontWeight: 600, fontSize: 14, cursor: 'pointer', listStyle: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>{faq.q}<ChevronRight size={14} style={{ color: T.muted }} /></summary>
          <div style={{ padding: '0 16px 16px' }}><p style={{ fontSize: 14, color: T.sec, margin: 0, lineHeight: 1.5 }}>{faq.a}</p></div>
        </details>
      )}
      <button className="tap" style={{ width: '100%', height: 48, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, fontWeight: 700, fontSize: 14, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Phone size={16} />Contact Support</button>
    </div>
  </div>
);

export default ProfileHelpScreen;
