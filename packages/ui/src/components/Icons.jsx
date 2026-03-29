import React from 'react';

const svgBase = { xmlns: "http://www.w3.org/2000/svg", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

// Helper: create an SVG icon from one or more path `d` strings
const I = (s, p) => React.createElement("svg", { ...svgBase, width: p?.size || 24, height: p?.size || 24, viewBox: "0 0 24 24", style: p?.style, className: p?.className }, ...(Array.isArray(s) ? s : [s]).map((d, i) => React.createElement("path", { key: i, d })));

// ── Arrows & Chevrons ──
export const ChevronRight = p => I("M9 18l6-6-6-6", p);
export const ChevronDown = p => I("M6 9l6 6 6-6", p);
export const ChevronUp = p => I("M18 15l-6-6-6 6", p);
export const ArrowLeft = p => I(["M19 12H5", "M12 19l-7-7 7-7"], p);
export const ArrowRight = p => I(["M5 12h14", "M12 5l7 7-7 7"], p);
export const ArrowUpRight = p => I(["M7 17L17 7", "M7 7h10v10"], p);
export const ArrowDownLeft = p => I(["M17 7L7 17", "M17 17H7V7"], p);

// ── Actions ──
export const X = p => I(["M18 6L6 18", "M6 6l12 12"], p);
export const Check = p => I("M20 6L9 17l-5-5", p);
export const Plus = p => I(["M12 5v14", "M5 12h14"], p);
export const Search = p => I(["M11 3a8 8 0 100 16 8 8 0 000-16z", "M21 21l-4.35-4.35"], p);
export const Filter = p => I("M22 3H2l8 9.46V19l4 2v-8.54L22 3z", p);
export const Copy = p => I(["M20 9h-9a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-9a2 2 0 00-2-2z", "M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"], p);
export const RefreshCw = p => I(["M23 4v6h-6", "M1 20v-6h6", "M3.51 9a9 9 0 0114.85-3.36L23 10", "M1 14l4.64 4.36A9 9 0 0020.49 15"], p);
export const RotateCcw = p => I(["M1 4v6h6", "M3.51 15a9 9 0 102.13-9.36L1 10"], p);
export const ExternalLink = p => I(["M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6", "M15 3h6v6", "M10 14L21 3"], p);
export const LogOut = p => I(["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4", "M16 17l5-5-5-5", "M21 12H9"], p);

// ── Objects ──
export const Package = p => I(["M16.5 9.4l-9-5.19", "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z", "M3.27 6.96L12 12.01l8.73-5.05", "M12 22.08V12"], p);
export const Box = p => I(["M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z", "M3.27 6.96L12 12.01l8.73-5.05", "M12 22.08V12"], p);
export const Truck = p => I(["M1 3h15v13H1z", "M16 8h4l3 3v5h-7V8z", "M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z", "M18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"], p);
export const Clipboard = p => I(["M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2", "M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z"], p);
export const Gift = p => I(["M20 12v10H4V12", "M2 7h20v5H2z", "M12 22V7", "M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z", "M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"], p);
export const CreditCard = p => I(["M2 5h20a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V7a2 2 0 012-2z", "M2 10h20"], p);

// ── People ──
export const User = p => I(["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 3a4 4 0 100 8 4 4 0 000-8z"], p);
export const Users = p => I(["M9 7a4 4 0 100-8 4 4 0 000 8z", "M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2", "M16 3.13a4 4 0 010 7.74", "M21 21v-2a4 4 0 00-3-3.85"], p);

// ── Communication ──
export const Bell = p => I(["M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 01-3.46 0"], p);
export const Phone = p => I("M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z", p);

// ── Location & Navigation ──
export const MapPin = p => I(["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z", "M12 10a1 1 0 100-2 1 1 0 000 2z"], p);
export const Navigation = p => I("M3 11l19-9-9 19-2-8-8-2z", p);
export const Globe = p => I(["M12 2a10 10 0 100 20 10 10 0 000-20z", "M2 12h20", "M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"], p);
export const Home = p => I(["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"], p);

// ── Time & Calendar ──
export const Clock = p => I(["M12 2a10 10 0 100 20 10 10 0 000-20z", "M12 6v6l4 2"], p);
export const Calendar = p => I(["M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z", "M16 2v4", "M8 2v4", "M3 10h18"], p);

// ── Status & Info ──
export const CheckCircle = p => I(["M22 11.08V12a10 10 0 11-5.93-9.14", "M22 4L12 14.01l-3-3"], p);
export const AlertTriangle = p => I(["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z", "M12 9v4", "M12 17h.01"], p);
export const Info = p => I(["M12 2a10 10 0 100 20 10 10 0 000-20z", "M12 16v-4", "M12 8h.01"], p);
export const HelpCircle = p => I(["M12 2a10 10 0 100 20 10 10 0 000-20z", "M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3", "M12 17h.01"], p);
export const Shield = p => I("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", p);
export const Lock = p => I(["M3 11h18a2 2 0 012 2v7a2 2 0 01-2 2H3a2 2 0 01-2-2v-7a2 2 0 012-2z", "M7 11V7a5 5 0 0110 0v4"], p);

// ── Media & Display ──
export const Camera = p => I(["M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z", "M12 13a4 4 0 100-8 4 4 0 000 8z"], p);
export const Eye = p => I(["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z", "M12 9a3 3 0 100 6 3 3 0 000-6z"], p);
export const EyeOff = p => I(["M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94", "M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19", "M1 1l22 22"], p);

// ── Data & Finance ──
export const Star = p => React.createElement("svg", { ...svgBase, width: p?.size || 24, height: p?.size || 24, viewBox: "0 0 24 24", fill: p?.fill || "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", style: p?.style, className: p?.className }, React.createElement("polygon", { points: "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" }));
export const TrendingUp = p => I(["M23 6l-9.5 9.5-5-5L1 18"], p);
export const DollarSign = p => I(["M12 1v22", "M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"], p);
export const Wallet = p => I(["M2 5h20a2 2 0 012 2v10a2 2 0 01-2 2H2a2 2 0 01-2-2V7a2 2 0 012-2z", "M2 9h20"], p);

// ── Settings & System ──
export const Settings = p => I(["M12 15a3 3 0 100-6 3 3 0 000 6z", "M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"], p);
export const Battery = p => I(["M17 6H3a2 2 0 00-2 2v8a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2z", "M23 13v-2"], p);
export const Wifi = p => I(["M5 12.55a11 11 0 0114.08 0", "M1.42 9a16 16 0 0121.16 0", "M8.53 16.11a6 6 0 016.95 0", "M12 20h.01"], p);
export const Zap = p => I("M13 2L3 14h9l-1 8 10-12h-9l1-8z", p);
export const Fingerprint = p => I(["M2 12C2 6.5 6.5 2 12 2a10 10 0 018 4", "M5 19.5C5.5 18 6 15 6 12c0-3.3 2.7-6 6-6s6 2.7 6 6", "M12 12v4", "M8 12a4 4 0 018 0", "M17 20.5a10 10 0 01-5 1.5c-5.5 0-10-4.5-10-10"], p);

// ── Courier-specific nav icons ──
export const NavIcons = {
  home: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
  tasks: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></svg>,
  schedule: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  earnings: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>,
  profile: (active) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
};
