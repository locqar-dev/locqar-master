import { ScreenLayout } from '../components/Layout'
import {
  Monitor, RotateCcw, Power, LogOut, Lock, Users, ChevronRight,
} from 'lucide-react'
import { hasPermission, getRoleInfo } from '../services/staffAuth'

export default function AdminMenuScreen({ staff, onLockerManagement, onManageStaff, onExitAdmin, onExitToOS, onRestart, onShutdown }) {
  const roleInfo = getRoleInfo(staff?.role)
  const can = (perm) => hasPermission(staff, perm)

  const menuItems = [
    {
      label: 'Locker Management',
      desc: 'Open doors, check status, clear PINs',
      icon: Lock,
      color: 'amber',
      action: onLockerManagement,
      show: true,
    },
    {
      label: 'Staff Management',
      desc: 'Add, edit, or remove staff accounts',
      icon: Users,
      color: 'violet',
      action: onManageStaff,
      show: can('manage_staff'),
    },
    {
      label: 'Exit to Desktop',
      desc: 'Close kiosk app and return to PC / Android',
      icon: Monitor,
      color: 'blue',
      action: onExitToOS,
      show: true,
    },
    {
      label: 'Restart Kiosk',
      desc: 'Restart the kiosk application',
      icon: RotateCcw,
      color: 'emerald',
      action: onRestart,
      show: true,
    },
    {
      label: 'Shutdown',
      desc: 'Power off the device',
      icon: Power,
      color: 'red',
      action: onShutdown,
      show: true,
    },
  ]

  const colorMap = {
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  }

  return (
    <ScreenLayout>
      <div className="flex-1 w-full max-w-[500px] mx-auto px-6 pt-14 pb-4 animate-slide">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
            <Lock size={28} className="text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-locqar-dark">Admin Panel</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-medium text-locqar-dark">
              {staff?.name}
            </span>
            <span className="text-locqar-dark/30">&mdash;</span>
            <span className="text-sm text-locqar-dark/50">{roleInfo?.label}</span>
          </div>
        </div>

        {/* Menu items */}
        <div className="space-y-3">
          {menuItems.filter(m => m.show).map((item) => {
            const colors = colorMap[item.color] || colorMap.amber
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-full flex items-center gap-4 px-5 py-5 rounded-2xl
                  border border-locqar-dark/10 bg-white/60
                  hover:bg-white hover:border-locqar-dark/20
                  active:scale-[0.98] transition-all text-left"
              >
                <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
                  <item.icon size={22} className={colors.text} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-locqar-dark">{item.label}</p>
                  <p className="text-xs text-locqar-dark/40 mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={18} className="text-locqar-dark/20 shrink-0" />
              </button>
            )
          })}
        </div>

        {/* Exit Admin button at bottom */}
        <button
          onClick={onExitAdmin}
          className="w-full flex items-center justify-center gap-2 mt-8 px-6 py-4 rounded-2xl
            border border-locqar-dark/10 text-locqar-dark/50 hover:text-locqar-dark hover:bg-white/60
            active:scale-[0.98] transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Exit Admin</span>
        </button>
      </div>
    </ScreenLayout>
  )
}
