"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  baseCurrencyFromResponse,
  useBaseCurrency,
} from "@/hooks/currencies/useBaseCurrency";
import {
  currenciesFromResponse,
  useActiveCurrencies,
} from "@/hooks/currencies/useActiveCurrencies";
import {
  buildCurrencyMap,
  convertCurrency,
  formatCurrency,
} from "@/lib/currency";
import type { Currency } from "@/models/Currency";

const STORAGE_KEY = "displayCurrencyCode";

function normalizeCode(code: string | null | undefined): string {
  return String(code ?? "")
    .trim()
    .toUpperCase();
}

function readStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota / private mode */
  }
}

function parseAmount(amount: number | null | undefined): number {
  if (typeof amount === "number" && Number.isFinite(amount)) return amount;
  const n = Number(amount ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export type DisplayCurrencyContextValue = {
  /** Raw selection from storage / user (empty = “Select currency”). */
  currencyCode: string;
  /** Same as {@link currencyCode} — only set when the user picked a display currency (no fallback). */
  displayTargetCode: string;
  /** Default used when inferring source amounts: `defaultCurrencyCode` → base API → USD. */
  computedDefault: string;
  isUserSelected: boolean;
  setCurrencyCode: (code: string) => void;
  setCurrencyCodeAuto: (code: string) => void;
  resetToDefault: () => void;
  options: Array<{ value: string; label: string }>;
  convertAmount: (
    amount: number | null | undefined,
    fromCurrencyCode?: string | null,
  ) => number;
  formatInCurrency: (
    amount: number | null | undefined,
    fromCurrencyCode?: string | null,
  ) => string;
  /** Shortcut: format `amount` already in the display currency (no FX). */
  formatDisplay: (amount: number | null | undefined) => string;
  activeCurrencies: Currency[];
  baseCurrency: Currency | null;
  currencyMap: Map<string, Currency>;
  isLoadingActive: boolean;
  isLoadingBase: boolean;
  /** True while either active or base currency query is loading. */
  isCurrencyDataLoading: boolean;
};

const DisplayCurrencyContext =
  createContext<DisplayCurrencyContextValue | null>(null);

export type DisplayCurrencyProviderProps = Readonly<{
  children: React.ReactNode;
  defaultCurrencyCode?: string | null;
}>;

export function DisplayCurrencyProvider({
  children,
  defaultCurrencyCode = null,
}: DisplayCurrencyProviderProps) {
  const activeQuery = useActiveCurrencies();
  const baseQuery = useBaseCurrency();

  const activeCurrencies = useMemo(
    () => currenciesFromResponse(activeQuery.data),
    [activeQuery.data],
  );

  const baseCurrency = useMemo(
    () => baseCurrencyFromResponse(baseQuery.data) ?? null,
    [baseQuery.data],
  );

  const currencyMap = useMemo(
    () => buildCurrencyMap(activeCurrencies, baseCurrency ?? undefined),
    [activeCurrencies, baseCurrency],
  );

  const computedDefault = useMemo(() => {
    return normalizeCode(defaultCurrencyCode || baseCurrency?.code || "USD") || "USD";
  }, [defaultCurrencyCode, baseCurrency?.code]);

  const [currencyCode, setCurrencyCodeState] = useState<string>(() => {
    const stored = readStorage(STORAGE_KEY);
    return stored ? normalizeCode(stored) : "";
  });

  const [touched, setTouched] = useState<boolean>(() =>
    Boolean(readStorage(STORAGE_KEY)),
  );

  const setCurrencyCode = useCallback((code: string) => {
    const next = normalizeCode(code);
    if (!next) {
      setTouched(false);
      setCurrencyCodeState("");
      writeStorage(STORAGE_KEY, "");
      return;
    }
    setTouched(true);
    setCurrencyCodeState(next);
    writeStorage(STORAGE_KEY, next);
  }, []);

  const setCurrencyCodeAuto = useCallback((code: string) => {
    const next = normalizeCode(code);
    if (!next) return;
    setCurrencyCodeState(next);
  }, []);

  const resetToDefault = useCallback(() => {
    setTouched(false);
    setCurrencyCodeState("");
    writeStorage(STORAGE_KEY, "");
  }, []);

  const displayTargetCode = useMemo(
    () => normalizeCode(currencyCode),
    [currencyCode],
  );

  const options = useMemo(() => {
    const currencyOpts = activeCurrencies
      .map((c) => {
        const code = normalizeCode(c.code);
        return {
          value: code,
          label: `${code} - ${c.name ?? ""}`.trim(),
        };
      })
      .filter((o) => o.value);

    const merged: Array<{ value: string; label: string }> = [
      { value: "", label: "Select Currency" },
      ...currencyOpts,
    ];

    const ensure = (code: string) => {
      const c = normalizeCode(code);
      if (!c || merged.some((o) => o.value === c)) return;
      merged.push({ value: c, label: c });
    };
    ensure(computedDefault);
    ensure(currencyCode);

    const seen = new Set<string>();
    return merged.filter((opt) => {
      if (seen.has(opt.value)) return false;
      seen.add(opt.value);
      return true;
    });
  }, [activeCurrencies, computedDefault, currencyCode]);

  const convertAmount = useCallback(
    (
      amount: number | null | undefined,
      fromCurrencyCode?: string | null,
    ): number => {
      const numeric = parseAmount(amount);
      const to = normalizeCode(currencyCode);
      if (!to) {
        return numeric;
      }
      const from = normalizeCode(fromCurrencyCode || computedDefault) || "USD";
      if (!numeric || from === to) return numeric;

      const fromRate = currencyMap.get(from)?.exchange_rate ?? 1;
      const toRate = currencyMap.get(to)?.exchange_rate ?? 1;
      return convertCurrency(numeric, fromRate, toRate);
    },
    [currencyMap, currencyCode, computedDefault],
  );

  const formatInCurrency = useCallback(
    (
      amount: number | null | undefined,
      fromCurrencyCode?: string | null,
    ): string => {
      const n = parseAmount(amount);
      const to = normalizeCode(currencyCode);
      if (!to) {
        const source =
          normalizeCode(fromCurrencyCode || computedDefault) || "USD";
        return formatCurrency(n, source);
      }
      return formatCurrency(
        convertAmount(amount, fromCurrencyCode),
        to,
      );
    },
    [convertAmount, currencyCode, computedDefault],
  );

  const formatDisplay = useCallback(
    (amount: number | null | undefined) => {
      const code = normalizeCode(currencyCode) || computedDefault;
      return formatCurrency(parseAmount(amount), code);
    },
    [currencyCode, computedDefault],
  );

  const isCurrencyDataLoading = activeQuery.isLoading || baseQuery.isLoading;

  const value = useMemo<DisplayCurrencyContextValue>(
    () => ({
      currencyCode,
      displayTargetCode,
      computedDefault,
      isUserSelected: touched,
      setCurrencyCode,
      setCurrencyCodeAuto,
      resetToDefault,
      options,
      convertAmount,
      formatInCurrency,
      formatDisplay,
      activeCurrencies,
      baseCurrency,
      currencyMap,
      isLoadingActive: activeQuery.isLoading,
      isLoadingBase: baseQuery.isLoading,
      isCurrencyDataLoading,
    }),
    [
      currencyCode,
      displayTargetCode,
      computedDefault,
      touched,
      setCurrencyCode,
      setCurrencyCodeAuto,
      resetToDefault,
      options,
      convertAmount,
      formatInCurrency,
      formatDisplay,
      activeCurrencies,
      baseCurrency,
      currencyMap,
      activeQuery.isLoading,
      baseQuery.isLoading,
      isCurrencyDataLoading,
    ],
  );

  return (
    <DisplayCurrencyContext.Provider value={value}>
      {children}
    </DisplayCurrencyContext.Provider>
  );
}

export function useDisplayCurrency(): DisplayCurrencyContextValue {
  const ctx = useContext(DisplayCurrencyContext);
  if (!ctx) {
    throw new Error(
      "useDisplayCurrency must be used within a DisplayCurrencyProvider",
    );
  }
  return ctx;
}

/** @deprecated Prefer `DisplayCurrencyProvider` + `useDisplayCurrency`. */
export const CurrencyDisplayProvider = DisplayCurrencyProvider;

/** @deprecated Prefer `useDisplayCurrency`. */
export function useCurrencyDisplay(): DisplayCurrencyContextValue {
  return useDisplayCurrency();
}
