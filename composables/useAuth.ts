import { storeToRefs } from 'pinia'

export function useAuth() {
  const authStore = useAuthStore()
  const {
    user,
    isAuthenticated,
    isLoading,
    displayName,
    userPermissions,
    userRoles,
    isStaff,
    isSuperuser,
    unreadCount,
  } = storeToRefs(authStore)

  async function fetchMe() {
    return authStore.fetchCurrentUser()
  }

  function can(permission: string): boolean {
    if (isSuperuser.value) return true
    return userPermissions.value.includes(permission)
  }

  async function logout() {
    const { executeLogout } = useLogout()
    await executeLogout()
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    displayName,
    userPermissions,
    userRoles,
    isStaff,
    isSuperuser,
    unreadCount,
    fetchMe,
    can,
    logout,
    store: authStore,
  }
}
