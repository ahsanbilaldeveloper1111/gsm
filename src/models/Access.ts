/**
 * Helpers: normalize `GET /api/user` payloads into checks (arrays, not only `AccessInfo` maps).
 */

export { ModuleName, ModuleStatus, type Module } from "./Module";
export {
  PermissionAction,
  type Permission,
  type UserPermission,
  type AccessInfo,
  permissionLevels,
} from "./Permission";

import { ModuleName } from "./Module";
import {
  PermissionAction,
  type UserPermission,
  permissionLevels,
} from "./Permission";

function normalizeAction(action: string): PermissionAction | string {
  const a = action.toLowerCase().trim();
  if (
    a === PermissionAction.VIEW ||
    a === PermissionAction.CREATE ||
    a === PermissionAction.UPDATE ||
    a === PermissionAction.DELETE ||
    a === PermissionAction.ADMIN
  ) {
    return a as PermissionAction;
  }
  return a;
}

function normalizeModule(mod: unknown): string {
  if (mod === undefined || mod === null) return "";
  return String(mod).trim();
}

function dedupePermissions(rows: UserPermission[]): UserPermission[] {
  const seen = new Set<string>();
  const out: UserPermission[] = [];
  for (const r of rows) {
    const key = `${normalizeModule(r.module)}|${String(r.action).toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(r);
    }
  }
  return out;
}

function normalizePermissionArray(arr: unknown[]): UserPermission[] {
  const out: UserPermission[] = [];
  for (const p of arr) {
    if (!p || typeof p !== "object") continue;
    const o = p as Record<string, unknown>;
    const moduleName = normalizeModule(
      o.module ?? o.module_name ?? o.module_key ?? o.slug,
    );
    const rawAction = o.action ?? o.permission_action;
    if (!moduleName || rawAction === undefined || rawAction === null) continue;
    out.push({
      module: moduleName,
      action: normalizeAction(String(rawAction)),
    });
  }
  return dedupePermissions(out);
}

/** True if Laravel sends `is_super_user` on the user model. */
export function isSuperUserFromUser(user: unknown): boolean {
  if (!user || typeof user !== "object") return false;
  const u = user as Record<string, unknown>;
  const v = u.is_super_user;
  if (v === true || v === 1) return true;
  if (v === "1" || v === "true") return true;
  return false;
}

export function isSuperAdmin(userPermissions: UserPermission[]): boolean {
  return userPermissions.some(
    (p) =>
      normalizeAction(String(p.action)) === PermissionAction.ADMIN &&
      normalizeModule(p.module) === ModuleName.GLOBAL,
  );
}

/**
 * Collect permissions from typical Laravel shapes:
 * - `user.user_access_info.permissions` (array or map)
 * - `user.permissions`
 * - `user.ranks[].permissions`
 */
export function extractUserPermissions(user: unknown): UserPermission[] {
  if (!user || typeof user !== "object") return [];
  const u = user as Record<string, unknown>;
  const collected: UserPermission[] = [];

  const accessInfo = u.user_access_info;
  if (accessInfo && typeof accessInfo === "object") {
    const raw = (accessInfo as Record<string, unknown>).permissions;
    if (Array.isArray(raw)) {
      collected.push(...normalizePermissionArray(raw));
    } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      const map = raw as Record<string, { action?: string } | unknown>;
      for (const [mod, entry] of Object.entries(map)) {
        if (
          entry &&
          typeof entry === "object" &&
          "action" in entry &&
          typeof (entry as { action?: unknown }).action === "string"
        ) {
          collected.push({
            module: mod,
            action: normalizeAction((entry as { action: string }).action),
          });
        }
      }
    }
  }

  if (Array.isArray(u.permissions)) {
    collected.push(...normalizePermissionArray(u.permissions));
  }

  if (Array.isArray(u.ranks)) {
    for (const r of u.ranks) {
      if (r && typeof r === "object") {
        const perms = (r as Record<string, unknown>).permissions;
        if (Array.isArray(perms)) {
          collected.push(...normalizePermissionArray(perms));
        }
      }
    }
  }

  return dedupePermissions(collected);
}

/** Union of implied actions for everything the user holds on a module. */
export function effectiveActionsForModule(
  grantedActions: Set<string>,
): Set<string> {
  const effective = new Set<string>();
  const known = Object.values(PermissionAction) as string[];
  for (const raw of grantedActions) {
    const s = String(raw).toLowerCase();
    if (known.includes(s)) {
      const key = s as PermissionAction;
      for (const implied of permissionLevels[key]) {
        effective.add(implied);
      }
    } else {
      effective.add(s);
    }
  }
  return effective;
}
