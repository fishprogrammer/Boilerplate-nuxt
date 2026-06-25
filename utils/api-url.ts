import { appConfig } from '~/config/app'

/**
 * Canonical API path with trailing slash (doc 19). Preserves query string and hash.
 * Example: `/api/auth/login` → `/api/auth/login/`
 */
export function normalizeApiPathSegment(segment: string): string {
  const hashIndex = segment.indexOf('#')
  const hash = hashIndex >= 0 ? segment.slice(hashIndex) : ''
  const withoutHash = hashIndex >= 0 ? segment.slice(0, hashIndex) : segment

  const queryIndex = withoutHash.indexOf('?')
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : ''
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash

  let path = pathname.startsWith('/') ? pathname : `/${pathname}`
  if (path.length > 1 && !path.endsWith('/')) {
    path = `${path}/`
  }

  return `${path}${query}${hash}`
}

/**
 * Full API URL: base + canonical path (always trailing slash before `?`).
 * Use for fetch and axios relative paths.
 */
export function apiPath(segment: string): string {
  const base = appConfig.api.baseUrl.replace(/\/+$/, '')
  const normalized = normalizeApiPathSegment(segment)
  return base ? `${base}${normalized}` : normalized
}

/** @alias apiPath */
export function resolveApiUrl(path: string): string {
  return apiPath(path)
}
