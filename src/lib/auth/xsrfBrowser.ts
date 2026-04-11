/**
 * Read Sanctum `XSRF-TOKEN` cookie → `X-XSRF-TOKEN` header (browser only).
 * Matches the Axios interceptor behavior for `fetch`-based login.
 */
export function getXsrfHeadersForFetch(): Record<string, string> {
  if (typeof document === "undefined") return {};
  const match = document.cookie.match(
    /(?:^|; )XSRF-TOKEN=([^;]*)/,
  );
  const value = match ? decodeURIComponent(match[1]) : "";
  if (!value) return {};
  return { "X-XSRF-TOKEN": value };
}
