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
      <div className="flex-1 flex flex-col items-center pt-20 w-full max-w-[480px] px-8 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-10">
          <p className="text-sm text-white/50 uppercase tracking-wider font-medium">Pay with Mobile Money</p>
          <div className="w-8 h-px bg-locqar-red mt-3 mb-5 animate-line" />
        </div>

        <p className="text-base text-white/50 text-left w-full mb-10 leading-relaxed">
          This package requires payment. Enter your mobile money number and provider.
        </p>

        <div className="w-full mb-6">
          <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Mobile Number</label>
          <input
            type="tel"
            placeholder="024 000 0000"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className="w-full mt-3 pb-4 border-b border-white/20 text-white text-xl
              placeholder:text-white/25 focus:border-white/60 focus:outline-none transition-colors bg-transparent"
          />
        </div>

        <div className="w-full relative mb-12">
          <label className="text-xs text-white/40 uppercase tracking-wider font-medium">Provider</label>
          <button
            onClick={() => setShowProviders(!showProviders)}
            className="w-full mt-3 pb-4 border-b border-white/20 text-left flex items-center justify-between
              hover:border-white/40 transition-colors"
          >
            <span className={`text-xl ${provider ? 'text-white' : 'text-white/25'}`}>
              {provider || 'Select provider'}
            </span>
            <ChevronDown size={20} className={`text-white/50 transition-transform ${showProviders ? 'rotate-180' : ''}`} />
          </button>
          {showProviders && (
            <div className="absolute top-full left-0 right-0 bg-gray-900/95 backdrop-blur-md border border-white/15 rounded-2xl mt-2 z-20 overflow-hidden">
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setProvider(p); setShowProviders(false) }}
                  className="w-full px-6 py-4 text-left text-lg font-medium text-white
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
          className="w-full py-5 rounded-2xl text-lg font-medium
            bg-locqar-red text-white
            hover:bg-red-700 active:scale-[0.98] transition-all
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Pay Now
        </button>
      </div>
    </ScreenLayout>
  )
}
