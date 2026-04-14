import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import { ChevronDown } from 'lucide-react'

const PROVIDERS = ['MTN', 'Vodafone', 'AirtelTigo']

export default function MobileMoneyScreen({ onPay, onBack }) {
  const [mobileNumber, setMobileNumber] = useState('')
  const [provider, setProvider] = useState('')
  const [showProviders, setShowProviders] = useState(false)

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center pt-[100px] w-full max-w-[700px] px-10 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-12">
          <p className="text-[18px] text-locqar-dark/60 uppercase tracking-wider font-bold">Pay with Mobile Money</p>
          <div className="w-10 h-[2px] bg-locqar-red mt-4 mb-6 animate-line" />
        </div>

        <p className="text-[18px] text-locqar-dark/50 text-left w-full mb-12 leading-relaxed">
          This package requires payment. Enter your mobile money number and provider to start the payment.
        </p>

        {/* Mobile number input — dark bar */}
        <div className="w-full mb-8">
          <div className="w-full flex items-center bg-locqar-dark rounded-2xl px-8 py-7">
            <input
              type="tel"
              placeholder="MOBILE NUMBER"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="flex-1 text-white text-[22px] placeholder:text-white/40 bg-transparent focus:outline-none uppercase tracking-wide"
            />
          </div>
        </div>

        {/* Provider selector — dark bar */}
        <div className="w-full relative mb-14">
          <button
            onClick={() => setShowProviders(!showProviders)}
            className="w-full flex items-center justify-between bg-locqar-dark rounded-2xl px-8 py-7"
          >
            <span className={`text-[22px] uppercase tracking-wide ${provider ? 'text-white' : 'text-white/40'}`}>
              {provider || 'SELECT PROVIDER'}
            </span>
            <ChevronDown size={24} className={`text-white/50 transition-transform ${showProviders ? 'rotate-180' : ''}`} />
          </button>
          {showProviders && (
            <div className="absolute top-full left-0 right-0 bg-locqar-dark border border-white/10 rounded-2xl mt-2 z-20 overflow-hidden">
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setProvider(p); setShowProviders(false) }}
                  className="w-full px-8 py-5 text-left text-[22px] font-medium text-white
                    hover:bg-white/10 transition-colors border-b border-white/10 last:border-0"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => mobileNumber && provider && onPay({ mobileNumber, provider })}
          disabled={!mobileNumber || !provider}
          className="w-full py-7 rounded-[20px] text-[22px] font-bold uppercase tracking-wide
            bg-locqar-dark text-white
            hover:bg-black active:scale-[0.98] transition-all
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Pay Now
        </button>
      </div>
    </ScreenLayout>
  )
}
