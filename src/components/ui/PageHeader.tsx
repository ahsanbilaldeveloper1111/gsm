import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="relative mb-8 sm:mb-10">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-950/[0.04] backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:ring-white/[0.06] sm:rounded-3xl sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.04] dark:from-emerald-500/[0.08]"
          aria-hidden
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)] dark:bg-emerald-400 dark:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
                aria-hidden
              />
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl sm:leading-tight">
                {title}
              </h1>
            </div>
            {description ? (
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
