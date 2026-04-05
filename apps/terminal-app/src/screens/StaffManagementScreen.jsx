import { useState } from 'react'
import { ScreenLayout } from '../components/Layout'
import NumPad from '../components/NumPad'
import {
  getStaffAccounts, addStaff, removeStaff, updateStaff,
  ROLES, getRoleInfo,
} from '../services/staffAuth'
import {
  Users, Plus, Trash2, Edit3, ChevronLeft, Shield, Check, X,
} from 'lucide-react'

export default function StaffManagementScreen({ currentStaff, onBack }) {
  const [accounts, setAccounts] = useState(() => getStaffAccounts().filter(a => a.active))
  const [view, setView] = useState('list') // list | add | edit | editPin
  const [editTarget, setEditTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const refresh = () => setAccounts(getStaffAccounts().filter(a => a.active))

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── List view ──
  if (view === 'list') {
    return (
      <ScreenLayout showBack onBack={onBack}>
        <div className="flex-1 w-full max-w-[500px] mx-auto px-6 pt-6 pb-4 animate-slide">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Users size={22} className="text-violet-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white">Staff Management</h1>
                <p className="text-xs text-white/40">{accounts.length} active staff</p>
              </div>
            </div>
            <button
              onClick={() => setView('add')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                bg-violet-600 text-white hover:bg-violet-500
                active:scale-[0.97] transition-all"
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {/* Role legend */}
          <div className="flex gap-3 mb-5">
            {Object.entries(ROLES).map(([key, role]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-full bg-${role.color}-400`} />
                <span className="text-xs text-white/50">{role.label}</span>
              </div>
            ))}
          </div>

          {/* Staff list */}
          <div className="space-y-2 overflow-y-auto max-h-[500px]">
            {accounts.map((staff) => {
              const role = getRoleInfo(staff.role)
              const isSelf = staff.id === currentStaff?.id
              return (
                <div
                  key={staff.id}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl
                    bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl bg-${role?.color || 'white'}-500/20
                    flex items-center justify-center shrink-0`}
                  >
                    <Shield size={18} className={`text-${role?.color || 'white'}-400`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium text-white truncate">{staff.name}</p>
                      {isSelf && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/40">YOU</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-medium text-${role?.color || 'white'}-400`}>
                        {role?.label || staff.role}
                      </span>
                      <span className="text-xs text-white/30">PIN: {'*'.repeat(staff.pin.length)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => { setEditTarget(staff); setView('edit') }}
                      className="p-2.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    {!isSelf && (
                      <button
                        onClick={() => {
                          try {
                            removeStaff(staff.id)
                            refresh()
                            showToast(`${staff.name} removed`)
                          } catch (err) {
                            showToast(err.message, 'error')
                          }
                        }}
                        className="p-2.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {toast && (
          <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl
            text-sm font-medium backdrop-blur-sm animate-slide
            ${toast.type === 'success' ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}
          >
            {toast.message}
          </div>
        )}
      </ScreenLayout>
    )
  }

  // ── Add view ──
  if (view === 'add') {
    return (
      <AddEditStaff
        mode="add"
        onSave={(data) => {
          try {
            addStaff(data)
            refresh()
            showToast(`${data.name} added as ${ROLES[data.role].label}`)
            setView('list')
          } catch (err) {
            showToast(err.message, 'error')
          }
        }}
        onBack={() => setView('list')}
      />
    )
  }

  // ── Edit view ──
  if (view === 'edit' && editTarget) {
    return (
      <AddEditStaff
        mode="edit"
        initial={editTarget}
        onSave={(data) => {
          try {
            updateStaff(editTarget.id, data)
            refresh()
            showToast(`${data.name || editTarget.name} updated`)
            setView('list')
          } catch (err) {
            showToast(err.message, 'error')
          }
        }}
        onBack={() => { setEditTarget(null); setView('list') }}
      />
    )
  }

  return null
}


// ── Add / Edit sub-screen ──

function AddEditStaff({ mode, initial, onSave, onBack }) {
  const [name, setName] = useState(initial?.name || '')
  const [role, setRole] = useState(initial?.role || 'attendant')
  const [step, setStep] = useState('info') // info | pin
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!name.trim()) { setError('Name is required'); return }
    setError('')
    setStep('pin')
  }

  const handlePinKey = (key) => {
    setError('')
    const next = pin + key
    if (next.length <= 6) setPin(next)
  }

  const handlePinBackspace = () => {
    setError('')
    setPin(p => p.slice(0, -1))
  }

  const handleSave = () => {
    if (pin.length < 4) { setError('PIN must be at least 4 digits'); return }
    onSave({ name: name.trim(), pin, role })
  }

  const handleSaveWithoutPinChange = () => {
    onSave({ name: name.trim(), role })
  }

  if (step === 'pin') {
    return (
      <ScreenLayout showBack onBack={() => setStep('info')}>
        <div className="flex-1 flex flex-col items-center justify-center animate-slide px-6">
          <h2 className="text-xl font-semibold text-white mb-2">
            {mode === 'edit' ? 'Change PIN' : 'Set PIN'}
          </h2>
          <p className="text-sm text-white/50 mb-6">
            {name} — {ROLES[role].label}
          </p>

          {/* PIN dots */}
          <div className="flex gap-3 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200
                  ${i < pin.length ? 'bg-violet-400 border-violet-400' : 'border-white/30'}`}
              />
            ))}
          </div>

          {error && <p className="text-locqar-red text-sm font-medium mb-3">{error}</p>}

          <NumPad onKey={handlePinKey} onBackspace={handlePinBackspace} />

          <button
            onClick={handleSave}
            disabled={pin.length < 4}
            className="mt-6 px-8 py-3 rounded-xl text-sm font-medium
              bg-violet-600 text-white hover:bg-violet-500
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-[0.97] transition-all"
          >
            <div className="flex items-center gap-2">
              <Check size={16} />
              {mode === 'edit' ? 'Update' : 'Create Staff'}
            </div>
          </button>
        </div>
      </ScreenLayout>
    )
  }

  // Info step
  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 flex flex-col items-center pt-12 animate-slide px-6">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mb-6">
          {mode === 'edit' ? <Edit3 size={28} className="text-violet-400" /> : <Plus size={28} className="text-violet-400" />}
        </div>
        <h2 className="text-xl font-semibold text-white mb-8">
          {mode === 'edit' ? 'Edit Staff' : 'Add Staff'}
        </h2>

        <div className="w-full max-w-[400px] space-y-5">
          {/* Name */}
          <div>
            <label className="text-sm text-white/50 mb-1.5 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Staff member name"
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl
                text-white placeholder-white/30 text-base
                focus:outline-none focus:border-violet-400/60"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-sm text-white/50 mb-2 block">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ROLES).map(([key, r]) => (
                <button
                  key={key}
                  onClick={() => setRole(key)}
                  className={`flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border-2
                    transition-all active:scale-[0.97]
                    ${role === key
                      ? `border-${r.color}-400 bg-${r.color}-500/20`
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                >
                  <Shield size={20} className={role === key ? `text-${r.color}-400` : 'text-white/40'} />
                  <span className={`text-sm font-medium ${role === key ? `text-${r.color}-400` : 'text-white/50'}`}>
                    {r.label}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {r.permissions.length} perms
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Role permissions preview */}
          <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {ROLES[role].permissions.map((perm) => (
                <span key={perm} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/60">
                  {perm.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {error && <p className="text-locqar-red text-sm font-medium">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-3 rounded-xl text-sm font-medium
                bg-violet-600 text-white hover:bg-violet-500
                active:scale-[0.97] transition-all"
            >
              {mode === 'edit' ? 'Change PIN' : 'Next — Set PIN'}
            </button>
            {mode === 'edit' && (
              <button
                onClick={handleSaveWithoutPinChange}
                className="flex-1 px-6 py-3 rounded-xl text-sm font-medium
                  bg-white/10 text-white border border-white/20
                  hover:bg-white/20 active:scale-[0.97] transition-all"
              >
                Save (Keep PIN)
              </button>
            )}
          </div>
        </div>
      </div>
    </ScreenLayout>
  )
}
