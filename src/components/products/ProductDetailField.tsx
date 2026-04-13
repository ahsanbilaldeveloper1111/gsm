"use client";

import type { ReactNode } from "react";

export function ProductDetailField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mb-4 ${className}`}>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {children}
      </div>
    </div>
  );
}
