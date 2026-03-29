import React, { useState, useEffect, useRef, useCallback } from 'react';
import { lightTheme, darkTheme } from './theme/themes';
import { tasksData, lockersData, notifsData } from './data/mockData';
import { NavIcons, Wifi, CheckCircle, Shield, Check } from './components/Icons';
import SwipeConfirm from './components/SwipeConfirm';
import PWAInstallPrompt from './components/PWAInstallPrompt';

/* Screens */
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import OtpScreen from './screens/OtpScreen';
import ScheduleScreen from './screens/ScheduleScreen';
import HomeScreen from './screens/HomeScreen';
import ItineraryScreen from './screens/ItineraryScreen';
import StopScreen from './screens/StopScreen';
import BatchDepositScreen from './screens/BatchDepositScreen';
import TasksScreen from './screens/TasksScreen';
import NotifsScreen from './screens/NotifsScreen';
import EarningsScreen from './screens/EarningsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProfileInfoScreen from './screens/ProfileInfoScreen';
import ProfileSafetyScreen from './screens/ProfileSafetyScreen';
import ProfileSettingsScreen from './screens/ProfileSettingsScreen';
import ProfileHelpScreen from './screens/ProfileHelpScreen';
import LockerDirectoryScreen from './screens/LockerDirectoryScreen';
import DeliveryHistoryScreen from './screens/DeliveryHistoryScreen';
import ExceptionReportScreen from './screens/ExceptionReportScreen';
import VehicleSettingsScreen from './screens/VehicleSettingsScreen';

/* New Feature Screens */
import NotificationsScreen from './screens/NotificationsScreen';
import AnalyticsScreen from './screens/AnalyticsScreen';
import SettingsScreen from './screens/SettingsScreen';
import RouteMapScreen from './screens/RouteMapScreen';
import ProofOfDeliveryScreen from './screens/ProofOfDeliveryScreen';
import HomeDeliveryScreen from './screens/HomeDeliveryScreen';

/* localStorage helpers — import from shared when available */
/* import { loadState, saveState } from '@locqar/shared/utils'; */
const loadState = (key, def) => { try { const v = localStorage.getItem('locqar_' + key); return v ? JSON.parse(v) : def } catch (e) { return def } };
const saveState = (key, val) => { try { localStorage.setItem('locqar_' + key, JSON.stringify(val)) } catch (e) { } };

/* ---- OFFLINE BANNER ---- */
const OfflineBanner = ({ T }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setIsOnline(true); const off = () => setIsOnline(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) };
  }, []);
  if (isOnline) return null;
  return <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200, background: T.amber, padding: '8px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
    <Wifi size={14} style={{ color: '#fff' }} />
    <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>You're offline. Actions will sync when reconnected.</span>
  </div>;
};

/* ---- ID VERIFICATION MODAL ---- */
const VerificationModal = ({ task, onVerified, onClose, T }) => {
  const [step, setStep] = useState('info');
  return <div style={{ position: 'fixed', inset: 0, zIndex: 110, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }} />
    <div className="su" onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: 448, background: T.bg, borderRadius: '24px 24px 0 0', padding: '24px 24px 32px', boxShadow: T.shadowLg }}>
      <div style={{ width: 40, height: 4, borderRadius: 2, background: T.fill2, margin: '0 auto 16px' }} />
      {step === 'info' && <>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: T.redBg, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={28} style={{ color: T.red }} /></div>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>ID Verification Required</h3>
          <p style={{ fontSize: 14, color: T.sec, margin: 0 }}>{task.ageRestricted ? 'Age-restricted package \u2014 verify recipient ID' : 'High-value package \u2014 verify recipient identity'}</p>
        </div>
        <div style={{ borderRadius: 12, padding: 14, background: T.fill, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>Package: {task.trk}</p>
          <p style={{ fontSize: 12, color: T.sec, margin: 0 }}>Recipient: {task.receiver}</p>
        </div>
        <div style={{ borderRadius: 12, padding: 14, background: T.amberBg, marginBottom: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: T.amber, margin: '0 0 6px' }}>Verification Steps</p>
          <div style={{ fontSize: 12, color: T.text, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Request valid photo ID from recipient', 'Verify name matches package details', 'Check ID expiration date', task.ageRestricted ? 'Confirm recipient is 18+' : 'Confirm identity match'].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}><div style={{ width: 16, height: 16, borderRadius: 8, background: T.amber, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div><span>{s}</span></div>
            ))}
          </div>
        </div>
        <button onClick={() => setStep('verify')} className="press" style={{ width: '100%', height: 52, borderRadius: 14, border: 'none', fontWeight: 700, fontSize: 16, background: T.red, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}>
          <Shield size={20} />Proceed to Verify
        </button>
        <button onClick={onClose} className="tap" style={{ width: '100%', height: 44, borderRadius: 12, border: `1.5px solid ${T.border}`, background: T.bg, fontWeight: 600, fontSize: 14, color: T.sec }}>Cancel</button>
      </>}
      {step === 'verify' && <>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>Confirm Verification</h3>
          <p style={{ fontSize: 14, color: T.sec, margin: 0 }}>Swipe to confirm ID has been verified</p>
        </div>
        <SwipeConfirm label="Swipe to Verify ID" color={T.green} onConfirm={() => { onVerified(); onClose() }} T={T} />
        <button onClick={() => setStep('info')} className="tap" style={{ width: '100%', height: 40, borderRadius: 10, border: 'none', background: 'transparent', fontWeight: 600, fontSize: 14, color: T.sec, marginTop: 10 }}>Back</button>
      </>}
    </div>
  </div>;
};

/* ---- NAV ---- */
const Nav = ({ active, onNav, T }) => (
  <div
    style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: T.card,
      borderTop: `1px solid ${T.border}`,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      boxShadow: '0 -8px 24px rgba(0,0,0,.08)',
      backdropFilter: 'blur(12px)',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        maxWidth: 448,
        margin: '0 auto',
        padding: '8px 0 12px',
      }}
    >
      {[
        { id: 'home', l: 'Home' },
        { id: 'tasks', l: 'Tasks' },
        { id: 'schedule', l: 'Blocks' },
        { id: 'earnings', l: 'Earn' },
        { id: 'profile', l: 'Profile' },
      ].map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onNav(t.id)}
            className="tap"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '8px 16px',
              border: 'none',
              background: isActive ? T.accentBg : 'transparent',
              borderRadius: isActive ? 14 : 12,
              position: 'relative',
              color: isActive ? T.accent : T.muted,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
            }}
          >
            {isActive && (
              <div
                style={{
                  position: 'absolute',
                  top: -8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 3,
                  borderRadius: 2,
                  background: T.accent,
                  animation: 'navPillSlide 0.25s ease both',
                }}
              />
            )}
            <span
              style={{
                transition: 'all 0.2s ease',
                transform: isActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
                lineHeight: 1,
              }}
            >
              {NavIcons[t.id]?.(isActive)}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: isActive ? 700 : 500,
                letterSpacing: isActive ? '0.02em' : 0,
                transition: 'all 0.2s ease',
                color: 'inherit',
              }}
            >
              {t.l}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

/* ---- APP ---- */
function LocQarDriverApp() {
  /* Migrate old tab names for existing users */
  const migrateTasks = (ts) => ts.map(t => {
    if (t.tab === 'pending') return { ...t, tab: 'accepted', acceptedAt: t.acceptedAt || 'Migrated' };
    if (t.tab === 'completed') return { ...t, tab: 'delivered_to_locker', depositedAt: t.completedAt || t.depositedAt || 'Migrated' };
    return t;
  });

  const [scr, setScr] = useState('splash');
  const [prevScr, setPrevScr] = useState(null);
  const [tasks, setTasks] = useState(() => migrateTasks(loadState('tasks', tasksData)));
  const [curLock, setCurLock] = useState(null);
  const [curStop, setCurStop] = useState(null);
  const [activeBlock, setActiveBlock] = useState(() => loadState('activeBlock', null));
  const [darkMode, setDarkMode] = useState(() => loadState('darkMode', false));
  const T = darkMode ? darkTheme : lightTheme;
  const [loginPhone, setLoginPhone] = useState('');
  const [notifs, setNotifs] = useState(notifsData);
  const [undoToast, setUndoToast] = useState(null);
  const [shiftState, setShiftState] = useState(() => loadState('shift', null));
  const [vehicleConfig, setVehicleConfig] = useState(() => loadState('vehicle', { type: 'Van', maxCapacity: 30, maxWeight: 150 }));
  const [exceptionTask, setExceptionTask] = useState(null);
  const [verifyTask, setVerifyTask] = useState(null);
  const [selectedTaskForPOD, setSelectedTaskForPOD] = useState(null);
  const undoTimer = useRef(null);
  const hist = useRef([]);

  /* Derive deliveries from unified tasks -- deposited = 'delivered', others = 'pending' */
  const dels = tasks.filter(t => t.tab !== 'recalled').map(t => ({ ...t, status: t.tab === 'delivered_to_locker' ? 'delivered' : 'pending' }));
  const notifCount = notifs.filter(n => !n.read).length;

  /* Adjust locker compartment availability based on deposited packages */
  const adjLockers = lockersData.map(l => {
    const deposited = tasks.filter(t => t.locker === l.name && t.tab === 'delivered_to_locker');
    const used = {}; deposited.forEach(t => { used[t.sz] = (used[t.sz] || 0) + 1 });
    return { ...l, avail: { ...l.avail, ...Object.fromEntries(Object.entries(l.avail).map(([k, v]) => [k, Math.max(0, v - (used[k] || 0))])) } };
  });

  /* Persist state changes */
  useEffect(() => saveState('tasks', tasks), [tasks]);
  useEffect(() => saveState('activeBlock', activeBlock), [activeBlock]);
  useEffect(() => saveState('darkMode', darkMode), [darkMode]);
  useEffect(() => { document.body.style.background = T.bg }, [darkMode, T.bg]);
  useEffect(() => saveState('shift', shiftState), [shiftState]);
  useEffect(() => saveState('vehicle', vehicleConfig), [vehicleConfig]);

  /* Push dynamic notification helper */
  const pushNotif = (type, title, body) => {
    setNotifs(prev => [{ id: Date.now(), type, title, body, time: 'Just now', read: false }, ...prev]);
  };

  /* Screen transition */
  const [transClass, setTransClass] = useState('');
  const animateScreen = () => { setTransClass('si'); setTimeout(() => setTransClass(''), 300) };

  const nav = useCallback((s, data) => {
    hist.current.push(scr);
    if (s === 'stop' && data) { setCurLock(data.locker); setCurStop(data.stopNum) }
    if (s === 'batch' && data) { setCurLock(data.locker); setCurStop(data.stopNum) }
    setPrevScr(scr); animateScreen(); setScr(s);
  }, [scr]);

  const back = useCallback(() => { const prev = hist.current.pop() || 'home'; setPrevScr(scr); animateScreen(); setScr(prev) }, [scr]);

  const depositOne = useCallback((id) => {
    const pkg = tasks.find(t => t.id === id);
    setTasks(p => p.map(t => t.id === id ? { ...t, tab: 'delivered_to_locker', depositedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } : t));
    if (pkg) pushNotif('success', 'Deposited', `${pkg.trk} deposited at ${pkg.locker}`);
    /* Undo toast */
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoToast(id);
    undoTimer.current = setTimeout(() => setUndoToast(null), 4000);
  }, [tasks]);

  const undoDeposit = useCallback((id) => {
    setTasks(p => p.map(t => t.id === id ? { ...t, tab: 'in_transit_to_locker', depositedAt: undefined } : t));
    setUndoToast(null);
  }, []);

  const acceptBlock = useCallback((block) => { setActiveBlock(block); pushNotif('info', 'Block Started', `${block.area} block accepted`); hist.current = []; setPrevScr(scr); setScr('home') }, [scr]);

  /* Shift handlers */
  const clockIn = () => setShiftState({ isActive: true, clockInTime: new Date().toISOString(), breaks: [], currentBreakStart: null });
  const clockOut = () => { pushNotif('info', 'Shift Ended', 'Clock-out recorded'); setShiftState(null) };
  const startBreak = () => setShiftState(s => ({ ...s, currentBreakStart: new Date().toISOString() }));
  const endBreak = () => setShiftState(s => ({ ...s, breaks: [...(s.breaks || []), { start: s.currentBreakStart, end: new Date().toISOString() }], currentBreakStart: null }));

  /* Exception handler */
  const submitException = (exc) => {
    if (exceptionTask) {
      setTasks(p => p.map(t => t.id === exceptionTask.id ? { ...t, exception: exc } : t));
      pushNotif('urgent', 'Issue Reported', `${exceptionTask.trk}: ${exc.type}`);
      setExceptionTask(null); back();
    }
  };

  const showNav = ['home', 'tasks', 'itinerary', 'schedule', 'earnings', 'profile', 'lockers'].includes(scr);

  return <div style={{ maxWidth: 448, margin: '0 auto', minHeight: '100vh', background: T.bg, position: 'relative', fontFamily: '"Inter",sans-serif' }}>
    <div className={transClass} key={scr}>
      {scr === 'splash' && <SplashScreen onDone={() => setScr('login')} T={T} />}
      {scr === 'login' && <LoginScreen onLogin={(ph) => { setLoginPhone(ph); hist.current.push('login'); setScr('otp') }} T={T} />}
      {scr === 'otp' && <OtpScreen phone={loginPhone} onVerify={() => { hist.current = []; setScr('home') }} onBack={back} T={T} />}
      {scr === 'home' && <HomeScreen dels={dels} tasks={tasks} activeBlock={activeBlock} onNav={nav} notifCount={notifCount} onRefresh={() => { }} shiftState={shiftState} onClockIn={clockIn} onClockOut={clockOut} onBreak={startBreak} onResume={endBreak} vehicleConfig={vehicleConfig} T={T} />}
      {scr === 'schedule' && <ScheduleScreen onBack={back} onAccept={acceptBlock} T={T} />}
      {scr === 'itinerary' && <ItineraryScreen dels={dels} tasks={tasks} onBack={back} onNav={nav} T={T} />}
      {scr === 'stop' && curLock && <StopScreen locker={curLock} stopNum={curStop} dels={dels} recalls={tasks.filter(t => t.tab === 'recalled' && t.locker === curLock.name)} onBack={back} onNav={nav} adjLockers={adjLockers} T={T} />}
      {scr === 'batch' && curLock && <BatchDepositScreen locker={curLock} stopNum={curStop} dels={dels} onBack={back} onDeposit={depositOne} T={T} />}
      {scr === 'tasks' && <TasksScreen tasks={tasks} setTasks={setTasks} onBack={back} T={T} />}
      {scr === 'earnings' && <EarningsScreen onBack={back} T={T} />}
      {scr === 'notifs' && <NotifsScreen onBack={back} notifItems={notifs} setNotifItems={setNotifs} T={T} />}
      {scr === 'profile' && <ProfileScreen onBack={back} onNav={nav} onLogout={() => { setScr('login'); setActiveBlock(null); hist.current = []; localStorage.removeItem('locqar_tasks'); localStorage.removeItem('locqar_activeBlock') }} T={T} />}
      {scr === 'profileInfo' && <ProfileInfoScreen onBack={back} T={T} />}
      {scr === 'profileSafety' && <ProfileSafetyScreen onBack={back} T={T} />}
      {scr === 'profileSettings' && <ProfileSettingsScreen onBack={back} darkMode={darkMode} onToggleDark={() => setDarkMode(d => !d)} T={T} />}
      {scr === 'profileHelp' && <ProfileHelpScreen onBack={back} T={T} />}
      {scr === 'lockers' && <LockerDirectoryScreen tasks={tasks} adjLockers={adjLockers} onBack={back} T={T} />}
      {scr === 'history' && <DeliveryHistoryScreen tasks={tasks} onBack={back} T={T} />}
      {scr === 'exception' && exceptionTask && <ExceptionReportScreen task={exceptionTask} onSubmit={submitException} onBack={() => { setExceptionTask(null); back() }} T={T} />}
      {scr === 'vehicleSettings' && <VehicleSettingsScreen vehicleConfig={vehicleConfig} setVehicleConfig={setVehicleConfig} onBack={back} T={T} />}
      
      {/* New Feature Screens */}
      {scr === 'notifications' && <NotificationsScreen onBack={back} T={T} />}
      {scr === 'analytics' && <AnalyticsScreen onBack={back} T={T} />}
      {scr === 'settings' && <SettingsScreen onBack={back} onLogout={() => { setScr('login'); setActiveBlock(null); hist.current = []; localStorage.removeItem('locqar_tasks'); localStorage.removeItem('locqar_activeBlock') }} T={T} />}
      {scr === 'routeMap' && <RouteMapScreen onBack={back} onSelectLocker={(locker) => nav('batch', { locker: locker.name, stopNum: 1 })} dels={dels} activeBlock={activeBlock} T={T} />}
      {scr === 'proofOfDelivery' && selectedTaskForPOD && <ProofOfDeliveryScreen task={selectedTaskForPOD} onConfirm={(proof) => { pushNotif('success', 'Proof Submitted', 'Delivery proof recorded'); setSelectedTaskForPOD(null); back() }} onBack={() => { setSelectedTaskForPOD(null); back() }} T={T} />}
      {scr === 'homeDelivery' && <HomeDeliveryScreen tasks={tasks} setTasks={setTasks} onBack={back} T={T} />}
    </div>
    <OfflineBanner T={T} />
    {verifyTask && <VerificationModal task={verifyTask} onVerified={() => { setVerifyTask(null) }} onClose={() => setVerifyTask(null)} T={T} />}
    {/* Undo toast for batch deposit */}
    {undoToast && <div style={{ position: 'fixed', bottom: showNav ? 72 : 16, left: 16, right: 16, maxWidth: 416, margin: '0 auto', zIndex: 150, padding: '12px 16px', borderRadius: 12, background: T.text, display: 'flex', alignItems: 'center', gap: 10, boxShadow: T.shadowLg, animation: 'slideUp .2s ease' }}>
      <CheckCircle size={18} style={{ color: T.green, flexShrink: 0 }} />
      <span style={{ flex: 1, color: '#fff', fontSize: 13, fontWeight: 600 }}>Package deposited</span>
      <button onClick={() => undoDeposit(undoToast)} style={{ border: 'none', background: 'none', color: T.amber, fontWeight: 700, fontSize: 13, padding: '4px 8px' }}>Undo</button>
    </div>}
    {showNav && <Nav active={scr} onNav={nav} T={T} />}
    <PWAInstallPrompt />
  </div>;
}

export default LocQarDriverApp;
