import type { ReactNode } from "react";
import { appPaths } from "@/lib/navigation/appPaths";

function IconBox({
  children,
  active,
  className,
}: {
  children: ReactNode;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-400 ${
        active
          ? "bg-emerald-500/20 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-200"
          : "bg-zinc-100/90 dark:bg-zinc-800/80"
      } ${className ?? ""}`}
    >
      {children}
    </span>
  );
}

function Svg({ path, className }: { path: ReactNode; className?: string }) {
  return (
    <svg
      className={`h-4 w-4 ${className ?? ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      {path}
    </svg>
  );
}

const icons: Partial<Record<string, ReactNode>> = {
  [appPaths.dashboard]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 13a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z"
        />
      }
    />
  ),
  [appPaths.analytics]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      }
    />
  ),
  [appPaths.users]: (
    <Svg
      path={
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </>
      }
    />
  ),
  [appPaths.company]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      }
    />
  ),
  [appPaths.invoices]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      }
    />
  ),
  [appPaths.payments]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      }
    />
  ),
  [appPaths.customers]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      }
    />
  ),
  [appPaths.expenses]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      }
    />
  ),
  [appPaths.expenseCategories]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
      }
    />
  ),
  [appPaths.products]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      }
    />
  ),
  [appPaths.productCategories]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
        />
      }
    />
  ),
  [appPaths.currencies]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      }
    />
  ),
  [appPaths.reports]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      }
    />
  ),
  [appPaths.statementOfAccount]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 7h6m0 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V9a2 2 0 012-2h6zM9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M9 12h6m-6 4h4"
        />
      }
    />
  ),
  [appPaths.vendors]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      }
    />
  ),
  [appPaths.ranks]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      }
    />
  ),
  [appPaths.crm]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      }
    />
  ),
  [appPaths.auditLogs]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      }
    />
  ),
  [appPaths.inventory]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
        />
      }
    />
  ),
  [appPaths.stripe]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      }
    />
  ),
  [appPaths.gsm]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M6 10h12M8 14h8M10 18h4"
        />
      }
    />
  ),
  [appPaths.gsmCompanies]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 7h16M4 12h16M4 17h16M9 7v10m6-10v10"
        />
      }
    />
  ),
  [appPaths.clientGsmProfiling]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 19h16M6 16V8m4 8V5m4 11v-6m4 6V9"
        />
      }
    />
  ),
  [appPaths.ports]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 7h10M7 12h10M7 17h10M4 7h.01M4 12h.01M4 17h.01"
        />
      }
    />
  ),
  [appPaths.notifications]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
        />
      }
    />
  ),
  [appPaths.conversations]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h8m-8 4h5m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      }
    />
  ),
  [appPaths.ussd]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 10h8m-8 4h5m-2 7a9 9 0 100-18 9 9 0 000 18z"
        />
      }
    />
  ),
  [appPaths.syncPorts]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 4v5h.582m14.836 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0H15m4.419 0A8.003 8.003 0 016.4 19.5"
        />
      }
    />
  ),
  [appPaths.sims]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm3 3h4m-4 4h4m-4 4h4"
        />
      }
    />
  ),
  [appPaths.outbox]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l9 6 9-6M4 18h16a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1z"
        />
      }
    />
  ),
  [appPaths.inbox]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l9 6 9-6M4 18h16a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1zm5-5h6"
        />
      }
    />
  ),
  [appPaths.cdr]: (
    <Svg
      path={
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h6m-6 4h4M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"
        />
      }
    />
  ),
};

export function NavIcon({ href, active }: { href: string; active?: boolean }) {
  const icon = icons[href];
  if (!icon) {
    return (
      <IconBox active={active}>
        <Svg
          path={<path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
        />
      </IconBox>
    );
  }
  return <IconBox active={active}>{icon}</IconBox>;
}
