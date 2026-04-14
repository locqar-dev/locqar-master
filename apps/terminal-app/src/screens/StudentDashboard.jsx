import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'

const SIZES = [
  { label: 'XS' },
  { label: 'S' },
  { label: 'M' },
  { label: 'L' },
]

export default function StudentDashboard({ onSelectSize, onBack }) {
  const [selected, setSelected] = useState(null)

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center justify-center animate-slide">
        <LocQarLogo size="sm" />

        <div className="mt-12 text-center">
          <p className="text-[20px] text-locqar-dark/70 uppercase tracking-wider font-bold">
            Please Select Box Size
          </p>
        </div>

        {/* Size buttons — black squares, red when selected */}
        <div className="flex gap-6 mt-16">
          {SIZES.map(({ label }) => (
            <button
              key={label}
              onClick={() => setSelected(label)}
              className={`w-[140px] h-[140px] rounded-2xl flex items-center justify-center transition-all active:scale-95
                ${selected === label
                  ? 'bg-locqar-red text-white'
                  : 'bg-locqar-dark text-white hover:bg-black'
                }`}
            >
              <span className="text-[36px] font-bold">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onSelectSize(selected)}
          disabled={!selected}
          className="mt-16 w-[476px] h-[112px] rounded-[20px] text-[24px] font-bold uppercase tracking-wide
            bg-locqar-red text-white
            hover:bg-red-700 active:scale-[0.98] transition-all
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          OPEN
        </button>
      </div>
    </ScreenLayout>
  )
}
