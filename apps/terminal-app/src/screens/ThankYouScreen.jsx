import { useEffect } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'

export default function ThankYouScreen({ message = 'See you next time', onTimeout }) {
  useEffect(() => {
    const timer = setTimeout(() => onTimeout?.(), 4000)
    return () => clearTimeout(timer)
  }, [onTimeout])

  return (
    <ScreenLayout>
      <div className="flex-1 flex flex-col items-center justify-center animate-fade">
        <LocQarLogo size="md" />

        <h2 className="text-[90px] font-bold text-locqar-dark tracking-wide mt-20 uppercase">
          Thank You !
        </h2>

        <p className="text-[24px] text-locqar-dark/50 mt-8 uppercase tracking-wider font-medium">
          {message}
        </p>
      </div>
    </ScreenLayout>
  )
}
