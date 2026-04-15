"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import { appPaths } from "@/lib/navigation/appPaths";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const userQuery = useCurrentUser();
  const [hydrated, setHydrated] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (userQuery.isPending) return;
    if (userQuery.isError) {
      const status = axios.isAxiosError(userQuery.error)
        ? userQuery.error.response?.status
        : undefined;
      if (status === 401 || status === 403) {
        router.replace(appPaths.login);
      }
      return;
    }
    if (!userQuery.data?.user) {
      router.replace(appPaths.login);
    }
  }, [hydrated, userQuery.isPending, userQuery.isError, userQuery.data, userQuery.error, router]);

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      {/* Ambient mesh — depth behind content */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.055),transparent_55%),radial-gradient(ellipse_45%_35%_at_100%_0%,rgba(59,130,246,0.035),transparent_48%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-18%,rgba(52,211,153,0.07),transparent_54%),radial-gradient(ellipse_40%_30%_at_100%_0%,rgba(56,189,248,0.045),transparent_48%)]"
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
