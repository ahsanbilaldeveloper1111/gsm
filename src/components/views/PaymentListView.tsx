"use client";

import { useState } from "react";
import { CrudEntityTable } from "@/components/crud/CrudEntityTable";
import { RecordDetailModal } from "@/components/crud/RecordDetailModal";
import { usePayment } from "@/hooks/payments/usePayment";
import { usePayments } from "@/hooks/payments/usePayments";

/**
 * Payments list with View → full record from GET /payments/{id}.
 */
export function PaymentListView() {
  const listQuery = usePayments();
  const [detailId, setDetailId] = useState<number | string | null>(null);
  const detailQuery = usePayment(detailId);

  return (
    <>
      <CrudEntityTable
        query={listQuery}
        title="Payments"
        onView={(id) => setDetailId(id)}
      />

      <RecordDetailModal
        open={detailId != null}
        title="Payment"
        subtitle="Full payment record from GET /payments/{id}."
        data={detailQuery.data ?? null}
        loading={detailQuery.isPending && detailId != null}
        error={detailQuery.isError ? String(detailQuery.error) : null}
        onClose={() => setDetailId(null)}
      />
    </>
  );
}
