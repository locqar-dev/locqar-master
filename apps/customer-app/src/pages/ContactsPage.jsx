import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import Toast from "../components/Toast";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { contacts } from "../data/mockData";
import { Search, X, Plus, ArrowRight } from "../components/Icons";

export default function ContactsPage(props) {
  var [searchQ, setSearchQ] = useState('');
  var [editIdx, setEditIdx] = useState(null);
  var [showAdd, setShowAdd] = useState(false);
  var [newName, setNewName] = useState('');
  var [newPhone, setNewPhone] = useState('');
  var [addedToast, setAddedToast] = useState(false);
  var fl = searchQ ? contacts.filter(function (c) { return c.name.toLowerCase().indexOf(searchQ.toLowerCase()) >= 0 || c.phone.indexOf(searchQ) >= 0; }) : contacts;
  var handleAdd = function () { if (newName.trim() && newPhone.replace(/\s/g, '').length >= 7) { setAddedToast(true); setShowAdd(false); setNewName(''); setNewPhone(''); setTimeout(function () { setAddedToast(false); }, 2000); } };
  return (
    <div className="min-h-screen pb-6 noscroll overflow-y-auto" style={{ background: T.bg }}><StatusBar />
      <Toast show={addedToast} emoji={'\u{2705}'} text="Contact added!" />
      <PageHeader title="Contacts" onBack={props.onBack} subtitle={contacts.length + ' saved'} right={
        <button onClick={function () { setShowAdd(!showAdd); }} className="tap" style={{ width: 44, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: showAdd ? T.text : T.card, border: '1.5px solid ' + (showAdd ? T.text : T.border), transition: 'all .25s', boxShadow: T.shadow }}>
          {showAdd ? <X style={{ width: 18, height: 18, color: '#fff' }} /> : <Plus style={{ width: 18, height: 18, color: T.text }} />}
        </button>
      } />
      <div style={{ padding: '0 20px' }}>
        {/* Add contact */}
        {showAdd && (
          <div className="fu glass" style={{ borderRadius: 24, padding: 20, marginBottom: 16, boxShadow: T.shadowLg }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.08em', marginBottom: 16, fontFamily: ff, textTransform: 'uppercase' }}>Add New Contact</p>
            <div style={{ marginBottom: 12 }}>
              <input type="text" value={newName} onChange={function (e) { setNewName(e.target.value); }} placeholder="Full name" style={{ width: '100%', borderRadius: 16, padding: '14px 18px', background: T.fill, fontSize: 14, fontWeight: 700, fontFamily: ff, border: '1.5px solid ' + T.border, color: T.text, outline: 'none' }} />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 flex-1" style={{ borderRadius: 16, padding: '14px 18px', background: T.fill, border: '1.5px solid ' + T.border }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: T.muted, fontFamily: ff }}>+233</span>
                <input type="tel" value={newPhone} onChange={function (e) { setNewPhone(e.target.value); }} placeholder="24 000 0000" className="flex-1" style={{ background: 'transparent', fontWeight: 800, fontSize: 14, fontFamily: mf, color: T.text, outline: 'none' }} />
              </div>
              <button onClick={handleAdd} className="tap" style={{ padding: '0 24px', borderRadius: 16, fontWeight: 800, fontSize: 13, background: (newName.trim() && newPhone.replace(/\s/g, '').length >= 7) ? T.accent : T.fill, color: (newName.trim() && newPhone.replace(/\s/g, '').length >= 7) ? '#fff' : T.muted, transition: 'all .25s', fontFamily: ff, textTransform: 'uppercase', letterSpacing: '0.02em', boxShadow: (newName.trim() && newPhone.replace(/\s/g, '').length >= 7) ? '0 8px 20px ' + T.accent + '33' : 'none' }}>Add</button>
            </div>
          </div>
        )}
        {/* Search */}
        <div className="flex items-center gap-3 glass" style={{ borderRadius: 16, padding: '12px 16px', border: '1.5px solid ' + (searchQ ? T.accent : T.border), transition: 'all .25s', marginBottom: 20, boxShadow: T.shadow }}>
          <Search style={{ width: 18, height: 18, color: T.sec, flexShrink: 0 }} />
          <input type="text" value={searchQ} onChange={function (e) { setSearchQ(e.target.value); }} placeholder="Search contacts..." className="flex-1" style={{ background: 'transparent', fontSize: 14, fontWeight: 700, fontFamily: ff, color: T.text, outline: 'none' }} />
        </div>
        {/* List */}
        {fl.length === 0 ? <EmptyState emoji={'\u{1F464}'} title="No contacts found" desc={searchQ ? "Try a different search." : "Add contacts to send packages quickly."} /> :
          fl.map(function (c, i) {
            return (
              <div key={i} className="fu" style={{ borderRadius: 24, padding: 16, display: 'flex', alignItems: 'center', gap: 16, background: T.card, border: '1.5px solid ' + T.border, boxShadow: T.shadow, marginBottom: 12, animationDelay: (i * 0.04) + 's' }}>
                <div style={{ width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: T.fill, border: '1.5px solid ' + T.border }}>{c.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="truncate" style={{ fontWeight: 800, fontSize: 16, fontFamily: ff, color: T.text, letterSpacing: '-0.01em' }}>{c.name}</h3>
                  <p style={{ fontSize: 13, color: T.sec, fontFamily: mf, fontWeight: 600, marginTop: 2 }}>{c.phone}</p>
                </div>
                <button onClick={function () { if (props.onNav) props.onNav('send', { contact: c }); }} className="tap" style={{ width: 44, height: 44, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', background: T.accentBg, border: '1.5px solid ' + T.accent + '20' }}>
                  <ArrowRight style={{ width: 18, height: 18, color: T.accent, transform: 'rotate(-45deg)', strokeWidth: 3 }} />
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );
}
