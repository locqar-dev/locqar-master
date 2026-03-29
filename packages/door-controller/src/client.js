/**
 * Door Controller Client
 * =======================
 * Drop-in replacement for Winnsen cloud's SetDoorOpen / GetTerminalInfo.
 * Import this in your API server to call the local door controller
 * instead of cloud.winnsen.com.
 *
 * Usage in winnsen.router.ts or any service:
 *
 *   import { doorClient } from '@locqar/door-controller/client';
 *
 *   // Open door 5
 *   const result = await doorClient.openDoor(5);
 *   // { success: true, door: 5, station: 1, lock: 5 }
 *
 *   // Check door 5 status
 *   const status = await doorClient.getDoorStatus(5);
 *   // { success: true, door: 5, status: 'closed' }
 *
 *   // Check all doors on station 1
 *   const all = await doorClient.getStationStatus(1);
 *   // { success: true, station: 1, doors: { 1: 'closed', 2: 'open', ... } }
 */

const DOOR_CONTROLLER_URL = process.env.DOOR_CONTROLLER_URL || 'http://127.0.0.1:9090';
const DOOR_CONTROLLER_KEY = process.env.DOOR_CONTROLLER_KEY || '';

async function request(method, path, body = null) {
  const url = `${DOOR_CONTROLLER_URL}${path}`;
  const headers = { 'Content-Type': 'application/json' };
  if (DOOR_CONTROLLER_KEY) {
    headers['x-api-key'] = DOOR_CONTROLLER_KEY;
  }

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Door controller returned ${res.status}`);
  }

  return data;
}

const doorClient = {
  /**
   * Open a door by global door number.
   * @param {number} door - Global door number (1-based)
   * @returns {Promise<{ success: boolean, door: number, station: number, lock: number, error: string|null }>}
   */
  async openDoor(door) {
    return request('POST', '/door/open', { door });
  },

  /**
   * Open a door by explicit station + lock.
   * @param {number} station - Control board station number
   * @param {number} lock - Lock number on that board (1-16)
   */
  async openLock(station, lock) {
    return request('POST', '/door/open', { station, lock });
  },

  /**
   * Get status of a single door.
   * @param {number} door - Global door number
   * @returns {Promise<{ success: boolean, door: number, status: 'open'|'closed', error: string|null }>}
   */
  async getDoorStatus(door) {
    return request('GET', `/door/status?door=${door}`);
  },

  /**
   * Get status of all doors on a station.
   * @param {number} station - Control board station number
   * @param {number[]} [locks] - Specific locks to check (empty = all)
   */
  async getStationStatus(station, locks = []) {
    const params = [`station=${station}`];
    if (locks.length) params.push(`locks=${locks.join(',')}`);
    return request('GET', `/door/status?${params.join('&')}`);
  },

  /**
   * Health check the door controller service.
   */
  async health() {
    return request('GET', '/health');
  },
};

module.exports = { doorClient };
