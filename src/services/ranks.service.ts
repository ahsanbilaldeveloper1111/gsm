import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiDelete, apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";

const r = apiRoutes.ranks;

export const rankService = {
  list: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.index(), params),

  moduleList: (params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.moduleList(), params),

  show: (id: number | string, params?: QueryParams) =>
    apiGet<ApiSuccessResponse<unknown>>(r.show(id), params),

  create: (body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.store(), body),

  duplicate: (id: number | string, body?: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.duplicate(id), body),

  updatePermissions: (id: number | string, body: unknown) =>
    apiPost<ApiSuccessResponse<unknown>>(r.permissions(id), body),

  update: (id: number | string, body: unknown) =>
    apiPut<ApiSuccessResponse<unknown>>(r.update(id), body),

  destroy: (id: number | string) =>
    apiDelete<ApiSuccessResponse<unknown>>(r.destroy(id)),
};
