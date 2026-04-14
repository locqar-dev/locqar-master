import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import NumPad from '../components/NumPad'
import { Eye, EyeOff, Pencil } from 'lucide-react'

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
      <div className="flex-1 flex flex-col items-center pt-[100px] w-full max-w-[700px] px-10 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-12">
          <p className="text-[18px] text-locqar-dark/60 uppercase tracking-wider font-medium">{title}</p>
          <div className="w-10 h-[2px] bg-locqar-red mt-4 mb-8 animate-line" />
        </div>

        {/* Password input field — dark rounded bar */}
        <div className="w-full flex items-center bg-locqar-dark rounded-2xl px-8 py-7 mb-12">
          <span className="flex-1 text-[28px] font-mono tracking-[0.3em] text-white">
            {pin ? (showPin ? pin : '\u2022'.repeat(pin.length)) : (
              <span className="text-white/40 text-[20px] tracking-normal font-sans">Enter Password</span>
            )}
          </span>
          <button onClick={() => setShowPin(!showPin)} className="text-white/50 hover:text-white transition-colors p-1">
            {showPin ? <EyeOff size={26} /> : <Eye size={26} />}
          </button>
          <Pencil size={22} className="text-white/40 ml-3" />
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
          className="mt-10 w-full max-w-[620px] py-6 rounded-[20px] text-[22px] font-bold uppercase tracking-wide
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
