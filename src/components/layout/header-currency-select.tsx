"use client";

import { useDisplayCurrency } from "@/contexts/currency-display-context";

/**
 * Header control: persisted display currency for {@link useDisplayCurrency} (formatting + conversion).
 */
export function HeaderCurrencySelect() {
  const {
    currencyCode,
    setCurrencyCode,
    options,
    isCurrencyDataLoading,
    displayTargetCode,
  } = useDisplayCurrency();

  return (
    <label className="flex max-w-[min(12rem,42vw)] items-center gap-2">
      <span className="hidden text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 sm:inline">
        Currency
      </span>
      <div className="relative min-w-0 flex-1">
        <select
          className="w-full cursor-pointer appearance-none rounded-xl border border-zinc-200/90 bg-white py-1.5 pl-2.5 pr-7 text-xs font-medium text-zinc-800 shadow-sm transition hover:border-zinc-300 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:border-zinc-600 dark:focus:border-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          disabled={isCurrencyDataLoading}
          aria-label="Display currency"
          title={
            displayTargetCode
              ? `Showing amounts in ${displayTargetCode}`
              : "Choose a display currency"
          }
        >
          {options.map((o) => (
            <option key={o.value || "__empty"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span
          className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-zinc-400 dark:text-zinc-500"
          aria-hidden
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>
    </label>
  );
}
