let _agent: import("https").Agent | undefined;

/** `API_TLS_INSECURE` — accepts `1`, `true`, `yes`, `on` (case-insensitive). */
export function isApiTlsInsecure(): boolean {
  if (typeof window !== "undefined") return false;
  const v = process.env.API_TLS_INSECURE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

/**
 * Node-only TLS agent for upstream HTTPS (self-signed / private CA) when `API_TLS_INSECURE` is set.
 * Safe to import from client bundles: returns `undefined` in the browser before touching `node:https`.
 * Used by Axios (SSR) and billing backend proxy Route Handlers.
 *
 * Note: `instrumentation.ts` also sets `NODE_TLS_REJECT_UNAUTHORIZED=0` when this flag is on,
 * so native `fetch` and redirect hops still work even if they ignore `httpsAgent`.
 */
export function getBillingBackendHttpsAgent(): import("https").Agent | undefined {
  if (typeof window !== "undefined") return undefined;
  if (!isApiTlsInsecure()) return undefined;
  if (_agent) return _agent;
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- keep `node:https` out of client chunks
  const https = require("node:https") as typeof import("node:https");
  _agent = new https.Agent({ rejectUnauthorized: false });
  return _agent;
}
