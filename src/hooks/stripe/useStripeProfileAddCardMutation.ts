"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { stripeService } from "@/services/stripe.service";

export type AddCardByProfileBody = {
  cardholderName: string;
  isDefault: boolean;
  stripeToken: string;
};

export function useStripeProfileAddCardMutation(profileId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AddCardByProfileBody) => {
      if (profileId == null || profileId === 0) {
        throw new Error("Missing company profile id");
      }
      return stripeService.createAndConfirmPaymentMethodByProfile(
        profileId,
        body,
      );
    },
    onSuccess: () => {
      if (profileId != null) {
        void qc.invalidateQueries({
          queryKey: queryKeys.stripe.paymentMethods(profileId),
        });
      }
    },
  });
}
