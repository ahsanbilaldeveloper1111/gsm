import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative mb-10 sm:mb-12">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-gradient-to-br from-white via-white to-emerald-50/50 p-6 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_8px_32px_-8px_rgba(15,23,42,0.08)] ring-1 ring-zinc-900/[0.04] dark:border-zinc-800/90 dark:from-zinc-950 dark:via-zinc-950 dark:to-emerald-950/25 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_12px_40px_-12px_rgba(0,0,0,0.45)] dark:ring-white/[0.05] sm:rounded-3xl sm:p-8">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-400/10 blur-3xl dark:from-emerald-500/20 dark:to-teal-600/10"
          aria-hidden
        />
        <div className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-32 rounded-full bg-teal-400/10 blur-2xl dark:bg-teal-500/10" aria-hidden />
        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <span className="inline-flex h-1.5 w-14 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-sm shadow-emerald-500/25" />
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl sm:leading-tight">
              <span className="bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-700 bg-clip-text text-transparent dark:from-white dark:via-zinc-100 dark:to-zinc-300">
                {title}
              </span>
            </h1>
            {description ? (
              <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2 pt-0.5 sm:pt-1">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
