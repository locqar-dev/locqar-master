import { useState, useRef } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'

const SECRET_TAPS = 5
const SECRET_WINDOW = 3000 // ms

export default function HomeScreen({ onDropOff, onPickUp, onStudentLogin, onAgentLogin, onAdmin }) {
  const tapsRef = useRef([])

  const handleLogoTap = () => {
    const now = Date.now()
    tapsRef.current = [...tapsRef.current.filter(t => now - t < SECRET_WINDOW), now]
    if (tapsRef.current.length >= SECRET_TAPS) {
      tapsRef.current = []
      onAdmin()
    }
  }
  return (
    <ScreenLayout>
      <div className="flex-1 flex flex-col items-center pt-20 animate-slide">
        <div onClick={handleLogoTap} className="cursor-pointer">
          <LocQarLogo size="md" />
        </div>

        <div className="flex flex-col gap-4 mt-16 w-full max-w-[480px]">
          <button
            onClick={onDropOff}
            className="flex items-center gap-6 px-8 py-7 rounded-2xl
              border border-white/15 bg-white/10 backdrop-blur-sm
              hover:bg-white/20 hover:border-white/30 active:scale-[0.98] transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <ArrowDownToLine size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white">Drop Off Package</p>
              <p className="text-sm text-white/50 mt-1">Store your package in a locker</p>
            </div>
          </button>

          <button
            onClick={onPickUp}
            className="flex items-center gap-6 px-8 py-7 rounded-2xl
              border border-white/15 bg-white/10 backdrop-blur-sm
              hover:bg-white/20 hover:border-white/30 active:scale-[0.98] transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-red-900/30 flex items-center justify-center">
              <ArrowUpFromLine size={24} className="text-locqar-red" />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white">Pick Up Package</p>
              <p className="text-sm text-white/50 mt-1">Retrieve your package</p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center w-full px-10 pb-2 relative z-10">
        <button
          onClick={onStudentLogin}
          className="text-sm font-medium text-white/40
            hover:text-white/70 transition-colors py-3 px-2"
        >
          Student Login
        </button>
        <button
          onClick={onAgentLogin}
          className="text-sm font-medium text-white/40
            hover:text-white/70 transition-colors py-3 px-2"
        >
          Agent Login
        </button>
      </div>
    </ScreenLayout>
  )
}
