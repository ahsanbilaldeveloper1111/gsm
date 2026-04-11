import { isApiTlsInsecure } from "@/lib/api/nodeTlsAgent";

/**
 * Node bootstrap only — imported from `instrumentation.ts`.
 * When `API_TLS_INSECURE` is enabled, relax TLS verification process-wide so `fetch()`, undici,
 * and axios redirects (which may not inherit `httpsAgent`) still reach self-signed upstreams.
 * Trusted LAN / dev only; prefer `NODE_EXTRA_CA_CERTS` or proper CA in production.
 */
export function applyInsecureNodeTlsFromEnv(): void {
  if (!isApiTlsInsecure()) return;
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
