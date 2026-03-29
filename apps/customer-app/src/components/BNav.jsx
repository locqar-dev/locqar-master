import React from "react";
import { T, ff } from "../theme/themes";
import { Package, Clock, User } from "./Icons";

export default function BNav(props) {
  var tabs = [{ id: 'home', icon: Package, l: 'Home' }, { id: 'activity', icon: Clock, l: 'Activities' }, { id: 'account', icon: User, l: 'Account' }];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass" style={{ borderTop: '1.5px solid ' + T.border }}>
      <div className="flex justify-around items-center max-w-lg mx-auto" style={{ paddingTop: 10, paddingBottom: 24 }}>
        {tabs.map(function (t) {
          var Icon = t.icon; var isActive = props.active === t.id;
          return (
            <button key={t.id} onClick={function () { props.onNav(t.id); }} className="tap relative" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 24px', borderRadius: 20, transition: 'all .4s cubic-bezier(0.32, 0.72, 0, 1)' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon style={{ width: 22, height: 22, color: isActive ? T.accent : T.sec, strokeWidth: isActive ? 3 : 2, transition: 'all .4s' }} />
                {isActive && <div className="fi pop" style={{ position: 'absolute', width: 44, height: 44, borderRadius: 16, background: T.accentBg, zIndex: -1, boxShadow: '0 4px 12px ' + T.accent + '20' }} />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 900, color: isActive ? T.accent : T.sec, fontFamily: ff, transition: 'all .4s', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.l}</span>
              {isActive && <div className="fi slide-in" style={{ position: 'absolute', bottom: -8, width: 4, height: 4, borderRadius: 2, background: T.accent }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
