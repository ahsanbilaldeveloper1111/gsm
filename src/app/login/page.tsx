"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useLoginFormState } from "@/hooks/forms/useLoginFormState";
import { appPaths } from "@/lib/navigation/appPaths";
import { showBillingBackendErrorToast } from "@/lib/toast/appToast";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginMutation } = useAuth();
  const { values, setValues } = useLoginFormState();
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    try {
      const result = await login(values);
      if (result.requires_google_auth_verification) {
        setFormError(
          "This account requires Google 2FA verification before continuing.",
        );
        return;
      }
      router.replace(appPaths.dashboard);
    } catch (err) {
      showBillingBackendErrorToast(err);
      setFormError(null);
    }
  }

  const pending = loginMutation.isPending;

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      <div
        className="relative flex min-h-[40vh] flex-1 flex-col justify-end overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 px-8 pb-12 pt-16 lg:min-h-screen lg:max-w-[46%] lg:justify-center lg:pb-16 lg:pt-0"
        aria-hidden={false}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_20%_-10%,rgba(255,255,255,0.18),transparent_55%)]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-200/90">Billing</p>
          <h2 className="mt-3 max-w-md text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Operations dashboard
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-emerald-100/85">
            Sign in to manage companies, GSM devices, invoices, and payments in one place.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-[var(--background)] px-4 py-12 sm:px-8">
        <div className="w-full max-w-[400px] rounded-2xl border border-zinc-200/80 bg-[var(--surface)] p-8 shadow-[var(--shadow-lg)] ring-1 ring-zinc-950/[0.04] dark:border-zinc-800 dark:bg-zinc-950/80 dark:ring-white/[0.06]">
          <div className="mb-8 text-center">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Sign in</h1>
            <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
              Use your account email and password
            </p>
          </div>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={values.email ?? ""}
                onChange={(e) =>
                  setValues((v) => ({ ...v, email: e.target.value }))
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-emerald-500"
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium text-zinc-600 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={values.password}
                onChange={(e) =>
                  setValues((v) => ({ ...v, password: e.target.value }))
                }
                className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-100"
                required
              />
            </div>
            {formError ? (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {formError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
