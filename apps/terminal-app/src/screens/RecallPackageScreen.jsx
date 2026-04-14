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
      <div className="flex-1 flex flex-col items-center pt-[100px] w-full px-10 animate-slide">
        <LocQarLogo size="sm" />

        <div className="w-full mt-10 max-w-[800px]">
          {/* Recall Package badge */}
          <div className="mb-8">
            <span className="bg-locqar-red text-white text-[16px] font-bold uppercase tracking-wider px-6 py-3 rounded-lg">
              Recall Package
            </span>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-4 gap-3 px-6 py-4 bg-locqar-dark/10 rounded-t-xl">
            <span className="text-[14px] text-locqar-dark/50 uppercase font-bold">Order No.</span>
            <span className="text-[14px] text-locqar-dark/50 uppercase font-bold">Order Ref.</span>
            <span className="text-[14px] text-locqar-dark/50 uppercase font-bold">Drop Off Time</span>
            <span className="text-[14px] text-locqar-dark/50 uppercase font-bold">Mobile Number</span>
          </div>

          {/* Table body */}
          <div className="bg-locqar-dark/5 rounded-b-xl border border-locqar-dark/10 border-t-0 min-h-[260px]">
            {MOCK_PACKAGES.map((pkg, i) => (
              <button
                key={i}
                onClick={() => setShowConfirm(true)}
                className="w-full grid grid-cols-4 gap-3 px-6 py-5
                  hover:bg-locqar-dark/10 active:scale-[0.99] transition-all text-left
                  border-b border-locqar-dark/5 last:border-0"
              >
                <span className="text-[16px] text-locqar-dark font-medium">{pkg.orderNo}</span>
                <span className="text-[16px] text-locqar-dark/60">{pkg.orderRef}</span>
                <span className="text-[16px] text-locqar-dark/60">{pkg.dropOffTime}</span>
                <span className="text-[16px] text-locqar-dark/60">{pkg.mobile}</span>
              </button>
            ))}

            {MOCK_PACKAGES.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-[22px] text-locqar-dark/40">No packages to recall</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          title="Locker 3"
          subtitle="Package Recall Confirmation"
          question="Did you collect the package?"
          onYes={() => { setShowConfirm(false); onRecallDone?.() }}
          onNo={() => setShowConfirm(false)}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </ScreenLayout>
  )
}
