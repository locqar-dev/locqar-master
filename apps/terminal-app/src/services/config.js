/**
 * Kiosk Configuration Store
 * =========================
 * Persists locker serial number, API URL, and API key in localStorage.
 * On first launch, the setup screen collects these values.
 * Environment variables override localStorage (for dev).
 */

const STORAGE_KEY = 'locqar_kiosk_config';

const DEFAULTS = {
  apiUrl: 'https://api.dev.locqar.com',
  apiKey: '',
  lockerSN: '',
  doorControllerUrl: 'http://127.0.0.1:9090',
  pollInterval: 2500,
  deviceId: '',
  deviceToken: '',
  configured: false,
};

/** Read config from localStorage, merged with env var overrides */
export function getConfig() {
  let stored = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) stored = JSON.parse(raw);
  } catch { /* ignore */ }

  const config = { ...DEFAULTS, ...stored };

  // Env var overrides (Vite build-time)
  if (import.meta.env.VITE_API_URL) config.apiUrl = import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_LOCKER_API_KEY) config.apiKey = import.meta.env.VITE_LOCKER_API_KEY;
  if (import.meta.env.VITE_LOCKER_SN) config.lockerSN = import.meta.env.VITE_LOCKER_SN;
  if (import.meta.env.VITE_DOOR_CONTROLLER_URL) config.doorControllerUrl = import.meta.env.VITE_DOOR_CONTROLLER_URL;

  return config;
}

/** Save config to localStorage */
export function saveConfig(updates) {
  const current = getConfig();
  const merged = { ...current, ...updates, configured: true };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

/** Check if initial setup has been completed */
export function isConfigured() {
  const config = getConfig();
  return config.configured && config.lockerSN && config.apiKey;
}

/** Clear config (for reset) */
export function clearConfig() {
  localStorage.removeItem(STORAGE_KEY);
}
