import { useState, useEffect } from 'react'

function LocQarLogo({ size = 'md' }) {
  const sizes = {
    sm: { wrapper: 'w-[140px] h-[140px]', inner: 'w-[108px] h-[108px]', icon: 48, text: 'text-[36px]', sub: 'text-[16px]' },
    md: { wrapper: 'w-[200px] h-[200px]', inner: 'w-[156px] h-[156px]', icon: 68, text: 'text-[48px]', sub: 'text-[18px]' },
    lg: { wrapper: 'w-[280px] h-[280px]', inner: 'w-[220px] h-[220px]', icon: 96, text: 'text-[64px]', sub: 'text-[22px]' },
  }
  const s = sizes[size]
  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${s.wrapper} rounded-full bg-locqar-red flex items-center justify-center`}>
        <div className={`${s.inner} rounded-full bg-white flex items-center justify-center`}>
          <svg viewBox="0 0 40 50" width={s.icon} height={s.icon} fill="none">
            <circle cx="20" cy="16" r="12" stroke="#dc2626" strokeWidth="3" />
            <rect x="17" y="24" width="6" height="18" rx="3" fill="#dc2626" />
            <circle cx="20" cy="16" r="4" fill="#dc2626" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h1 className={`${s.text} font-semibold tracking-tight text-locqar-dark`}>
          Loc<span className="text-locqar-red">Q</span>ar
        </h1>
        <p className={`${s.sub} text-locqar-muted tracking-[0.25em] uppercase font-medium`}>
          Pick N Go
        </p>
      </div>
    </div>
  )
}

function StatusBar() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const hours = time.getHours().toString().padStart(2, '0')
  const minutes = time.getMinutes().toString().padStart(2, '0')
  const date = time.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="flex items-center justify-between px-12 py-6 text-[18px] text-locqar-dark/70">
      <div className="flex items-center gap-5 font-mono">
        <span className="font-medium text-locqar-dark text-[22px]">{hours}:{minutes}</span>
        <span>{date}</span>
      </div>
      <span className="tracking-wide">Helpline: 030-825-0086</span>
    </div>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="absolute top-10 left-10 z-30 w-16 h-16 flex items-center justify-center
        rounded-full text-locqar-dark/70
        hover:bg-black/10 active:scale-95 transition-all"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  )
}

function TimerBadge({ seconds }) {
  return (
    <div className="absolute top-10 right-10 z-10 flex items-center gap-3 text-locqar-dark/70">
      <div className="w-4 h-4 rounded-full bg-locqar-red animate-breathe" />
      <span className="text-[22px] font-mono font-medium">{seconds}s</span>
    </div>
  )
}

function ScreenLayout({ children, showBack, onBack, showTimer, timerSeconds }) {
  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* LocQar background image */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/bg.png)',
          backgroundSize: '100% 100%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {showBack && <BackButton onClick={onBack} />}
      {showTimer && <TimerBadge seconds={timerSeconds} />}

      <div className="flex-1 flex flex-col items-center relative z-10 overflow-y-auto">
        {children}
      </div>

      <div className="relative z-10">
        <StatusBar />
      </div>
    </div>
  )
}

export { LocQarLogo, StatusBar, BackButton, TimerBadge, ScreenLayout }
