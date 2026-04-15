"use client";

/** Use as `enabled` for React Query calls that require JWT. */
export function useAuthQueryEnabled(): boolean {
  // JWT is stored in an HTTP-only cookie and attached by proxy middleware.
  return true;
}
