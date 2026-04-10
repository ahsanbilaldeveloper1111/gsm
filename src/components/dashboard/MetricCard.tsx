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
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/90 p-5 shadow-sm ring-1 ring-black/[0.03] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-200/80 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-zinc-800/80 dark:bg-zinc-950/80 dark:ring-white/[0.04] dark:hover:border-emerald-800/50">
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400/10 to-teal-400/5 blur-2xl transition duration-500 group-hover:from-emerald-400/20 group-hover:to-teal-400/10" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="relative mt-3 tabular-nums text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
      {hint ? (
        <p className={`relative mt-2 text-xs ${trend ? trendColor : "text-zinc-500"}`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
