import type { RouteLocationRaw, Router } from 'vue-router'

export type ResolvedNotificationRoute = RouteLocationRaw

function stripOrigin(path: string): string {
  return path.replace(/^https?:\/\/[^/]+/i, '')
}

function parseQuery(search: string): Record<string, string> {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const query: Record<string, string> = {}
  params.forEach((value, key) => {
    query[key] = value
  })
  return query
}

function normalizeActionPathname(pathname: string): string {
  let path = pathname.replace(/\/+$/, '') || '/'
  if (path.startsWith('/api/')) {
    path = path.slice(4) || '/'
  }
  return path
}

/** Resolve internal SPA routes from inbox notification action_url values. */
export function resolveNotificationActionRoute(actionUrl: string): ResolvedNotificationRoute | null {
  const trimmed = actionUrl.trim()
  if (!trimmed) return null

  const pathWithQuery = stripOrigin(trimmed)
  const [pathname, search = ''] = pathWithQuery.split('?')
  const normalizedPath = normalizeActionPathname(pathname)
  const query = parseQuery(search)

  const ticketViewMatch = normalizedPath.match(/^\/tickets\/view\/([^/]+)$/i)
  if (ticketViewMatch?.[1]) {
    return { name: 'view-ticket', params: { id: ticketViewMatch[1] } }
  }

  const ticketUuidMatch = normalizedPath.match(/^\/tickets\/([0-9a-f-]{36})$/i)
  if (ticketUuidMatch?.[1]) {
    return { name: 'view-ticket', params: { id: ticketUuidMatch[1] } }
  }

  if (normalizedPath === '/wallet/deposit/result') {
    return { name: 'wallet-deposit-result', query }
  }

  if (normalizedPath === '/wallet/deposit') {
    return { name: 'wallet-deposit', query }
  }

  if (normalizedPath === '/wallet') {
    return { name: 'wallet', query }
  }

  const blogMatch = normalizedPath.match(/^\/blog\/p\/([^/]+)$/i)
  if (blogMatch?.[1]) {
    return { name: 'blog-view', params: { id: blogMatch[1] } }
  }

  const userMatch = normalizedPath.match(/^\/users\/([^/]+)$/i)
  if (userMatch?.[1]) {
    return { name: 'view-user', params: { id: userMatch[1] } }
  }

  if (normalizedPath === '/notifications') {
    return { name: 'notifications', query }
  }

  const notificationMatch = normalizedPath.match(/^\/notifications\/view\/([^/]+)$/i)
  if (notificationMatch?.[1]) {
    return { name: 'view-notification', params: { id: notificationMatch[1] } }
  }

  return null
}

export function isExternalNotificationActionUrl(actionUrl: string): boolean {
  const trimmed = actionUrl.trim()
  if (!trimmed) return false
  if (resolveNotificationActionRoute(trimmed)) return false
  return /^https?:\/\//i.test(trimmed)
}

export function isInternalNotificationActionUrl(actionUrl: string): boolean {
  const trimmed = actionUrl.trim()
  if (!trimmed) return false
  if (resolveNotificationActionRoute(trimmed)) return true

  const pathWithQuery = stripOrigin(trimmed)
  const pathname = normalizeActionPathname(pathWithQuery.split('?')[0] || '')
  return pathname.startsWith('/') && !pathname.startsWith('//')
}

export function navigateNotificationAction(
  router: Router,
  actionUrl: string | undefined,
  fallbackNotificationId: string,
): void {
  const url = actionUrl?.trim()
  if (!url) {
    router.push({ name: 'view-notification', params: { id: fallbackNotificationId } })
    return
  }

  const internalRoute = resolveNotificationActionRoute(url)
  if (internalRoute) {
    router.push(internalRoute)
    return
  }

  if (isExternalNotificationActionUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer')
    return
  }

  router.push({ name: 'view-notification', params: { id: fallbackNotificationId } })
}

export function getNotificationActionHref(router: Router, actionUrl: string): string | null {
  const trimmed = actionUrl.trim()
  if (!trimmed) return null

  const internalRoute = resolveNotificationActionRoute(trimmed)
  if (internalRoute) {
    return router.resolve(internalRoute).href
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const pathWithQuery = stripOrigin(trimmed)
  if (pathWithQuery.startsWith('/')) {
    return pathWithQuery
  }

  return null
}
