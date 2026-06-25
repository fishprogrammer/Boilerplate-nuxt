import { useAuthStore } from '~/stores/auth'

/** After login/register verify — load profile from GET /api/auth/me/ */
export async function hydrateUserSession(force = false) {
  const authStore = useAuthStore()
  return authStore.fetchCurrentUser(force)
}

