import type { UserPermission } from "@/models/Permission";
import type { Rank } from "@/models/Rank";

/** `GET /api/backend/users` — see backend `User\IndexRequest`. */
export interface IndexUserParams {
  search?: string;
  company_id?: number;
  limit?: number;
  load_ranks?: boolean;
}

export interface UserAccessInfo {
  permissions?: UserPermission[] | unknown[];
  [key: string]: unknown;
}

/** Billing backend `User` JSON from `GET /api/user` — extend as your API evolves. */
export interface User {
  id?: number;
  first_name?: string;
  last_name?: string;
  name?: string;
  email?: string;
  phone_no?: string;
  username?: string;
  samaccountname?: string;
  ranks?: Rank[];
  company_id?: number;
  is_super_user?: boolean | number | string;
  user_access_info?: UserAccessInfo;
  permissions?: unknown[];
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
