// Shared by the /request page and the per-song Request buttons (same storage keys).
const NAME_KEY = 'akn.request.name';
const LAST_KEY = 'akn.request.last';
const COOLDOWN_MS = 30_000;

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getSavedName = () => read(NAME_KEY) ?? '';

export function cooldownRemainingMs(): number {
  return Math.max(0, COOLDOWN_MS - (Date.now() - Number(read(LAST_KEY) ?? 0)));
}

export function markRequestSent() {
  try {
    localStorage.setItem(LAST_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}
