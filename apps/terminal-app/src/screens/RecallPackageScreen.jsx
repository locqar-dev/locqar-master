import { useState } from 'react'
import { ScreenLayout, LocQarLogo } from '../components/Layout'
import { ConfirmModal } from '../components/Modal'

const MOCK_PACKAGES = [
  { orderNo: 'ORD-001', orderRef: 'REF-2024-001', dropOffTime: '09:30 AM', mobile: '024****567' },
  { orderNo: 'ORD-002', orderRef: 'REF-2024-002', dropOffTime: '10:15 AM', mobile: '055****890' },
  { orderNo: 'ORD-003', orderRef: 'REF-2024-003', dropOffTime: '11:45 AM', mobile: '020****234' },
]

export default function RecallPackageScreen({ onBack, onRecallDone }) {
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center pt-20 w-full px-8 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-8 max-w-[540px]">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-white/50 uppercase tracking-wider font-medium">Your Packages</p>
            <span className="text-xs text-white/50 bg-white/10 px-3 py-1.5 rounded-full">
              {MOCK_PACKAGES.length} items
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {MOCK_PACKAGES.map((pkg, i) => (
              <button
                key={i}
                onClick={() => setShowConfirm(true)}
                className="w-full flex items-center justify-between px-6 py-5 rounded-2xl
                  border border-white/15 bg-white/10 backdrop-blur-sm
                  hover:bg-white/20 hover:border-white/30 active:scale-[0.99] transition-all text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-white">{pkg.orderNo}</p>
                  <p className="text-sm text-white/50 mt-1">{pkg.mobile}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/50">{pkg.dropOffTime}</p>
                  <p className="text-sm text-locqar-red font-medium mt-1">Recall</p>
                </div>
              </button>
            ))}

            {MOCK_PACKAGES.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-lg text-white/50">No packages to recall</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Locker 3"
          subtitle="Package Recall"
          question="Did you collect the package?"
          onYes={() => { setShowConfirm(false); onRecallDone?.() }}
          onNo={() => setShowConfirm(false)}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </ScreenLayout>
  )
}
