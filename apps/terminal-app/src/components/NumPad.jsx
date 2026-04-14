import { Delete } from 'lucide-react'

export default function NumPad({ onKey, onBackspace, onModeToggle, mode = 'num' }) {
  if (mode === 'abc') {
    return <AlphaPad onKey={onKey} onBackspace={onBackspace} onModeToggle={onModeToggle} />
  }

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-[620px]">
      {keys.map((key) => (
        <button
          key={key}
          onClick={() => onKey(key)}
          className="h-[100px] rounded-2xl text-[32px] font-medium
            bg-locqar-dark text-white
            hover:bg-black active:scale-[0.97] transition-all"
        >
          {key}
        </button>
      ))}
      <button
        onClick={onBackspace}
        className="h-[100px] rounded-2xl flex items-center justify-center
          bg-locqar-dark text-white/60
          hover:bg-black active:scale-[0.97] transition-all"
      >
        <Delete size={34} />
      </button>
      <button
        onClick={() => onKey('0')}
        className="h-[100px] rounded-2xl text-[32px] font-medium
          bg-locqar-dark text-white
          hover:bg-black active:scale-[0.97] transition-all"
      >
        0
      </button>
      <button
        onClick={onModeToggle}
        className="h-[100px] rounded-2xl text-[24px] font-medium
          bg-gray-400/40 text-locqar-dark/70
          hover:bg-gray-400/60 active:scale-[0.97] transition-all"
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
    <div className="flex flex-col gap-3 w-full max-w-[760px]">
      {rows.map((row, i) => (
        <div key={i} className="flex justify-center gap-2">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKey(key)}
              className="w-[64px] h-[72px] rounded-xl text-[20px] font-medium
                bg-locqar-dark text-white
                hover:bg-black active:scale-[0.97] transition-all"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
      <div className="flex justify-center gap-3 mt-1">
        <button
          onClick={onBackspace}
          className="h-[72px] px-8 rounded-xl flex items-center justify-center
            bg-locqar-dark text-white/60
            hover:bg-black active:scale-[0.97] transition-all"
        >
          <Delete size={28} />
        </button>
        <button
          onClick={() => onKey(' ')}
          className="h-[72px] flex-1 rounded-xl text-[20px] font-medium text-white/70
            bg-locqar-dark
            hover:bg-black active:scale-[0.97] transition-all"
        >
          space
        </button>
        <button
          onClick={onModeToggle}
          className="h-[72px] px-8 rounded-xl text-[20px] font-medium
            bg-gray-400/40 text-locqar-dark/70
            hover:bg-gray-400/60 active:scale-[0.97] transition-all"
        >
          123
        </button>
      </div>
    </div>
  )
}
