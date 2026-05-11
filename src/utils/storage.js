const SAVE_KEY = "vn-engine-save";

export const loadVNState = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

export const saveVNState = (payload) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  } catch (_error) {
    // Ignore storage errors gracefully for restricted browsers.
  }
};
