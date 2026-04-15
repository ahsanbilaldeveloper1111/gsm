import {
  apiDelete,
  apiGet,
  apiPost,
  apiPut,
  type QueryParams,
} from "@/lib/api/http";
import {
  normalizeTelecomDataResponse,
  normalizeTelecomListResponse,
  toTelecomError,
} from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type {
  CreateSimPayload,
  IndexSimParams,
  Sim,
  UpdateSimPayload,
} from "@/models/Sim";

const r = apiRoutes.sims;

export const simsService = {
  async list(params?: IndexSimParams) {
    try {
      const payload = await apiGet<unknown>(
        r.index(),
        params as QueryParams | undefined,
      );
      return normalizeTelecomListResponse<Sim>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async show(id: number | string) {
    try {
      const payload = await apiGet<unknown>(r.show(id));
      return normalizeTelecomDataResponse<Sim>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async create(body: CreateSimPayload) {
    try {
      const payload = await apiPost<unknown>(r.store(), body);
      return normalizeTelecomDataResponse<Sim | unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async update(id: number | string, body: UpdateSimPayload) {
    try {
      const payload = await apiPut<unknown>(r.update(id), body);
      return normalizeTelecomDataResponse<Sim | unknown>(payload);
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

export const fetchSims = simsService.list;
