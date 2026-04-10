"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import { stripeService } from "@/services/stripe.service";

export function useStripeIncompletePayments(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.stripe.incompletePayments(),
    queryFn: () => stripeService.incompletePayments(params),
    enabled,
  });
}

export function useStripeLatestTransactionFee(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.stripe.latestTransactionFee(),
    queryFn: () => stripeService.latestTransactionFee(params),
    enabled,
  });
}

export function useStripePaymentMethodsForCustomer(
  crmCompanyId: string | null | undefined,
  params?: QueryParams,
) {
  const enabled = useAuthQueryEnabled() && !!crmCompanyId;
  return useQuery({
    queryKey: queryKeys.stripe.paymentMethodsForCustomer(crmCompanyId ?? null),
    queryFn: () =>
      stripeService.paymentMethodsForCustomer(crmCompanyId as string, params),
    enabled,
  });
}

export function useStripePaymentMethods(
  profileId: number | string | null | undefined,
  params?: QueryParams,
) {
  const enabled =
    useAuthQueryEnabled() && profileId != null && profileId !== "";
  return useQuery({
    queryKey: queryKeys.stripe.paymentMethods(profileId ?? null),
    queryFn: () =>
      stripeService.paymentMethods(profileId as number | string, params),
    enabled,
  });
}
