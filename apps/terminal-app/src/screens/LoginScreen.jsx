import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import NumPad from '../components/NumPad'
import { Eye, EyeOff } from 'lucide-react'

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
      <div className="flex-1 flex flex-col items-center pt-20 w-full max-w-[480px] px-8 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-10">
          <p className="text-sm text-white/50 uppercase tracking-wider font-medium">{title}</p>
          <div className="w-8 h-px bg-locqar-red mt-3 mb-8 animate-line" />
        </div>

        <div className="w-full mb-6">
          <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Mobile Number</label>
          <button
            onClick={() => setActiveField('mobile')}
            className={`w-full mt-3 pb-4 text-left border-b transition-colors
              ${activeField === 'mobile' ? 'border-white/60' : 'border-white/20'}`}
          >
            <span className={`text-xl font-mono ${mobileNumber ? 'text-white' : 'text-white/30'}`}>
              {mobileNumber || '024 000 0000'}
            </span>
          </button>
        </div>

        <div className="w-full mb-8">
          <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Password</label>
          <div
            onClick={() => setActiveField('password')}
            className={`w-full mt-3 pb-4 flex items-center border-b transition-colors cursor-pointer
              ${activeField === 'password' ? 'border-white/60' : 'border-white/20'}`}
          >
            <span className={`flex-1 text-xl font-mono tracking-wider ${password ? 'text-white' : 'text-white/30'}`}>
              {password ? (showPassword ? password : '\u2022'.repeat(password.length)) : 'Password'}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowPassword(!showPassword) }}
              className="text-white/50 hover:text-white transition-colors p-2"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <NumPad
          mode={inputMode}
          onKey={handleKey}
          onBackspace={handleBackspace}
          onModeToggle={() => setInputMode(m => m === 'num' ? 'abc' : 'num')}
        />

        <button
          onClick={() => mobileNumber && password && onConfirm({ mobileNumber, password })}
          disabled={!mobileNumber || !password}
          className="mt-6 w-full max-w-[420px] py-5 rounded-2xl text-lg font-medium
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
