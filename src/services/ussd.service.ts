import { apiGet, type QueryParams } from "@/lib/api/http";
import { normalizeTelecomListResponse, toTelecomError } from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { IndexUssdParams, UssdRow } from "@/models/Ussd";

export const ussdService = {
  async list(params?: IndexUssdParams) {
    try {
      const payload = await apiGet<unknown>(
        apiRoutes.ussd(),
        params as QueryParams | undefined,
      );
      return normalizeTelecomListResponse<UssdRow>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};

export const fetchUssd = ussdService.list;
