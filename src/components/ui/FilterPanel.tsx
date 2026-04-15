"use client";

import { type ReactNode, useId, useState } from "react";

/** Shared control styling for filter toolbars (text inputs, selects). */
export const filterTextControlClassName =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-emerald-500/45 focus:ring-2 focus:ring-emerald-500/15 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-emerald-400/45 dark:focus:ring-emerald-400/15";

/** Same surface as text inputs; native select chevron is retained for simplicity. */
export const filterSelectControlClassName = filterTextControlClassName;

/** Alias for `filterSelectControlClassName`. */
export const filterSelectClassName = filterSelectControlClassName;

export const filterFieldLabelClassName =
  "mb-1.5 block text-sm font-semibold text-zinc-800 dark:text-zinc-200";

export function FilterPanelField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        className ??
        "min-w-0 flex-1 basis-full sm:basis-[10.5rem] sm:flex-none md:basis-[11.5rem]"
      }
    >
      <span className={filterFieldLabelClassName}>{label}</span>
      {children}
    </div>
  );
}

const primaryButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500";

const secondaryButtonClass =
  "inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/80";

export type FilterPanelPrimaryAction = {
  label: string;
  onClick: () => void;
};

export type FilterPanelProps = {
  title?: string;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  children: ReactNode;
  primaryAction?: FilterPanelPrimaryAction;
  secondaryActions?: ReactNode;
  /** Extra classes for the row that wraps `children` (e.g. wider fields). */
  fieldsClassName?: string;
};

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function FilterPanel({
  title = "Filters",
  defaultExpanded = true,
  expanded: controlledExpanded,
  onExpandedChange,
  children,
  primaryAction,
  secondaryActions,
  fieldsClassName = "flex flex-wrap items-end gap-4",
}: FilterPanelProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;
  const panelId = useId();
  const headerId = `${panelId}-header`;

  function toggle() {
    const next = !expanded;
    if (!isControlled) setInternalExpanded(next);
    onExpandedChange?.(next);
  }

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white shadow-[var(--shadow-sm)] ring-1 ring-zinc-950/[0.04] dark:border-zinc-800 dark:bg-zinc-950/85 dark:ring-white/[0.06]">
      <button
        id={headerId}
        type="button"
        className="flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition hover:bg-zinc-50/90 dark:hover:bg-zinc-900/60"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={toggle}
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          {title}
        </span>
        <ChevronIcon
          className={`shrink-0 text-zinc-500 transition-transform duration-300 ease-out dark:text-zinc-400 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className={`border-t border-zinc-100 px-6 pb-6 pt-1 dark:border-zinc-800/90 ${expanded ? "opacity-100" : "pointer-events-none opacity-0"} transition-opacity duration-200 ease-out motion-reduce:transition-none`}
            inert={!expanded || undefined}
          >
            <div className={fieldsClassName}>{children}</div>

            {primaryAction || secondaryActions ? (
              <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-zinc-100 pt-5 dark:border-zinc-800/80">
                {secondaryActions}
                {primaryAction ? (
                  <button type="button" className={primaryButtonClass} onClick={primaryAction.onClick}>
                    {primaryAction.label}
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export { secondaryButtonClass as filterSecondaryButtonClassName };
