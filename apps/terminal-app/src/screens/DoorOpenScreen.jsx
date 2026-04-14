import { useState, useEffect } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'

export default function DoorOpenScreen({ type = 'dropoff', doorNumber = 3, onDone, onCancel }) {
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onDone?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [onDone])

  const isDropoff = type === 'dropoff'

  return (
    <ScreenLayout showTimer timerSeconds={countdown}>
      <div className="flex-1 flex flex-col items-center justify-center animate-fade px-12">
        <LocQarLogo size="md" />

        <p className="text-[20px] text-locqar-dark/70 uppercase tracking-wider font-bold mt-12">
          {isDropoff ? 'Drop Off Your Package' : 'Pick Up Your Package'}
        </p>

        {/* DOOR / Number / OPEN indicator */}
        <div className="flex items-center gap-10 mt-16">
          <span className="text-[20px] text-locqar-dark/50 uppercase tracking-wider font-medium">Door</span>
          <div className="w-[160px] h-[160px] rounded-2xl bg-locqar-dark flex items-center justify-center">
            <span className="text-[72px] font-bold text-white">{doorNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-green-500 animate-breathe" />
            <span className="text-[20px] text-green-600 font-bold uppercase">Open</span>
          </div>
        </div>

        <p className="text-[20px] text-locqar-dark/60 mt-12 text-center uppercase tracking-wide font-medium">
          {isDropoff
            ? 'Please close door when package is stored'
            : 'Please close door'
          }
        </p>

        {isDropoff && (
          <div className="flex gap-5 mt-16">
            <button
              onClick={onCancel}
              className="px-14 py-5 rounded-[20px] text-[20px] font-bold uppercase
                bg-locqar-dark text-white
                hover:bg-black active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onDone}
              className="px-16 py-5 rounded-[20px] text-[20px] font-bold uppercase
                bg-locqar-red text-white
                hover:bg-red-700 active:scale-[0.98] transition-all"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </ScreenLayout>
  )
}
