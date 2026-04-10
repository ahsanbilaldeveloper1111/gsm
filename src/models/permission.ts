import { type Module, ModuleName } from "./module";

export interface Permission {
  id: number;
  name: string;
  description: string;
  module_id: number;
  action: string;
  created_at?: string;
  updated_at?: string;
}

export enum PermissionAction {
  VIEW = "view",
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  ADMIN = "admin",
}

export const permissionLevels = {
  [PermissionAction.VIEW]: [PermissionAction.VIEW],
  [PermissionAction.CREATE]: [PermissionAction.VIEW, PermissionAction.CREATE],
  [PermissionAction.UPDATE]: [PermissionAction.VIEW, PermissionAction.UPDATE],
  [PermissionAction.DELETE]: [PermissionAction.VIEW, PermissionAction.DELETE],
  [PermissionAction.ADMIN]: [
    PermissionAction.VIEW,
    PermissionAction.CREATE,
    PermissionAction.UPDATE,
    PermissionAction.DELETE,
    PermissionAction.ADMIN,
  ],
};

export interface PermissionCreateData {
  action: PermissionAction;
  module_id: number;
}

export interface PermissionUpdateData {
  action?: PermissionAction;
  module_id?: number;
}

export interface AccessInfo {
  permissions: Record<ModuleName, { action: PermissionAction }>;
}

/** Runtime checks use module key + action (multiple actions per module supported). */
export interface UserPermission {
  module: ModuleName | string;
  action: PermissionAction | string;
}

export type { Module };
