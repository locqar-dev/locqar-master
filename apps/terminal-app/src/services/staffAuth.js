/**
 * Staff authentication & role management — fully offline via localStorage.
 *
 * Supports two types of staff records:
 *   - Local-only: has `pin` field (plain text), created on the kiosk
 *   - Cloud-synced: has `pinHash` field (bcrypt), synced from dashboard API
 *
 * Roles:
 *   manager    — full access: open, clear PIN, bulk ops, manage staff
 *   technician — open doors, clear PIN, check status
 *   attendant  — open individual doors, check status only
 */

import bcrypt from 'bcryptjs'

const STORAGE_KEY = 'locqar_staff_accounts'

export const ROLES = {
  manager: {
    label: 'Manager',
    color: 'amber',
    permissions: ['open_door', 'clear_pin', 'bulk_open', 'check_status', 'manage_staff'],
  },
  technician: {
    label: 'Technician',
    color: 'blue',
    permissions: ['open_door', 'clear_pin', 'check_status'],
  },
  attendant: {
    label: 'Attendant',
    color: 'emerald',
    permissions: ['open_door', 'check_status'],
  },
}

// Default accounts seeded on first use
const DEFAULT_ACCOUNTS = [
  { id: '1', name: 'Admin', pin: '1234', role: 'manager', active: true, createdAt: Date.now() },
  { id: '2', name: 'Kofi', pin: '5678', role: 'technician', active: true, createdAt: Date.now() },
  { id: '3', name: 'Ama', pin: '9012', role: 'attendant', active: true, createdAt: Date.now() },
]

// ── Helpers ──

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      save(DEFAULT_ACCOUNTS)
      return DEFAULT_ACCOUNTS
    }
    return JSON.parse(raw)
  } catch {
    return DEFAULT_ACCOUNTS
  }
}

function save(accounts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

function nextId(accounts) {
  const max = accounts.reduce((m, a) => Math.max(m, parseInt(a.id, 10) || 0), 0)
  return String(max + 1)
}

// ── Public API ──

/**
 * Authenticate by PIN.
 * Checks local plain-PIN accounts first (instant), then cloud bcrypt accounts.
 * Returns staff object or null.
 */
export async function authenticate(pin) {
  const accounts = load()

  // 1. Fast pass: check local accounts with plain PINs
  const localMatch = accounts.find(a => a.pin === pin && a.active)
  if (localMatch) return localMatch

  // 2. Slow pass: check cloud accounts with bcrypt hashes
  for (const account of accounts) {
    if (!account.active || !account.pinHash) continue
    try {
      const match = await bcrypt.compare(pin, account.pinHash)
      if (match) return account
    } catch {
      // Invalid hash format — skip
    }
  }

  return null
}

/**
 * Synchronous authenticate — only checks plain-PIN accounts.
 * Use this when you need instant response (e.g., during PIN entry animation).
 * Falls back to null if only bcrypt accounts exist.
 */
export function authenticateSync(pin) {
  const accounts = load()
  return accounts.find(a => a.pin === pin && a.active) || null
}

/** Get all staff accounts. */
export function getStaffAccounts() {
  return load()
}

/** Add a new staff member. Returns the created account or throws. */
export function addStaff({ name, pin, role }) {
  if (!name || !pin || !role) throw new Error('Name, PIN, and role are required')
  if (pin.length < 4 || pin.length > 6) throw new Error('PIN must be 4-6 digits')
  if (!ROLES[role]) throw new Error('Invalid role')

  const accounts = load()
  if (accounts.find(a => a.pin === pin && a.active)) {
    throw new Error('PIN already in use by another staff member')
  }

  const account = {
    id: nextId(accounts),
    name: name.trim(),
    pin,
    role,
    active: true,
    createdAt: Date.now(),
    source: 'local', // marks it as locally created (eligible for cloud push)
  }
  accounts.push(account)
  save(accounts)
  return account
}

/** Update an existing staff member. */
export function updateStaff(id, updates) {
  const accounts = load()
  const idx = accounts.findIndex(a => a.id === id)
  if (idx < 0) throw new Error('Staff not found')

  // If changing PIN, check uniqueness
  if (updates.pin && updates.pin !== accounts[idx].pin) {
    if (updates.pin.length < 4 || updates.pin.length > 6) throw new Error('PIN must be 4-6 digits')
    if (accounts.find(a => a.pin === updates.pin && a.active && a.id !== id)) {
      throw new Error('PIN already in use')
    }
  }

  accounts[idx] = { ...accounts[idx], ...updates }
  save(accounts)
  return accounts[idx]
}

/** Deactivate (soft-delete) a staff member. Cannot deactivate the last manager. */
export function removeStaff(id) {
  const accounts = load()
  const target = accounts.find(a => a.id === id)
  if (!target) throw new Error('Staff not found')

  // Prevent removing the last active manager
  const activeManagers = accounts.filter(a => a.role === 'manager' && a.active && a.id !== id)
  if (target.role === 'manager' && activeManagers.length === 0) {
    throw new Error('Cannot remove the last manager')
  }

  target.active = false
  save(accounts)
}

/** Check if a staff member has a specific permission. */
export function hasPermission(staff, permission) {
  if (!staff || !staff.role) return false
  const role = ROLES[staff.role]
  return role ? role.permissions.includes(permission) : false
}

/** Get role metadata. */
export function getRoleInfo(roleKey) {
  return ROLES[roleKey] || null
}
