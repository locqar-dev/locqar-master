import { useState, useEffect } from 'react'

function LocQarLogo({ size = 'md' }) {
  const sizes = {
    sm: { wrapper: 'w-16 h-16', inner: 'w-12 h-12', icon: 22, text: 'text-xl', sub: 'text-xs' },
    md: { wrapper: 'w-24 h-24', inner: 'w-18 h-18', icon: 34, text: 'text-3xl', sub: 'text-sm' },
    lg: { wrapper: 'w-36 h-36', inner: 'w-28 h-28', icon: 52, text: 'text-5xl', sub: 'text-base' },
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
        <h1 className={`${s.text} font-semibold tracking-tight text-white`}>
          Loc<span className="text-locqar-red">Q</span>ar
        </h1>
        <p className={`${s.sub} text-white/50 tracking-[0.25em] uppercase font-medium`}>
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
    <div className="flex items-center justify-between px-10 py-5 text-base text-white/50 border-t border-white/10 bg-black/40 backdrop-blur-sm">
      <div className="flex items-center gap-4 font-mono">
        <span className="font-medium text-white/80 text-lg">{hours}:{minutes}</span>
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
      className="absolute top-8 left-8 z-10 w-14 h-14 flex items-center justify-center
        rounded-full border border-white/20 text-white bg-white/10 backdrop-blur-sm
        hover:bg-white/20 active:scale-95 transition-all"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </button>
  )
}

function TimerBadge({ seconds }) {
  return (
    <div className="absolute top-8 right-8 z-10 flex items-center gap-2 text-white/70">
      <div className="w-3 h-3 rounded-full bg-locqar-red animate-breathe" />
      <span className="text-lg font-mono font-medium">{seconds}s</span>
    </div>
  )
}

function ScreenLayout({ children, showBack, onBack, showTimer, timerSeconds }) {
  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-black/60" />
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
