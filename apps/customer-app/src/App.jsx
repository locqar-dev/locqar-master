import React, { useState } from "react";
import { T, ff } from "./theme/themes";
import GS from "./utils/GS";
import BNav from "./components/BNav";
import ScreenWrap from "./components/ScreenWrap";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import { initLockers } from "./data/mockData";

// Pages
import Splash from "./pages/Splash";
import Onboard from "./pages/Onboard";
import Signup from "./pages/Signup";
import Auth from "./pages/Auth";
import StudentAuth from "./pages/StudentAuth";
import StudentSignup from "./pages/StudentSignup";
import OTP from "./pages/OTP";
import SubscribePage from "./pages/SubscribePage";
import SubSuccessPage from "./pages/SubSuccessPage";
import Home from "./pages/Home";
import Activities from "./pages/Activities";
import Account from "./pages/Account";
import PkgDetail from "./pages/PkgDetail";
import Notifs from "./pages/Notifs";
import Send from "./pages/Send";
import EditProfilePage from "./pages/EditProfilePage";
import ContactsPage from "./pages/ContactsPage";
import PayMethodsPage from "./pages/PayMethodsPage";
import NotifPrefsPage from "./pages/NotifPrefsPage";
import RewardsPage from "./pages/RewardsPage";
import SettingsPage from "./pages/SettingsPage";
import StoragePage from "./pages/StoragePage";
import PaymentPage from "./pages/PaymentPage";
import LockersPage from "./pages/LockersPage";
import ManageSubPage from "./pages/ManageSubPage";
import ReceivePage from "./pages/ReceivePage";
import CallPackagePage from "./pages/CallPackagePage";
import SupportChat from "./pages/SupportChat";
import ReferralPage from "./pages/ReferralPage";
import RatingPage from "./pages/RatingPage";
import TransactionsPage from "./pages/TransactionsPage";
import LegalPage from "./pages/LegalPage";
import SecurityPinPage from "./pages/SecurityPinPage";
import DeleteAccountPage from "./pages/DeleteAccountPage";
import WalletPage from "./pages/WalletPage";
import WalletTopUpPage from "./pages/WalletTopUpPage";
import QRScannerPage from "./pages/QRScannerPage";
import BillingHistoryPage from "./pages/BillingHistoryPage";

export default function App() {
  var [scr, sScr] = useState('splash');
  var [selPkg, sSelPkg] = useState(null);
  var [sendPrefill, setSendPrefill] = useState(null);
  var [payCtx, setPayCtx] = useState(null);
  var [sendConfirmed, setSendConfirmed] = useState(false);
  var [sendData, setSendData] = useState({});
  var [storageConfirmed, setStorageConfirmed] = useState(false);
  var [storageData, setStorageData] = useState({});
  var [receiveConfirmed, setReceiveConfirmed] = useState(false);
  var [receiveData, setReceiveData] = useState({});
  var [prevScr, sPrevScr] = useState('home');
  var [phone, sPhone] = useState('');
  var [navDir, setNavDir] = useState('fade');
  var [prefLocker, setPrefLocker] = useState(0);
  var [currentPlan, setCurrentPlan] = useState(null);
  var [isStudent, setIsStudent] = useState(false);
  var [studentId, setStudentId] = useState('');
  var user = { name: 'Kwame Asante', phone: '24 XXX XXXX' };
  var pkgs = [
    { id: 1, name: 'iPhone 15 Case', status: 'Ready', location: 'Osu Mall, Locker #12', fromPhone: '+233 24 XXX XXXX', toPhone: '+233 24 555 1234', time: '26h ago', hoursInLocker: 26.5 },
    { id: 4, name: 'Wireless Earbuds', status: 'Ready', location: 'Accra Mall, Locker #7', fromPhone: '+233 55 222 9012', toPhone: '+233 24 XXX XXXX', time: '8h ago', hoursInLocker: 8 },
    { id: 2, name: 'Book Bundle', status: 'In transit', location: 'En route to Accra Mall', fromPhone: '+233 20 888 5678', toPhone: '+233 24 XXX XXXX', time: '1d ago', hoursInLocker: null },
    { id: 5, name: 'Laptop Bag', status: 'In transit', location: 'En route to Osu Mall', fromPhone: '+233 24 XXX XXXX', toPhone: '+233 55 222 9012', time: '2h ago', hoursInLocker: null, dropCode: 'LQ-583920', pickupLocker: 'Osu Mall' },
    { id: 3, name: 'Nike Sneakers', status: 'Delivered', location: 'Junction Mall', fromPhone: '+233 24 XXX XXXX', toPhone: '+233 55 222 9012', time: '3d ago', hoursInLocker: null, dropCode: 'LQ-294710', pickupLocker: 'Junction Mall' }
  ];
  var mainTabs = ['home', 'activity', 'account'];

  // Determine transition direction based on navigation pattern
  var getTransition = function (from, to) {
    var tabs = mainTabs;
    var isFromTab = tabs.indexOf(from) >= 0;
    var isToTab = tabs.indexOf(to) >= 0;
    // Tab-to-tab: crossfade
    if (isFromTab && isToTab) return 'scr-fade';
    // Going deeper into a sub-screen: slide in from right
    if (isFromTab && !isToTab) return 'scr-forward';
    // Going back to a tab: slide in from left
    if (!isFromTab && isToTab) return 'scr-back';
    // Sub-screen to sub-screen (e.g. send -> payment): slide forward
    return 'scr-forward';
  };

  var nav = function (s, d) {
    if (s === 'pkg-detail' && d) sSelPkg(d);
    if (s === 'send' && d && d.contact) setSendPrefill(d);
    else if (s === 'send' && d && d.confirmed) { setSendConfirmed(true); }
    else if (s === 'send') { setSendPrefill(null); setSendConfirmed(false); setSendData({}); }
    if (s === 'storage' && d && d.confirmed) setStorageConfirmed(true);
    else if (s === 'storage') { setStorageConfirmed(false); setStorageData({}); }
    if (s === 'receive' && d && d.confirmed) setReceiveConfirmed(true);
    else if (s === 'receive') { setReceiveConfirmed(false); setReceiveData({}); }
    if (s === 'payment' && d) { setPayCtx(d); if (d.sendData) setSendData(d.sendData); if (d.storageData) setStorageData(d.storageData); if (d.receiveData) setReceiveData(d.receiveData); }
    if (s === 'support' || s === 'referral' || s === 'terms' || s === 'privacy') sPrevScr(scr);
    setNavDir(getTransition(scr, s));
    sScr(s);
  };

  // Back navigation helper - always slides back
  var goBack = function (to, d) {
    setNavDir('scr-back');
    // Directly set screen to avoid nav overriding the direction
    if (to === 'pkg-detail' && d) sSelPkg(d);
    if (to === 'support' || to === 'referral' || to === 'terms' || to === 'privacy') sPrevScr(scr);
    sScr(to);
  };

  var showNav = mainTabs.indexOf(scr) >= 0;
  var tr = navDir;

  return (
    <div className="max-w-md mx-auto min-h-screen relative" style={{ fontFamily: ff, overflow: 'hidden', background: T.bg }}>
      <div className="mesh-bg"></div>
      <GS />
      {scr === 'splash' && <Splash onDone={function () { setNavDir('scr-fade'); sScr('onboard'); }} />}
      {scr === 'onboard' && <ScreenWrap screenKey="onboard" transition="scr-fade"><Onboard onDone={function () { setNavDir('scr-up'); sScr('signup'); }} /></ScreenWrap>}
      {scr === 'signup' && <ScreenWrap screenKey="signup" transition="scr-up"><Signup onSignup={function (p) { sPhone(p); setNavDir('scr-forward'); sScr('otp'); }} onLogin={function () { setNavDir('scr-fade'); sScr('auth'); }} onBack={function () { setNavDir('scr-back'); sScr('onboard'); }} onNav={nav} /></ScreenWrap>}
      {scr === 'auth' && <ScreenWrap screenKey="auth" transition={tr}><Auth onLogin={function (p) { sPhone(p); setNavDir('scr-forward'); sScr('otp'); }} onSignup={function () { setNavDir('scr-fade'); sScr('signup'); }} onStudentLogin={function () { setNavDir('scr-fade'); sScr('student-auth'); }} /></ScreenWrap>}
      {scr === 'student-auth' && <ScreenWrap screenKey="student-auth" transition={tr}><StudentAuth onLogin={function (sid, pass) { setIsStudent(true); setStudentId(sid); setNavDir('scr-forward'); sScr('home'); }} onSignup={function () { setNavDir('scr-fade'); sScr('student-signup'); }} onRegular={function () { setNavDir('scr-fade'); sScr('auth'); }} /></ScreenWrap>}
      {scr === 'student-signup' && <ScreenWrap screenKey="student-signup" transition={tr}><StudentSignup onDone={function (sid) { setIsStudent(true); setStudentId(sid || ''); setNavDir('scr-forward'); sScr('home'); }} onLogin={function () { setNavDir('scr-fade'); sScr('student-auth'); }} onBack={function () { setNavDir('scr-back'); sScr('student-auth'); }} /></ScreenWrap>}
      {scr === 'otp' && <ScreenWrap screenKey="otp" transition={tr}><OTP onOk={function () { setNavDir('scr-fade'); sScr('home'); }} onBack={function () { setNavDir('scr-back'); sScr('signup'); }} phone={phone} /></ScreenWrap>}
      {scr === 'subscribe' && <ScreenWrap screenKey="subscribe" transition={tr}><SubscribePage current={currentPlan} onSelect={function (p) { setCurrentPlan(p || 'student'); setNavDir('scr-fade'); sScr('sub-success'); }} onNav={nav} onBack={function () { goBack(prevScr || 'account'); }} /></ScreenWrap>}
      {scr === 'sub-success' && <ScreenWrap screenKey="sub-success" transition="scr-fade"><SubSuccessPage plan={payCtx && payCtx.onSuccessData && payCtx.onSuccessData.plan ? payCtx.onSuccessData.plan : currentPlan} onDone={function () { setNavDir('scr-fade'); sScr('home'); }} /></ScreenWrap>}
      {scr === 'home' && <ScreenWrap screenKey="home" transition={tr}><Home user={user} pkgs={pkgs} onNav={nav} prefLocker={prefLocker} onPrefLockerChange={setPrefLocker} currentPlan={currentPlan} isStudent={isStudent} studentId={studentId} /></ScreenWrap>}
      {scr === 'activity' && <ScreenWrap screenKey="activity" transition={tr}><Activities pkgs={pkgs} onNav={nav} /></ScreenWrap>}
      {scr === 'account' && <ScreenWrap screenKey="account" transition={tr}><Account user={user} currentPlan={currentPlan} onNav={nav} onLogout={function () { setNavDir('scr-fade'); sScr('auth'); }} /></ScreenWrap>}
      {scr === 'pkg-detail' && selPkg && <ScreenWrap screenKey={'pkg-' + selPkg.id} transition={tr}><PkgDetail pkg={selPkg} onBack={function () { goBack('activity'); }} onRate={function (p) { sSelPkg(p); setNavDir('scr-up'); sScr('rating'); }} /></ScreenWrap>}
      {scr === 'notifs' && <ScreenWrap screenKey="notifs" transition={tr}><Notifs onBack={function () { goBack('home'); }} /></ScreenWrap>}
      {scr === 'send' && <ScreenWrap screenKey="send" transition={tr}><Send onBack={function () { goBack('home'); }} prefill={sendPrefill} onNav={nav} confirmed={sendConfirmed} savedData={sendData} /></ScreenWrap>}
      {scr === 'edit-profile' && <ScreenWrap screenKey="edit-profile" transition={tr}><EditProfilePage user={user} onBack={function () { goBack('account'); }} /></ScreenWrap>}
      {scr === 'contacts' && <ScreenWrap screenKey="contacts" transition={tr}><ContactsPage onBack={function () { goBack('account'); }} onNav={nav} /></ScreenWrap>}
      {scr === 'pay-methods' && <ScreenWrap screenKey="pay-methods" transition={tr}><PayMethodsPage onBack={function () { goBack('account'); }} /></ScreenWrap>}
      {scr === 'notif-prefs' && <ScreenWrap screenKey="notif-prefs" transition={tr}><NotifPrefsPage onBack={function () { goBack('account'); }} /></ScreenWrap>}
      {scr === 'rewards' && <ScreenWrap screenKey="rewards" transition={tr}><RewardsPage onBack={function () { goBack('account'); }} /></ScreenWrap>}
      {scr === 'settings' && <ScreenWrap screenKey="settings" transition={tr}><SettingsPage onBack={function () { goBack('account'); }} onNav={nav} /></ScreenWrap>}
      {scr === 'storage' && <ScreenWrap screenKey="storage" transition={tr}><StoragePage onBack={function () { goBack('home'); }} onNav={nav} confirmed={storageConfirmed} savedData={storageData} /></ScreenWrap>}
      {scr === 'payment' && payCtx && <ScreenWrap screenKey="payment" transition={tr}><PaymentPage amount={payCtx.amount} label={payCtx.label} icon={payCtx.icon} items={payCtx.items} onBack={function () { setNavDir('scr-back'); sScr(payCtx.backTo || 'home'); }} onSuccess={function () { if (payCtx.onSuccessData && payCtx.onSuccessData.plan) { setCurrentPlan(payCtx.onSuccessData.plan); if (payCtx.onSuccessData.studentId) { setIsStudent(true); setStudentId(payCtx.onSuccessData.studentId); } } if (payCtx.onSuccessNav) nav(payCtx.onSuccessNav, payCtx.onSuccessData); else nav('home'); }} /></ScreenWrap>}
      {scr === 'lockers' && <ScreenWrap screenKey="lockers" transition={tr}><LockersPage onBack={function () { goBack('home'); }} /></ScreenWrap>}
      {scr === 'manage-sub' && currentPlan && <ScreenWrap screenKey="manage-sub" transition={tr}><ManageSubPage currentPlan={currentPlan} onBack={function () { goBack('account'); }} onCancelled={function () { setCurrentPlan(null); goBack('account'); }} onNav={nav} /></ScreenWrap>}
      {scr === 'receive' && <ScreenWrap screenKey="receive" transition={tr}><ReceivePage onBack={function () { goBack('home'); }} onNav={nav} prefLocker={initLockers[prefLocker]} confirmed={receiveConfirmed} savedData={receiveData} /></ScreenWrap>}
      {scr === 'call-pkg' && <ScreenWrap screenKey="call-pkg" transition={tr}><CallPackagePage onBack={function () { goBack('home'); }} onNav={nav} confirmed={false} /></ScreenWrap>}
      {scr === 'call-pkg-done' && <ScreenWrap screenKey="call-pkg-done" transition={tr}><CallPackagePage onBack={function () { goBack('home'); }} onNav={nav} confirmed={true} /></ScreenWrap>}
      {scr === 'support' && <ScreenWrap screenKey="support" transition="scr-up"><SupportChat onBack={function () { goBack(prevScr || 'home'); }} /></ScreenWrap>}
      {scr === 'referral' && <ScreenWrap screenKey="referral" transition={tr}><ReferralPage onBack={function () { goBack(prevScr || 'home'); }} /></ScreenWrap>}
      {scr === 'rating' && selPkg && <ScreenWrap screenKey="rating" transition={tr}><RatingPage pkg={selPkg} onBack={function () { goBack('pkg-detail', selPkg); }} onDone={function () { goBack('activity'); }} /></ScreenWrap>}
      {scr === 'transactions' && <ScreenWrap screenKey="transactions" transition={tr}><TransactionsPage onBack={function () { goBack('account'); }} /></ScreenWrap>}
      {scr === 'terms' && <ScreenWrap screenKey="terms" transition={tr}><LegalPage type="terms" onBack={function () { goBack(prevScr || 'settings'); }} /></ScreenWrap>}
      {scr === 'privacy' && <ScreenWrap screenKey="privacy" transition={tr}><LegalPage type="privacy" onBack={function () { goBack(prevScr || 'settings'); }} /></ScreenWrap>}
      {scr === 'security' && <ScreenWrap screenKey="security" transition={tr}><SecurityPinPage onBack={function () { goBack('settings'); }} /></ScreenWrap>}
      {scr === 'delete-account' && <ScreenWrap screenKey="delete-account" transition={tr}><DeleteAccountPage onBack={function () { goBack('settings'); }} onLogout={function () { setNavDir('scr-fade'); sScr('auth'); }} /></ScreenWrap>}
      {scr === 'wallet' && <ScreenWrap screenKey="wallet" transition={tr}><WalletPage onBack={function () { goBack('home'); }} onNav={nav} /></ScreenWrap>}
      {scr === 'wallet-topup' && <ScreenWrap screenKey="wallet-topup" transition={tr}><WalletTopUpPage onBack={function () { goBack('wallet'); }} /></ScreenWrap>}
      {scr === 'qr-scan' && <ScreenWrap screenKey="qr-scan" transition={tr}><QRScannerPage onBack={function () { goBack('home'); }} /></ScreenWrap>}
      {scr === 'billing-history' && <ScreenWrap screenKey="billing-history" transition={tr}><BillingHistoryPage onBack={function () { goBack('account'); }} /></ScreenWrap>}
      {showNav && <BNav active={scr} onNav={nav} />}
      <PWAInstallPrompt />
    </div>
  );
}
