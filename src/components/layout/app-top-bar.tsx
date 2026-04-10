"use client";

import { HeaderCurrencySelect } from "@/components/layout/header-currency-select";
import { useAuth } from "@/contexts/auth-context";
import { useCurrentUser } from "@/hooks/auth/use-current-user";

function initials(name: string | null): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

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

  const sub =
    userQuery.isFetching
      ? "Syncing profile…"
      : bootstrapError?.message?.trim() || " ";

  return (
    <header className="sticky top-0 z-30 flex h-[3.25rem] shrink-0 items-center justify-between gap-3 border-b border-zinc-200/50 bg-white/75 px-3 backdrop-blur-md dark:border-zinc-800/50 dark:bg-zinc-950/75 sm:h-14 sm:px-5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-100 lg:hidden"
          aria-label="Open menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-semibold text-white shadow-md shadow-emerald-500/20"
            aria-hidden
          >
            {initials(displayName)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {displayName ?? "Signed out"}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {sub}
            </p>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        {token ? <HeaderCurrencySelect /> : null}
        {isBootstrapping ? (
          <span className="hidden items-center gap-1.5 rounded-full bg-amber-500/12 px-2.5 py-1 text-[11px] font-medium text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200 dark:ring-amber-500/30 sm:inline-flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
            </span>
            Connecting
          </span>
        ) : null}
        {token ? (
          <span className="hidden rounded-full bg-emerald-500/12 px-2.5 py-1 text-[11px] font-medium text-emerald-800 ring-1 ring-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-500/25 sm:inline">
            Session
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => refreshServerToken()}
          className="rounded-xl border border-zinc-200/90 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-xl bg-zinc-900 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm shadow-zinc-900/10 transition hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
