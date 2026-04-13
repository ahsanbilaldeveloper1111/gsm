"use client";

import { useMutation } from "@tanstack/react-query";
import { stripeService } from "@/services/stripe.service";

export function useStripeCompletePaymentMutation() {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      stripeService.completePayment(body),
  });
}
