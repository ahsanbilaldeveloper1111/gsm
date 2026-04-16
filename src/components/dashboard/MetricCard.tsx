type MetricCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  trend?: "up" | "down" | "neutral";
  /** Rotating accent (0–7) for visual variety in grids. */
  accent?: number;
};

const ACCENT_STYLES = [
  {
    orb: "from-emerald-400/25 to-teal-400/12 group-hover:from-emerald-400/35 group-hover:to-teal-400/18",
    border:
      "hover:border-emerald-300/70 dark:hover:border-emerald-600/55 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_36px_-10px_rgba(16,185,129,0.18)]",
  },
  {
    orb: "from-sky-400/25 to-cyan-400/12 group-hover:from-sky-400/35 group-hover:to-cyan-400/18",
    border:
      "hover:border-sky-300/70 dark:hover:border-sky-600/55 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_36px_-10px_rgba(14,165,233,0.18)]",
  },
  {
    orb: "from-violet-400/25 to-fuchsia-400/12 group-hover:from-violet-400/35 group-hover:to-fuchsia-400/18",
    border:
      "hover:border-violet-300/70 dark:hover:border-violet-600/55 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_36px_-10px_rgba(139,92,246,0.18)]",
  },
  {
    orb: "from-amber-400/25 to-orange-400/12 group-hover:from-amber-400/35 group-hover:to-orange-400/18",
    border:
      "hover:border-amber-300/70 dark:hover:border-amber-600/55 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_36px_-10px_rgba(245,158,11,0.18)]",
  },
  {
    orb: "from-rose-400/25 to-pink-400/12 group-hover:from-rose-400/35 group-hover:to-pink-400/18",
    border:
      "hover:border-rose-300/70 dark:hover:border-rose-600/55 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_36px_-10px_rgba(244,63,94,0.16)]",
  },
  {
    orb: "from-cyan-400/25 to-emerald-400/12 group-hover:from-cyan-400/35 group-hover:to-emerald-400/18",
    border:
      "hover:border-cyan-300/70 dark:hover:border-cyan-600/55 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_36px_-10px_rgba(6,182,212,0.18)]",
  },
  {
    orb: "from-indigo-400/25 to-blue-400/12 group-hover:from-indigo-400/35 group-hover:to-blue-400/18",
    border:
      "hover:border-indigo-300/70 dark:hover:border-indigo-600/55 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_36px_-10px_rgba(99,102,241,0.18)]",
  },
  {
    orb: "from-lime-400/22 to-emerald-400/12 group-hover:from-lime-400/32 group-hover:to-emerald-400/18",
    border:
      "hover:border-lime-300/70 dark:hover:border-lime-600/55 hover:shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_36px_-10px_rgba(132,204,22,0.16)]",
  },
] as const;

export function MetricCard({ label, value, hint, trend, accent = 0 }: MetricCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend === "down"
        ? "text-rose-600 dark:text-rose-400"
        : "text-zinc-500";

  const a = ACCENT_STYLES[((accent % ACCENT_STYLES.length) + ACCENT_STYLES.length) % ACCENT_STYLES.length]!;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-zinc-200/60 bg-gradient-to-br from-white to-zinc-50/80 p-5 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_4px_24px_-8px_rgba(15,23,42,0.08)] ring-1 ring-zinc-900/[0.03] transition duration-300 hover:-translate-y-1 ${a.border} dark:border-zinc-800/70 dark:from-zinc-950 dark:to-zinc-950/80 dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_28px_-8px_rgba(0,0,0,0.4)] dark:ring-white/[0.04]`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br ${a.orb} blur-2xl transition duration-500`}
      />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-200/60 to-transparent dark:via-zinc-700/40" />
      <p className="relative text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="relative mt-3 bg-gradient-to-br from-zinc-900 to-zinc-700 bg-clip-text tabular-nums text-3xl font-bold tracking-tight text-transparent dark:from-zinc-50 dark:to-zinc-300">
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
