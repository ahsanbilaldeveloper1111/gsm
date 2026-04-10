"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/permissions/usePermissions";
import { PermissionAction } from "@/models/Permission";

type PermissionGateProps = {
  module: string;
  action?: PermissionAction;
  fallback?: ReactNode;
  children: ReactNode;
};

/** Renders `children` when the user has the required permission (or is super-admin). */
export function PermissionGate({
  module: moduleName,
  action = PermissionAction.VIEW,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, isSuperAdmin: superAdmin } = usePermissions();

  if (superAdmin || hasPermission(moduleName, action)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
