"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/layout/NavIcons";
import type { AppPath } from "@/lib/navigation/appPaths";
import { appPaths } from "@/lib/navigation/appPaths";
import { navigationGroups } from "@/lib/navigation/navConfig";
import { appPathToModule } from "@/lib/permissions/routeModules";
import { usePermissions } from "@/hooks/permissions/usePermissions";

function NavLink({
  href,
  label,
  description,
  onNavigate,
}: {
  href: string;
  label: string;
  description?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(typeof window !== "undefined" ? window.location.hash : "");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  const [base, fragment] = href.split("#");
  const pathPart = base ?? href;
  const wantsHash = fragment != null && fragment !== "";

  let active = false;
  if (pathname === pathPart || pathname.startsWith(`${pathPart}/`)) {
    if (wantsHash) {
      active = hash === `#${fragment}`;
    } else if (pathPart === appPaths.dashboard && href === appPaths.dashboard) {
      active = hash === "" || hash === "#";
    } else {
      active =
        pathname === href ||
        (pathPart !== appPaths.dashboard && pathname.startsWith(`${pathPart}/`));
    }
  }
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group relative flex w-full min-w-0 items-center gap-3 rounded-lg border-l-[3px] py-2.5 pl-2.5 pr-3 text-sm font-medium transition-colors duration-200 ${
        active
          ? "border-emerald-500 bg-emerald-50/90 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-500/12 dark:text-emerald-50"
          : "border-transparent text-zinc-600 hover:border-zinc-200 hover:bg-zinc-100/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800/70 dark:hover:text-zinc-100"
      }`}
    >
      <NavIcon href={href} active={active} />
      <span className="min-w-0 flex-1">
        <span className="block truncate leading-snug">{label}</span>
        {description ? (
          <span
            className={`mt-0.5 block truncate text-[11px] font-normal leading-tight ${
              active
                ? "text-emerald-800/80 dark:text-emerald-200/80"
                : "text-zinc-500 dark:text-zinc-500"
            }`}
          >
            {description}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { canView, isSuperAdmin, isUserLoading } = usePermissions();

  const canSeeHref = (href: string) => {
    if (isUserLoading) return true;
    if (isSuperAdmin) return true;
    const mod = appPathToModule[href as AppPath];
    if (!mod) return true;
    return canView(mod);
  };

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-zinc-200/60 bg-white/90 shadow-[inset_-1px_0_0_0_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95 dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.06)]">
      <div className="relative border-b border-zinc-200/50 px-4 py-6 dark:border-zinc-800/70">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        <Link
          href={appPaths.dashboard}
          onClick={onNavigate}
          className="block transition hover:opacity-90"
        >
          <span className="bg-gradient-to-br from-emerald-700 to-teal-600 bg-clip-text text-xl font-bold tracking-tight text-transparent dark:from-emerald-400 dark:to-teal-400">
            Billing
          </span>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            Accounts
          </p>
        </Link>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden px-3 py-4">
        {navigationGroups.map((group) => {
          const visible = group.items.filter((item) => canSeeHref(item.href));
          if (visible.length === 0) return null;
          return (
            <div
              key={group.title}
              className="rounded-xl border border-zinc-200/50 bg-zinc-50/50 p-1.5 dark:border-zinc-800/60 dark:bg-zinc-900/40"
            >
              <p className="mb-1.5 px-2.5 pt-1 text-[11px] font-semibold tracking-wide text-zinc-500 dark:text-zinc-400">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {visible.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      href={item.href}
                      label={item.label}
                      description={item.description}
                      onNavigate={onNavigate}
                    />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
