"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CustomerPaymentCardsEditor } from "@/components/customers/CustomerPaymentCardsEditor";
import { useCrmCompanyNameMap } from "@/hooks/crm/useCrmCompanyNameMap";
import { useCustomer } from "@/hooks/customers/useCustomer";
import { useTenantDisplayNameMap } from "@/hooks/company/useTenantDisplayNameMap";
import { unwrapApiSuccessData } from "@/lib/dashboard/unwrapAnalyticsPayload";
import { customerProductPricingPath } from "@/lib/navigation/appPaths";
import type { Customer } from "@/models/Customer";

type ViewCustomerModalProps = {
  show: boolean;
  onHide: () => void;
  customerId: string | null;
  onEdit?: (customer: Customer) => void;
};

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 rounded-xl border border-zinc-200/80 bg-white/50 dark:border-zinc-800 dark:bg-zinc-950/40">
      <div className="border-b border-zinc-200/70 px-4 py-2.5 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function GridField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="mb-4 sm:mb-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{children}</p>
    </div>
  );
}

function fmtProfile(
  v: string | number | null | undefined,
  empty = "—",
): string {
  if (v === null || v === undefined) return empty;
  return String(v);
}

export function ViewCustomerModal({
  show,
  onHide,
  customerId,
  onEdit,
}: ViewCustomerModalProps) {
  const router = useRouter();
  const tenantNameMap = useTenantDisplayNameMap();
  const crmCompanyNameMap = useCrmCompanyNameMap();

  const detailQuery = useCustomer(show ? customerId : null, {
    load_profile: true,
    load_invoices_count: true,
  });

  const customer = unwrapApiSuccessData<Customer>(detailQuery.data);
  const isLoading = detailQuery.isPending && show && customerId != null;
  const loadError = detailQuery.isError ? detailQuery.error : null;

  const crmCompanyId =
    customer?.crm_company_id != null &&
    String(customer.crm_company_id).trim() !== ""
      ? String(customer.crm_company_id).trim()
      : null;

  const companyName = useMemo(() => {
    if (!customer?.tenant_id) return "—";
    const tid = String(customer.tenant_id).trim();
    return tenantNameMap[tid]?.trim() || tid;
  }, [customer?.tenant_id, tenantNameMap]);

  const crmDisplay = useMemo(() => {
    if (!customer?.crm_company_id) return "—";
    const id = String(customer.crm_company_id);
    return crmCompanyNameMap[id]?.trim() || id;
  }, [customer?.crm_company_id, crmCompanyNameMap]);

  const profile = customer?.profile;
  const pricingHref =
    customer &&
    (customer.crm_company_id != null || customer.id != null)
      ? customerProductPricingPath(
          String(customer.crm_company_id ?? customer.id),
        )
      : null;

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-customer-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/50 backdrop-blur-sm transition-opacity dark:bg-black/60"
        aria-label="Close"
        onClick={onHide}
      />
      <div className="relative z-10 flex max-h-[min(92vh,900px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex-shrink-0 border-b border-zinc-200/70 bg-gradient-to-r from-sky-50/90 to-emerald-50/40 px-5 py-4 dark:border-zinc-800 dark:from-sky-950/40 dark:to-zinc-950">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="view-customer-title"
              className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Customer details
            </h2>
            <button
              type="button"
              onClick={onHide}
              className="rounded-lg px-2 py-1 text-sm font-medium text-zinc-600 hover:bg-white/80 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
                Loading customer…
              </p>
            </div>
          ) : loadError ? (
            <p
              className="rounded-xl border border-rose-200/90 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
              role="alert"
            >
              Failed to load customer. Please try again.
            </p>
          ) : customer && !isLoading ? (
            <>
              <SectionCard title="Basic information">
                <div className="grid gap-4 sm:grid-cols-2">
                  <GridField label="Name">{customer.name ?? "—"}</GridField>
                  <GridField label="Email">{customer.email ?? "—"}</GridField>
                  <GridField label="Phone">{customer.phone ?? "—"}</GridField>
                  <GridField label="CRM company">{crmDisplay}</GridField>
                  <GridField label="Company (tenant)">
                    <span>{companyName}</span>
                    {customer.tenant_id &&
                    companyName !== String(customer.tenant_id) ? (
                      <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                        {String(customer.tenant_id)}
                      </span>
                    ) : null}
                  </GridField>
                  <GridField label="Invoices">
                    {customer.invoices_count ?? 0}
                  </GridField>
                </div>
              </SectionCard>

              <SectionCard title="Address">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <GridField label="Address">
                      {profile?.address ?? "—"}
                    </GridField>
                  </div>
                  <GridField label="City">{profile?.city ?? "—"}</GridField>
                  <GridField label="Country">
                    {profile?.country ?? "—"}
                  </GridField>
                  <GridField label="Postal code">
                    {profile?.postal_code ?? "—"}
                  </GridField>
                </div>
              </SectionCard>

              <SectionCard title="Tax & billing">
                <div className="grid gap-4 sm:grid-cols-2">
                  <GridField label="Currency">
                    {profile?.currency ?? "—"}
                  </GridField>
                  <GridField label="VAT rate (%)">
                    {fmtProfile(profile?.vat_rate)}
                  </GridField>
                  <GridField label="VAT exemption">
                    {profile?.vat_exemption === true ? "Yes" : "No"}
                  </GridField>
                  <GridField label="Tax ID">{profile?.tax_id ?? "—"}</GridField>
                  <GridField label="Payment terms (days)">
                    {fmtProfile(profile?.payment_terms)}
                  </GridField>
                  <GridField label="Credit limit">
                    {fmtProfile(profile?.credit_limit)}
                  </GridField>
                  <GridField label="Discount type">
                    {profile?.discount_type ?? "—"}
                  </GridField>
                  <GridField label="Discount limit">
                    {fmtProfile(profile?.discount_limit)}
                  </GridField>
                  <GridField label="Early payment discount (%)">
                    {fmtProfile(profile?.early_payment_discount)}
                  </GridField>
                  <GridField label="Late fee rule (%)">
                    {fmtProfile(profile?.late_fee_rule)}
                  </GridField>
                </div>
              </SectionCard>

              {crmCompanyId && customer ? (
                <CustomerPaymentCardsEditor
                  crmCompanyId={crmCompanyId}
                  customerName={customer.name ?? "Customer"}
                  active={show}
                />
              ) : null}
            </>
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
          {customer && pricingHref ? (
            <button
              type="button"
              onClick={() => {
                onHide();
                router.push(pricingHref);
              }}
              className="rounded-xl border border-sky-300 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
            >
              Product pricing
            </button>
          ) : null}
          {customer && onEdit ? (
            <button
              type="button"
              onClick={() => {
                onEdit(customer);
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
