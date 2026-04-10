type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "neutral";
};

export function MetricCard({ label, value, hint, trend }: MetricCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-rose-600 dark:text-rose-400"
        : "text-zinc-500";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm transition hover:border-emerald-200/80 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-emerald-900/50">
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl transition group-hover:bg-emerald-500/10" />
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50`}>
        {value}
      </p>
      {hint ? (
        <p className={`mt-1 text-xs ${trend ? trendColor : "text-zinc-500"}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
