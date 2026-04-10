import type { Permission } from "@/models/permission";

export enum RankStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

export interface Rank {
  id?: number;
  name: string;
  description: string;
  users_count?: number;
  permissions?: Permission[];
  created_at?: string;
  updated_at?: string;
}

export interface RankCreateData {
  name: string;
  description: string;
}

export interface RankUpdateData {
  name?: string;
  description?: string;
}
