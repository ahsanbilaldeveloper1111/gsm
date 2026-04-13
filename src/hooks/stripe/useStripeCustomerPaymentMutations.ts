"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { stripeService } from "@/services/stripe.service";

export function useStripeCustomerPaymentMutations(
  crmCompanyId: string | null | undefined,
) {
  const qc = useQueryClient();
  const invalidate = () => {
    const id = crmCompanyId?.trim();
    if (!id) return;
    void qc.invalidateQueries({
      queryKey: queryKeys.stripe.paymentMethodsForCustomer(id),
    });
  };

  const createAndConfirm = useMutation({
    mutationFn: (body: {
      cardholderName: string;
      isDefault: boolean;
      stripeToken: string;
    }) => {
      const id = crmCompanyId?.trim();
      if (!id) throw new Error("Missing CRM company id");
      return stripeService.createAndConfirmPaymentMethodForCustomer(id, body);
    },
    onSuccess: invalidate,
  });

  const saveFromIntent = useMutation({
    mutationFn: (body: { payment_intent_id: string; isDefault: boolean }) =>
      stripeService.savePaymentMethod(body),
    onSuccess: invalidate,
  });

  const setDefault = useMutation({
    mutationFn: (paymentMethodId: string) => {
      const id = crmCompanyId?.trim();
      if (!id) throw new Error("Missing CRM company id");
      return stripeService.setDefaultForCustomer(id, {
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

  return {
    createAndConfirm,
    saveFromIntent,
    setDefault,
    remove,
    invalidate,
  };
}
