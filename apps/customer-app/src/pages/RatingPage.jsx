import React, { useState } from "react";
import { T, ff, mf } from "../theme/themes";
import StatusBar from "../components/StatusBar";
import PageHeader from "../components/PageHeader";
import { Star, ChevronDown } from "../components/Icons";

export default function RatingPage(props) {
  var [stars, setStars] = useState(0);
  var [hoverStar, setHoverStar] = useState(0);
  var [tags, setTags] = useState([]);
  var [comment, setComment] = useState('');
  var [tip, setTip] = useState(null);
  var [customTip, setCustomTip] = useState('');
  var [showTip, setShowTip] = useState(false);
  var [submitted, setSubmitted] = useState(false);
  var [showThankYou, setShowThankYou] = useState(false);

  var pkg = props.pkg || { name: 'Package', location: 'LocQar Locker' };
  var starLabels = ['', 'Terrible', 'Poor', 'Okay', 'Great', 'Amazing!'];
  var starEmojis = ['', '\u{1F61E}', '\u{1F615}', '\u{1F610}', '\u{1F60A}', '\u{1F929}'];
  var activeStar = hoverStar || stars;

  var goodTags = [
    { e: '\u{26A1}', l: 'Fast delivery' }, { e: '\u{1F4E6}', l: 'Good packaging' },
    { e: '\u{1F5C4}\u{FE0F}', l: 'Clean locker' }, { e: '\u{1F4F1}', l: 'Easy pickup' },
    { e: '\u{1F512}', l: 'Secure' }, { e: '\u{1F4CD}', l: 'Convenient' }
  ];

  var badTags = [
    { e: '\u{1F40C}', l: 'Slow delivery' }, { e: '\u{1F4E6}', l: 'Damaged package' },
    { e: '\u{1F5C4}\u{FE0F}', l: 'Dirty locker' }, { e: '\u{1F624}', l: 'Hard to find' },
    { e: '\u{1F513}', l: 'Security concern' }, { e: '\u{1F4F5}', l: 'No notifications' }
  ];

  var activeTags = stars >= 4 ? goodTags : stars >= 1 ? badTags : [];

  var toggleTag = function (label) {
    setTags(function (prev) {
      if (prev.indexOf(label) >= 0) return prev.filter(function (t) { return t !== label; });
      if (prev.length >= 3) return prev;
      return prev.concat([label]);
    });
  };

  var tipAmts = [2, 5, 10];
  var finalTip = tip === 'custom' ? parseFloat(customTip) || 0 : (tip || 0);

  var handleSubmit = function () {
    setSubmitted(true);
    setShowThankYou(true);
    setTimeout(function () {
      if (props.onDone) props.onDone({ stars: stars, tags: tags, comment: comment, tip: finalTip });
    }, 2400);
  };

  if (showThankYou) {
    var msgs = [
      { min: 5, e: '\u{1F31F}', t: 'You\'re amazing!', d: 'Thanks for the 5-star rating. It means a lot to us!' },
      { min: 4, e: '\u{1F60A}', t: 'Thanks for the love!', d: 'We\'re glad you had a great experience today.' },
      { min: 3, e: '\u{1F44D}', t: 'Thanks for the feedback!', d: 'We\'ll work on making your next delivery even better.' },
      { min: 1, e: '\u{1F64F}', t: 'We hear you.', d: 'Sorry it wasn\'t perfect. Your feedback helps us improve.' }
    ];
    var msg = msgs.find(function (m) { return stars >= m.min; }) || msgs[3];

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10" style={{ background: T.bg }}>
        <StatusBar />
        <div className="fu text-center max-w-xs">
          <div className="pop" style={{ fontSize: 80, marginBottom: 24 }}>{msg.e}</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, fontFamily: ff, letterSpacing: '-0.04em', marginBottom: 12, color: T.text }}>{msg.t}</h1>
          <p style={{ fontSize: 14, color: T.sec, fontFamily: ff, lineHeight: '1.6', marginBottom: 32 }}>{msg.d}</p>

          {finalTip > 0 && (
            <div className="fi flex items-center gap-3 glass mx-auto mb-4" style={{ borderRadius: 20, padding: '12px 24px', background: T.okBg, border: '1.5px solid ' + T.ok + '30' }}>
              <span style={{ fontSize: 20 }}>{'\u{1F49A}'}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: T.okDark, fontFamily: ff }}>GH{'\u20B5'}{finalTip.toFixed(2)} tip sent!</span>
            </div>
          )}

          <div className="fi" style={{ borderRadius: 24, padding: '12px 24px', background: T.purpleBg, border: '1.5px solid ' + T.purple + '30', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 16 }}>{'\u{1F381}'}</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: T.purple, fontFamily: ff }}>+10 points earned</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen noscroll overflow-y-auto pb-40" style={{ background: T.bg }}><StatusBar />
      <PageHeader title="Rate Experience" onBack={props.onBack} subtitle={pkg.name} />

      <div style={{ padding: '0 20px' }}>
        {/* Package Card */}
        <div className="fu glass mb-6" style={{ borderRadius: 24, padding: 18, background: '#fff', border: '1.5px solid ' + T.border, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, background: T.fill }}>{'\u{1F4E6}'}</div>
          <div className="flex-1 min-w-0">
            <h3 className="truncate" style={{ fontWeight: 900, fontSize: 16, fontFamily: ff, letterSpacing: '-0.01em' }}>{pkg.name}</h3>
            <p style={{ fontSize: 13, color: T.sec, fontFamily: ff, fontWeight: 500 }}>{pkg.location}</p>
          </div>
          <div style={{ padding: '4px 10px', borderRadius: 8, background: T.okBg, color: T.okDark, fontSize: 10, fontWeight: 800, fontFamily: ff }}>COMPLETED</div>
        </div>

        {/* Star Rating */}
        <div className="fu d1 text-center mb-8">
          <p style={{ fontSize: 15, fontWeight: 700, color: T.sec, marginBottom: 20, fontFamily: ff }}>How would you rate the delivery?</p>
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2, 3, 4, 5].map(function (i) {
              var active = i <= activeStar;
              return (
                <button key={i} onClick={function () { setStars(i); setTags([]); }} onMouseEnter={function () { setHoverStar(i); }} onMouseLeave={function () { setHoverStar(0); }} className="tap" style={{ transition: 'transform .15s' }}>
                  <Star style={{
                    width: 44, height: 44,
                    color: active ? '#F59E0B' : T.border,
                    fill: active ? '#F59E0B' : 'none',
                    strokeWidth: active ? 0 : 1.5,
                    transition: 'all .25s cubic-bezier(.17,.67,.83,.67)',
                    filter: active ? 'drop-shadow(0 0 12px rgba(245,158,11,0.4))' : 'none',
                    transform: active ? 'scale(1.1)' : 'none'
                  }} />
                </button>
              );
            })}
          </div>
          {activeStar > 0 && (
            <div className="fi flex items-center justify-center gap-3">
              <span style={{ fontSize: 28 }}>{starEmojis[activeStar]}</span>
              <span style={{ fontSize: 18, fontWeight: 900, fontFamily: ff, color: activeStar >= 4 ? T.okDark : activeStar >= 3 ? T.warn : T.accent, letterSpacing: '-0.02em' }}>{starLabels[activeStar]}</span>
            </div>
          )}
        </div>

        {/* Feedback Tags */}
        {stars > 0 && (
          <div className="fu d2 mb-8">
            <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.1em', marginBottom: 12, fontFamily: ff }}>{stars >= 4 ? 'WHAT STOOD OUT?' : 'WHAT WENT WRONG?'}</p>
            <div className="flex flex-wrap gap-2">
              {activeTags.map(function (t, i) {
                var sel = tags.indexOf(t.l) >= 0;
                return (
                  <button key={i} onClick={function () { toggleTag(t.l); }} className="tap" style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '10px 16px', borderRadius: 24,
                    background: sel ? (stars >= 4 ? T.ok : T.accent) : T.card,
                    border: '1.5px solid ' + (sel ? 'transparent' : T.border),
                    transition: 'all .3s',
                    boxShadow: sel ? '0 8px 16px ' + (stars >= 4 ? T.ok : T.accent) + '33' : 'none'
                  }}>
                    <span style={{ fontSize: 14 }}>{t.e}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: ff, color: sel ? '#fff' : T.text }}>{t.l}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Comment Area */}
        {stars > 0 && (
          <div className="fu d3 mb-8">
            <p style={{ fontSize: 10, fontWeight: 900, color: T.sec, letterSpacing: '0.1em', marginBottom: 10, fontFamily: ff }}>TELL US MORE</p>
            <div style={{ borderRadius: 24, padding: '16px 20px', background: T.fill, border: '1.5px solid ' + (comment ? T.text : 'transparent'), transition: 'all .3s' }}>
              <textarea value={comment} onChange={function (e) { setComment(e.target.value); }} placeholder={stars >= 4 ? "Share your positive experience..." : "How can we do better next time?"} rows={3} style={{ width: '100%', background: 'transparent', fontSize: 14, fontWeight: 600, fontFamily: ff, resize: 'none', color: T.text, outline: 'none' }} />
            </div>
          </div>
        )}

        {/* Tipping */}
        {stars >= 4 && (
          <div className="fu d4 mb-8">
            <button onClick={function () { setShowTip(!showTip); }} className="tap flex items-center justify-between w-full glass shadow-lg" style={{ borderRadius: 24, padding: 18, background: T.okBg, border: '1.5px solid ' + T.ok + '20' }}>
              <div className="flex items-center gap-4">
                <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, background: '#fff' }}>{'\u{1F49A}'}</div>
                <div className="text-left">
                  <p style={{ fontWeight: 900, fontSize: 15, fontFamily: ff, color: T.text }}>Tip for the Agent?</p>
                  <p style={{ fontSize: 12, color: T.okDark, fontFamily: ff, fontWeight: 600 }}>100% of tips go to the delivery team</p>
                </div>
              </div>
              <ChevronDown style={{ width: 18, height: 18, color: T.ok, transform: showTip ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }} />
            </button>

            {showTip && (
              <div className="fi glass mt-3 p-5" style={{ borderRadius: 24, background: '#fff', border: '1.5px solid ' + T.border, boxShadow: T.shadowLg }}>
                <div className="flex gap-2 mb-4">
                  {tipAmts.map(function (a) {
                    var sel = tip === a;
                    return (
                      <button key={a} onClick={function () { setTip(sel ? null : a); setCustomTip(''); }} className="tap flex-1" style={{ padding: '14px 0', borderRadius: 16, fontWeight: 800, fontSize: 16, background: sel ? T.ok : T.fill, color: sel ? '#fff' : T.text, transition: 'all .25s', fontFamily: mf }}>GH{'\u20B5'}{a}</button>
                    );
                  })}
                  <button onClick={function () { setTip('custom'); }} className="tap flex-1" style={{ padding: '14px 0', borderRadius: 16, fontWeight: 800, fontSize: 14, background: tip === 'custom' ? T.ok : T.fill, color: tip === 'custom' ? '#fff' : T.text, transition: 'all .25s', fontFamily: ff }}>Other</button>
                </div>
                {tip === 'custom' && (
                  <div className="fi flex items-center gap-3" style={{ borderRadius: 16, padding: '16px 20px', background: T.fill, border: '1.5px solid ' + T.ok }}>
                    <span style={{ fontSize: 16, fontWeight: 900, color: T.okDark }}>GH{'\u20B5'}</span>
                    <input type="number" value={customTip} onChange={function (e) { setCustomTip(e.target.value); }} placeholder="0.00" className="flex-1" style={{ background: 'transparent', fontWeight: 900, fontSize: 20, fontFamily: mf, color: T.text, outline: 'none' }} autoFocus />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Submit Button */}
      {stars > 0 && (
        <div className="glass fixed bottom-0 left-0 right-0 z-50 p-6" style={{ borderTop: '1.5px solid ' + T.border }}>
          <button onClick={handleSubmit} className="tap" style={{ width: '100%', padding: '18px 0', borderRadius: 20, fontWeight: 900, fontSize: 16, color: '#fff', background: stars >= 4 ? T.ok : T.text, fontFamily: ff, boxShadow: '0 12px 24px ' + (stars >= 4 ? T.ok + '44' : 'rgba(0,0,0,0.2)'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Submit Rating {starEmojis[stars]}
          </button>
          <p style={{ textAlign: 'center', fontSize: 11, color: T.muted, marginTop: 12, fontFamily: ff, fontWeight: 700 }}>EARN +10 POINTS FOR RATING</p>
        </div>
      )}
    </div>
  );
}
