"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/hooks/auth/use-current-user";

export function AppTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  const {
    token,
    isBootstrapping,
    bootstrapError,
    refreshServerToken,
    logout,
  } = useAuth();
  const userQuery = useCurrentUser();

  const userRecord =
    userQuery.data?.user && typeof userQuery.data.user === "object"
      ? (userQuery.data.user as Record<string, unknown>)
      : null;
  const displayName =
    (userRecord?.name as string | undefined) ??
    (userRecord?.samaccountname as string | undefined) ??
    null;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200/80 bg-white/90 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 lg:hidden"
          aria-label="Open menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {displayName ?? "Session"}
          </p>
          <p className="truncate text-xs text-zinc-500">
            {userQuery.isFetching ? "Loading profile…" : bootstrapError?.message ?? " "}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {isBootstrapping ? (
          <span className="hidden rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-200 sm:inline">
            Connecting…
          </span>
        ) : null}
        {token ? (
          <span className="hidden rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:text-emerald-200 sm:inline">
            JWT
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => refreshServerToken()}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
        >
          Refresh token
        </button>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
