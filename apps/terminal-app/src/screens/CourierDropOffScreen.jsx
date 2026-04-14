import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import NumPad from '../components/NumPad'
import { Pencil } from 'lucide-react'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

export default function CourierDropOffScreen({ onOpen, onBack }) {
  const [selectedSize, setSelectedSize] = useState('S')
  const [barcode, setBarcode] = useState('')
  const [recipientNumber, setRecipientNumber] = useState('')
  const [activeField, setActiveField] = useState('barcode')
  const [inputMode, setInputMode] = useState('num')

  const handleKey = (key) => {
    if (activeField === 'barcode') {
      setBarcode(prev => prev + key)
    } else {
      if (recipientNumber.length < 10) setRecipientNumber(prev => prev + key)
    }
  }

  const handleBackspace = () => {
    if (activeField === 'barcode') {
      setBarcode(prev => prev.slice(0, -1))
    } else {
      setRecipientNumber(prev => prev.slice(0, -1))
    }
  }

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center pt-[80px] w-full max-w-[700px] px-10 animate-slide">
        {/* Box size selector */}
        <div className="w-full">
          <p className="text-[16px] text-locqar-dark/50 uppercase tracking-wider font-bold mb-4">Select Box Size</p>
          <div className="flex gap-3">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 h-[72px] rounded-xl text-[20px] font-bold transition-all active:scale-95
                  ${selectedSize === size
                    ? 'bg-locqar-red text-white'
                    : 'bg-locqar-dark text-white hover:bg-black'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Drop Off Package heading */}
        <div className="w-full mt-8">
          <p className="text-[18px] text-locqar-dark/60 uppercase tracking-wider font-bold">Drop Off Package</p>
          <div className="w-10 h-[2px] bg-locqar-red mt-3 mb-5 animate-line" />
        </div>

        <p className="text-[14px] text-locqar-dark/40 w-full mb-4 uppercase tracking-wide">
          Scan Bar Code or Enter Manually
        </p>

        {/* Barcode input — dark bar */}
        <button
          onClick={() => setActiveField('barcode')}
          className={`w-full flex items-center bg-locqar-dark rounded-2xl px-8 py-6 mb-4 transition-all
            ${activeField === 'barcode' ? 'ring-2 ring-locqar-red' : ''}`}
        >
          <span className={`flex-1 text-left text-[20px] ${barcode ? 'text-white font-mono' : 'text-white/40'}`}>
            {barcode || 'SCAN BARCODE'}
          </span>
          <Pencil size={20} className="text-white/40" />
        </button>

        {/* Recipient number input — dark bar */}
        <button
          onClick={() => setActiveField('recipient')}
          className={`w-full flex items-center bg-locqar-dark rounded-2xl px-8 py-6 mb-5 transition-all
            ${activeField === 'recipient' ? 'ring-2 ring-locqar-red' : ''}`}
        >
          <span className={`flex-1 text-left text-[20px] ${recipientNumber ? 'text-white font-mono' : 'text-white/40'}`}>
            {recipientNumber || 'RECIPIENT MOBILE NUMBER'}
          </span>
          <Pencil size={20} className="text-white/40" />
        </button>

        <p className="text-[14px] text-locqar-dark/40 w-full mb-4 uppercase tracking-wide">
          Press 'Open'
        </p>

        {/* OPEN button */}
        <div className="w-full mb-5">
          <button
            onClick={() => recipientNumber && onOpen({ selectedSize, barcode, recipientNumber })}
            disabled={!recipientNumber}
            className="px-16 py-5 rounded-[20px] text-[20px] font-bold uppercase tracking-wide
              bg-locqar-red text-white
              hover:bg-red-700 active:scale-[0.98] transition-all
              disabled:opacity-30 disabled:cursor-not-allowed"
          >
            OPEN
          </button>
        </div>

        <NumPad
          mode={inputMode}
          onKey={handleKey}
          onBackspace={handleBackspace}
          onModeToggle={() => setInputMode(m => m === 'num' ? 'abc' : 'num')}
        />
      </div>
    </ScreenLayout>
  )
}
