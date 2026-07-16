"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type SearchableSelectOption = {
  value: string;
  label: string;
};

type SearchableSelectBaseProps = {
  options: SearchableSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  isClearable?: boolean;
  className?: string;
  /** Accessible name when no visible label is tied to the control. */
  ariaLabel?: string;
  /** Shown next to the spinner while `loading` is true. */
  loadingText?: string;
  /** Message when `options` is empty (after load). */
  emptyText?: string;
  /** Max height class for the dropdown list (Tailwind). */
  listMaxHeightClass?: string;
  /**
   * Renders as a single control with a chevron (native select–like).
   * Clear sits inside the field; use with {@link controlClassName} to match sibling inputs.
   */
  selectLike?: boolean;
  /** Merged into the trigger input when `selectLike` is true. */
  controlClassName?: string;
  /** Label for the “clear” row in the list (defaults to {@link placeholder}). */
  listClearLabel?: string;
};

export type SearchableSelectProps =
  | (SearchableSelectBaseProps & {
      multiple?: false;
      /** Selected option value, or empty / null when cleared. */
      value: string | null | undefined;
      onChange: (next: string | null) => void;
    })
  | (SearchableSelectBaseProps & {
      multiple: true;
      /** Selected option values. Use `[]` to represent “none selected”. */
      value: string[];
      onChange: (next: string[]) => void;
    });

/**
 * Select2-style searchable dropdown: type to filter, click to choose, optional clear.
 * Uses plain React + Tailwind (no jQuery Select2 / react-select).
 */
export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  disabled = false,
  loading = false,
  isClearable = true,
  className = "",
  ariaLabel,
  loadingText = "Loading…",
  emptyText = "No options",
  listMaxHeightClass = "max-h-52",
  selectLike = false,
  controlClassName = "",
  listClearLabel,
  multiple = false,
}: SearchableSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectedValues: string[] = multiple
    ? (value as string[])
    : value == null || value === ""
      ? []
      : [String(value)];

  const selectedLabel = (() => {
    if (selectedValues.length === 0) return "";
    if (selectedValues.length === 1) {
      const o = options.find((x) => x.value === selectedValues[0]);
      return o?.label ?? "";
    }
    return `${selectedValues.length} selected`;
  })();

  /** When closing (e.g. click outside), reset the search field to the current label. */
  useEffect(() => {
    if (!open) {
      setQuery(selectedLabel);
    }
  }, [open, selectedLabel]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const filtered = useMemo(() => {
    const t = query.trim().toLowerCase();
    if (!t) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(t) ||
        o.value.toLowerCase().includes(t),
    );
  }, [options, query]);

  const showList = open && !loading && !disabled;

  const handleOpen = () => {
    if (disabled || loading) return;
    setOpen(true);
    setQuery(selectedLabel);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleClear = () => {
    if (multiple) {
      (onChange as (next: string[]) => void)([]);
    } else {
      (onChange as (next: string | null) => void)(null);
    }
    setQuery("");
    setOpen(false);
  };

  const clearRowLabel = listClearLabel ?? placeholder;

  const selectOption = (opt: SearchableSelectOption) => {
    if (multiple) {
      const exists = selectedValues.includes(opt.value);
      const next = exists
        ? selectedValues.filter((v) => v !== opt.value)
        : [...selectedValues, opt.value];
      (onChange as (next: string[]) => void)(next);
      return;
    }
    (onChange as (next: string | null) => void)(opt.value);
    setQuery(opt.label);
    setOpen(false);
  };

  if (loading) {
    if (selectLike) {
      const loadBox = controlClassName.trim()
        ? `flex w-full min-w-0 items-center gap-2 pr-11 text-zinc-500 ${controlClassName}`
        : "flex w-full min-w-0 items-center gap-2 rounded-2xl border border-zinc-200/90 bg-white/90 px-4 py-2.5 pr-11 text-sm text-zinc-500 shadow-sm dark:border-zinc-700/90 dark:bg-zinc-900/80";
      return (
        <div className={`relative w-full ${className}`}>
          <div className={loadBox}>
            <span
              className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent dark:border-emerald-500"
              aria-hidden
            />
            <span>{loadingText}</span>
          </div>
          <span
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      );
    }
    return (
      <div
        className={`flex items-center gap-2 text-sm text-zinc-500 ${className}`}
      >
        <span
          className="inline-block size-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent"
          aria-hidden
        />
        <span>{loadingText}</span>
      </div>
    );
  }

  const inputDisplay = open ? query : selectedLabel || "";

  const defaultSelectLikeControl =
    "w-full min-w-0 rounded-2xl border border-zinc-200/90 bg-white/90 py-2.5 pl-4 text-sm shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-400/90 focus:outline-none focus:ring-2 focus:ring-emerald-500/25 dark:border-zinc-700/90 dark:bg-zinc-900/80 dark:placeholder:text-zinc-500 dark:focus:border-emerald-500/70 dark:focus:ring-emerald-500/20";

  if (selectLike) {
    const hasValue = selectedValues.length > 0;
    const showClear = isClearable && hasValue;
    const inputPadRight = showClear ? "pr-[4.25rem]" : "pr-11";

    return (
      <div ref={rootRef} className={`relative w-full ${className}`}>
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          disabled={disabled}
          value={inputDisplay}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          aria-expanded={showList}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          className={
            controlClassName.trim()
              ? `${controlClassName} ${inputPadRight} disabled:cursor-not-allowed disabled:opacity-60`
              : `${defaultSelectLikeControl} ${inputPadRight} disabled:cursor-not-allowed disabled:opacity-60`
          }
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={handleOpen}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery(selectedLabel);
            }
          }}
        />
        {showClear ? (
          <button
            type="button"
            disabled={disabled}
            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-lg leading-none text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClear();
            }}
            aria-label="Clear selection"
          >
            ×
          </button>
        ) : null}
        <span
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 ${showClear ? "right-10" : "right-3"}`}
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
        {showList ? (
          <ul
            id={listboxId}
            role="listbox"
            className={`absolute left-0 right-0 top-full z-[500] mt-1.5 w-full overflow-auto rounded-xl border border-zinc-200/90 bg-white py-1 shadow-2xl ring-1 ring-zinc-900/5 dark:border-zinc-600/90 dark:bg-zinc-950 dark:ring-white/10 ${listMaxHeightClass}`}
          >
            {isClearable ? (
              <li role="presentation">
                <button
                  type="button"
                  role="option"
                  className="w-full px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleClear();
                  }}
                >
                  {clearRowLabel}
                </button>
              </li>
            ) : null}
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-zinc-500">{emptyText}</li>
            ) : (
              filtered.map((o) => (
                <li key={o.value} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selectedValues.includes(o.value)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectOption(o);
                    }}
                  >
                    {o.label}
                  </button>
                </li>
              ))
            )}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="flex gap-1">
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          disabled={disabled}
          value={inputDisplay}
          placeholder={placeholder}
          aria-label={ariaLabel ?? placeholder}
          aria-expanded={showList}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={handleOpen}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setQuery(selectedLabel);
            }
          }}
        />
        {isClearable && selectedValues.length > 0 ? (
          <button
            type="button"
            disabled={disabled}
            className="shrink-0 rounded-xl border border-zinc-200 px-2.5 text-sm text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            onClick={handleClear}
            aria-label="Clear selection"
          >
            ×
          </button>
        ) : null}
      </div>
      {showList ? (
        <ul
          id={listboxId}
          role="listbox"
          className={`absolute left-0 right-0 top-full z-[500] mt-1.5 w-full overflow-auto rounded-xl border border-zinc-200/90 bg-white py-1 shadow-2xl ring-1 ring-zinc-900/5 dark:border-zinc-600/90 dark:bg-zinc-950 dark:ring-white/10 ${listMaxHeightClass}`}
        >
          {isClearable ? (
            <li role="presentation">
              <button
                type="button"
                role="option"
                className="w-full px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleClear();
                }}
              >
                {clearRowLabel}
              </button>
            </li>
          ) : null}
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-zinc-500">{emptyText}</li>
          ) : (
            filtered.map((o) => (
              <li key={o.value} role="presentation">
                <button
                  type="button"
                  role="option"
                    aria-selected={selectedValues.includes(o.value)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(o);
                  }}
                >
                  {o.label}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
