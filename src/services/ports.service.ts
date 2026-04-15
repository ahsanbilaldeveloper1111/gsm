import { apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import {
  normalizeTelecomDataResponse,
  normalizeTelecomListResponse,
  toTelecomError,
} from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { IndexPortParams, Port } from "@/models/Port";

const r = apiRoutes.ports;

export const portsService = {
  async list(params?: IndexPortParams) {
    try {
      const payload = await apiGet<unknown>(r.index(), params as QueryParams | undefined);
      return normalizeTelecomListResponse<Port>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async show(id: number | string) {
    try {
      const payload = await apiGet<unknown>(r.show(id));
      return normalizeTelecomDataResponse<Port>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async byGsm(gsmId: number | string, params?: QueryParams) {
    try {
      const payload = await apiGet<unknown>(r.byGsm(gsmId), params);
      return normalizeTelecomListResponse<Port>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async byCompany(companyId: number | string, params?: QueryParams) {
    try {
      const payload = await apiGet<unknown>(r.byCompany(companyId), params);
      return normalizeTelecomListResponse<Port>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async updateMobileNumber(id: number | string, mobile_number: string) {
    try {
      const payload = await apiPut<unknown>(r.updateMobileNumber(id), { mobile_number });
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async assignPort(body: unknown) {
    try {
      const payload = await apiPost<unknown>(r.assignPort(), body);
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async syncPorts(type: string, gsm: number | string) {
    try {
      const payload = await apiPost<unknown>(r.syncPorts(), { type, gsm });
      return normalizeTelecomDataResponse<{ message?: string } | unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async syncPortsMobileNumber(gsm: number | string, ports: Array<number | string>) {
    try {
      const payload = await apiPost<unknown>(r.syncPortsMobileNumber(), {
        gsm,
        ports,
      });
      return normalizeTelecomDataResponse<{ message?: string } | unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async syncSimStatus() {
    try {
      const payload = await apiPost<unknown>(r.syncSimStatus());
      return normalizeTelecomDataResponse<{ message?: string } | unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async delink(company_id: number | string, port_id: number | string) {
    try {
      const payload = await apiPost<unknown>(r.delink(), { company_id, port_id });
      return normalizeTelecomDataResponse<{ message?: string } | unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async assigned(gsm_id: number | string, company_id: number | string) {
    try {
      const payload = await apiPost<unknown>(r.assigned(), { gsm_id, company_id });
      return normalizeTelecomListResponse<Port>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },

  async assignedRemove(port_id: number | string, gsm_id: number | string, company_id: number | string) {
    try {
      const payload = await apiPost<unknown>(r.assignedRemove(), {
        port_id,
        gsm_id,
        company_id,
      });
      return normalizeTelecomDataResponse<unknown>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};

export const fetchPorts = portsService.list;
