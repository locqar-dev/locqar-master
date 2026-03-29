import { Delete } from 'lucide-react'

export default function NumPad({ onKey, onBackspace, onModeToggle, mode = 'num' }) {
  if (mode === 'abc') {
    return <AlphaPad onKey={onKey} onBackspace={onBackspace} onModeToggle={onModeToggle} />
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[420px]">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKey(key)}
          className="h-[72px] rounded-2xl text-2xl font-medium
            bg-white/10 text-white border border-white/15
            hover:bg-white/20 active:scale-[0.97] transition-all"
        >
          {key}
        </button>
      ))}
      <button
        onClick={onBackspace}
        className="h-[72px] rounded-2xl flex items-center justify-center
          bg-white/10 text-white/60 border border-white/15
          hover:bg-white/20 active:scale-[0.97] transition-all"
      >
        <Delete size={26} />
      </button>
      <button
        onClick={() => onKey('0')}
        className="h-[72px] rounded-2xl text-2xl font-medium
          bg-white/10 text-white border border-white/15
          hover:bg-white/20 active:scale-[0.97] transition-all"
      >
        0
      </button>
      <button
        onClick={onModeToggle}
        className="h-[72px] rounded-2xl text-lg font-medium
          bg-white/5 text-white/50 border border-white/15
          hover:bg-white/15 active:scale-[0.97] transition-all"
      >
        ABC
      </button>
    </div>
  )
}

function AlphaPad({ onKey, onBackspace, onModeToggle }) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ]

  return (
    <div className="flex flex-col gap-2 w-full max-w-[540px]">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-1.5">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className="w-[48px] h-14 rounded-xl text-base font-medium
                bg-white/10 text-white border border-white/15
                hover:bg-white/20 active:scale-[0.97] transition-all"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-2 mt-1">
        <button
          onClick={onBackspace}
          className="h-14 px-6 rounded-xl flex items-center justify-center
            bg-white/10 text-white/60 border border-white/15
            hover:bg-white/20 active:scale-[0.97] transition-all"
        >
          <Delete size={22} />
        </button>
        <button
          onClick={() => onKey(' ')}
          className="h-14 flex-1 rounded-xl text-base font-medium text-white/50
            bg-white/10 border border-white/15
            hover:bg-white/20 active:scale-[0.97] transition-all"
        >
          space
        </button>
        <button
          onClick={onModeToggle}
          className="h-14 px-6 rounded-xl text-base font-medium
            bg-white/5 text-white/50 border border-white/15
            hover:bg-white/15 active:scale-[0.97] transition-all"
        >
          123
        </button>
      </div>
    </div>
  )
}
