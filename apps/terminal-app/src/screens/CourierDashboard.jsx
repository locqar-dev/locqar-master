import { ScreenLayout, LocQarLogo } from '../components/Layout'

export default function CourierDashboard({ onDropOff, onViewPackages, onBack }) {
  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center pt-[100px] animate-slide">
        <LocQarLogo size="md" />

        {/* Two big black buttons */}
        <div className="flex flex-col gap-6 mt-[80px] w-full max-w-[760px] px-10">
          <button
            onClick={onDropOff}
            className="w-full py-8 rounded-[20px] text-[24px] font-bold tracking-[0.1em] uppercase
              bg-locqar-dark text-white
              hover:bg-black active:scale-[0.98] transition-all shadow-md"
          >
            DROP OFF PACKAGE
          </button>

          <button
            onClick={onViewPackages}
            className="w-full py-8 rounded-[20px] text-[24px] font-bold tracking-[0.1em] uppercase
              bg-locqar-dark text-white
              hover:bg-black active:scale-[0.98] transition-all shadow-md"
          >
            VIEW YOUR PACKAGES
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}
