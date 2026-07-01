import { STORAGE_KEYS } from '~/constants/storage'

/** Keys used before STORAGE_KEYS centralisation — migrate on startup. */
const LEGACY_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
} as const

function canUseLocalStorage(): boolean {
  return Boolean(import.meta.client) && typeof localStorage !== 'undefined'
}

function migrateKey(currentKey: string, legacyKey: string) {
  if (!canUseLocalStorage()) return
  if (localStorage.getItem(currentKey)) return
  const legacy = localStorage.getItem(legacyKey)
  if (!legacy) return
  localStorage.setItem(currentKey, legacy)
  localStorage.removeItem(legacyKey)
}

/** Move tokens from legacy plain keys (`token`, `refresh_token`) to prefixed STORAGE_KEYS. */
export function migrateLegacyAuthStorage() {
  if (!canUseLocalStorage()) return
  migrateKey(STORAGE_KEYS.TOKEN, LEGACY_KEYS.TOKEN)
  migrateKey(STORAGE_KEYS.REFRESH_TOKEN, LEGACY_KEYS.REFRESH_TOKEN)
  migrateKey(STORAGE_KEYS.USER_ID, LEGACY_KEYS.USER_ID)
}

export function getAccessToken(): string | null {
  if (!canUseLocalStorage()) return null
  return localStorage.getItem(STORAGE_KEYS.TOKEN)
}

export function getRefreshToken(): string | null {
  if (!canUseLocalStorage()) return null
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)
}

export function setAccessToken(token: string) {
  if (!canUseLocalStorage()) return
  localStorage.setItem(STORAGE_KEYS.TOKEN, token)
}

export function setRefreshToken(token: string) {
  if (!canUseLocalStorage()) return
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token)
}

export function clearAuthTokens() {
  if (!canUseLocalStorage()) return
  localStorage.removeItem(STORAGE_KEYS.TOKEN)
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN)
  localStorage.removeItem(STORAGE_KEYS.USER_ID)
}

