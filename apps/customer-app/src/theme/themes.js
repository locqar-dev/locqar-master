import { useState, useEffect } from "react";

export var ff = "'Inter',system-ui,-apple-system,sans-serif";
export var hf = "'Inter',system-ui,-apple-system,sans-serif";
export var mf = "'JetBrains Mono','SF Mono','Fira Code',monospace";

export var TLight = {
  bg: '#FAFAFA', fill: '#F5F5F7', fill2: '#EBEBF0', border: '#E5E5EA', text: '#1C1C1E',
  sec: '#8E8E93', muted: '#AEAEB2', accent: '#FF2D55', accentBg: '#FFE5EC', accentLight: '#FF3B30',
  ok: '#34C759', okBg: '#E4F8EA', okDark: '#248A3D',
  warn: '#FF9500', warnBg: '#FFF4E5',
  blue: '#007AFF', blueBg: '#E5F1FF',
  purple: '#AF52DE', purpleBg: '#F7EBFC',
  card: '#FFFFFF',
  shadow: '0 8px 24px rgba(28, 28, 30, 0.04), 0 2px 8px rgba(28, 28, 30, 0.02)',
  shadowMd: '0 16px 40px rgba(28, 28, 30, 0.08), 0 4px 16px rgba(28, 28, 30, 0.04)',
  shadowLg: '0 32px 64px rgba(28, 28, 30, 0.14), 0 8px 24px rgba(28, 28, 30, 0.08)',
  accentDark: '#D00036',
  gradient: 'linear-gradient(135deg, #1C1C1E 0%, #3A3A3C 100%)',
  gradientAccent: 'linear-gradient(135deg, #FF2D55 0%, #FF3B30 100%)',
  gradientSuccess: 'linear-gradient(135deg, #34C759 0%, #30B551 100%)',
  gradientSubtle: 'linear-gradient(180deg, #FAFAFA 0%, #F5F5F7 100%)'
};

export var TDark = {
  bg: '#000000', fill: '#1C1C1E', fill2: '#2C2C2E', border: '#3A3A3C', text: '#F2F2F7',
  sec: '#8E8E93', muted: '#636366', accent: '#FF375F', accentBg: '#3E0A1B', accentLight: '#FF453A',
  ok: '#30D158', okBg: '#0A3618', okDark: '#32D74B',
  warn: '#FF9F0A', warnBg: '#3E2500',
  blue: '#0A84FF', blueBg: '#002E6B',
  purple: '#BF5AF2', purpleBg: '#3D1B54',
  card: '#1C1C1E',
  shadow: '0 8px 24px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
  shadowMd: '0 16px 40px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5)',
  shadowLg: '0 32px 64px rgba(0,0,0,0.8), 0 8px 24px rgba(0,0,0,0.6)',
  accentDark: '#FF2D55',
  gradient: 'linear-gradient(135deg, #2C2C2E 0%, #1C1C1E 100%)',
  gradientAccent: 'linear-gradient(135deg, #FF375F 0%, #D00036 100%)',
  gradientSuccess: 'linear-gradient(135deg, #30D158 0%, #248A3D 100%)',
  gradientSubtle: 'linear-gradient(180deg, #000000 0%, #1C1C1E 100%)'
};

var _darkMode = false;
var _darkListeners = [];

export function isDark() { return _darkMode; }

export function setDarkMode(v) {
  _darkMode = v;
  Object.assign(T, v ? TDark : TLight);
  _darkListeners.forEach(function (fn) { fn(v); });
}

export function useDarkMode() {
  var [dm, setDm] = useState(_darkMode);
  useEffect(function () {
    _darkListeners.push(setDm);
    return function () {
      _darkListeners = _darkListeners.filter(function (f) { return f !== setDm; });
    };
  }, []);
  return [dm, function (v) { setDarkMode(v); }];
}

export var T = Object.assign({}, TLight);
