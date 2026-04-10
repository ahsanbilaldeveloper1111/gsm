/**
 * Public API base must include the `/api` prefix, e.g. `http://localhost:8000/api`
 */
export function getPublicApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL is not set (e.g. http://localhost:8000/api)",
    );
  }
  return base.replace(/\/$/, "");
}

export function getServerApiBaseUrl(): string {
  const base =
    process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error(
      "API_BASE_URL or NEXT_PUBLIC_API_BASE_URL must be set for server token routes",
    );
  }
  return base.replace(/\/$/, "");
}
