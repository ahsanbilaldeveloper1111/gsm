import { apiGet, type QueryParams } from "@/lib/api/http";
import { normalizeTelecomListResponse, toTelecomError } from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { CdrRow, IndexCdrParams } from "@/models/Cdr";

export const cdrService = {
  async list(params?: IndexCdrParams) {
    try {
      const payload = await apiGet<unknown>(
        apiRoutes.cdr(),
        params as QueryParams | undefined,
      );
      return normalizeTelecomListResponse<CdrRow>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};

export const fetchCdr = cdrService.list;
