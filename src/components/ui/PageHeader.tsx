import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-zinc-200/70 pb-8 dark:border-zinc-800/80 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <span className="inline-block h-1 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1">{actions}</div>
      ) : null}
    </div>
  );
}
