import { T } from "../theme/themes";

export var contacts = [
  { name: 'Ama Mensah', phone: '+233 24 555 1234', emoji: '\u{1F469}\u{1F3FE}', recent: true },
  { name: 'Kofi Boateng', phone: '+233 20 888 5678', emoji: '\u{1F468}\u{1F3FE}', recent: true },
  { name: 'Abena Owusu', phone: '+233 55 222 9012', emoji: '\u{1F469}\u{1F3FE}\u{200D}\u{1F4BC}', recent: true },
  { name: 'Yaw Darko', phone: '+233 27 333 4567', emoji: '\u{1F468}\u{1F3FE}\u{200D}\u{1F527}', recent: false },
  { name: 'Efua Adjei', phone: '+233 50 111 8901', emoji: '\u{1F469}\u{1F3FE}\u{200D}\u{1F393}', recent: false }
];

export var initLockers = [
  { id: 1, name: 'Osu Mall', addr: 'Oxford Street, Osu', lat: 5.556, lng: -0.182, avail: 12, total: 24, type: 'mall', hours: '6am-10pm', rating: 4.8, emoji: '\u{1F3EC}', dist: '1.2' },
  { id: 2, name: 'Accra Mall', addr: 'Tetteh Quarshie', lat: 5.635, lng: -0.155, avail: 18, total: 36, type: 'mall', hours: '7am-9pm', rating: 4.9, emoji: '\u{1F3EC}', dist: '3.5' },
  { id: 3, name: 'Shell Airport', addr: 'Airport Residential', lat: 5.605, lng: -0.172, avail: 3, total: 8, type: 'gas', hours: '24/7', rating: 4.5, emoji: '\u{26FD}', dist: '2.8' },
  { id: 4, name: 'Junction Mall', addr: 'Nungua Barrier', lat: 5.598, lng: -0.135, avail: 22, total: 30, type: 'mall', hours: '8am-9pm', rating: 4.7, emoji: '\u{1F3EC}', dist: '4.1' },
  { id: 5, name: 'Circle Hub', addr: 'Kwame Nkrumah Circle', lat: 5.570, lng: -0.220, avail: 14, total: 20, type: 'hub', hours: '5am-11pm', rating: 4.4, emoji: '\u{1F4E6}', dist: '2.1' },
  { id: 6, name: 'West Hills Mall', addr: 'Weija, Kasoa Rd', lat: 5.568, lng: -0.310, avail: 25, total: 40, type: 'mall', hours: '8am-9pm', rating: 4.8, emoji: '\u{1F3EC}', dist: '8.2' }
];

export var avSt = function (a, t) {
  var r = a / t;
  if (r === 0) return { bg: T.accentBg, c: T.accent, l: 'Full' };
  if (r < 0.25) return { bg: T.warnBg, c: T.warn, l: 'Low' };
  return { bg: T.okBg, c: T.ok, l: 'Open' };
};
