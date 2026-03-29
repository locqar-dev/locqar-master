import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import NumPad from '../components/NumPad'
import { Eye, EyeOff } from 'lucide-react'

export default function PinEntryScreen({ title, onConfirm, onBack }) {
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [inputMode, setInputMode] = useState('num')

  const handleKey = (key) => {
    if (pin.length < 10) setPin(prev => prev + key)
  }
  const handleBackspace = () => setPin(prev => prev.slice(0, -1))

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center pt-20 w-full max-w-[480px] px-8 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-10">
          <p className="text-sm text-white/50 uppercase tracking-wider font-medium">{title}</p>
          <div className="w-8 h-px bg-locqar-red mt-3 mb-6 animate-line" />
        </div>

        <div className="w-full flex items-center border-b border-white/20 pb-4 mb-10">
          <span className="flex-1 text-3xl font-mono tracking-[0.3em] text-white">
            {pin ? (showPin ? pin : '\u2022'.repeat(pin.length)) : (
              <span className="text-white/30 text-lg tracking-normal font-sans">Enter password</span>
            )}
          </span>
          <button onClick={() => setShowPin(!showPin)} className="text-white/50 hover:text-white transition-colors p-2">
            {showPin ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
        </div>

        <NumPad
          mode={inputMode}
          onKey={handleKey}
          onBackspace={handleBackspace}
          onModeToggle={() => setInputMode(m => m === 'num' ? 'abc' : 'num')}
        />

        <button
          onClick={() => pin && onConfirm(pin)}
          disabled={!pin}
          className="mt-8 w-full max-w-[420px] py-5 rounded-2xl text-lg font-medium
            bg-locqar-red text-white
            hover:bg-red-700 active:scale-[0.98] transition-all
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Confirm
        </button>
      </div>
    </ScreenLayout>
  )
}
