"use client";

import { JsonApiSection } from "@/components/views/JsonApiSection";
import {
  useStripeIncompletePayments,
  useStripeLatestTransactionFee,
} from "@/hooks/stripe/useStripeEndpoints";
import { useStripePublishableKey } from "@/hooks/stripe/useStripePublishableKey";

function panelPayload(q: {
  isError: boolean;
  error: unknown;
  data: unknown;
}) {
  if (q.isError) return { error: String(q.error) };
  return q.data;
}

function subtitle(q: { isFetching: boolean; isError: boolean }) {
  if (q.isFetching) return "Loading…";
  if (q.isError) return "Error";
  return "OK";
}

export function StripeModuleView() {
  const publishableKey = useStripePublishableKey();
  const incompletePayments = useStripeIncompletePayments();
  const latestFee = useStripeLatestTransactionFee();

  return (
    <JsonApiSection
      heading="Stripe endpoints"
      panels={[
        {
          title: "GET …/stripe/publishable-key",
          subtitle: subtitle(publishableKey),
          data: panelPayload(publishableKey),
          defaultOpen: true,
        },
        {
          title: "GET …/stripe/incomplete-payments",
          subtitle: subtitle(incompletePayments),
          data: panelPayload(incompletePayments),
        },
        {
          title: "GET …/stripe/latest-transaction-fee",
          subtitle: subtitle(latestFee),
          data: panelPayload(latestFee),
        },
      ]}
    />
  );
}
