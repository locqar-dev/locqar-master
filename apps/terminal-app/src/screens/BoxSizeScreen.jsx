import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'

const SIZES = [
  { label: 'XS', desc: 'Extra Small' },
  { label: 'S', desc: 'Small' },
  { label: 'M', desc: 'Medium' },
  { label: 'L', desc: 'Large' },
]

export default function BoxSizeScreen({ onSelect, onBack }) {
  const [selected, setSelected] = useState(null)

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center justify-center animate-slide">
        <LocQarLogo size="sm" />

        <div className="mt-10 text-center">
          <p className="text-sm text-white/50 uppercase tracking-wider font-medium">Select Box Size</p>
          <div className="w-8 h-px bg-locqar-red mx-auto mt-3 animate-line" />
        </div>

        <div className="flex gap-5 mt-14">
          {SIZES.map(({ label, desc }) => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              className={`w-24 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-95
                ${selected === label
                  ? 'bg-locqar-red text-white'
                  : 'bg-white/10 border border-white/15 text-white hover:bg-white/20'
                }`}
            >
              <span className="text-2xl font-semibold">{label}</span>
              <span className={`text-[10px] uppercase tracking-wider ${selected === label ? 'text-white/70' : 'text-white/40'}`}>
                {desc}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          className="mt-14 px-20 py-5 rounded-2xl text-lg font-medium
            bg-locqar-red text-white
            hover:bg-red-700 active:scale-[0.98] transition-all
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Open Locker
        </button>
      </div>
    </ScreenLayout>
  )
}
