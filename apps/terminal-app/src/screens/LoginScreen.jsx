import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import NumPad from '../components/NumPad'
import { Eye, EyeOff, Pencil } from 'lucide-react'

export default function LoginScreen({ title = 'Courier Login', onConfirm, onBack }) {
  const [mobileNumber, setMobileNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [activeField, setActiveField] = useState('mobile')
  const [inputMode, setInputMode] = useState('num')

  const handleKey = (key) => {
    if (activeField === 'mobile') {
      if (mobileNumber.length < 10) setMobileNumber(prev => prev + key)
    } else {
      if (password.length < 20) setPassword(prev => prev + key)
    }
  }

  const handleBackspace = () => {
    if (activeField === 'mobile') {
      setMobileNumber(prev => prev.slice(0, -1))
    } else {
      setPassword(prev => prev.slice(0, -1))
    }
  }

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center pt-[100px] w-full max-w-[700px] px-10 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-12">
          <p className="text-[18px] text-locqar-dark/60 uppercase tracking-wider font-bold">{title}</p>
          <div className="w-10 h-[2px] bg-locqar-red mt-4 mb-10 animate-line" />
        </div>

        {/* Mobile number input — dark bar */}
        <button
          onClick={() => setActiveField('mobile')}
          className={`w-full flex items-center bg-locqar-dark rounded-2xl px-8 py-6 mb-5 transition-all
            ${activeField === 'mobile' ? 'ring-2 ring-locqar-red' : ''}`}
        >
          <span className={`flex-1 text-left text-[22px] ${mobileNumber ? 'text-white font-mono' : 'text-white/40'}`}>
            {mobileNumber || 'Mobile Number'}
          </span>
          <Pencil size={22} className="text-white/40" />
        </button>

        {/* Password input — dark bar */}
        <button
          onClick={() => setActiveField('password')}
          className={`w-full flex items-center bg-locqar-dark rounded-2xl px-8 py-6 mb-5 transition-all
            ${activeField === 'password' ? 'ring-2 ring-locqar-red' : ''}`}
        >
          <span className={`flex-1 text-left text-[22px] font-mono tracking-wider ${password ? 'text-white' : 'text-white/40 tracking-normal font-sans'}`}>
            {password ? (showPassword ? password : '\u2022'.repeat(password.length)) : 'Enter Password'}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword) }}
            className="text-white/50 hover:text-white transition-colors p-1 mr-2"
          >
            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
          </button>
          <Pencil size={22} className="text-white/40" />
        </button>

        <p className="text-[16px] text-locqar-dark/40 uppercase tracking-wider mb-8 mt-3">
          Press 'Confirm'
        </p>

        <NumPad
          mode={inputMode}
          onKey={handleKey}
          onBackspace={handleBackspace}
          onModeToggle={() => setInputMode(m => m === 'num' ? 'abc' : 'num')}
        />

        <button
          onClick={() => mobileNumber && password && onConfirm({ mobileNumber, password })}
          disabled={!mobileNumber || !password}
          className="mt-8 w-full max-w-[620px] py-6 rounded-[20px] text-[22px] font-bold uppercase tracking-wide
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
