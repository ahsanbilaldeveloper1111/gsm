"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { stripeService } from "@/services/stripe.service";

export type AddCardByProfileBody = {
  cardholderName: string;
  isDefault: boolean;
  stripeToken: string;
};

export function useStripeProfileAddCardMutation(
  profileId: number | string | null,
) {
  const qc = useQueryClient();
  const valid =
    profileId != null &&
    profileId !== "" &&
    !(typeof profileId === "number" && profileId === 0);

  return useMutation({
    mutationFn: (body: AddCardByProfileBody) => {
      if (!valid) {
        throw new Error("Missing company profile id");
      }
      return stripeService.createAndConfirmPaymentMethodByProfile(
        profileId,
        body,
      );
    },
    onSuccess: () => {
      if (valid) {
        void qc.invalidateQueries({
          queryKey: queryKeys.stripe.paymentMethods(profileId),
        });
      }
    },
  });
}
