import { apiDelete, apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import {
  normalizeTelecomDataResponse,
  normalizeTelecomListResponse,
  toTelecomError,
} from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type {
  CreateGsmPayload,
  GsmDevice,
  IndexGsmParams,
  UpdateGsmPayload,
} from "@/models/Gsm";

const r = apiRoutes.gsm;

export const gsmService = {
  async list(params?: IndexGsmParams) {
    try {
      const payload = await apiGet<unknown>(r.index(), params as QueryParams | undefined);
      return normalizeTelecomListResponse<GsmDevice>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async show(id: number | string) {
    try {
      const payload = await apiGet<unknown>(r.show(id));
      return normalizeTelecomDataResponse<GsmDevice>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async create(body: CreateGsmPayload) {
    try {
      const payload = await apiPost<unknown>(r.store(), body);
      return normalizeTelecomDataResponse<GsmDevice | unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async update(id: number | string, body: UpdateGsmPayload) {
    try {
      const payload = await apiPut<unknown>(r.update(id), body);
      return normalizeTelecomDataResponse<GsmDevice | unknown>(payload);
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

  async assignCompany(gsmId: number | string, company_id: number | string) {
    try {
      const payload = await apiPost<unknown>(r.assignCompany(gsmId), { company_id });
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async clientProfile(params?: QueryParams) {
    try {
      const payload = await apiGet<unknown>(r.clientProfile(), params);
      return normalizeTelecomListResponse(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};

export const fetchGsmDevices = gsmService.list;
