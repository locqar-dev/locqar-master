import { useRef } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'

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
      <div className="flex-1 flex flex-col items-center pt-[80px] animate-slide w-full">
        <div onClick={handleLogoTap} className="cursor-pointer">
          <LocQarLogo size="md" />
        </div>

        {/* Main action buttons — Figma: ~760px wide, stacked */}
        <div className="flex flex-col gap-6 mt-[80px] w-full max-w-[760px] px-10">
          <button
            onClick={onDropOff}
            className="w-full py-8 rounded-[20px] text-[24px] font-bold tracking-[0.1em] uppercase
              bg-locqar-dark text-white
              hover:bg-black active:scale-[0.98] transition-all shadow-md"
          >
            DROP OFF PACKAGE
          </button>

          <button
            onClick={onPickUp}
            className="w-full py-8 rounded-[20px] text-[24px] font-bold tracking-[0.1em] uppercase
              bg-locqar-dark text-white
              hover:bg-black active:scale-[0.98] transition-all shadow-md"
          >
            PICK UP PACKAGE
          </button>
        </div>
      </div>

      {/* Bottom login buttons — red pills in corners */}
      <div className="flex justify-between items-center w-full px-10 pb-4 relative z-10">
        <button
          onClick={onStudentLogin}
          className="px-8 py-4 rounded-2xl text-[16px] font-bold uppercase tracking-wide
            bg-locqar-red text-white
            hover:bg-red-700 active:scale-[0.97] transition-all shadow-sm"
        >
          Student Login
        </button>
        <button
          onClick={onAgentLogin}
          className="px-8 py-4 rounded-2xl text-[16px] font-bold uppercase tracking-wide
            bg-locqar-red text-white
            hover:bg-red-700 active:scale-[0.97] transition-all shadow-sm"
        >
          Agent Login
        </button>
      </div>
    </ScreenLayout>
  )
}
