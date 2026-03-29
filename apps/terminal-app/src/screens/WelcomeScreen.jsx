import { ScreenLayout, LocQarLogo } from '../components/Layout'

export default function WelcomeScreen({ onNext }) {
  return (
    <ScreenLayout>
      <div className="flex-1 flex flex-col items-center w-full animate-fade">
        {/* Logo area - positioned in upper portion like Figma (260/1920 ≈ 14% from top) */}
        <div className="mt-[14%]">
          <LocQarLogo size="lg" />
        </div>

        {/* WELCOME text - positioned at center like Figma (960/1920 ≈ 50%) */}
        <div className="mt-auto mb-4 text-center">
          <h2 className="text-5xl font-bold text-white tracking-[0.2em] uppercase">
            WELCOME
          </h2>
        </div>

        {/* NEXT button - rectangular like Figma (476x112 rectangle) */}
        <div className="mb-auto mt-12">
          <button
            onClick={onNext}
            className="px-24 py-6 rounded-2xl text-xl font-bold tracking-[0.15em] uppercase
              bg-locqar-red text-white
              hover:bg-red-700 active:scale-[0.97] transition-all"
          >
            NEXT
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}
