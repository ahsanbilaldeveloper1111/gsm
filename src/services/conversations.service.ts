import { apiDelete, apiGet, apiPut, type QueryParams } from "@/lib/api/http";
import {
  normalizeTelecomDataResponse,
  normalizeTelecomListResponse,
  toTelecomError,
} from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { Conversation, IndexConversationParams } from "@/models/Conversation";

const r = apiRoutes.conversations;

export const conversationsService = {
  async list(params?: IndexConversationParams) {
    try {
      const payload = await apiGet<unknown>(r.index(), params as QueryParams | undefined);
      return normalizeTelecomListResponse<Conversation>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async show(id: number | string) {
    try {
      const payload = await apiGet<unknown>(r.show(id));
      return normalizeTelecomDataResponse<Conversation>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async byMobile(mobile_number: string, port_id?: number | string) {
    try {
      const payload = await apiGet<unknown>(r.byMobile(), { mobile_number, port_id });
      return normalizeTelecomDataResponse<Conversation | unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async updateStatus(id: number | string, status: "active" | "archived" | "closed") {
    try {
      const payload = await apiPut<unknown>(r.updateStatus(id), { status });
      return normalizeTelecomDataResponse<Conversation | unknown>(payload);
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

  async destroy(id: number | string) {
    try {
      const payload = await apiDelete<unknown>(r.destroy(id));
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};

export const fetchConversations = conversationsService.list;
