export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[90rem] flex-1 px-4 pb-10 pt-5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-10 lg:pb-14">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-px w-[min(100%,56rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent dark:via-emerald-400/20"
        aria-hidden
      />
      {children}
    </div>
  );
}
