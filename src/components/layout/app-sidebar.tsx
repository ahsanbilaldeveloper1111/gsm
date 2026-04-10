"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavIcon } from "@/components/layout/nav-icons";
import { navigationGroups } from "@/lib/navigation/nav-config";
import { appPaths } from "@/lib/navigation/app-paths";

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === href ||
    (href !== appPaths.dashboard && pathname.startsWith(`${href}/`));
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 text-emerald-900 shadow-sm ring-1 ring-emerald-500/20 dark:from-emerald-500/20 dark:to-teal-500/10 dark:text-emerald-50 dark:ring-emerald-500/25"
          : "text-zinc-600 hover:bg-zinc-100/90 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
      }`}
    >
      <NavIcon href={href} active={active} />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full flex-col border-r border-zinc-200/60 bg-white/80 shadow-[4px_0_24px_-12px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/90 dark:shadow-[4px_0_32px_-8px_rgba(0,0,0,0.4)]">
      <div className="relative border-b border-zinc-200/60 px-4 py-6 dark:border-zinc-800/80">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
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
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">
        {navigationGroups.map((group) => (
          <div key={group.title} className="mb-7 last:mb-0">
            <p className="mb-2.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              {group.title}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    label={item.label}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
