import { Suspense } from "react";
import { StripeCheckoutSuccessClient } from "./StripeCheckoutSuccessClient";

export default function PublicPaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center px-4 py-12 text-sm text-zinc-500">
          Loading…
        </div>
      }
    >
      <StripeCheckoutSuccessClient />
    </Suspense>
  );
}
