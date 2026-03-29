import { ScreenLayout, LocQarLogo } from '../components/Layout'
import { Package, Eye } from 'lucide-react'

export default function CourierDashboard({ onDropOff, onViewPackages, onBack }) {
  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center pt-20 animate-slide">
        <LocQarLogo size="md" />

        <div className="flex flex-col gap-4 mt-16 w-full max-w-[480px]">
          <button
            onClick={onDropOff}
            className="flex items-center gap-6 px-8 py-7 rounded-2xl
              border border-white/15 bg-white/10 backdrop-blur-sm
              hover:bg-white/20 hover:border-white/30 active:scale-[0.98] transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white">Drop Off Package</p>
              <p className="text-sm text-white/50 mt-1">Deliver to locker</p>
            </div>
          </button>

          <button
            onClick={onViewPackages}
            className="flex items-center gap-6 px-8 py-7 rounded-2xl
              border border-white/15 bg-white/10 backdrop-blur-sm
              hover:bg-white/20 hover:border-white/30 active:scale-[0.98] transition-all"
          >
            <div className="w-14 h-14 rounded-xl bg-red-900/30 flex items-center justify-center">
              <Eye size={24} className="text-locqar-red" />
            </div>
            <div className="text-left">
              <p className="text-lg font-semibold text-white">View Packages</p>
              <p className="text-sm text-white/50 mt-1">Manage & recall</p>
            </div>
          </button>
        </div>
      </div>
    </ScreenLayout>
  )
}
