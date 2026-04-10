import type { ApiSuccessResponse } from "@/lib/api/types";
import { apiDelete, apiGet, apiPost, apiPut, type QueryParams } from "@/lib/api/http";
import { apiRoutes } from "@/lib/routes/apiRoutes";
import type { User } from "@/models/User";

export async function fetchUsers(
  params?: QueryParams,
): Promise<ApiSuccessResponse<User[]>> {
  return apiGet<ApiSuccessResponse<User[]>>(apiRoutes.users.index(), params);
}

export async function fetchUser(
  id: number | string,
  params?: QueryParams,
): Promise<ApiSuccessResponse<User>> {
  return apiGet<ApiSuccessResponse<User>>(
    apiRoutes.users.show(id),
    params,
  );
}

export async function updateUser(
  id: number | string,
  body: unknown,
): Promise<ApiSuccessResponse<unknown>> {
  return apiPut<ApiSuccessResponse<unknown>>(apiRoutes.users.update(id), body);
}

export async function deleteUser(
  id: number | string,
): Promise<ApiSuccessResponse<unknown>> {
  return apiDelete<ApiSuccessResponse<unknown>>(apiRoutes.users.destroy(id));
}

export async function updatePasswordByUsername(
  username: string,
  body: unknown,
): Promise<ApiSuccessResponse<unknown>> {
  return apiPut<ApiSuccessResponse<unknown>>(
    apiRoutes.users.updatePasswordByUsername(username),
    body,
  );
}

export async function updatePasswordById(
  id: number | string,
  body: unknown,
): Promise<ApiSuccessResponse<unknown>> {
  return apiPost<ApiSuccessResponse<unknown>>(
    apiRoutes.users.updatePassword(id),
    body,
  );
}

export async function updateUserSetting(
  id: number | string,
  body: unknown,
): Promise<ApiSuccessResponse<unknown>> {
  return apiPost<ApiSuccessResponse<unknown>>(
    apiRoutes.users.updateSetting(id),
    body,
  );
}
