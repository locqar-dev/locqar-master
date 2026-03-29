const PREFIX = 'locqar_';

export const loadState = (key, defaultValue) => {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? JSON.parse(v) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const saveState = (key, value) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* storage full or unavailable */ }
};

export const removeState = (key) => {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch { /* ignore */ }
};
