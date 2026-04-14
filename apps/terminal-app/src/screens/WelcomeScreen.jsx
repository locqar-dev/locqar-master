import { ScreenLayout, LocQarLogo } from '../components/Layout'

export default function WelcomeScreen({ onNext }) {
  return (
    <ScreenLayout>
      <div className="flex-1 flex flex-col items-center w-full animate-fade">
        {/* Logo area — Figma: image 1 at Y:260 */}
        <div className="mt-[260px]">
          <LocQarLogo size="lg" />
        </div>

        {/* WELCOME text — Figma: 90px Semi Bold at Y:960 */}
        <div className="mt-auto mb-4 text-center">
          <h2 className="text-[90px] font-semibold text-locqar-dark tracking-[0.2em] uppercase">
            WELCOME
          </h2>
        </div>

        {/* NEXT button — Figma: 476×112, radius 20, at Y:1152 */}
        <div className="mb-auto mt-16">
          <button
            onClick={onNext}
            className="w-[476px] h-[112px] rounded-[20px] text-[28px] font-bold tracking-[0.15em] uppercase
              bg-locqar-red text-white
              hover:bg-red-700 active:scale-[0.97] transition-all shadow-lg"
          >
            NEXT
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}
