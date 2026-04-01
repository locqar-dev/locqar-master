import { useState, useCallback } from 'react'
import WelcomeScreen from './screens/WelcomeScreen'
import HomeScreen from './screens/HomeScreen'
import PinEntryScreen from './screens/PinEntryScreen'
import BoxSizeScreen from './screens/BoxSizeScreen'
import DoorOpenScreen from './screens/DoorOpenScreen'
import ThankYouScreen from './screens/ThankYouScreen'
import MobileMoneyScreen from './screens/MobileMoneyScreen'
import LoginScreen from './screens/LoginScreen'
import CourierDashboard from './screens/CourierDashboard'
import CourierDropOffScreen from './screens/CourierDropOffScreen'
import RecallPackageScreen from './screens/RecallPackageScreen'
import StudentDashboard from './screens/StudentDashboard'
import SetupScreen from './screens/SetupScreen'
import { ErrorModal, ConfirmModal, DoorOpenModal } from './components/Modal'
import useCommandPolling from './hooks/useCommandPolling'
import { isConfigured } from './services/config'

const INITIAL_SCREEN = isConfigured() ? 'welcome' : 'setup'

export default function App() {
  const [screen, setScreen] = useState(INITIAL_SCREEN)
  const [history, setHistory] = useState([])
  const [modal, setModal] = useState(null)
  const [sessionData, setSessionData] = useState({})

  // Background polling for remote door-open commands from the API.
  // Only polls when the kiosk has been configured (has lockerSN + apiKey).
  const configured = isConfigured()
  const { lastCommand, error: pollingError } = useCommandPolling({
    enabled: configured,
    onDoorOpen: (result) => {
      if (result.success) {
        setModal({
          type: 'door-open',
          doorNumber: result.doorNum,
          instruction: `Door #${result.doorNum} opened remotely`,
          cancelLabel: 'Dismiss',
        })
      } else {
        setModal({
          type: 'error',
          title: 'Door Open Failed',
          message: result.error || `Could not open door #${result.doorNum}`,
        })
      }
    },
  })

  const navigate = useCallback((to, data = {}) => {
    setHistory(prev => [...prev, screen])
    setSessionData(prev => ({ ...prev, ...data }))
    setScreen(to)
    setModal(null)
  }, [screen])

  const goBack = useCallback(() => {
    const prev = history[history.length - 1]
    if (prev) {
      setHistory(h => h.slice(0, -1))
      setScreen(prev)
      setModal(null)
    }
  }, [history])

  const goHome = useCallback(() => {
    setHistory([])
    setSessionData({})
    setScreen('home')
    setModal(null)
  }, [])

  const goWelcome = useCallback(() => {
    setHistory([])
    setSessionData({})
    setScreen('welcome')
    setModal(null)
  }, [])

  const randomDoor = () => Math.floor(Math.random() * 12) + 1

  const renderScreen = () => {
    switch (screen) {
      case 'setup':
        return <SetupScreen onComplete={() => { setScreen('welcome') }} />
      case 'welcome':
        return <WelcomeScreen onNext={() => navigate('home')} />
      case 'home':
        return (
          <HomeScreen
            onDropOff={() => navigate('dropoff-pin')}
            onPickUp={() => navigate('pickup-pin')}
            onStudentLogin={() => navigate('student-login')}
            onAgentLogin={() => navigate('courier-login')}
          />
        )
      case 'dropoff-pin':
        return <PinEntryScreen title="Drop Off Package" onConfirm={(pin) => navigate('dropoff-box-size', { pin })} onBack={goBack} />
      case 'dropoff-box-size':
        return <BoxSizeScreen onSelect={(size) => navigate('dropoff-door-open', { boxSize: size, doorNumber: randomDoor() })} onBack={goBack} />
      case 'dropoff-door-open':
        return <DoorOpenScreen type="dropoff" doorNumber={sessionData.doorNumber || 3} onDone={() => navigate('dropoff-thank-you')} onCancel={goBack} />
      case 'dropoff-thank-you':
        return <ThankYouScreen message="See you next time" onTimeout={goWelcome} />
      case 'pickup-pin':
        return (
          <PinEntryScreen
            title="Pick Up Package"
            onConfirm={(pin) => {
              const needsPayment = Math.random() > 0.5
              if (needsPayment) navigate('pickup-pay', { pin })
              else navigate('pickup-door-open', { pin, doorNumber: randomDoor() })
            }}
            onBack={goBack}
          />
        )
      case 'pickup-pay':
        return <MobileMoneyScreen onPay={(d) => navigate('pickup-door-open', { ...d, doorNumber: randomDoor() })} onBack={goBack} />
      case 'pickup-door-open':
        return <DoorOpenScreen type="pickup" doorNumber={sessionData.doorNumber || 3} onDone={() => navigate('pickup-thank-you')} />
      case 'pickup-thank-you':
        return <ThankYouScreen message="See you next time" onTimeout={goWelcome} />
      case 'student-login':
        return <LoginScreen title="Student Login" onConfirm={(c) => navigate('student-dashboard', { studentCreds: c })} onBack={goBack} />
      case 'student-dashboard':
        return <StudentDashboard onSelectSize={(s) => navigate('student-door-open', { boxSize: s, doorNumber: randomDoor() })} onBack={goHome} />
      case 'student-door-open':
        return <DoorOpenScreen type="dropoff" doorNumber={sessionData.doorNumber || 3} onDone={() => navigate('student-thank-you')} onCancel={goBack} />
      case 'student-thank-you':
        return <ThankYouScreen message="See you soon" onTimeout={goWelcome} />
      case 'courier-login':
        return <LoginScreen title="Courier Login" onConfirm={(c) => navigate('courier-dashboard', { courierCreds: c })} onBack={goBack} />
      case 'courier-dashboard':
        return <CourierDashboard onDropOff={() => navigate('courier-dropoff')} onViewPackages={() => navigate('courier-view-packages')} onBack={goHome} />
      case 'courier-dropoff':
        return (
          <CourierDropOffScreen
            onOpen={(data) => {
              const door = randomDoor()
              setSessionData(prev => ({ ...prev, ...data, doorNumber: door }))
              setModal({ type: 'door-open', doorNumber: door, instruction: 'Drop off package and close door', cancelLabel: 'Press X to cancel' })
            }}
            onBack={goBack}
          />
        )
      case 'courier-view-packages':
        return <RecallPackageScreen onBack={goBack} onRecallDone={() => navigate('courier-dashboard')} />
      default:
        return <WelcomeScreen onNext={() => navigate('home')} />
    }
  }

  const renderModal = () => {
    if (!modal) return null
    switch (modal.type) {
      case 'door-open':
        return <DoorOpenModal doorNumber={modal.doorNumber} instruction={modal.instruction} cancelLabel={modal.cancelLabel} onCancel={() => setModal(null)} />
      case 'confirm-fit':
        return (
          <ConfirmModal
            title={`Locker ${modal.doorNumber}`} subtitle="Drop-off Confirmation" question="Did the package fit?"
            onYes={() => { setModal(null); navigate('courier-dashboard') }}
            onNo={() => setModal({ type: 'reuse-door', doorNumber: modal.doorNumber })}
            onClose={() => setModal(null)}
          />
        )
      case 'reuse-door':
        return (
          <ConfirmModal
            title={`Locker ${modal.doorNumber}`} subtitle="Reuse Door" question="Reuse this door for the same recipient?"
            onYes={() => setModal({ type: 'door-open', doorNumber: modal.doorNumber, instruction: 'Add package and close door', cancelLabel: null })}
            onNo={() => setModal(null)}
            onClose={() => setModal(null)}
          />
        )
      case 'error':
        return <ErrorModal title={modal.title} message={modal.message} onCancel={() => setModal(null)} />
      default:
        return null
    }
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-900">
      {renderScreen()}
      {renderModal()}

      {/* Settings gear — triple-tap bottom-right corner to access */}
      {screen !== 'setup' && (
        <button
          onClick={() => setScreen('setup')}
          className="fixed top-3 right-3 z-[70] w-8 h-8 flex items-center justify-center
            text-white/20 hover:text-white/60 transition-colors rounded-full"
          title="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {modal?.type === 'door-open' && (
        <button
          onClick={() => setModal({ type: 'confirm-fit', doorNumber: modal.doorNumber })}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60]
            text-sm font-medium text-white/60 px-6 py-3 rounded-full
            border border-white/20 bg-white/10 backdrop-blur-sm
            hover:bg-white/20 active:scale-[0.98] transition-all"
        >
          Simulate: Door Closed
        </button>
      )}
    </div>
  )
}
