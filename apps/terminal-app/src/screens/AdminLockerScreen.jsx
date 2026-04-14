import { useState, useEffect, useCallback } from 'react'
import { ScreenLayout } from '../components/Layout'
import {
  Lock, Unlock, RefreshCw, DoorOpen, DoorClosed,
  AlertTriangle, Wifi, WifiOff, Users,
} from 'lucide-react'
import { openDoorLocal, doorControllerHealth } from '../services/api'
import { getConfig } from '../services/config'
import { hasPermission, getRoleInfo } from '../services/staffAuth'

const DOOR_COUNT = 15

function makeDoors(count) {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    status: 'closed',
    occupied: Math.random() > 0.65,
  }))
}

export default function AdminLockerScreen({ staff, onBack, onManageStaff }) {
  const can = (perm) => hasPermission(staff, perm)
  const roleInfo = getRoleInfo(staff?.role)
  const config = getConfig()
  const [doors, setDoors] = useState(() => makeDoors(DOOR_COUNT))
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(null)
  const [controllerOnline, setControllerOnline] = useState(null)
  const [mockMode, setMockMode] = useState(false)
  const [lastRefresh, setLastRefresh] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 15000)
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      const data = await doorControllerHealth()
      setControllerOnline(true)
      setMockMode(false)
      if (data.doors && Array.isArray(data.doors)) {
        setDoors(prev => {
          const updated = [...prev]
          data.doors.forEach((d) => {
            const idx = updated.findIndex(x => x.number === d.number)
            if (idx >= 0) {
              updated[idx] = { ...updated[idx], status: d.status, occupied: d.occupied ?? updated[idx].occupied }
            }
          })
          return updated
        })
      }
      if (data.doorCount && data.doorCount !== doors.length) {
        setDoors(makeDoors(data.doorCount))
      }
    } catch {
      setControllerOnline(false)
      setMockMode(true)
    }
  }

  const mockDelay = () => new Promise(r => setTimeout(r, 300 + Math.random() * 400))

  const openDoor = useCallback(async (doorNum) => {
    setLoading(doorNum)
    if (mockMode) {
      await mockDelay()
      setDoors(prev => prev.map(d =>
        d.number === doorNum ? { ...d, status: 'open' } : d
      ))
      showToast(`Door #${doorNum} opened`, 'success')
    } else {
      try {
        await openDoorLocal(doorNum)
        setDoors(prev => prev.map(d =>
          d.number === doorNum ? { ...d, status: 'open' } : d
        ))
        showToast(`Door #${doorNum} opened`, 'success')
      } catch (err) {
        showToast(`Door #${doorNum}: ${err.message}`, 'error')
      }
    }
    setLoading(null)
  }, [mockMode])

  const resetDoor = useCallback(async (doorNum) => {
    setLoading(doorNum)
    if (mockMode) {
      await mockDelay()
      setDoors(prev => prev.map(d =>
        d.number === doorNum ? { ...d, status: 'closed', occupied: false } : d
      ))
      showToast(`Door #${doorNum} PIN cleared`, 'success')
    } else {
      try {
        const { doorControllerUrl } = config
        await fetch(`${doorControllerUrl.replace(/\/+$/, '')}/door/clear-pin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ door: doorNum }),
        })
        setDoors(prev => prev.map(d =>
          d.number === doorNum ? { ...d, status: 'closed', occupied: false } : d
        ))
        showToast(`Door #${doorNum} PIN cleared`, 'success')
      } catch (err) {
        showToast(`Clear PIN failed: ${err.message}`, 'error')
      }
    }
    setLoading(null)
  }, [mockMode, config])

  const refreshAll = useCallback(async () => {
    setLoading('refresh')
    if (mockMode) {
      await mockDelay()
      setDoors(prev => prev.map(d => ({
        ...d,
        status: d.status === 'open' ? (Math.random() > 0.3 ? 'closed' : 'open') : d.status,
      })))
      setLastRefresh(new Date())
      showToast('Status refreshed (simulated)', 'success')
    } else {
      try {
        const { doorControllerUrl } = config
        const res = await fetch(`${doorControllerUrl.replace(/\/+$/, '')}/door/status`)
        const data = await res.json()
        if (data.doors) {
          setDoors(prev => prev.map(d => {
            const remote = data.doors.find(r => r.number === d.number)
            return remote ? { ...d, status: remote.status, occupied: remote.occupied ?? d.occupied } : d
          }))
        }
        setLastRefresh(new Date())
        showToast('Status refreshed', 'success')
      } catch {
        showToast('Could not reach door controller', 'error')
      }
    }
    setLoading(null)
  }, [mockMode, config])

  const openAllEmpty = useCallback(async () => {
    const emptyDoors = doors.filter(d => !d.occupied && d.status !== 'fault')
    setLoading('all-empty')
    for (const d of emptyDoors) {
      if (mockMode) {
        setDoors(prev => prev.map(x => x.number === d.number ? { ...x, status: 'open' } : x))
      } else {
        try {
          await openDoorLocal(d.number)
          setDoors(prev => prev.map(x => x.number === d.number ? { ...x, status: 'open' } : x))
        } catch { /* continue */ }
      }
    }
    if (mockMode) await mockDelay()
    showToast(`${emptyDoors.length} empty doors opened`, 'success')
    setLoading(null)
  }, [doors, mockMode])

  const openAllOccupied = useCallback(async () => {
    const occupiedDoors = doors.filter(d => d.occupied)
    setLoading('all-occupied')
    for (const d of occupiedDoors) {
      if (mockMode) {
        setDoors(prev => prev.map(x => x.number === d.number ? { ...x, status: 'open' } : x))
      } else {
        try {
          await openDoorLocal(d.number)
          setDoors(prev => prev.map(x => x.number === d.number ? { ...x, status: 'open' } : x))
        } catch { /* continue */ }
      }
    }
    if (mockMode) await mockDelay()
    showToast(`${occupiedDoors.length} occupied doors opened`, 'success')
    setLoading(null)
  }, [doors, mockMode])

  const handleOpenSelected = () => {
    const num = parseInt(selected, 10)
    if (num >= 1 && num <= doors.length) openDoor(num)
    else showToast('Invalid door number', 'error')
  }

  const handleResetSelected = () => {
    const num = parseInt(selected, 10)
    if (num >= 1 && num <= doors.length) resetDoor(num)
    else showToast('Invalid door number', 'error')
  }

  const showToast = (message, type) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCount = doors.filter(d => d.status === 'open').length
  const closedCount = doors.filter(d => d.status === 'closed').length
  const occupiedCount = doors.filter(d => d.occupied).length
  const faultCount = doors.filter(d => d.status === 'fault').length

  return (
    <ScreenLayout showBack onBack={onBack}>
      <div className="flex-1 w-full max-w-[600px] mx-auto px-6 pt-6 pb-4 animate-slide">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Lock size={22} className="text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-locqar-dark">Locker Admin</h1>
                {can('manage_staff') && onManageStaff && (
                  <button
                    onClick={onManageStaff}
                    className="p-1.5 rounded-lg text-locqar-dark/30 hover:text-violet-600
                      hover:bg-violet-100 transition-colors"
                    title="Manage Staff"
                  >
                    <Users size={18} />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-locqar-dark/40 font-mono">{config.lockerSN || 'Not configured'}</p>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-locqar-dark/10 text-locqar-dark/50">
                  {staff?.name} — {roleInfo?.label}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
              ${controllerOnline === true ? 'bg-emerald-100 text-emerald-600' :
                controllerOnline === false ? 'bg-red-100 text-red-600' :
                'bg-locqar-dark/10 text-locqar-dark/40'}`}
            >
              {controllerOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              {controllerOnline === true ? 'Online' :
               controllerOnline === false ? 'Offline' : 'Checking...'}
            </div>
            {mockMode && (
              <span className="text-[10px] text-amber-600 font-medium px-2 py-0.5 rounded-full bg-amber-100">
                MOCK MODE
              </span>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <StatCard label="Closed" value={closedCount} color="emerald" icon={DoorClosed} />
          <StatCard label="Open" value={openCount} color="blue" icon={DoorOpen} />
          <StatCard label="Occupied" value={occupiedCount} color="amber" icon={Lock} />
          <StatCard label="Fault" value={faultCount} color="red" icon={AlertTriangle} />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-sm text-locqar-dark/50 whitespace-nowrap">Door #</label>
            <input
              type="number"
              min={1}
              max={doors.length}
              value={selected}
              onChange={e => setSelected(e.target.value)}
              placeholder="—"
              className="w-20 px-3 py-2.5 bg-white border border-locqar-dark/20 rounded-xl
                text-locqar-dark text-center text-lg font-mono
                placeholder-locqar-dark/30 focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={handleOpenSelected}
            disabled={!selected || !!loading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium
              bg-emerald-600 text-white hover:bg-emerald-500
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-[0.97] transition-all"
          >
            Open
          </button>
          {can('clear_pin') && (
            <button
              onClick={handleResetSelected}
              disabled={!selected || !!loading}
              className="px-5 py-2.5 rounded-xl text-sm font-medium
                bg-white text-locqar-dark border border-locqar-dark/20
                hover:bg-locqar-dark/5 disabled:opacity-40 disabled:cursor-not-allowed
                active:scale-[0.97] transition-all"
            >
              Clear PIN
            </button>
          )}
        </div>

        {/* Bulk actions */}
        <div className="flex gap-2 mb-5">
          {can('bulk_open') && (
            <>
              <button
                onClick={openAllEmpty}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                  bg-blue-600 text-white hover:bg-blue-500
                  disabled:opacity-40 active:scale-[0.98] transition-all"
              >
                <Unlock size={16} />
                Open All Empty
              </button>
              <button
                onClick={openAllOccupied}
                disabled={!!loading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
                  bg-amber-600 text-white hover:bg-amber-500
                  disabled:opacity-40 active:scale-[0.98] transition-all"
              >
                <Unlock size={16} />
                Open All Occupied
              </button>
            </>
          )}
          <button
            onClick={refreshAll}
            disabled={!!loading}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium
              bg-white text-locqar-dark border border-locqar-dark/20
              hover:bg-locqar-dark/5 disabled:opacity-40
              active:scale-[0.98] transition-all ${!can('bulk_open') ? 'flex-1' : ''}`}
          >
            <RefreshCw size={16} className={loading === 'refresh' ? 'animate-spin' : ''} />
            Check
          </button>
        </div>

        {/* Door grid */}
        <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[340px] pr-1">
          {doors.map((door) => (
            <DoorTile
              key={door.number}
              door={door}
              isLoading={loading === door.number}
              onTap={() => {
                setSelected(String(door.number))
                if (door.status === 'closed' || door.status === 'unknown') {
                  openDoor(door.number)
                }
              }}
              onLongPress={can('clear_pin') ? () => resetDoor(door.number) : null}
            />
          ))}
        </div>

        {lastRefresh && (
          <p className="text-center text-xs text-locqar-dark/30 mt-3">
            Last checked: {lastRefresh.toLocaleTimeString()}
          </p>
        )}
      </div>

      {toast && (
        <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl
          text-sm font-medium animate-slide
          ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}
        >
          {toast.message}
        </div>
      )}
    </ScreenLayout>
  )
}

function StatCard({ label, value, color, icon: Icon }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    red: 'bg-red-50 text-red-600 border-red-200',
  }

  return (
    <div className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border ${colors[color]}`}>
      <Icon size={16} />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">{label}</span>
    </div>
  )
}

function DoorTile({ door, isLoading, onTap, onLongPress }) {
  const [pressing, setPressing] = useState(false)
  const [timer, setTimer] = useState(null)

  const handlePointerDown = () => {
    setPressing(true)
    if (onLongPress) {
      const t = setTimeout(() => {
        onLongPress()
        setPressing(false)
      }, 800)
      setTimer(t)
    }
  }

  const handlePointerUp = () => {
    if (pressing) {
      clearTimeout(timer)
      setPressing(false)
      onTap()
    }
  }

  const handlePointerLeave = () => {
    clearTimeout(timer)
    setPressing(false)
  }

  const statusStyles = {
    closed: 'bg-emerald-50 border-emerald-200 text-emerald-600',
    open: 'bg-blue-50 border-blue-200 text-blue-600',
    fault: 'bg-red-50 border-red-200 text-red-600',
    unknown: 'bg-locqar-dark/5 border-locqar-dark/10 text-locqar-dark/40',
  }

  const statusLabel = {
    closed: 'Closed',
    open: 'Open',
    fault: 'Fault',
    unknown: '—',
  }

  return (
    <button
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      disabled={isLoading}
      className={`relative flex flex-col items-center justify-center gap-0.5
        py-3 rounded-xl border transition-all
        active:scale-[0.95]
        ${pressing ? 'ring-2 ring-amber-400' : ''}
        ${statusStyles[door.status]}
        ${isLoading ? 'opacity-50 animate-pulse' : ''}`}
    >
      <span className="text-lg font-bold font-mono">
        {String(door.number).padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-wide">
        {statusLabel[door.status]}
      </span>
      {door.occupied && (
        <div className="absolute top-1 right-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
        </div>
      )}
    </button>
  )
}
