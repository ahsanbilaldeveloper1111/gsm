"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopBar } from "@/components/layout/AppTopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      {/* Ambient mesh — depth behind content */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,rgba(16,185,129,0.07),transparent_52%),radial-gradient(ellipse_50%_40%_at_100%_0%,rgba(59,130,246,0.04),transparent_45%)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-18%,rgba(52,211,153,0.09),transparent_52%),radial-gradient(ellipse_45%_35%_at_100%_0%,rgba(56,189,248,0.06),transparent_45%)]"
        aria-hidden
      />

      {mobileNavOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(18rem,88vw)] transform transition-transform duration-300 ease-out lg:static lg:z-0 lg:flex lg:w-56 lg:max-w-none lg:translate-x-0 xl:w-64 ${
          mobileNavOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <AppSidebar onNavigate={() => setMobileNavOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col lg:min-h-0">
        <AppTopBar onMenuClick={() => setMobileNavOpen((o) => !o)} />
        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          {children}
        </div>
      </div>
    </div>
  );
}
