import { apiDelete, apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import {
  normalizeTelecomDataResponse,
  normalizeTelecomListResponse,
  toTelecomError,
} from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { GsmAssignment, IndexGsmAssignmentParams } from "@/models/GsmAssignment";

const r = apiRoutes.gsmAssignments;

export const gsmAssignmentsService = {
  async list(params?: IndexGsmAssignmentParams) {
    try {
      const payload = await apiGet<unknown>(r.index(), params as QueryParams | undefined);
      return normalizeTelecomListResponse<GsmAssignment>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
  async show(id: number | string) {
    try {
      const payload = await apiGet<unknown>(r.show(id));
      return normalizeTelecomDataResponse<GsmAssignment>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
  async create(gsm_id: number | string, company_id: number | string) {
    try {
      const payload = await apiPost<unknown>(r.store(), { gsm_id, company_id });
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
  async update(
    id: number | string,
    body: { gsm_id: number | string; company_id: number | string; status: string },
  ) {
    try {
      const payload = await apiPut<unknown>(r.update(id), body);
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
  async sendSms(body: {
    gsm_id: number | string;
    mobileNumber: string;
    message: string;
    port?: number | string | null;
  }) {
    try {
      const payload = await apiPost<unknown>(apiRoutes.deviceProxy.sendSms(), body);
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
  async sendUssd(body: {
    gsm_id: number | string;
    text: string;
    command: "send";
    port: Array<number>;
  }) {
    try {
      const payload = await apiPost<unknown>(apiRoutes.deviceProxy.sendUssd(), body);
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};
