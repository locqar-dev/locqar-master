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
      <div className="flex-1 flex flex-col items-center justify-center animate-fade px-10">
        <LocQarLogo size="md" />

        <p className="text-sm text-white/50 uppercase tracking-wider font-medium mt-10">
          {isDropoff ? 'Drop Off Your Package' : 'Pick Up Your Package'}
        </p>

        <div className="flex items-center gap-10 mt-14">
          <span className="text-base text-white/50 uppercase tracking-wider">Door</span>
          <div className="w-28 h-28 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-5xl font-semibold text-white">{doorNumber}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-breathe" />
            <span className="text-base text-green-400 font-medium">Open</span>
          </div>
        </div>

        <p className="text-lg text-white/50 mt-10 text-center">
          {isDropoff
            ? 'Please close door when package is stored'
            : 'Please close door after retrieval'
          }
        </p>

        {isDropoff && (
          <div className="flex gap-4 mt-14">
            <button
              onClick={onCancel}
              className="px-10 py-4 rounded-2xl text-base font-medium
                border border-white/20 text-white bg-white/10
                hover:bg-white/20 active:scale-[0.98] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onDone}
              className="px-12 py-4 rounded-2xl text-base font-medium
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
