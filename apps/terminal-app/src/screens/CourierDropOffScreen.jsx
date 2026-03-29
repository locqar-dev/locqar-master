import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import NumPad from '../components/NumPad'
import { ScanBarcode } from 'lucide-react'

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
      <div className="flex-1 flex flex-col items-center pt-20 w-full max-w-[480px] px-8 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-6">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">Box Size</p>
          <div className="flex gap-2 mt-3">
            {SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`flex-1 h-14 rounded-xl text-base font-semibold transition-all active:scale-95
                  ${selectedSize === size
                    ? 'bg-locqar-red text-white'
                    : 'bg-white/10 border border-white/15 text-white hover:bg-white/20'
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full mt-6">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Package Details</p>

          <div className="w-full mb-4">
            <button
              onClick={() => setActiveField('barcode')}
              className={`w-full pb-3 text-left border-b transition-colors flex items-center
                ${activeField === 'barcode' ? 'border-white/60' : 'border-white/20'}`}
            >
              <span className={`flex-1 text-lg font-mono ${barcode ? 'text-white' : 'text-white/30'}`}>
                {barcode || 'Scan barcode'}
              </span>
              <ScanBarcode size={20} className="text-white/50" />
            </button>
          </div>

          <div className="w-full mb-6">
            <button
              onClick={() => setActiveField('recipient')}
              className={`w-full pb-3 text-left border-b transition-colors
                ${activeField === 'recipient' ? 'border-white/60' : 'border-white/20'}`}
            >
              <span className={`text-lg font-mono ${recipientNumber ? 'text-white' : 'text-white/30'}`}>
                {recipientNumber || 'Recipient number'}
              </span>
            </button>
          </div>
        </div>

        <NumPad
          mode={inputMode}
          onKey={handleKey}
          onBackspace={handleBackspace}
          onModeToggle={() => setInputMode(m => m === 'num' ? 'abc' : 'num')}
        />

        <button
          onClick={() => recipientNumber && onOpen({ selectedSize, barcode, recipientNumber })}
          disabled={!recipientNumber}
          className="mt-6 w-full max-w-[420px] py-4 rounded-2xl text-lg font-medium
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
