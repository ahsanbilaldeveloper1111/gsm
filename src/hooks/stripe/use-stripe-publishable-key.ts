"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/use-auth-query-enabled";
import { queryKeys } from "@/lib/query-keys";
import { stripeService } from "@/services/stripe.service";

export function useStripePublishableKey() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.stripe.publishableKey(),
    queryFn: () => stripeService.publishableKey(),
    enabled,
  });
}
