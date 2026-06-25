import { refreshAccessTokenIfNeeded } from '~/api/client'
import { getAccessToken, getRefreshToken } from '~/utils/auth-storage'
import { isAccessTokenExpired } from '~/utils/jwt'

/** True when the user has a usable access token (refreshing first if expired). */
export async function hasAuthenticatedSession(): Promise<boolean> {
  const access = getAccessToken()
  const refresh = getRefreshToken()

  if (!access && !refresh) return false
  if (access && !isAccessTokenExpired(access)) return true
  if (!refresh) return Boolean(access)

  const refreshed = await refreshAccessTokenIfNeeded()
  return Boolean(refreshed ?? getAccessToken())
}

