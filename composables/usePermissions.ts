import { computed } from 'vue'
import { PERMISSIONS } from '~/constants/permissions'
import { useAuthStore } from '~/stores/auth'
import {
  canAccessMenu,
  canAccessRouteName,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  type PermissionCheckContext,
} from '~/utils/permissions'

export function usePermissions() {
  const authStore = useAuthStore()

  const accessContext = computed<PermissionCheckContext>(() => ({
    permissions: authStore.userPermissions,
    isSuperuser: authStore.isSuperuser,
    isStaff: authStore.isStaff,
  }))

  function checkPermission(permission: string): boolean {
    return hasPermission(permission, accessContext.value)
  }

  function checkAnyPermission(permissions: readonly string[]): boolean {
    return hasAnyPermission(permissions, accessContext.value)
  }

  function checkAllPermissions(permissions: readonly string[]): boolean {
    return hasAllPermissions(permissions, accessContext.value)
  }

  function canAccessMenuAction(action: string | undefined): boolean {
    return canAccessMenu(action, accessContext.value)
  }

  function canAccessRoute(routeName: string | symbol | null | undefined): boolean {
    return canAccessRouteName(routeName, accessContext.value)
  }

  return {
    user: computed(() => authStore.user),
    userPermissions: computed(() => authStore.userPermissions),
    isSuperuser: computed(() => authStore.isSuperuser),
    isStaff: computed(() => authStore.isStaff),
    PERMISSIONS,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canAccessMenu: canAccessMenuAction,
    canAccessRoute,
  }
}

