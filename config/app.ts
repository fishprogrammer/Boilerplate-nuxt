import { APP_VERSION } from './version'

const PRODUCTION_API_BASE_URL = 'https://api.store.a4j.ir'

function resolvePublicUrlFromEnv(): string {
  return String(
    import.meta.env.NUXT_PUBLIC_APP_PUBLIC_URL || import.meta.env.VITE_APP_PUBLIC_URL || '',
  )
    .trim()
    .replace(/\/+$/, '')
}

/** Canonical frontend origin for absolute URLs (payment return links, etc.). */
export function getAppPublicOrigin(): string {
  const fromEnv = resolvePublicUrlFromEnv()
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined') return window.location.origin.replace(/\/+$/, '')
  return ''
}

export function getAppPublicOriginSource(): 'env' | 'browser' {
  return resolvePublicUrlFromEnv() ? 'env' : 'browser'
}

function resolveApiBaseUrl(): string {
  const fromEnv = String(
    import.meta.env.NUXT_PUBLIC_API_BASE_URL || import.meta.env.NUXT_PUBLIC_API_BASE || '',
  ).trim()
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, '')
  }

  // Dev / same-origin proxy via Nitro `/api` route
  if (import.meta.dev) {
    return '/api'
  }

  return PRODUCTION_API_BASE_URL.replace(/\/+$/, '')
}

export const appConfig = {
  title: import.meta.env.NUXT_PUBLIC_APP_TITLE || 'Soft Store',
  name:
    import.meta.env.NUXT_PUBLIC_APP_NAME ||
    import.meta.env.NUXT_PUBLIC_APP_TITLE ||
    'Soft Store',
  description: import.meta.env.NUXT_PUBLIC_APP_DESCRIPTION || 'فروشگاه نرم‌افزار و افزونه‌های وردپرس',
  /** Semantic version — edit only `app.version.json`. */
  version: APP_VERSION,
  themeColor: import.meta.env.NUXT_PUBLIC_APP_THEME_COLOR || '#00B894',
  bgColor: import.meta.env.NUXT_PUBLIC_APP_BG_COLOR || '#f4f5f6',
  storagePrefix: import.meta.env.NUXT_PUBLIC_APP_STORAGE_PREFIX || 'app',
  api: {
    baseUrl: resolveApiBaseUrl(),
    timeout: Number(import.meta.env.NUXT_PUBLIC_API_TIMEOUT) || 30_000,
  },
} as const
