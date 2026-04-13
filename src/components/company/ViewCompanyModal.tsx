"use client";

import { useCompany } from "@/hooks/company/useCompany";
import { CompanyProfileView } from "@/components/company/CompanyProfileView";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import type { Company } from "@/models/Company";

type ViewCompanyModalProps = {
  show: boolean;
  onHide: () => void;
  companyId: number | string | null;
  onEdit?: (company: Company) => void;
};

export function ViewCompanyModal({
  show,
  onHide,
  companyId,
  onEdit,
}: ViewCompanyModalProps) {
  const detailQuery = useCompany(show ? companyId : null, {
    load_profile: true,
    load_outstanding_amount: true,
  });

  const company = unwrapApiSuccessData<Company>(detailQuery.data);
  const isLoading = detailQuery.isPending && show && companyId != null;
  const error = detailQuery.isError ? detailQuery.error : null;

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-company-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm transition-opacity dark:bg-black/60"
        aria-label="Close"
        onClick={onHide}
      />
      <div className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex-shrink-0 border-b border-zinc-200/70 bg-gradient-to-r from-emerald-50/90 to-teal-50/40 px-5 py-4 dark:border-zinc-800 dark:from-emerald-950/40 dark:to-zinc-950">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="view-company-title"
              className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Tenant details
            </h2>
            <button
              type="button"
              onClick={onHide}
              className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-white/80 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div
                className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent dark:border-emerald-400"
                aria-hidden
              />
              <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
                Loading tenant details…
              </p>
            </div>
          ) : error ? (
            <p
              className="rounded-xl border border-rose-200/90 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
              role="alert"
            >
              Failed to load tenant details. Please try again.
            </p>
          ) : company && !isLoading ? (
            <CompanyProfileView profile={company} />
          ) : (
            <p className="text-sm text-zinc-500">No data.</p>
          )}
        </div>

        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2 border-t border-zinc-200/70 bg-zinc-50/80 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
          <button
            type="button"
            onClick={onHide}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
          >
            Close
          </button>
          {company && onEdit ? (
            <button
              type="button"
              onClick={() => {
                onEdit(company);
                onHide();
              }}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Edit
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
