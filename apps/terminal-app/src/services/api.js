/**
 * LocQar API Service
 * ==================
 * Handles all communication between the kiosk terminal-app and the LocQar API.
 *
 * Environment variables (set in .env or at build time):
 *   VITE_API_URL        - LocQar API base URL (default: http://localhost:3000)
 *   VITE_LOCKER_API_KEY - API key for /api/locker endpoints
 *   VITE_LOCKER_SN      - This kiosk's locker serial number (e.g. "LQ-001")
 */

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/+$/, '')
const LOCKER_API_KEY = import.meta.env.VITE_LOCKER_API_KEY || ''
const LOCKER_SN = import.meta.env.VITE_LOCKER_SN || 'LQ-001'

/**
 * Generic fetch wrapper with API key auth.
 */
async function request(method, path, body = null) {
  const url = `${API_URL}${path}`
  const headers = { 'Content-Type': 'application/json' }

  if (LOCKER_API_KEY) {
    headers['x-api-key'] = LOCKER_API_KEY
  }

  const opts = { method, headers }
  if (body) opts.body = JSON.stringify(body)

  const res = await fetch(url, opts)
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || data.error || `API returned ${res.status}`)
  }

  return data
}

// ─── Locker Command Endpoints ─────────────────────────────────

/**
 * Poll for pending commands for this kiosk.
 * GET /api/locker/commands?lockerSN=X
 * Returns an array of LockerCommand objects with status "processing".
 */
export async function pollCommands(lockerSN = LOCKER_SN) {
  return request('GET', `/api/locker/commands?lockerSN=${encodeURIComponent(lockerSN)}`)
}

/**
 * Acknowledge that a command has been processed.
 * POST /api/locker/commands/:id/ack
 */
export async function ackCommand(commandId, success, error = null) {
  const body = { success }
  if (error) body.error = error
  return request('POST', `/api/locker/commands/${commandId}/ack`, body)
}

/**
 * Check the status of a specific command.
 * GET /api/locker/commands/:id
 */
export async function getCommandStatus(commandId) {
  return request('GET', `/api/locker/commands/${commandId}`)
}

// ─── Door Controller (local RS-485 bridge) ────────────────────

const DOOR_CONTROLLER_URL = (import.meta.env.VITE_DOOR_CONTROLLER_URL || 'http://127.0.0.1:9090').replace(/\/+$/, '')

/**
 * Open a physical door via the local door controller service.
 * POST http://127.0.0.1:9090/door/open  { door: N }
 */
export async function openDoorLocal(doorNum) {
  const url = `${DOOR_CONTROLLER_URL}/door/open`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ door: doorNum }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `Door controller returned ${res.status}`)
  }
  return data
}

/**
 * Health-check the local door controller.
 */
export async function doorControllerHealth() {
  const url = `${DOOR_CONTROLLER_URL}/health`
  const res = await fetch(url)
  return res.json()
}

export { API_URL, LOCKER_API_KEY, LOCKER_SN, DOOR_CONTROLLER_URL }
