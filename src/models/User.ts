import type { UserPermission } from "@/models/Permission";
import type { Rank } from "@/models/Rank";

export interface UserAccessInfo {
  permissions?: UserPermission[] | unknown[];
  [key: string]: unknown;
}

/** Laravel `User` JSON from `GET /api/user` — extend as your API evolves. */
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
