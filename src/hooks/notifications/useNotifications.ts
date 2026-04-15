"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthQueryEnabled } from "@/hooks/useAuthQueryEnabled";
import type { QueryParams } from "@/lib/api/http";
import { queryKeys } from "@/lib/queryKeys";
import type { IndexNotificationParams } from "@/models/Notification";
import { notificationsService } from "@/services/notifications.service";

function record(params?: Record<string, unknown> | null): Record<string, unknown> | null {
  return params ?? null;
}

export function useNotifications(params?: IndexNotificationParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.notifications.list(
      record(params as Record<string, unknown> | undefined),
    ),
    queryFn: () => notificationsService.list(params),
    enabled,
  });
}

export function useNotificationStatistics() {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: queryKeys.notifications.statistics(),
    queryFn: () => notificationsService.statistics(),
    enabled,
  });
}

export function useNotificationStatisticsWithParams(params?: QueryParams) {
  const enabled = useAuthQueryEnabled();
  return useQuery({
    queryKey: [...queryKeys.notifications.statistics(), record(params as Record<string, unknown> | undefined)],
    queryFn: () => notificationsService.statistics(params),
    enabled,
  });
}

export function useNotificationsByMobile(params?: QueryParams, enabledOverride?: boolean) {
  const enabled = useAuthQueryEnabled() && (enabledOverride ?? true);
  return useQuery({
    queryKey: queryKeys.notifications.byMobile(
      record(params as Record<string, unknown> | undefined),
    ),
    queryFn: () => notificationsService.byMobileWithParams(params ?? {}),
    enabled,
  });
}

export function useNotificationById(id: number | null, enabledOverride?: boolean) {
  const enabled = useAuthQueryEnabled() && id != null && (enabledOverride ?? true);
  return useQuery({
    queryKey: queryKeys.notifications.detail(id),
    queryFn: () => notificationsService.show(id as number),
    enabled,
  });
}
