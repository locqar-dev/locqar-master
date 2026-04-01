/**
 * LocQar API Service
 * ==================
 * Handles all communication between the kiosk terminal-app and the LocQar API.
 * Reads configuration from the config store (localStorage + env overrides).
 */

import { getConfig } from './config'

function cfg() { return getConfig() }

/**
 * Generic fetch wrapper with API key auth.
 */
async function request(method, path, body = null) {
  const { apiUrl, apiKey } = cfg()
  const url = `${apiUrl.replace(/\/+$/, '')}${path}`
  const headers = { 'Content-Type': 'application/json' }

  if (apiKey) {
    headers['x-api-key'] = apiKey
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
 */
export async function pollCommands(lockerSN) {
  const sn = lockerSN || cfg().lockerSN
  return request('GET', `/api/locker/commands?lockerSN=${encodeURIComponent(sn)}`)
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

/**
 * Open a physical door via the local door controller service.
 * POST http://127.0.0.1:9090/door/open  { door: N }
 */
export async function openDoorLocal(doorNum) {
  const { doorControllerUrl } = cfg()
  const url = `${doorControllerUrl.replace(/\/+$/, '')}/door/open`
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
  const { doorControllerUrl } = cfg()
  const url = `${doorControllerUrl.replace(/\/+$/, '')}/health`
  const res = await fetch(url)
  return res.json()
}

/**
 * Test API connectivity (health check).
 */
export async function apiHealthCheck() {
  const { apiUrl } = cfg()
  const res = await fetch(`${apiUrl.replace(/\/+$/, '')}/health`)
  return res.ok
}

// Legacy exports for backward compat
export const API_URL = cfg().apiUrl
export const LOCKER_API_KEY = cfg().apiKey
export const LOCKER_SN = cfg().lockerSN
export const DOOR_CONTROLLER_URL = cfg().doorControllerUrl
