import { useState, useRef } from 'react'
import { ScreenLayout } from '../components/Layout'
import NumPad from '../components/NumPad'
import { Shield, Loader2 } from 'lucide-react'
import { authenticate, authenticateSync } from '../services/staffAuth'

const PIN_LENGTH = 6 // max digits to accept

export default function AdminPasswordScreen({ onSuccess, onBack }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [checking, setChecking] = useState(false)
  const authInFlight = useRef(false)

  const tryAuth = async (nextPin) => {
    const localMatch = authenticateSync(nextPin)
    if (localMatch) {
      onSuccess(localMatch)
      return
    }

    if (nextPin.length === PIN_LENGTH) {
      if (authInFlight.current) return
      authInFlight.current = true
      setChecking(true)

      const staff = await authenticate(nextPin)
      authInFlight.current = false
      setChecking(false)

      if (staff) {
        onSuccess(staff)
      } else {
        setError(true)
        setShake(true)
        setTimeout(() => { setPin(''); setShake(false) }, 600)
      }
    }
  }

  const handleKey = (key) => {
    if (checking) return
    setError(false)
    const next = pin + key
    if (next.length > PIN_LENGTH) return
    setPin(next)

    if (next.length >= 4) {
      tryAuth(next)
    }
  }

  const handleBackspace = () => {
    if (checking) return
    setError(false)
    setPin(p => p.slice(0, -1))
  }

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center justify-center animate-slide">
        <div className="w-20 h-20 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
          <Shield size={36} className="text-amber-600" />
        </div>

        <h2 className="text-2xl font-bold text-locqar-dark">Staff Access</h2>
        <p className="text-sm text-locqar-dark/50 mt-2">Enter your PIN to continue</p>

        {/* PIN dots */}
        <div className={`flex gap-3 mt-8 mb-8 ${shake ? 'animate-shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200
                ${i < pin.length
                  ? error ? 'bg-locqar-red border-locqar-red' : 'bg-amber-500 border-amber-500'
                  : 'border-locqar-dark/30'
                }`}
            />
          ))}
        </div>

        {checking && (
          <div className="flex items-center gap-2 mb-4">
            <Loader2 size={14} className="text-amber-500 animate-spin" />
            <p className="text-amber-600 text-sm font-medium">Verifying...</p>
          </div>
        )}

        {error && (
          <p className="text-locqar-red text-sm font-medium mb-4">Incorrect PIN</p>
        )}

        <NumPad onKey={handleKey} onBackspace={handleBackspace} />
      </div>
    </ScreenLayout>
  )
}
