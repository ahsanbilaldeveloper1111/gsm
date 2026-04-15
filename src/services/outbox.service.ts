import { apiGet, type QueryParams } from "@/lib/api/http";
import { normalizeTelecomListResponse, toTelecomError } from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { IndexOutboxParams, OutboxRow } from "@/models/Outbox";

export const outboxService = {
  async list(params?: IndexOutboxParams) {
    try {
      const payload = await apiGet<unknown>(
        apiRoutes.outbox(),
        params as QueryParams | undefined,
      );
      return normalizeTelecomListResponse<OutboxRow>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};

export const fetchOutbox = outboxService.list;
