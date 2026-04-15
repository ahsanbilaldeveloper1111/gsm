import { apiGet, type QueryParams } from "@/lib/api/http";
import { normalizeTelecomListResponse, toTelecomError } from "@/lib/api/telecomResponse";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { InboxRow, IndexInboxParams } from "@/models/Inbox";

export const inboxService = {
  async list(params?: IndexInboxParams) {
    try {
      const payload = await apiGet<unknown>(
        apiRoutes.inbox(),
        params as QueryParams | undefined,
      );
      return normalizeTelecomListResponse<InboxRow>(payload);
    } catch (error) {
      throw toTelecomError(error);
    }
  },
};

export const fetchInbox = inboxService.list;
