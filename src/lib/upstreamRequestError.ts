import axios from "axios";

/** Safe URL for logs and JSON responses (never expose `app_secret`). */
export function redactSensitiveUrl(url: URL): string {
  const u = new URL(url.toString());
  if (u.searchParams.has("app_secret")) {
    u.searchParams.set("app_secret", "[redacted]");
  }
  return u.toString();
}

/** Best-effort detail for upstream failures (TLS, ECONNREFUSED, timeouts, etc.). */
export function serializeUnknownError(e: unknown): Record<string, unknown> {
  if (axios.isAxiosError(e)) {
    const cause = e.cause;
    const errno =
      cause &&
      typeof cause === "object" &&
      "errno" in cause &&
      typeof (cause as { errno: unknown }).errno === "number"
        ? (cause as { errno: number }).errno
        : undefined;
    const syscall =
      cause &&
      typeof cause === "object" &&
      "syscall" in cause &&
      typeof (cause as { syscall: unknown }).syscall === "string"
        ? (cause as { syscall: string }).syscall
        : undefined;
    return {
      kind: "AxiosError",
      code: e.code ?? null,
      message: e.message,
      errno: errno ?? null,
      syscall: syscall ?? null,
    };
  }
  if (e instanceof Error) {
    const out: Record<string, unknown> = {
      kind: e.name,
      message: e.message,
    };
    if (e.cause !== undefined) {
      out.cause =
        e.cause instanceof Error
          ? { message: e.cause.message, name: e.cause.name }
          : String(e.cause);
    }
    if (process.env.NODE_ENV === "development" && e.stack) {
      out.stack = e.stack;
    }
    return out;
  }
  return { kind: "unknown", detail: String(e) };
}
