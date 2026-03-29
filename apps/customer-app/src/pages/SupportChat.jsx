import React, { useState, useEffect, useRef } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import { Zap } from "../components/Icons";

export default function SupportChat(props) {
  var [msgs, setMsgs] = useState([
    { id: 1, text: "Hi there! I'm LocQar Assistant. How can I help you today?", sender: 'bot', time: '10:00 AM' }
  ]);
  var [input, setInput] = useState('');
  var [typing, setTyping] = useState(false);
  var chatEndRef = useRef(null);

  var quickActions = [
    { e: '\u{1F4E6}', l: 'Track package', reply: "I'd be happy to help track your package! Please share your tracking code or phone number." },
    { e: '\u{1F511}', l: 'Lost code', reply: "No worries! I can resend your pickup code via SMS. Please confirm your phone number." },
    { e: '\u{1F5C4}\u{FE0F}', l: 'Locker issue', reply: "Sorry to hear about the locker issue. Which location are you at?" },
    { e: '\u{1F4B0}', l: 'Billing', reply: "I can help with billing! You can view transactions in Account \u2192 Wallet." }
  ];

  var handleSend = function (text) {
    var val = text || input;
    if (!val.trim()) return;
    var newMsg = { id: Date.now(), text: val, sender: 'user', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMsgs(function (prev) { return prev.concat([newMsg]); });
    setInput('');
    setTyping(true);
    setTimeout(function () {
      setTyping(false);
      var reply = { id: Date.now() + 1, text: "I've received your message. A human agent will be with you shortly if I can't resolve this!", sender: 'bot', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMsgs(function (prev) { return prev.concat([reply]); });
    }, 1500);
  };

  useEffect(function () {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  return (
    <div className="min-h-screen flex flex-col items-stretch" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="Support" onBack={props.onBack} subtitle="Live Chat" />

      <div className="flex-1 noscroll overflow-y-auto p-5 space-y-4">
        <div className="text-center mb-6">
          <span style={{ fontSize: 11, fontWeight: 800, color: T.muted, background: T.fill, padding: '4px 12px', borderRadius: 10, fontFamily: ff }}>TODAY</span>
        </div>

        {msgs.map(function (m) {
          var isBot = m.sender === 'bot';
          return (
            <div key={m.id} className={"flex " + (isBot ? 'justify-start' : 'justify-end')}>
              <div className="max-w-[85%] flex flex-col" style={{ alignItems: isBot ? 'flex-start' : 'flex-end' }}>
                <div className="glass" style={{
                  padding: '12px 16px', borderRadius: 22,
                  borderBottomLeftRadius: isBot ? 4 : 22, borderBottomRightRadius: isBot ? 22 : 4,
                  background: isBot ? '#fff' : T.text,
                  color: isBot ? T.text : '#fff',
                  border: '1.5px solid ' + (isBot ? T.border : 'transparent'),
                  boxShadow: isBot ? T.shadow : '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ fontSize: 14, fontWeight: 500, fontFamily: ff, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{m.text}</p>
                </div>
                <span style={{ fontSize: 10, color: T.muted, marginTop: 4, fontFamily: mf, fontWeight: 600 }}>{m.time}</span>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="flex justify-start">
            <div className="glass" style={{ padding: '12px 18px', borderRadius: 20, borderBottomLeftRadius: 4, background: '#fff', border: '1.5px solid ' + T.border }}>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(function (i) {
                  return <div key={i} className="bounce" style={{ width: 6, height: 6, borderRadius: 3, background: T.muted, animationDelay: (i * 0.15) + 's' }} />;
                })}
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="glass p-5 pb-8" style={{ borderTop: '1.5px solid ' + T.border }}>
        {msgs.length < 3 && (
          <div className="flex gap-2 overflow-x-auto noscroll mb-4 pb-2">
            {quickActions.map(function (q, i) {
              return (
                <button key={i} onClick={function () { handleSend(q.l); }} className="tap flex items-center gap-2 whitespace-nowrap" style={{ padding: '10px 16px', borderRadius: 16, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadow }}>
                  <span style={{ fontSize: 14 }}>{q.e}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: ff, color: T.text }}>{q.l}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 glass" style={{ padding: '12px 18px', borderRadius: 24, background: T.fill, border: '1.5px solid ' + (input ? T.text : 'transparent'), transition: 'all .3s' }}>
            <input value={input} onChange={function (e) { setInput(e.target.value); }} onKeyDown={function (e) { if (e.key === 'Enter') handleSend(); }} placeholder="Type a message..." style={{ flex: 1, background: 'transparent', fontSize: 14, fontWeight: 600, fontFamily: ff, outline: 'none', color: T.text }} />
          </div>
          <button onClick={function () { handleSend(); }} className="tap" style={{ width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: input ? T.text : T.fill, color: input ? '#fff' : T.muted, transition: 'all .3s' }}>
            <Zap style={{ width: 20, height: 20, fill: input ? '#fff' : 'none' }} />
          </button>
        </div>
      </div>
    </div>
  );
}
