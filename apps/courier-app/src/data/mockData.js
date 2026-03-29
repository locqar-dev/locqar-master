export const driver = {
  name: 'Kwame Asante', id: 'DRV-4821', avatar: '\u{1F468}\u{1F3FE}\u200D\u2708\uFE0F',
  rating: 4.92, deliveries: 1847, onTime: 98.2,
  todayEarn: 127.5, weekEarn: 892, monthEarn: 3460,
  joined: 'Mar 2023', vehicle: 'Toyota Hiace', plate: 'GR 4821-24',
};

export const lockersData = [
  { id: 'LOC-001', name: 'Accra Mall', addr: 'Tetteh Quarshie, Accra', dist: '2.3 km', eta: '8 min', avail: { S: 8, M: 5, L: 3, XL: 2 }, bat: 98, lat: 5.6220, lng: -0.1735, distKm: 2.3, hours: '6AM\u201310PM', status: 'online' },
  { id: 'LOC-002', name: 'Achimota Mall', addr: 'Mile 7, Achimota', dist: '6.1 km', eta: '18 min', avail: { S: 12, M: 8, L: 4, XL: 1 }, bat: 87, lat: 5.6150, lng: -0.2280, distKm: 6.1, hours: '7AM\u20139PM', status: 'online' },
  { id: 'LOC-003', name: 'West Hills Mall', addr: 'Weija Junction, Accra', dist: '14.2 km', eta: '35 min', avail: { S: 6, M: 4, L: 2, XL: 3 }, bat: 72, lat: 5.5770, lng: -0.3030, distKm: 14.2, hours: '8AM\u20138PM', status: 'online' },
];

export const availableBlocks = [
  { id: 'BLK-001', time: '6:00 AM \u2013 10:00 AM', type: '4 hr', area: 'Accra Central', pay: 'GH\u20B5 85', stops: 8, dist: '22 km', surge: false },
  { id: 'BLK-002', time: '10:30 AM \u2013 2:30 PM', type: '4 hr', area: 'Achimota / Legon', pay: 'GH\u20B5 92', stops: 10, dist: '28 km', surge: false },
  { id: 'BLK-003', time: '11:00 AM \u2013 3:00 PM', type: '4 hr', area: 'East Legon / Airport', pay: 'GH\u20B5 105', stops: 12, dist: '35 km', surge: true },
  { id: 'BLK-004', time: '3:00 PM \u2013 7:00 PM', type: '4 hr', area: 'Tema / Spintex', pay: 'GH\u20B5 78', stops: 7, dist: '19 km', surge: false },
  { id: 'BLK-005', time: '5:00 PM \u2013 9:00 PM', type: '4 hr', area: 'Accra Mall Area', pay: 'GH\u20B5 110', stops: 14, dist: '18 km', surge: true },
];

export const notifsData = [
  { id: 1, type: 'urgent', title: 'Urgent Package', body: 'LQ-8847292 requires priority delivery.', time: '2m ago', read: false },
  { id: 2, type: 'info', title: 'Route Optimized', body: 'Saved 12 minutes on your route.', time: '15m ago', read: false },
  { id: 3, type: 'success', title: 'Weekly Bonus!', body: 'GH\u20B5 25 bonus for 50+ deliveries.', time: '1h ago', read: true },
];


export const tasksData = [
  { id: 'TSK-001', trk: 'LQ-8847301', sz: 'M', tab: 'assigned', locker: 'Accra Mall', addr: 'Tetteh Quarshie, Accra', eta: '10:30 AM', sender: 'Kofi Mensah', receiver: 'Ama Serwaa', phone: '+233 24 111 2222' },
  { id: 'TSK-002', trk: 'LQ-8847302', sz: 'S', tab: 'assigned', locker: 'Accra Mall', addr: 'Tetteh Quarshie, Accra', eta: '10:30 AM', sender: 'Yaw Boateng', receiver: 'Efua Adjei', phone: '+233 20 333 4444' },
  { id: 'TSK-003', trk: 'LQ-8847303', sz: 'L', tab: 'assigned', locker: 'Accra Mall', addr: 'Tetteh Quarshie, Accra', eta: '10:30 AM', sender: 'Kwesi Appiah', receiver: 'Akua Donkor', phone: '+233 55 666 7777', ageRestricted: true },
  { id: 'TSK-004', trk: 'LQ-8847304', sz: 'M', tab: 'assigned', locker: 'Achimota Mall', addr: 'Mile 7, Achimota', eta: '11:15 AM', sender: 'Nana Osei', receiver: 'Abena Pokua', phone: '+233 24 555 8888', highValue: true },
  { id: 'TSK-005', trk: 'LQ-8847305', sz: 'S', tab: 'assigned', locker: 'Achimota Mall', addr: 'Mile 7, Achimota', eta: '11:15 AM', sender: 'Joe Addo', receiver: 'Sika Mensah', phone: '+233 20 999 0000' },
  { id: 'TSK-006', trk: 'LQ-8847306', sz: 'XL', tab: 'assigned', locker: 'West Hills Mall', addr: 'Weija Junction, Accra', eta: '12:00 PM', sender: 'Kwame Nkrumah', receiver: 'Esi Asante', phone: '+233 50 111 3333' },
  { id: 'TSK-007', trk: 'LQ-8847307', sz: 'M', tab: 'accepted', locker: 'Accra Mall', addr: 'Tetteh Quarshie, Accra', eta: '10:30 AM', sender: 'Fiifi Coleman', receiver: 'Adjoa Baah', phone: '+233 24 222 5555', acceptedAt: '10:12 AM' },
  { id: 'TSK-008', trk: 'LQ-8847308', sz: 'S', tab: 'in_transit_to_locker', locker: 'West Hills Mall', addr: 'Weija Junction, Accra', eta: '12:00 PM', sender: 'Prince Tagoe', receiver: 'Dede Ayew', phone: '+233 55 444 6666', acceptedAt: '10:05 AM', inTransitAt: '10:20 AM' },
  { id: 'TSK-009', trk: 'LQ-8847309', sz: 'L', tab: 'delivered_to_locker', locker: 'Accra Mall', addr: 'Tetteh Quarshie, Accra', eta: '9:00 AM', sender: 'Obed Asamoah', receiver: 'Mansa Keita', phone: '+233 20 777 8888', acceptedAt: '9:15 AM', inTransitAt: '9:25 AM', depositedAt: '9:42 AM' },
  { id: 'TSK-010', trk: 'LQ-8847310', sz: 'S', tab: 'delivered_to_locker', locker: 'Achimota Mall', addr: 'Mile 7, Achimota', eta: '9:30 AM', sender: 'Gifty Lamptey', receiver: 'Kofi Annan', phone: '+233 24 000 1111', acceptedAt: '9:35 AM', inTransitAt: '9:45 AM', depositedAt: '10:05 AM' },
  { id: 'TSK-011', trk: 'LQ-8847311', sz: 'M', tab: 'recalled', locker: 'Accra Mall', addr: 'Tetteh Quarshie, Accra', eta: '10:30 AM', sender: 'Ama Mensah', receiver: 'Yaw Asante', phone: '+233 24 333 5555', recallType: 'customerCancel', recallStatus: 'pendingPickup', returnDest: 'Warehouse' },
  { id: 'TSK-012', trk: 'LQ-8847312', sz: 'S', tab: 'recalled', locker: 'West Hills Mall', addr: 'Weija Junction, Accra', eta: '12:00 PM', sender: 'Kweku Baah', receiver: 'Efua Nyarko', phone: '+233 55 888 9999', recallType: 'wrongAddress', recallStatus: 'pendingPickup', returnDest: 'Achimota Mall' },
  // Home delivery tasks (locker_to_home method)
  { id: 'HMD-001', trk: 'LQ-8847401', sz: 'M', tab: 'assigned', deliveryType: 'home', pickupLocker: 'Accra Mall', homeAddr: '15 Cantonments Road, Accra', homeNote: 'Gate code: 1234', eta: '1:00 PM', sender: 'LocQar Locker', receiver: 'Kwabena Frimpong', phone: '+233 24 900 1111' },
  { id: 'HMD-002', trk: 'LQ-8847402', sz: 'S', tab: 'assigned', deliveryType: 'home', pickupLocker: 'Accra Mall', homeAddr: '7 Airport Residential, Accra', homeNote: 'Call on arrival', eta: '1:30 PM', sender: 'LocQar Locker', receiver: 'Maame Sarpong', phone: '+233 55 200 3333' },
  { id: 'HMD-003', trk: 'LQ-8847403', sz: 'L', tab: 'in_transit_to_home', deliveryType: 'home', pickupLocker: 'West Hills Mall', homeAddr: '3 Weija Road, Weija', homeNote: '', eta: '11:45 AM', sender: 'LocQar Locker', receiver: 'Kwesi Danso', phone: '+233 20 500 7777', acceptedAt: '10:50 AM', transitHomeAt: '11:10 AM' },
  { id: 'HMD-004', trk: 'LQ-8847404', sz: 'S', tab: 'delivered_to_home', deliveryType: 'home', pickupLocker: 'Achimota Mall', homeAddr: '22 Mile 7, Achimota', homeNote: '', eta: '9:30 AM', sender: 'LocQar Locker', receiver: 'Adjoa Nyarko', phone: '+233 24 800 5555', acceptedAt: '9:00 AM', transitHomeAt: '9:15 AM', deliveredHomeAt: '9:28 AM' },
];
