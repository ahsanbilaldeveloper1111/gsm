"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { publicApiService } from "@/services/public-api.service";
import { appPaths } from "@/lib/navigation/appPaths";

type CancelPayload = {
  cancelled?: boolean;
  message?: string;
};

/**
 * Stripe Checkout cancel / return page (`cancel_url`).
 * Query: `invoice_id` — optional; when present, user can notify the backend to clear pending checkout.
 */
export function StripeCheckoutCancelClient() {
  const searchParams = useSearchParams();
  const invoiceIdParam = searchParams.get("invoice_id");
  const invoiceId = invoiceIdParam
    ? Number.parseInt(invoiceIdParam, 10)
    : Number.NaN;
  const validInvoiceId = Number.isFinite(invoiceId) && invoiceId > 0;

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{
    cancelled: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const markCancelled = async () => {
    if (!validInvoiceId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await publicApiService.cancelCheckout({
        invoice_id: invoiceId,
      });
      const body = res as {
        data?: CancelPayload;
        message?: string;
      };
      const data = body.data;
      const msg =
        data?.message ??
        body.message ??
        (data?.cancelled ? "Payment cancelled." : "Updated.");
      setDone({
        cancelled: Boolean(data?.cancelled),
        message: String(msg),
      });
    } catch (e: unknown) {
      const msg =
        e &&
        typeof e === "object" &&
        "response" in e &&
        (e as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? String(
              (e as { response: { data: { message?: string } } }).response.data
                .message,
            )
          : e instanceof Error
            ? e.message
            : "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          Payment cancelled
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          You left the payment page before completing checkout. No charge was made.
          {validInvoiceId
            ? " You can tell us to cancel the pending checkout so a new link can be sent."
            : ""}
        </p>

        {validInvoiceId && !done ? (
          <div className="mt-6 text-start">
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
              If you are not going to complete payment now, use the button below.
              This marks the pending Stripe Checkout attempt as{" "}
              <strong className="text-zinc-700 dark:text-zinc-300">
                cancelled
              </strong>{" "}
              in our system (the invoice stays unpaid; your sender can create a new
              checkout link).
            </p>
            <button
              type="button"
              className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-amber-950 hover:bg-amber-400 disabled:opacity-50 dark:bg-amber-600 dark:text-amber-50 dark:hover:bg-amber-500"
              disabled={loading}
              onClick={() => void markCancelled()}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden
                  />
                  Updating…
                </span>
              ) : (
                "Mark pending checkout as cancelled"
              )}
            </button>
          </div>
        ) : null}

        {error ? (
          <p
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-start text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {done ? (
          <p
            className={`mt-4 rounded-xl border px-3 py-2 text-start text-sm ${
              done.cancelled
                ? "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-100"
                : "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100"
            }`}
          >
            {done.message}
          </p>
        ) : null}

        <div className="mt-6">
          <Link
            href={appPaths.login}
            className="inline-flex rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
