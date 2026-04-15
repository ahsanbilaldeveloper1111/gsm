import { apiGet, apiPost, type QueryParams } from "@/lib/api/http";
import {
  normalizeTelecomDataResponse,
  normalizeTelecomListResponse,
  toTelecomError,
} from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { IndexNotificationParams, NotificationRow } from "@/models/Notification";

const r = apiRoutes.notifications;

export const notificationsService = {
  async list(params?: IndexNotificationParams) {
    try {
      const payload = await apiGet<unknown>(r.index(), params as QueryParams | undefined);
      return normalizeTelecomListResponse<NotificationRow>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async statistics(params?: QueryParams) {
    try {
      const payload = await apiGet<unknown>(r.statistics(), params);
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async byMobile(mobile_number: string) {
    try {
      const payload = await apiGet<unknown>(r.byMobile(), { mobile_number });
      return normalizeTelecomListResponse<NotificationRow>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async byMobileWithParams(params: QueryParams) {
    try {
      const payload = await apiGet<unknown>(r.byMobile(), params);
      return normalizeTelecomListResponse<NotificationRow>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async show(id: number | string) {
    try {
      const payload = await apiGet<unknown>(r.show(id));
      return normalizeTelecomDataResponse<NotificationRow | unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async sendSms(body: unknown) {
    try {
      const payload = await apiPost<unknown>(r.sendSms(), body);
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};

export const fetchNotifications = notificationsService.list;
