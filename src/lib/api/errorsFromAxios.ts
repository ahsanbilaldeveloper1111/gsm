import axios from "axios";

/**
 * Maps Laravel-style `{ errors: { field: string[] } }` (and `message`) to a flat
 * `Record<field, firstMessage>` for inline form validation.
 */
export function errorsFromAxios(err: unknown): Record<string, string> {
  if (!axios.isAxiosError(err)) {
    return { submit: err instanceof Error ? err.message : String(err) };
  }
  const data = err.response?.data as Record<string, unknown> | undefined;
  const raw = data?.errors;
  const out: Record<string, string> = {};
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw)) {
      if (Array.isArray(v) && v[0]) out[k] = String(v[0]);
      else if (typeof v === "string" && v.trim()) out[k] = v.trim();
    }
  }
  if (Object.keys(out).length > 0) return out;
  const msg = data?.message;
  if (typeof msg === "string" && msg.trim()) return { submit: msg.trim() };
  return { submit: err.message };
}
