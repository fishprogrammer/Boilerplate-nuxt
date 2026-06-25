import type { MenuAccessRule, RouteAccessRule } from '~/constants/permissions'
import { MENU_ACCESS, ROUTE_ACCESS } from '~/constants/permissions'

export interface PermissionCheckContext {
  permissions: readonly string[]
  isSuperuser?: boolean
  isStaff?: boolean
}

function bypassAccess(ctx: PermissionCheckContext): boolean {
  return ctx.isSuperuser === true
}

function matchesRule(rule: MenuAccessRule | RouteAccessRule | undefined, ctx: PermissionCheckContext): boolean {
  if (!rule) return true
  if (bypassAccess(ctx)) return true

  if ('staffOnly' in rule && rule.staffOnly && ctx.isStaff !== true) {
    return false
  }

  if (rule.anyOf?.length) {
    return rule.anyOf.some((permission) => ctx.permissions.includes(permission.toLowerCase()))
  }

  if ('allOf' in rule && rule.allOf?.length) {
    return rule.allOf.every((permission) => ctx.permissions.includes(permission.toLowerCase()))
  }

  if ('staffOnly' in rule && rule.staffOnly) {
    return ctx.isStaff === true
  }

  return true
}

/** Normalize permissions from /api/auth/me/ (array or object keys). */
export function normalizePermissions(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return [...new Set(raw.map((item) => String(item).trim().toLowerCase()).filter(Boolean))]
  }

  if (raw && typeof raw === 'object') {
    return [...new Set(Object.keys(raw as Record<string, unknown>).map((key) => key.trim().toLowerCase()).filter(Boolean))]
  }

  return []
}

export function hasPermission(permission: string, ctx: PermissionCheckContext): boolean {
  if (bypassAccess(ctx)) return true
  return ctx.permissions.includes(permission.toLowerCase())
}

export function hasAnyPermission(permissions: readonly string[], ctx: PermissionCheckContext): boolean {
  if (bypassAccess(ctx)) return true
  if (permissions.length === 0) return true
  return permissions.some((permission) => hasPermission(permission, ctx))
}

export function hasAllPermissions(permissions: readonly string[], ctx: PermissionCheckContext): boolean {
  if (bypassAccess(ctx)) return true
  if (permissions.length === 0) return true
  return permissions.every((permission) => hasPermission(permission, ctx))
}

export function canAccessMenu(action: string | undefined, ctx: PermissionCheckContext): boolean {
  if (!action) return true
  return matchesRule(MENU_ACCESS[action], ctx)
}

export function canAccessRouteName(routeName: string | symbol | null | undefined, ctx: PermissionCheckContext): boolean {
  if (!routeName || typeof routeName !== 'string') return true
  return matchesRule(ROUTE_ACCESS[routeName], ctx)
}

