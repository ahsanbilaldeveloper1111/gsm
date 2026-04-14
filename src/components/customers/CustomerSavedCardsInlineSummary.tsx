"use client";

import { useMemo } from "react";
import { useStripePaymentMethodsForCustomer } from "@/hooks/stripe/useStripeEndpoints";
import { parseStripePaymentMethods } from "@/lib/stripe/parseStripePaymentMethods";

type CustomerSavedCardsInlineSummaryProps = {
  crmCompanyId: string | null;
  className?: string;
};

/**
 * One-line summary of Stripe saved cards (for Tax & billing context).
 */
export function CustomerSavedCardsInlineSummary({
  crmCompanyId,
  className = "mt-1 text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400",
}: CustomerSavedCardsInlineSummaryProps) {
  const q = useStripePaymentMethodsForCustomer(crmCompanyId);
  const list = useMemo(() => parseStripePaymentMethods(q.data), [q.data]);

  if (!crmCompanyId) return null;

  if (q.isPending) {
    return <p className={className}>Loading saved cards…</p>;
  }

  if (list.length === 0) {
    return (
      <p className={className}>
        No cards on file yet. Use <strong className="font-medium">Payment cards</strong>{" "}
        below to add one.
      </p>
    );
  }

  const def = list.find((p) => p.is_default) ?? list[0];
  const extra = Math.max(0, list.length - 1);

  return (
    <p className={className}>
      <span className="font-medium text-zinc-700 dark:text-zinc-300">
        {list.length}
      </span>{" "}
      saved {list.length === 1 ? "card" : "cards"}
      {def ? (
        <>
          {" "}
          · default{" "}
          <span className="uppercase">{def.card?.brand ?? "Card"}</span> ••••
          {def.card?.last4 ?? "—"}
          {def.card?.exp_month != null && def.card?.exp_year != null
            ? ` (${String(def.card.exp_month).padStart(2, "0")}/${def.card.exp_year})`
            : null}
        </>
      ) : null}
      {extra > 0 ? ` · +${extra} more` : null}
    </p>
  );
}
