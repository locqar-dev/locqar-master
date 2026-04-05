/**
 * Staff Sync Service
 * ==================
 * Syncs staff accounts between the cloud API and localStorage.
 *
 * Flow:
 *   1. On boot + every SYNC_INTERVAL, pull staff from API
 *   2. Merge into localStorage (cloud is source of truth when online)
 *   3. Local-only accounts (created offline) are pushed up when online
 *   4. When offline, the kiosk uses whatever was last synced
 *
 * The API returns pin_hash (bcrypt) — the kiosk compares entered PINs
 * against hashes using a lightweight bcrypt check.
 */

import { getConfig } from './config'

const SYNC_STORAGE_KEY = 'locqar_staff_sync'
const LAST_SYNC_KEY = 'locqar_staff_last_sync'
const LOCAL_QUEUE_KEY = 'locqar_staff_push_queue'

// ── API helpers ──

function cfg() { return getConfig() }

async function apiFetch(method, path, body = null) {
  const { apiUrl, deviceId, deviceToken } = cfg()
  if (!apiUrl || !deviceId || !deviceToken) return null

  const url = `${apiUrl.replace(/\/+$/, '')}/api/v1/devices/${deviceId}${path}`
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${deviceToken}`,
  }

  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(url, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `API ${res.status}`)
  }
  return res.json()
}

// ── Sync: pull from cloud → merge into localStorage ──

/**
 * Pull staff from the cloud API (delta or full).
 * Returns { staff, serverTime } or null if offline / not configured.
 */
export async function pullStaff() {
  try {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY)
    const path = lastSync ? `/staff?updated_since=${encodeURIComponent(lastSync)}` : '/staff'
    const data = await apiFetch('GET', path)
    if (!data) return null

    // Merge cloud staff into local storage
    mergeCloudStaff(data.staff)

    // Update last sync timestamp
    if (data.server_time) {
      localStorage.setItem(LAST_SYNC_KEY, data.server_time)
    }

    return data
  } catch (err) {
    console.warn('[staffSync] Pull failed (offline?):', err.message)
    return null
  }
}

/**
 * Merge cloud staff records into local staff storage.
 * Cloud is source of truth — cloud records overwrite local ones by ID.
 * Local-only records (no cloud ID) are preserved.
 */
function mergeCloudStaff(cloudStaff) {
  if (!Array.isArray(cloudStaff) || cloudStaff.length === 0) return

  const STAFF_KEY = 'locqar_staff_accounts'
  let local = []
  try {
    const raw = localStorage.getItem(STAFF_KEY)
    if (raw) local = JSON.parse(raw)
  } catch { /* ignore */ }

  // Index cloud staff by ID for fast lookup
  const cloudById = new Map(cloudStaff.map(s => [s.id, s]))

  // Update existing local records that came from cloud, add new ones
  const merged = []
  const seenIds = new Set()

  // First pass: update local records that have a cloud counterpart
  for (const localStaff of local) {
    if (localStaff.cloudId && cloudById.has(localStaff.cloudId)) {
      const cloud = cloudById.get(localStaff.cloudId)
      merged.push(cloudToLocal(cloud))
      seenIds.add(cloud.id)
    } else if (!localStaff.cloudId) {
      // Local-only staff — keep as-is
      merged.push(localStaff)
    } else {
      // Has cloudId but not in cloud response — keep (might be from an older sync)
      merged.push(localStaff)
    }
  }

  // Second pass: add new cloud records not yet in local
  for (const cloud of cloudStaff) {
    if (!seenIds.has(cloud.id)) {
      merged.push(cloudToLocal(cloud))
    }
  }

  localStorage.setItem(STAFF_KEY, JSON.stringify(merged))
}

/**
 * Convert a cloud staff record to local format.
 */
function cloudToLocal(cloud) {
  return {
    id: cloud.id,
    cloudId: cloud.id,
    name: cloud.name,
    pinHash: cloud.pin_hash,
    role: cloud.role,
    active: cloud.active,
    createdAt: new Date(cloud.created_at).getTime(),
    updatedAt: new Date(cloud.updated_at).getTime(),
    source: 'cloud',
  }
}

// ── Push: local-only staff → cloud ──

/**
 * Push locally-created staff to the cloud.
 * Called after successful pullStaff or on a timer.
 */
export async function pushLocalStaff() {
  const STAFF_KEY = 'locqar_staff_accounts'
  let local = []
  try {
    const raw = localStorage.getItem(STAFF_KEY)
    if (raw) local = JSON.parse(raw)
  } catch { return }

  const localOnly = local.filter(s => !s.cloudId && s.active)
  if (localOnly.length === 0) return

  for (const staff of localOnly) {
    try {
      // We need the plain PIN to send to cloud, but we only have it locally
      // Local staff use plain PIN in the 'pin' field (not hashed)
      const result = await apiFetch('POST', '/staff', {
        name: staff.name,
        pin: staff.pin, // plain PIN stored locally
        role: staff.role.toUpperCase(),
      })
      if (result) {
        // Update local record with cloud ID
        staff.cloudId = result.id
        staff.pinHash = result.pin_hash
        staff.source = 'cloud'
      }
    } catch (err) {
      console.warn(`[staffSync] Push failed for ${staff.name}:`, err.message)
    }
  }

  localStorage.setItem(STAFF_KEY, JSON.stringify(local))
}

// ── Auto-sync manager ──

let syncInterval = null

/**
 * Start periodic staff sync. Call once on app boot.
 * @param {number} intervalMs — sync interval (default 2 minutes)
 */
export function startStaffSync(intervalMs = 120_000) {
  // Immediate first sync
  syncNow()

  // Periodic sync
  if (syncInterval) clearInterval(syncInterval)
  syncInterval = setInterval(syncNow, intervalMs)
}

/**
 * Stop periodic sync.
 */
export function stopStaffSync() {
  if (syncInterval) {
    clearInterval(syncInterval)
    syncInterval = null
  }
}

/**
 * Run a single sync cycle: pull → push.
 */
export async function syncNow() {
  const result = await pullStaff()
  if (result) {
    // Only push if we successfully pulled (means we're online)
    await pushLocalStaff()
  }
  return result
}

/**
 * Check if the device is configured for cloud sync.
 */
export function isSyncConfigured() {
  const { apiUrl, deviceId, deviceToken } = cfg()
  return !!(apiUrl && deviceId && deviceToken)
}
