import { Suspense } from "react";
import { StripeCheckoutCancelClient } from "./StripeCheckoutCancelClient";

export default function PublicPaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center px-4 py-12 text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <StripeCheckoutCancelClient />
    </Suspense>
  );
}
