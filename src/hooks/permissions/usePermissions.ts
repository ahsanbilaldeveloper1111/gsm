"use client";

import { useCallback, useMemo } from "react";
import { useCurrentUser } from "@/hooks/auth/useCurrentUser";
import {
  PermissionAction,
  type UserPermission,
  effectiveActionsForModule,
  extractUserPermissions,
  isSuperAdmin,
  isSuperUserFromUser,
} from "@/models/Access";

export interface PermissionSummary {
  totalPermissions: number;
  accessibleModules: string[];
  isSuperAdmin: boolean;
  permissionMapKeys: string[];
}

function buildPermissionMap(
  permissions: UserPermission[],
): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const p of permissions) {
    const mod = String(p.module).trim();
    if (!mod) continue;
    const act = String(p.action).toLowerCase();
    if (!map.has(mod)) map.set(mod, new Set());
    map.get(mod)!.add(act);
  }
  return map;
}

/**
 * Permission checks from the current user (`GET /api/user`).
 * Reads `user_access_info.permissions`, `user.permissions`, and `user.ranks[].permissions`.
 * Full access when: `global`+`admin`, or `is_super_user` on the user payload.
 */
export function usePermissions() {
  const { data, isFetching } = useCurrentUser();
  const user = data?.user;

  const userPermissions = useMemo(
    () => (user ? extractUserPermissions(user) : []),
    [user],
  );

  const isUserSuperAdmin = useMemo(() => {
    if (user && isSuperUserFromUser(user)) return true;
    return isSuperAdmin(userPermissions);
  }, [user, userPermissions]);

  const permissionMap = useMemo(
    () => buildPermissionMap(userPermissions),
    [userPermissions],
  );

  const hasPermission = useCallback(
    (moduleName: string, action: PermissionAction): boolean => {
      if (isUserSuperAdmin) return true;

      const granted = permissionMap.get(moduleName);
      if (!granted || granted.size === 0) return false;

      const required = String(action).toLowerCase();
      const effective = effectiveActionsForModule(granted);
      return effective.has(required);
    },
    [permissionMap, isUserSuperAdmin],
  );

  const canView = useCallback(
    (moduleName: string) =>
      hasPermission(moduleName, PermissionAction.VIEW),
    [hasPermission],
  );

  const canCreate = useCallback(
    (moduleName: string) =>
      hasPermission(moduleName, PermissionAction.CREATE),
    [hasPermission],
  );

  const canUpdate = useCallback(
    (moduleName: string) =>
      hasPermission(moduleName, PermissionAction.UPDATE),
    [hasPermission],
  );

  const canDelete = useCallback(
    (moduleName: string) =>
      hasPermission(moduleName, PermissionAction.DELETE),
    [hasPermission],
  );

  const canAdmin = useCallback(
    (moduleName: string) =>
      hasPermission(moduleName, PermissionAction.ADMIN),
    [hasPermission],
  );

  const hasAnyPermission = useCallback(
    (moduleName: string, actions: PermissionAction[]) =>
      actions.some((a) => hasPermission(moduleName, a)),
    [hasPermission],
  );

  const hasAllPermissions = useCallback(
    (moduleName: string, actions: PermissionAction[]) =>
      actions.every((a) => hasPermission(moduleName, a)),
    [hasPermission],
  );

  const getModulePermissions = useCallback(
    (moduleName: string): PermissionAction[] => {
      const granted = permissionMap.get(moduleName);
      if (!granted) return [];
      const effective = effectiveActionsForModule(granted);
      return Array.from(effective) as PermissionAction[];
    },
    [permissionMap],
  );

  const getAccessibleModules = useCallback(
    () => Array.from(permissionMap.keys()),
    [permissionMap],
  );

  const hasModuleAccess = useCallback(
    (moduleName: string) => permissionMap.has(moduleName),
    [permissionMap],
  );

  const permissionSummary = useMemo((): PermissionSummary => {
    return {
      totalPermissions: userPermissions.length,
      accessibleModules: Array.from(permissionMap.keys()),
      isSuperAdmin: isUserSuperAdmin,
      permissionMapKeys: Array.from(permissionMap.keys()),
    };
  }, [userPermissions.length, permissionMap, isUserSuperAdmin]);

  return {
    hasPermission,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    canAdmin,
    hasAnyPermission,
    hasAllPermissions,
    getModulePermissions,
    getAccessibleModules,
    hasModuleAccess,
    getPermissionSummary: permissionSummary,
    isSuperAdmin: isUserSuperAdmin,
    userPermissions,
    isUserLoading: isFetching,
    rawUser: user,
  };
}

export function usePermission(moduleName: string, action: PermissionAction) {
  const { hasPermission, isSuperAdmin: superAdmin } = usePermissions();

  return useMemo(
    () => ({
      hasPermission: hasPermission(moduleName, action),
      isSuperAdmin: superAdmin,
    }),
    [hasPermission, moduleName, action, superAdmin],
  );
}

export function useModuleAccess(moduleName: string) {
  const { hasModuleAccess, getModulePermissions, isSuperAdmin: superAdmin } =
    usePermissions();

  return useMemo(
    () => ({
      hasAccess: hasModuleAccess(moduleName),
      permissions: getModulePermissions(moduleName),
      isSuperAdmin: superAdmin,
    }),
    [hasModuleAccess, getModulePermissions, moduleName, superAdmin],
  );
}
