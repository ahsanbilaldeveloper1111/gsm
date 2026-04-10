"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import { queryKeys } from "@/lib/queryKeys";
import { stripeService } from "@/services/stripe.service";

export function useStripePublishableKey() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.stripe.publishableKey(),
    queryFn: () => stripeService.publishableKey(),
    enabled,
  });
}
