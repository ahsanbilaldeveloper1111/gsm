export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-7xl flex-1 px-4 pb-10 pt-6 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8 lg:pb-14">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent dark:via-emerald-400/25"
        aria-hidden
      />
      {children}
    </div>
  );
}
