"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { stripeService } from "@/services/stripe.service";

/**
 * Set default / delete payment methods scoped to a company profile
 * (`GET/POST …/stripe/payment-methods/{profileId}`, `…/set-default/{profileId}`),
 * not the CRM customer routes under `…/customer/…`.
 */
export function useStripeProfilePaymentMutations(
  profileId: string | number | null | undefined,
) {
  const qc = useQueryClient();
  const id =
    profileId != null && profileId !== ""
      ? profileId
      : null;

  const invalidate = () => {
    if (id == null) return;
    void qc.invalidateQueries({
      queryKey: queryKeys.stripe.paymentMethods(id),
    });
  };

  const setDefault = useMutation({
    mutationFn: (paymentMethodId: string) => {
      if (id == null) throw new Error("Missing profile id");
      return stripeService.setDefault(id, {
        payment_method_id: paymentMethodId,
      });
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (paymentMethodId: string) =>
      stripeService.deletePaymentMethod(paymentMethodId),
    onSuccess: invalidate,
  });

  return { setDefault, remove };
}
