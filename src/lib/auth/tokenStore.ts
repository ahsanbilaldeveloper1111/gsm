const STORAGE_KEY = "billing.jwt";
const EXPIRES_AT_KEY = "billing.jwt.expiresAt";

let memoryToken: string | null = null;

export function parseExpiresInSeconds(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string") {
    const n = Number.parseInt(v.trim(), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

function readExpiresAtMsFromStorage(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const s = window.localStorage.getItem(EXPIRES_AT_KEY);
    if (!s) return null;
    const n = Number.parseInt(s, 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** True when `expires_in` was stored and `Date.now()` is past that instant. */
export function isStoredSessionExpired(): boolean {
  const exp = readExpiresAtMsFromStorage();
  if (exp == null) return false;
  return Date.now() >= exp;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return memoryToken;
  if (!memoryToken) {
    try {
      memoryToken = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      memoryToken = null;
    }
  }
  if (memoryToken && isStoredSessionExpired()) {
    clearStoredToken();
    return null;
  }
  return memoryToken;
}

export function setStoredToken(
  token: string | null,
  options?: { expiresInSeconds?: unknown },
): void {
  memoryToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(STORAGE_KEY, token);
      const sec = parseExpiresInSeconds(options?.expiresInSeconds);
      if (sec != null) {
        window.localStorage.setItem(
          EXPIRES_AT_KEY,
          String(Date.now() + sec * 1000),
        );
      } else {
        window.localStorage.removeItem(EXPIRES_AT_KEY);
      }
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(EXPIRES_AT_KEY);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearStoredToken(): void {
  memoryToken = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(EXPIRES_AT_KEY);
  } catch {
    /* ignore */
  }
}

/** Clears stored JWT when `expires_in` has passed. Returns whether the session was expired. */
export function clearSessionIfExpired(): boolean {
  if (typeof window === "undefined") return false;
  if (!isStoredSessionExpired()) return false;
  clearStoredToken();
  return true;
}
