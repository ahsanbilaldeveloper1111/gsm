/**
 * Sanctum SPA step: `GET /sanctum/csrf-cookie` sets `XSRF-TOKEN` (and session cookie when applicable).
 * Call from the browser before cookie/session login. No-op on the server.
 *
 * Uses `fetch` (not Axios) so this step does not run through `axiosClient` interceptors before login.
 */
export async function fetchSanctumCsrfCookie(): Promise<void> {
  if (typeof window === "undefined") return;
  const u = new URL("/sanctum/csrf-cookie", window.location.origin);
  u.searchParams.set("is_super_user", "1");
  try {
    const res = await fetch(u.toString(), {
      credentials: "include",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.error("[fetchSanctumCsrfCookie] non-ok response", {
        status: res.status,
        statusText: res.statusText,
      });
    }
  } catch (e) {
    console.error("[fetchSanctumCsrfCookie] network", {
      message: e instanceof Error ? e.message : String(e),
    });
    throw e;
  }
}
