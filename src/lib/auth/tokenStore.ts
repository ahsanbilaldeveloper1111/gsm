const STORAGE_KEY = "billing.jwt";
const EXPIRES_AT_KEY = "billing.jwt.expiresAt";

/** Same-tab localStorage updates (login/logout) — `storage` event only fires for *other* tabs. */
const TOKEN_CHANGED_EVENT = "billing:jwt-changed";

let memoryToken: string | null = null;

function emitTokenChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TOKEN_CHANGED_EVENT));
}

/**
 * Pure read for React `useSyncExternalStore` — does **not** mutate storage
 * (unlike {@link getStoredToken}, which may clear an expired session).
 */
export function getStoredTokenSnapshot(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const t = window.localStorage.getItem(STORAGE_KEY);
    if (!t) return null;
    if (isStoredSessionExpired()) return null;
    return t;
  } catch {
    return null;
  }
}

/** Subscribe to JWT changes (login, logout, expiry cleanup, other-tab storage). */
export function subscribeStoredToken(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === EXPIRES_AT_KEY) onStoreChange();
  };
  const onCustom = () => onStoreChange();
  window.addEventListener("storage", onStorage);
  window.addEventListener(TOKEN_CHANGED_EVENT, onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(TOKEN_CHANGED_EVENT, onCustom);
  };
}

/**
 * Parses a positive numeric expiry fragment from the API (used for minutes or seconds, depending on caller).
 */
export function parseExpiresInSeconds(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number" && Number.isFinite(v) && v > 0) return v;
  if (typeof v === "string") {
    const n = Number.parseInt(v.trim(), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

/**
 * Billing login responses use `expires_in` in **minutes**; storage uses seconds until expiry.
 */
export function loginExpiresInMinutesToStorageSeconds(v: unknown): number | null {
  const minutes = parseExpiresInSeconds(v);
  if (minutes == null) return null;
  return minutes * 60;
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
  /** Seconds until JWT expiry (already converted from API `expires_in` when that value is in minutes). */
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
  emitTokenChanged();
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
  emitTokenChanged();
}

/** Clears stored JWT when `expires_in` has passed. Returns whether the session was expired. */
export function clearSessionIfExpired(): boolean {
  if (typeof window === "undefined") return false;
  if (!isStoredSessionExpired()) return false;
  clearStoredToken();
  return true;
}
