import { useEffect } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import { Check } from 'lucide-react'

export default function ThankYouScreen({ message = 'See you next time', onTimeout }) {
  useEffect(() => {
    const timer = setTimeout(() => onTimeout?.(), 4000)
    return () => clearTimeout(timer)
  }, [onTimeout])

  return (
    <ScreenLayout>
      <div className="flex-1 flex flex-col items-center justify-center animate-fade">
        <div className="w-24 h-24 rounded-full bg-green-900/30 flex items-center justify-center mb-10">
          <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center">
            <Check size={32} className="text-white" strokeWidth={2.5} />
          </div>
        </div>

        <h2 className="text-4xl font-light text-white tracking-wide">Thank You</h2>
        <div className="w-12 h-px bg-locqar-red mx-auto mt-4 animate-line" />
        <p className="text-lg text-white/50 mt-5">{message}</p>

        <div className="mt-14">
          <LocQarLogo size="sm" />
        </div>
      </div>
    </ScreenLayout>
  )
}
