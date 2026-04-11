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
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-white to-zinc-50/80 p-5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_24px_-8px_rgba(15,23,42,0.08)] ring-1 ring-zinc-900/[0.03] transition duration-300 hover:-translate-y-0.5 hover:border-emerald-300/60 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_32px_-10px_rgba(16,185,129,0.12)] dark:border-zinc-800/70 dark:from-zinc-950 dark:to-zinc-950/80 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_28px_-8px_rgba(0,0,0,0.4)] dark:ring-white/[0.04] dark:hover:border-emerald-700/50">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-400/15 to-teal-400/8 blur-2xl transition duration-500 group-hover:from-emerald-400/25 group-hover:to-teal-400/12" />
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
