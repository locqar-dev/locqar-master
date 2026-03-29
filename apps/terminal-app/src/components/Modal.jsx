import { X } from 'lucide-react'

export default function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade">
      <div className="bg-gray-900/95 backdrop-blur-md rounded-3xl w-[520px] max-w-[90%] p-12 relative animate-scale border border-white/10">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center
              rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={22} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

export function ErrorModal({ title, message, onCancel }) {
  return (
    <Modal>
      <div className="flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-red-900/40 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full bg-locqar-red flex items-center justify-center">
            <span className="text-white text-lg font-bold">!</span>
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          <p className="text-base text-white/60 mt-3 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onCancel}
          className="w-full py-4 rounded-2xl text-base font-medium
            bg-white/15 text-white border border-white/20 hover:bg-white/25 active:scale-[0.98] transition-all"
        >
          Go Back
        </button>
      </div>
    </Modal>
  )
}

export function ConfirmModal({ title, subtitle, question, onYes, onNo, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="flex flex-col items-center text-center gap-5 pt-2">
        <div>
          <h3 className="text-2xl font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-base font-medium text-white/50 mt-2">{subtitle}</p>}
        </div>
        <p className="text-lg text-white">{question}</p>
        <div className="flex gap-4 w-full mt-2">
          <button
            onClick={onYes}
            className="flex-1 py-4 rounded-2xl text-base font-medium
              bg-locqar-red text-white hover:bg-red-700 active:scale-[0.98] transition-all"
          >
            Yes
          </button>
          <button
            onClick={onNo}
            className="flex-1 py-4 rounded-2xl text-base font-medium
              border border-white/20 text-white bg-white/10
              hover:bg-white/20 active:scale-[0.98] transition-all"
          >
            No
          </button>
        </div>
      </div>
    </Modal>
  )
}

export function DoorOpenModal({ doorNumber, instruction, cancelLabel, onCancel }) {
  return (
    <Modal onClose={onCancel}>
      <div className="flex flex-col items-center text-center gap-5 pt-2">
        <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
          <span className="text-4xl font-semibold text-white">{doorNumber}</span>
        </div>
        <div>
          <p className="text-sm text-white/50 uppercase tracking-wider">Locker</p>
          <p className="text-lg font-medium text-white mt-3">{instruction}</p>
        </div>
        {cancelLabel && (
          <p className="text-sm text-locqar-red font-medium">{cancelLabel}</p>
        )}
      </div>
    </Modal>
  )
}
